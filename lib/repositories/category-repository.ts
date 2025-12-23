import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Repository } from './base-repository';
import { Category } from '@/types';

interface CategoryRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: Date;
}

interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
}

interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
}

export class CategoryRepository extends Repository<Category> {
  constructor() {
    super('categories', [
      'id',
      'name',
      'slug',
      'description',
      'created_at'
    ]);
  }

  // 根据slug查找分类
  async findBySlug(slug: string): Promise<Category | null> {
    const [rows] = await this.pool.query<CategoryRow[]>(
      `${this.selectQuery} WHERE slug = ?`,
      [slug]
    );
    const row = rows[0];
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      created_at: row.created_at.toISOString()
    };
  }

  // 检查slug是否已存在
  async checkSlugExists(slug: string, excludeId?: number): Promise<boolean> {
    let query = 'SELECT id FROM categories WHERE slug = ?';
    const params: any[] = [slug];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await this.pool.query(query, params);
    return (rows as any[]).length > 0;
  }

  // 检查名称是否已存在
  async checkNameExists(name: string, excludeId?: number): Promise<boolean> {
    let query = 'SELECT id FROM categories WHERE name = ?';
    const params: any[] = [name];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await this.pool.query(query, params);
    return (rows as any[]).length > 0;
  }

  async create(data: CreateCategoryData): Promise<number> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)`,
      [data.name, data.slug, data.description || '']
    );
    return result.insertId;
  }

  async update(id: number, data: UpdateCategoryData): Promise<boolean> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.slug !== undefined) {
      updates.push('slug = ?');
      values.push(data.slug);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }

    if (updates.length === 0) {
      return false;
    }

    values.push(id);
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // 获取所有分类（按名称排序）
  async getAllCategories(): Promise<Category[]> {
    const [rows] = await this.pool.query(`${this.selectQuery} ORDER BY name ASC`);
    return (rows as CategoryRow[]).map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      created_at: row.created_at.toISOString()
    }));
  }
}
