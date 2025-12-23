import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '@/lib/db';

export interface BaseRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: number): Promise<T | null>;
  create(data: Partial<T>): Promise<number>;
  update(id: number, data: Partial<T>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}

export abstract class Repository<T> implements BaseRepository<T> {
  protected pool: Pool;
  protected tableName: string;
  protected selectableFields: string[];

  constructor(tableName: string, selectableFields: string[]) {
    this.pool = pool;
    this.tableName = tableName;
    this.selectableFields = selectableFields;
  }

  protected get selectQuery(): string {
    return `SELECT ${this.selectableFields.join(', ')} FROM ${this.tableName}`;
  }

  async findAll(): Promise<T[]> {
    const [rows] = await this.pool.query(`${this.selectQuery} ORDER BY created_at DESC`);
    return rows as T[];
  }

  async findById(id: number): Promise<T | null> {
    const [rows] = await this.pool.query(
      `${this.selectQuery} WHERE id = ?`,
      [id]
    );
    return (rows as T[])[0] || null;
  }

  abstract create(data: Partial<T>): Promise<number>;
  abstract update(id: number, data: Partial<T>): Promise<boolean>;
  
  async delete(id: number): Promise<boolean> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `DELETE FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}
