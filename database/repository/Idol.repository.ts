import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./Base.repository";
import { Idol, IdolWithRelations } from "../interfaces";

export class IdolRepository extends BaseRepository<Idol> {
  constructor(database: SQLiteDatabase) {
    super(database, "idol");
  }

  async findWithRelations(id: number): Promise<IdolWithRelations | null> {
    const result = await this.db.getFirstAsync<{
      id: number;
      name: string;
      korean_name: string | null;
      birth_date: string | null;
      sun_sign_id: number | null;
      moon_sign_id: number | null;
      rising_sign_id: number | null;
      mercury_sign_id: number | null;
      venus_sign_id: number | null;
      mars_sign_id: number | null;
      jupiter_sign_id: number | null;
      saturn_sign_id: number | null;
      uranus_sign_id: number | null;
      neptune_sign_id: number | null;
      pluto_sign_id: number | null;
      group_ids: string;
      group_names: string;
      group_actives: string;
      sun_sign_name: string | null;
      moon_sign_name: string | null;
      rising_sign_name: string | null;
      mercury_sign_name: string | null;
      venus_sign_name: string | null;
      mars_sign_name: string | null;
      jupiter_sign_name: string | null;
      saturn_sign_name: string | null;
      uranus_sign_name: string | null;
      neptune_sign_name: string | null;
      pluto_sign_name: string | null;
    }>(
      `SELECT i.*, 
              GROUP_CONCAT(ig.group_id) as group_ids,
              GROUP_CONCAT(g.name) as group_names,
              GROUP_CONCAT(ig.is_active) as group_actives,
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
       LEFT JOIN idol_group ig ON i.id = ig.idol_id
       LEFT JOIN "group" g ON ig.group_id = g.id
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
       GROUP BY i.id`,
      [id]
    );

    if (!result) {
      return null;
    }

    // Procesar los grupos concatenados
    const groupIds = result.group_ids ? result.group_ids.split(',').map(Number) : [];
    const groupNames = result.group_names ? result.group_names.split(',') : [];
    const groupActives = result.group_actives ? result.group_actives.split(',').map(Number).map(Boolean) : [];

    const groups = groupIds.map((group_id, index) => ({
      group_id,
      group_name: groupNames[index],
      is_active: groupActives[index]
    }));

    // Eliminar las propiedades concatenadas del resultado
    const { group_ids, group_names, group_actives, ...idol } = result;

    return {
      ...idol,
      groups
    };
  }

  async create(
    name: string,
    groups?: Array<{
      group_id: number,
      is_active: boolean
    }>,
    koreanName: string | null = null,
    birthDate: string | null = null,
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
    await this.db.execAsync('BEGIN TRANSACTION');
    
    try {
      // 1. Insertar el idol
      const signColumns = signs ? Object.keys(signs).filter(key => signs[key as keyof typeof signs] !== undefined) : [];
      const columns = ['name', 'korean_name', 'birth_date', ...signColumns];
      const values = ['?', '?', '?', ...signColumns.map(() => '?')];
      const params = [name, koreanName, birthDate, ...signColumns.map(col => {
        const value = signs?.[col as keyof typeof signs];
        return value !== null ? String(value) : null;
      })];

      await this.execute(
        `INSERT INTO ${this.tableName} (${columns.join(', ')}) 
         VALUES (${values.join(', ')})`,
        params
      );

      // Obtener el ID del último insert
      const result = await this.db.getFirstAsync<{ id: number }>(
        'SELECT last_insert_rowid() as id'
      );
      
      if (!result) {
        throw new Error('Failed to get last insert ID');
      }
      
      const idolId = result.id;

      // 2. Insertar las relaciones con los grupos si existen
      if (groups && groups.length > 0) {
        for (const group of groups) {
          await this.execute(
            `INSERT INTO idol_group (idol_id, group_id, is_active) 
             VALUES (?, ?, ?)`,
            [idolId, group.group_id, group.is_active ?? true ? 1 : 0]
          );
        }
      }

      await this.db.execAsync('COMMIT');
    } catch (error) {
      await this.db.execAsync('ROLLBACK');
      throw error;
    }
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
    groups?: Array<{
      group_id: number,
      is_active: boolean
    }>,
    koreanName: string | null = null,
    birthDate: string | null = null,
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
    await this.db.execAsync('BEGIN TRANSACTION');
    
    try {
      // 1. Actualizar el idol
      const signColumns = signs ? Object.keys(signs).filter(key => signs[key as keyof typeof signs] !== undefined) : [];
      const updates = [
        'name = ?',
        'korean_name = ?',
        'birth_date = ?',
        ...signColumns.map(col => `${col} = ?`)
      ];
      
      const params = [
        name,
        koreanName,
        birthDate,
        ...signColumns.map(col => {
          const value = signs?.[col as keyof typeof signs];
          return value !== null ? String(value) : null;
        }),
        id
      ];

      await this.execute(
        `UPDATE ${this.tableName} 
         SET ${updates.join(', ')}
         WHERE id = ?`,
        params
      );

      // 2. Actualizar las relaciones con los grupos si existen
      if (groups) {
        // Eliminar todas las relaciones existentes
        await this.execute(
          'DELETE FROM idol_group WHERE idol_id = ?',
          [id]
        );

        // Insertar las nuevas relaciones
        for (const group of groups) {
          await this.execute(
            `INSERT INTO idol_group (idol_id, group_id, is_active) 
             VALUES (?, ?, ?)`,
            [id, group.group_id, group.is_active ?? true ? 1 : 0]
          );
        }
      }

      await this.db.execAsync('COMMIT');
    } catch (error) {
      await this.db.execAsync('ROLLBACK');
      throw error;
    }
  }

