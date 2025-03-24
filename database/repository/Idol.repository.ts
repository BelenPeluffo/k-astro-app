import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./Base.repository";
import { Idol, IdolWithRelations } from "../interfaces";

export class IdolRepository extends BaseRepository<Idol> {
  constructor(database: SQLiteDatabase) {
    super(database, "idol");
  }

  async findWithRelations(id: number): Promise<IdolWithRelations | null> {
    const idol = await this.db.getFirstAsync<IdolWithRelations>(`
      SELECT 
        i.*,
        GROUP_CONCAT(DISTINCT g.name) as group_names,
        GROUP_CONCAT(DISTINCT g.id) as group_ids,
        GROUP_CONCAT(DISTINCT ig.is_active) as group_actives
      FROM idol i
      LEFT JOIN idol_group ig ON i.id = ig.idol_id
      LEFT JOIN "group" g ON ig.group_id = g.id
      WHERE i.id = ?
      GROUP BY i.id
    `, [id]);

    if (!idol) return null;

    // Procesar los grupos concatenados en un array de objetos
    const groupNames = idol.group_names ? idol.group_names.split(',') : [];
    const groupIds = idol.group_ids ? idol.group_ids.split(',').map(Number) : [];
    const groupActives = idol.group_actives ? idol.group_actives.split(',').map(n => n === '1') : [];

    const groups = groupIds.map((groupId, index) => ({
      group_id: groupId,
      group_name: groupNames[index],
      is_active: groupActives[index]
    }));

    // Eliminar las propiedades concatenadas y agregar el array de grupos
    delete idol.group_names;
    delete idol.group_ids;
    delete idol.group_actives;

    return {
      ...idol,
      groups: groups
    };
  }

  async create(
    name: string,
    groups: Array<{
      group_id: number,
      is_active: boolean
    }>,
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
    await this.db.execAsync('BEGIN TRANSACTION');
    
    try {
      // 1. Insertar el idol
      const signColumns = signs ? Object.keys(signs).filter(key => signs[key] !== undefined) : [];
      const columns = ['name', 'korean_name', ...signColumns];
      const values = ['?', '?', ...signColumns.map(() => '?')];
      const params = [name, koreanName, ...signColumns.map(col => signs[col])];

      await this.execute(
        `INSERT INTO ${this.tableName} (${columns.join(', ')}) 
         VALUES (${values.join(', ')})`,
        params
      );

      // Obtener el ID del último insert
      const result = await this.db.getFirstAsync<{ id: number }>(
        'SELECT last_insert_rowid() as id'
      );
      
      const idolId = result!.id;

      // 2. Insertar las relaciones con los grupos
      for (const group of groups) {
        await this.execute(
          `INSERT INTO idol_group (idol_id, group_id, is_active) 
           VALUES (?, ?, ?)`,
          [idolId, group.group_id, group.is_active ? 1 : 0]
        );
      }

      // Si todo salió bien, confirmar la transacción
      await this.db.execAsync('COMMIT');
    } catch (error) {
      // Si hubo algún error, deshacer todos los cambios
      await this.db.execAsync('ROLLBACK');
      throw error; // Re-lanzar el error para que se maneje en el nivel superior
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
    groups: Array<{
      group_id: number,
      is_active: boolean
    }>,
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
    // 1. Actualizar la información básica del idol
    const columns = ['name', 'korean_name'];
    const values = [name, koreanName];
    
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

    // 2. Eliminar las relaciones anteriores con grupos
    await this.execute(
      `DELETE FROM idol_group WHERE idol_id = ?`,
      [id]
    );

    // 3. Insertar las nuevas relaciones con grupos
    for (const group of groups) {
      await this.execute(
        `INSERT INTO idol_group (idol_id, group_id, is_active) 
         VALUES (?, ?, ?)`,
        [id, group.group_id, group.is_active ? 1 : 0]
      );
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
      `SELECT COUNT(*) as count FROM ${this.tableName} 
       WHERE name = ? AND group_id = ?`,
      [name, groupId]
    );
    return result?.count > 0;
  }
}
