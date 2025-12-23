import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Repository } from './base-repository';
import { User } from '@/types';

interface ProfileRow extends RowDataPacket {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
  created_at: Date;
  updated_at: Date;
}

interface UpdateProfileData {
  name?: string;
  avatar?: string;
  bio?: string;
}

export class ProfileRepository extends Repository<User> {
  constructor() {
    super('users', [
      'id',
      'email',
      'name',
      'avatar',
      'bio',
      'role',
      'status',
      'created_at',
      'updated_at'
    ]);
  }

  // 实现抽象方法 - 但ProfileRepository主要用于查询，这些方法很少使用
  async create(data: Partial<User>): Promise<number> {
    const keys = Object.keys(data) as (keyof User)[];
    const values = keys.map(key => data[key]);
    const placeholders = keys.map(() => '?').join(', ');
    
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO users (${keys.join(', ')}) VALUES (${placeholders})`,
      values
    );
    return result.insertId;
  }

  async update(id: number, data: Partial<User>): Promise<boolean> {
    const keys = Object.keys(data) as (keyof User)[];
    if (keys.length === 0) return false;
    
    const updates = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => data[key]);
    values.push(id);
    
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE users SET ${updates} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // 获取用户资料（不包含密码）
  async getProfile(id: number): Promise<User | null> {
    const query = `
      SELECT id, email, name, avatar, bio, role, status, created_at, updated_at
      FROM users 
      WHERE id = ?
    `;
    const result = await this.pool.query(query, [id]);
    const rows = result[0] as any[];
    
    if (!rows || rows.length === 0) return null;
    
    const row = rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatar: row.avatar,
      bio: row.bio,
      role: row.role,
      status: row.status,
      created_at: new Date(row.created_at).toISOString(),
      updated_at: new Date(row.updated_at).toISOString()
    };
  }

  // 获取用户密码（用于验证）
  async getUserPassword(id: number): Promise<string | null> {
    const result = await this.pool.query(
      'SELECT password FROM users WHERE id = ?',
      [id]
    );
    // mysql2返回 [rows, fields]，我们需要第一个元素
    const rows = result[0] as any;
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0].password;
    }
    return null;
  }

  async updateProfile(id: number, data: UpdateProfileData): Promise<boolean> {
    const updates: string[] = [];
    const values: any[] = [];

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

  // 更新密码
  async updatePassword(id: number, hashedPassword: string): Promise<boolean> {
    const [result] = await this.pool.query<ResultSetHeader>(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  }
}
