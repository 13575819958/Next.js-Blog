import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { UserRepository } from './repositories/user-repository';
import { ApiResponse } from './api-response';

// 简单的内存缓存，减少数据库查询
const userCache = new Map<string, { user: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

const userRepository = new UserRepository();

async function getUserFromCache(email: string) {
  const cached = userCache.get(email);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }

  try {
    const user = await userRepository.findAuthUser(email);
    
    if (user) {
      userCache.set(email, { user, timestamp: Date.now() });
    }
    
    return user;
  } catch (error) {
    console.error('Database query error:', error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await getUserFromCache(credentials.email);
        
        if (!user) {
          return null;
        }

        // 检查用户状态
        if (user.status === 'banned') {
          throw new Error('账号已被禁用');
        }

        // 使用缓存的密码验证，避免重复查询
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // 清理敏感信息，只返回必要字段
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
        // 添加时间戳用于缓存失效
        token.iat = Math.floor(Date.now() / 1000);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'user' | 'admin';
        session.user.avatar = token.avatar as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24小时
  },
  secret: process.env.NEXTAUTH_SECRET,
  // 启用调试模式仅在开发环境
  debug: process.env.NODE_ENV === 'development',
};
