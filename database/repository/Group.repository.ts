import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./Base.repository";
import { Group, GroupWithCompany, GroupWithRelations } from "../interfaces";

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

  async findByName(name: string): Promise<GroupWithRelations[]> {
    const results = await this.db.getAllAsync<GroupWithRelations>(`
      SELECT 
        g.*,
        c.name as company_name,
        GROUP_CONCAT(DISTINCT i.id) as idol_ids,
        GROUP_CONCAT(DISTINCT i.name) as idol_names,
        GROUP_CONCAT(DISTINCT ig.is_active) as idol_actives
      FROM "group" g
      LEFT JOIN company c ON g.company_id = c.id
      LEFT JOIN idol_group ig ON g.id = ig.group_id
      LEFT JOIN idol i ON ig.idol_id = i.id
      WHERE g.name LIKE ?
      GROUP BY g.id
    `, [`%${name}%`]);

    return results.map(result => {
      const idolIds = result.idol_ids ? result.idol_ids.split(',').map(Number) : [];
      const idolNames = result.idol_names ? result.idol_names.split(',') : [];
      const idolActives = result.idol_actives ? result.idol_actives.split(',').map((n: string) => n === '1') : [];

      const idols = idolIds.map((idolId: number, index: number) => ({
        idol_id: idolId,
        idol_name: idolNames[index],
        is_active: idolActives[index],
      }));

      const { idol_ids, idol_names, idol_actives, ...cleanResult } = result;

      return {
        ...cleanResult,
        idols,
      } as GroupWithRelations;
    });
  }
} 