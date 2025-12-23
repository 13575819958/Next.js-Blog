import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { UserRepository } from '@/lib/repositories/user-repository';
import { ApiResponse, withErrorHandling } from '@/lib/api-response';

const userRepository = new UserRepository();

// POST /api/auth/register - 用户注册
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { name, email, password } = body;

  // 参数验证
  if (!name || !email || !password) {
    return ApiResponse.validationError({
      name: !name ? '姓名不能为空' : undefined,
      email: !email ? '邮箱不能为空' : undefined,
      password: !password ? '密码不能为空' : undefined
    });
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return ApiResponse.validationError({ email: '邮箱格式不正确' });
  }

  // 验证密码长度
  if (password.length < 6) {
    return ApiResponse.validationError({ password: '密码长度至少需要6位' });
  }

  // 检查邮箱是否已存在
  const emailExists = await userRepository.checkEmailExists(email);
  if (emailExists) {
    return ApiResponse.conflict('该邮箱已被注册');
  }

  // 哈希密码
  const hashedPassword = await bcrypt.hash(password, 12);

  // 创建用户
  const userId = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role: 'user',
    status: 'active'
  } as any);

  return ApiResponse.created(
    { id: userId, name, email, role: 'user' },
    '注册成功'
  );
});
