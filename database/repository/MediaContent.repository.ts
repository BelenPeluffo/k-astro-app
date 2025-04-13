import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./Base.repository";
import { MediaContent, MediaContentWithRelations } from "../interfaces";

export class MediaContentRepository extends BaseRepository<MediaContent> {
  constructor(database: SQLiteDatabase) {
    super(database, "media_content");
  }

  async findWithRelations(id: number): Promise<MediaContentWithRelations | null> {
    const query = `SELECT mc.*, 
              GROUP_CONCAT(imc.idol_id) as idol_ids,
              GROUP_CONCAT(i.name) as idol_names,
              GROUP_CONCAT(imc.role) as roles
       FROM ${this.tableName} mc
       LEFT JOIN idol_media_content imc ON mc.id = imc.media_content_id
       LEFT JOIN idol i ON imc.idol_id = i.id
       WHERE mc.id = ?
       GROUP BY mc.id`;

    const params = [id];

    const result = await this.db.getFirstAsync<{
      id: number;
      title: string;
      type: 'k-drama' | 'variety_show' | 'movie';
      release_date: string | null;
      description: string | null;
      idol_ids: string;
      idol_names: string;
      roles: string;
    }>(query, params);

    if (!result) {
      return null;
    }

    const idolIds = result.idol_ids ? result.idol_ids.split(',').map(Number) : [];
    const idolNames = result.idol_names ? result.idol_names.split(',') : [];
    const roles = result.roles ? result.roles.split(',') : [];

    const idols = idolIds.map((idol_id, index) => ({
      idol_id,
      idol_name: idolNames[index],
      role: roles[index] || null
    }));

    const { idol_ids, idol_names, roles: _, ...mediaContent } = result;

    return {
      ...mediaContent,
      idols
    };
  }

  async create(
    title: string,
    type: 'k-drama' | 'variety_show' | 'movie',
    idols?: Array<{
      idol_id: number,
      role: string | null
    }>,
    releaseDate: string | null = null,
    description: string | null = null
  ): Promise<void> {
    await this.db.execAsync('BEGIN TRANSACTION');
    
    try {
      // 1. Insertar el contenido multimedia
      await this.execute(
        `INSERT INTO ${this.tableName} (title, type, release_date, description) 
         VALUES (?, ?, ?, ?)`,
        [title, type, releaseDate, description]
      );

      // Obtener el ID del último insert
      const result = await this.db.getFirstAsync<{ id: number }>(
        'SELECT last_insert_rowid() as id'
      );
      
      if (!result) {
        throw new Error('Failed to get last insert ID');
      }
      
      const mediaContentId = result.id;

      // 2. Insertar las relaciones con los idols si existen
      if (idols && idols.length > 0) {
        for (const idol of idols) {
          await this.execute(
            `INSERT INTO idol_media_content (idol_id, media_content_id, role) 
             VALUES (?, ?, ?)`,
            [idol.idol_id, mediaContentId, idol.role]
          );
        }
      }

      await this.db.execAsync('COMMIT');
    } catch (error) {
      await this.db.execAsync('ROLLBACK');
      throw error;
    }
  }

  async update(
    id: number,
    title: string,
    type: 'k-drama' | 'variety_show' | 'movie',
    idols?: Array<{
      idol_id: number,
      role: string | null
    }>,
    releaseDate: string | null = null,
    description: string | null = null
  ): Promise<void> {
    await this.db.execAsync('BEGIN TRANSACTION');
    
    try {
      // 1. Actualizar el contenido multimedia
      await this.execute(
        `UPDATE ${this.tableName} 
         SET title = ?, type = ?, release_date = ?, description = ?
         WHERE id = ?`,
        [title, type, releaseDate, description, id]
      );

      // 2. Actualizar las relaciones con los idols si existen
      if (idols) {
        // Eliminar todas las relaciones existentes
        await this.execute(
          'DELETE FROM idol_media_content WHERE media_content_id = ?',
          [id]
        );

        // Insertar las nuevas relaciones
        for (const idol of idols) {
          await this.execute(
            `INSERT INTO idol_media_content (idol_id, media_content_id, role) 
             VALUES (?, ?, ?)`,
            [idol.idol_id, id, idol.role]
          );
        }
      }

      await this.db.execAsync('COMMIT');
    } catch (error) {
      await this.db.execAsync('ROLLBACK');
      throw error;
    }
  }

  async findByName(name: string): Promise<MediaContentWithRelations[]> {
    const query = `SELECT 
        mc.*,
        GROUP_CONCAT(DISTINCT i.id) as idol_ids,
        GROUP_CONCAT(DISTINCT i.name) as idol_names,
        GROUP_CONCAT(DISTINCT imc.role) as roles
      FROM media_content mc
      LEFT JOIN idol_media_content imc ON mc.id = imc.media_content_id
      LEFT JOIN idol i ON imc.idol_id = i.id
      WHERE mc.title LIKE ?
      GROUP BY mc.id`;

    const params = [`%${name}%`];

    const results = await this.db.getAllAsync<{
      id: number;
      title: string;
      type: 'k-drama' | 'variety_show' | 'movie';
      release_date: string | null;
      description: string | null;
      idol_ids: string;
      idol_names: string;
      roles: string;
    }>(query, params);

    return results.map(result => {
      const idolIds = result.idol_ids ? result.idol_ids.split(',').map(Number) : [];
      const idolNames = result.idol_names ? result.idol_names.split(',') : [];
      const roles = result.roles ? result.roles.split(',') : [];

      const idols = idolIds.map((idolId, index) => ({
        idol_id: idolId,
        idol_name: idolNames[index],
        role: roles[index] || null
      }));

      const { idol_ids, idol_names, roles: _, ...mediaContent } = result;

      return {
        ...mediaContent,
        idols
      } as MediaContentWithRelations;
    });
  }

  async findAll(): Promise<MediaContent[]> {
    return await this.db.getAllAsync<MediaContent>(`SELECT * FROM ${this.tableName}`);
  }

  async findAllWithRelations(): Promise<MediaContentWithRelations[]> {
    const query = `SELECT mc.*, 
              GROUP_CONCAT(imc.idol_id) as idol_ids,
              GROUP_CONCAT(i.name) as idol_names,
              GROUP_CONCAT(imc.role) as roles
       FROM ${this.tableName} mc
       LEFT JOIN idol_media_content imc ON mc.id = imc.media_content_id
       LEFT JOIN idol i ON imc.idol_id = i.id
       GROUP BY mc.id`;

    const results = await this.db.getAllAsync<{
      id: number;
      title: string;
      type: 'k-drama' | 'variety_show' | 'movie';
      release_date: string | null;
      description: string | null;
      idol_ids: string;
      idol_names: string;
      roles: string;
    }>(query);

    return results.map(result => {
      const idolIds = result.idol_ids ? result.idol_ids.split(',').map(Number) : [];
      const idolNames = result.idol_names ? result.idol_names.split(',') : [];
      const roles = result.roles ? result.roles.split(',') : [];

      const idols = idolIds.map((idol_id, index) => ({
        idol_id,
        idol_name: idolNames[index],
        role: roles[index] || null
      }));

      const { idol_ids, idol_names, roles: _, ...mediaContent } = result;

      return {
        ...mediaContent,
        idols
      };
    });
  }
} 