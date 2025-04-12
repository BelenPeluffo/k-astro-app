import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./Base.repository";
import { Company, CompanyWithRelations } from "../interfaces";

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
    return result?.count ? result.count > 0 : false;
  }

  async findByName(name: string): Promise<CompanyWithRelations[]> {
    const results = await this.db.getAllAsync<CompanyWithRelations>(`
      SELECT 
        c.*,
        GROUP_CONCAT(DISTINCT g.id) as group_ids,
        GROUP_CONCAT(DISTINCT g.name) as group_names
      FROM company c
      LEFT JOIN "group" g ON c.id = g.company_id
      WHERE c.name LIKE ?
      GROUP BY c.id
    `, [`%${name}%`]);

    return results.map(result => {
      const groupIds = result.group_ids ? result.group_ids.split(',').map(Number) : [];
      const groupNames = result.group_names ? result.group_names.split(',') : [];

      const groups = groupIds.map((groupId: number, index: number) => ({
        group_id: groupId,
        group_name: groupNames[index],
      }));

      const { group_ids, group_names, ...cleanResult } = result;

      return {
        ...cleanResult,
        groups,
      } as CompanyWithRelations;
    });
  }
} 