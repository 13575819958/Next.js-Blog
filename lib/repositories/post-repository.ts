import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Repository } from './base-repository';
import { Post } from '@/types';

interface PostRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: number;
  category_name: string;
  published: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CreatePostData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category_id?: number;
  published?: boolean;
}

interface UpdatePostData {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  category_id?: number;
  published?: boolean;
}

export class PostRepository extends Repository<Post> {
  constructor() {
    super('posts', [
      'id',
      'title',
      'slug',
      'content',
      'excerpt',
      'category_id',
      'published',
      'created_at',
      'updated_at'
    ]);
  }

  // 获取所有已发布的文章（带分类名称）
  async getPublishedPosts(): Promise<Post[]> {
    const query = `
      SELECT p.id, p.title, p.slug, p.excerpt, p.category_id, p.created_at, c.name as category_name
      FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.published = TRUE 
      ORDER BY p.created_at DESC
    `;
    const [rows] = await this.pool.query(query);
    return rows as Post[];
  }

  // 根据slug获取文章（带分类名称）
  async getPostBySlug(slug: string): Promise<Post | null> {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.slug = ? AND p.published = TRUE
    `;
    const [rows] = await this.pool.query(query, [slug]);
    return (rows as Post[])[0] || null;
  }

  // 获取文章详情（管理后台用，包含所有状态）
  async getPostById(id: number): Promise<Post | null> {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `;
    const [rows] = await this.pool.query(query, [id]);
    return (rows as Post[])[0] || null;
  }

  // 获取所有文章（管理后台用）
  async getAllPosts(): Promise<Post[]> {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.created_at DESC
    `;
    const [rows] = await this.pool.query(query);
    return rows as Post[];
  }

  async create(data: CreatePostData): Promise<number> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO posts (title, slug, content, excerpt, category_id, published) VALUES (?, ?, ?, ?, ?, ?)`,
      [data.title, data.slug, data.content, data.excerpt || '', data.category_id || null, data.published || false]
    );
    return result.insertId;
  }

  async update(id: number, data: UpdatePostData): Promise<boolean> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.slug !== undefined) {
      updates.push('slug = ?');
      values.push(data.slug);
    }
    if (data.content !== undefined) {
      updates.push('content = ?');
      values.push(data.content);
    }
    if (data.excerpt !== undefined) {
      updates.push('excerpt = ?');
      values.push(data.excerpt);
    }
    if (data.category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(data.category_id);
    }
    if (data.published !== undefined) {
      updates.push('published = ?');
      values.push(data.published);
    }

    if (updates.length === 0) {
      return false;
    }

    values.push(id);
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // 检查slug是否已存在
  async checkSlugExists(slug: string, excludeId?: number): Promise<boolean> {
    let query = 'SELECT id FROM posts WHERE slug = ?';
    const params: any[] = [slug];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await this.pool.query(query, params);
    return (rows as any[]).length > 0;
  }
}