  async checkTableStructure(): Promise<void> {
    const result = await this.db.getAllAsync(
      "PRAGMA table_info(idol)"
    );
    console.log('Estructura de la tabla idol:', result);
  }

  async exists(name: string, groupId: number): Promise<boolean> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${this.tableName} i
       LEFT JOIN idol_group ig ON i.id = ig.idol_id
       WHERE i.name = ? AND ig.group_id = ?`,
      [name, groupId]
    );
    return result?.count ? result.count > 0 : false;
  }

  async findByName(name: string): Promise<IdolWithRelations[]> {
    const results = await this.db.getAllAsync<{
      id: number;
      name: string;
      korean_name: string | null;
      birth_date: string | null;
      sun_sign_id: number | null;
      moon_sign_id: number | null;
      rising_sign_id: number | null;
      mercury_sign_id: number | null;
      venus_sign_id: number | null;
      mars_sign_id: number | null;
      jupiter_sign_id: number | null;
      saturn_sign_id: number | null;
      uranus_sign_id: number | null;
      neptune_sign_id: number | null;
      pluto_sign_id: number | null;
      group_ids: string;
      group_names: string;
      group_actives: string;
      sun_sign_name: string | null;
      moon_sign_name: string | null;
      rising_sign_name: string | null;
      mercury_sign_name: string | null;
      venus_sign_name: string | null;
      mars_sign_name: string | null;
      jupiter_sign_name: string | null;
      saturn_sign_name: string | null;
      uranus_sign_name: string | null;
      neptune_sign_name: string | null;
      pluto_sign_name: string | null;
    }>(`
      SELECT 
        i.*,
        GROUP_CONCAT(DISTINCT g.name) as group_names,
        GROUP_CONCAT(DISTINCT g.id) as group_ids,
        GROUP_CONCAT(DISTINCT ig.is_active) as group_actives,
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
      FROM idol i
      LEFT JOIN idol_group ig ON i.id = ig.idol_id
      LEFT JOIN "group" g ON ig.group_id = g.id
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
      WHERE i.name LIKE ?
      GROUP BY i.id
    `, [`%${name}%`]);

    return results.map(result => {
      const groupIds = result.group_ids ? result.group_ids.split(',').map(Number) : [];
      const groupNames = result.group_names ? result.group_names.split(',') : [];
      const groupActives = result.group_actives ? result.group_actives.split(',').map((n: string) => n === '1') : [];

      const groups = groupIds.map((groupId: number, index: number) => ({
        group_id: groupId,
        group_name: groupNames[index],
        is_active: groupActives[index],
      }));

      const { group_ids, group_names, group_actives, ...cleanResult } = result;

      return {
        ...cleanResult,
        groups,
      } as IdolWithRelations;
    });
  }
}