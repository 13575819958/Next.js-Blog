import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Repository } from './base-repository';
import { User, AuthUser, CreateUserInput, UpdateUserInput } from '@/types';

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
  created_at: Date;
  updated_at: Date;
}

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  avatar?: string;
  bio?: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'banned';
}

interface UpdateUserData {
  email?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'banned';
}

export class UserRepository extends Repository<User> {
  constructor() {
    super('users', [
      'id',
      'email',
      'password',
      'name',
      'avatar',
      'bio',
      'role',
      'status',
      'created_at',
      'updated_at'
    ]);
  }

  // 根据邮箱查找用户（用于认证）
  async findByEmail(email: string): Promise<any> {
    const [rows] = await this.pool.query<UserRow[]>(
      `${this.selectQuery} WHERE email = ?`,
      [email]
    );
    const row = rows[0];
    if (!row) return null;
    
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      name: row.name,
      avatar: row.avatar,
      bio: row.bio,
      role: row.role,
      status: row.status,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString()
    };
  }

  // 根据邮箱查找用户（仅返回必要字段，用于认证）
  async findAuthUser(email: string): Promise<{
    id: number;
    email: string;
    password: string;
    name: string;
    avatar?: string;
    role: 'user' | 'admin';
    status: 'active' | 'banned';
  } | null> {
    const query = `
      SELECT id, email, password, name, avatar, role, status 
      FROM users 
      WHERE email = ?
    `;
    const [rows] = await this.pool.query(query, [email]);
    return (rows as any[])[0] || null;
  }

  // 检查邮箱是否已存在
  async checkEmailExists(email: string, excludeId?: number): Promise<boolean> {
    let query = 'SELECT id FROM users WHERE email = ?';
    const params: any[] = [email];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await this.pool.query(query, params);
    return (rows as any[]).length > 0;
  }

  async create(data: Partial<User>): Promise<number> {
    const createData = data as any;
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO users (email, password, name, avatar, bio, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        createData.email,
        createData.password,
        createData.name,
        createData.avatar || null,
        createData.bio || null,
        createData.role || 'user',
        createData.status || 'active'
      ]
    );
    return result.insertId;
  }

  async update(id: number, data: UpdateUserData): Promise<boolean> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(data.avatar);
    }
    if (data.bio !== undefined) {
      updates.push('bio = ?');
      values.push(data.bio);
    }
    if (data.role !== undefined) {
      updates.push('role = ?');
      values.push(data.role);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }

    if (updates.length === 0) {
      return false;
    }

    values.push(id);
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // 更新用户密码
  async updatePassword(id: number, hashedPassword: string): Promise<boolean> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE users SET password = ? WHERE id = ?`,
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  }
}
