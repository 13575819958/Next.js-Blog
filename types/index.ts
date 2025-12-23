export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: number;
  category_name?: string;
  created_at: string;
  updated_at: string;
  published: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id?: number;
  author_name: string;
  author_email: string;
  author_avatar?: string;
  content: string;
  created_at: string;
  approved: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
  created_at: string;
  updated_at: string;
}

// 认证用户类型（包含密码）
export interface AuthUser {
  id: number;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
}

// 创建用户数据类型
export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  avatar?: string;
  bio?: string;
}

// 更新用户数据类型
export interface UpdateUserInput {
  email?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'banned';
}
