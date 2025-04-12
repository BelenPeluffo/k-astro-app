import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./Base.repository";
import { Group, GroupWithCompany } from "../interfaces";

export class GroupRepository extends BaseRepository<Group> {
  constructor(database: SQLiteDatabase) {
    super(database, '"group"');
  }

  async findWithCompany(id: number): Promise<GroupWithCompany | null> {
    const result = await this.db.getAllAsync(`
      SELECT g.*, c.name as company_name 
      FROM "group" g
      LEFT JOIN company c ON g.company_id = c.id
      WHERE g.id = ?
    `, [id]);
    return result.length > 0 ? result[0] as GroupWithCompany : null;
  }

  async create(name: string, companyId?: number): Promise<void> {
    await this.execute(
      `INSERT INTO "group" (name, company_id) VALUES (?, ?)`,
      [name, companyId || null]
    );
  }

  async findByCompanyId(companyId: number): Promise<Group[]> {
    const result = await this.db.getAllAsync(
      `SELECT * FROM "group" WHERE company_id = ?`,
      [companyId]
    );
    return result as Group[];
  }

  async exists(name: string, companyId?: number): Promise<boolean> {
    const query = companyId 
      ? `SELECT COUNT(*) as count FROM ${this.tableName} WHERE name = ? AND company_id = ?`
      : `SELECT COUNT(*) as count FROM ${this.tableName} WHERE name = ? AND company_id IS NULL`;
    
    const params = companyId ? [name, companyId] : [name];
    
    const result = await this.db.getFirstAsync<{ count: number }>(query, params);
    return result?.count ? result.count > 0 : false;
  }
} 