import { SQLiteDatabase } from "expo-sqlite";

export abstract class BaseRepository<T> {
  protected db: SQLiteDatabase;
  protected tableName: string;

  constructor(database: SQLiteDatabase, tableName: string) {
    this.db = database;
    this.tableName = tableName;
  }

  async findAll(): Promise<T[]> {
    const result = await this.db.getAllAsync(`SELECT * FROM ${this.tableName}`);
    return result as T[];
  }

  async findById(id: number): Promise<T | null> {
    const result = await this.db.getAllAsync(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return result.length > 0 ? (result[0] as T) : null;
  }

  protected async execute(query: string, params: any[] = []): Promise<any> {
    return await this.db.runAsync(query, params);
  }

  async delete(id: number): Promise<void> {
    await this.execute(
      `DELETE FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
  }
} 