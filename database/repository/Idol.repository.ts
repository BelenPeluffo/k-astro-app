import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./Base.repository";
import { Idol, IdolWithRelations } from "../interfaces";

export class IdolRepository extends BaseRepository<Idol> {
  constructor(database: SQLiteDatabase) {
    super(database, "idol");
  }

  async findWithRelations(id: number): Promise<IdolWithRelations | null> {
    const result = await this.db.getAllAsync(`
      SELECT 
        i.*,
        g.name as group_name,
        g.id as group_id,
        c.name as company_name,
        c.id as company_id,
        ws_sun.name as sun_sign_name,
        ws_moon.name as moon_sign_name,
        ws_rising.name as rising_sign_name,
        ws_mercury.name as mercury_sign_name,
        ws_venus.name as venus_sign_name,
        ws_mars.name as mars_sign_name,
        ws_jupiter.name as jupiter_sign_name,
        ws_saturn.name as saturn_sign_name,
        ws_uranus.name as uranus_sign_name,
        ws_neptune.name as neptune_sign_name,
        ws_pluto.name as pluto_sign_name
      FROM ${this.tableName} i
      LEFT JOIN "group" g ON i.group_id = g.id
      LEFT JOIN company c ON g.company_id = c.id
      LEFT JOIN western_zodiac_sign ws_sun ON i.sun_sign_id = ws_sun.id
      LEFT JOIN western_zodiac_sign ws_moon ON i.moon_sign_id = ws_moon.id
      LEFT JOIN western_zodiac_sign ws_rising ON i.rising_sign_id = ws_rising.id
      LEFT JOIN western_zodiac_sign ws_mercury ON i.mercury_sign_id = ws_mercury.id
      LEFT JOIN western_zodiac_sign ws_venus ON i.venus_sign_id = ws_venus.id
      LEFT JOIN western_zodiac_sign ws_mars ON i.mars_sign_id = ws_mars.id
      LEFT JOIN western_zodiac_sign ws_jupiter ON i.jupiter_sign_id = ws_jupiter.id
      LEFT JOIN western_zodiac_sign ws_saturn ON i.saturn_sign_id = ws_saturn.id
      LEFT JOIN western_zodiac_sign ws_uranus ON i.uranus_sign_id = ws_uranus.id
      LEFT JOIN western_zodiac_sign ws_neptune ON i.neptune_sign_id = ws_neptune.id
      LEFT JOIN western_zodiac_sign ws_pluto ON i.pluto_sign_id = ws_pluto.id
      WHERE i.id = ?
    `, [id]);
    return result.length > 0 ? result[0] as IdolWithRelations : null;
  }

  async create(
    name: string, 
    groupId: number,
    koreanName: string | null = null,
    signs?: {
      sun_sign_id?: number | null;
      moon_sign_id?: number | null;
      rising_sign_id?: number | null;
      mercury_sign_id?: number | null;
      venus_sign_id?: number | null;
      mars_sign_id?: number | null;
      jupiter_sign_id?: number | null;
      saturn_sign_id?: number | null;
      uranus_sign_id?: number | null;
      neptune_sign_id?: number | null;
      pluto_sign_id?: number | null;
    }
  ): Promise<void> {
    const signColumns = signs ? Object.keys(signs).filter(key => signs[key] !== undefined) : [];
    const columns = ['name', 'group_id', 'korean_name', ...signColumns];
    const values = ['?', '?', '?', ...signColumns.map(() => '?')];
    const params = [name, groupId, koreanName, ...signColumns.map(col => signs[col])];

    await this.execute(
      `INSERT INTO ${this.tableName} (${columns.join(', ')}) 
       VALUES (${values.join(', ')})`,
      params
    );
  }

  async updateSigns(
    id: number, 
    signs: Partial<Pick<Idol, 
      'sun_sign_id' | 
      'moon_sign_id' | 
      'rising_sign_id' | 
      'mercury_sign_id' |
      'venus_sign_id' |
      'mars_sign_id' |
      'jupiter_sign_id' |
      'saturn_sign_id' |
      'uranus_sign_id' |
      'neptune_sign_id' |
      'pluto_sign_id'
    >>
  ): Promise<void> {
    const updates = Object.entries(signs)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(signs).filter(value => value !== undefined);
    
    await this.execute(
      `UPDATE ${this.tableName} SET ${updates} WHERE id = ?`,
      [...values, id]
    );
  }

  async update(
    id: number,
    name: string,
    groupId: number,
    koreanName: string | null,
    signs?: Partial<Pick<Idol,
      'sun_sign_id' |
      'moon_sign_id' |
      'rising_sign_id' |
      'mercury_sign_id' |
      'venus_sign_id' |
      'mars_sign_id' |
      'jupiter_sign_id' |
      'saturn_sign_id' |
      'uranus_sign_id' |
      'neptune_sign_id' |
      'pluto_sign_id'
    >>
  ): Promise<void> {
    const columns = ['name', 'group_id', 'korean_name'];
    const values = [name, groupId, koreanName];
    
    if (signs) {
      Object.entries(signs).forEach(([key, value]) => {
        if (value !== undefined) {
          columns.push(key);
          values.push(value);
        }
      });
    }

    const setClause = columns.map(col => `${col} = ?`).join(', ');
    await this.execute(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  async checkTableStructure(): Promise<void> {
    const result = await this.db.getAllAsync(
      "PRAGMA table_info(idol)"
    );
    console.log('Estructura de la tabla idol:', result);
  }

  async exists(name: string, groupId: number): Promise<boolean> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${this.tableName} 
       WHERE name = ? AND group_id = ?`,
      [name, groupId]
    );
    return result?.count > 0;
  }
}
