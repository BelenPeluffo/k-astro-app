import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./Base.repository";
import { WesternZodiacSign } from "../interfaces";

export class WesternZodiacSignRepository extends BaseRepository<WesternZodiacSign> {
  constructor(database: SQLiteDatabase) {
    super(database, "western_zodiac_sign");
  }

  async findByName(name: string): Promise<WesternZodiacSign | null> {
    const result = await this.db.getAllAsync(
      `SELECT * FROM ${this.tableName} WHERE name = ?`,
      [name]
    );
    return result.length > 0 ? result[0] as WesternZodiacSign : null;
  }
} 