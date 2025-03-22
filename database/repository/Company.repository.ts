import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./Base.repository";
import { Company } from "../interfaces";

export class CompanyRepository extends BaseRepository<Company> {
  constructor(database: SQLiteDatabase) {
    super(database, "company");
  }

  async create(name: string): Promise<void> {
    await this.execute(
      `INSERT INTO ${this.tableName} (name) VALUES (?)`,
      [name]
    );
  }

  async exists(name: string): Promise<boolean> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${this.tableName} WHERE name = ?`,
      [name]
    );
    return result?.count > 0;
  }
} 