import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Repository } from './base-repository';
import { Comment } from '@/types';

interface CommentRow extends RowDataPacket {
  id: number;
  post_id: number;
  user_id?: number;
  author_name: string;
  author_email: string;
  author_avatar?: string;
  content: string;
  created_at: Date;
  approved: boolean;
}

interface CreateCommentData {
  post_id: number;
  user_id?: number | null;
  author_name: string;
  author_email: string;
  content: string;
  approved?: boolean;
}

interface UpdateCommentData {
  approved?: boolean;
}

export class CommentRepository extends Repository<Comment> {
  constructor() {
    super('comments', [
      'id',
      'post_id',
      'user_id',
      'author_name',
      'author_email',
      'author_avatar',
      'content',
      'created_at',
      'approved'
    ]);
  }

  // 获取文章的所有已审核评论
  async getApprovedCommentsByPost(postId: number): Promise<Comment[]> {
    const query = `
      ${this.selectQuery} 
      WHERE post_id = ? AND approved = TRUE 
      ORDER BY created_at DESC
    `;
    const [rows] = await this.pool.query(query, [postId]);
    return (rows as CommentRow[]).map(row => ({
      id: row.id,
      post_id: row.post_id,
      user_id: row.user_id,
      author_name: row.author_name,
      author_email: row.author_email,
      author_avatar: row.author_avatar,
      content: row.content,
      created_at: row.created_at.toISOString(),
      approved: row.approved
    }));
  }

  // 获取所有评论（管理后台用，带文章标题）
  async getAllCommentsWithPostTitle(): Promise<(Comment & { post_title: string })[]> {
    const query = `
      SELECT c.*, p.title as post_title
      FROM comments c
      LEFT JOIN posts p ON c.post_id = p.id
      ORDER BY c.created_at DESC
    `;
    const [rows] = await this.pool.query(query);
    return rows as any[];
  }

  // 获取待审核评论数量
  async getPendingCount(): Promise<number> {
    const [rows] = await this.pool.query(
      'SELECT COUNT(*) as count FROM comments WHERE approved = FALSE'
    );
    return (rows as any[])[0].count;
  }

  async create(data: Partial<Comment>): Promise<number> {
    const commentData = data as CreateCommentData;
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO comments (post_id, user_id, author_name, author_email, content, approved) VALUES (?, ?, ?, ?, ?, ?)`,
      [commentData.post_id, commentData.user_id || null, commentData.author_name, commentData.author_email, commentData.content, commentData.approved || false]
    );
    return result.insertId;
  }

  async update(id: number, data: UpdateCommentData): Promise<boolean> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.approved !== undefined) {
      updates.push('approved = ?');
      values.push(data.approved);
    }

    if (updates.length === 0) {
      return false;
    }

    values.push(id);
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE comments SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }
}
