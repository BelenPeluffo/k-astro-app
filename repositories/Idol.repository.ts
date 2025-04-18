import { Idol, IdolWithRelations } from '../database/interfaces';
import { SQLiteDatabase } from 'expo-sqlite';

interface RawIdolWithRelations extends Idol {
  group_ids?: string;
  group_names?: string;
  idol_actives?: string;
  media_content_ids?: string;
  media_content_titles?: string;
  media_content_types?: string;
  media_content_roles?: string;
  sun_sign_name?: string;
  moon_sign_name?: string;
  rising_sign_name?: string;
  mercury_sign_name?: string;
  venus_sign_name?: string;
  mars_sign_name?: string;
  jupiter_sign_name?: string;
  saturn_sign_name?: string;
  uranus_sign_name?: string;
  neptune_sign_name?: string;
  pluto_sign_name?: string;
}

export class IdolRepository {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async getAll(): Promise<IdolWithRelations[]> {
    const query = `
      SELECT 
        i.*,
        GROUP_CONCAT(DISTINCT g.id) AS group_ids,
        GROUP_CONCAT(DISTINCT g.name) AS group_names,
        GROUP_CONCAT(DISTINCT ig.is_active) AS idol_actives,
        GROUP_CONCAT(DISTINCT mc.id) AS media_content_ids,
        GROUP_CONCAT(DISTINCT mc.title) AS media_content_titles,
        GROUP_CONCAT(DISTINCT mc.type) AS media_content_types,
        GROUP_CONCAT(DISTINCT imc.role) AS media_content_roles,
        ws.name AS sun_sign_name,
        wm.name AS moon_sign_name,
        wr.name AS rising_sign_name,
        wme.name AS mercury_sign_name,
        wv.name AS venus_sign_name,
        wma.name AS mars_sign_name,
        wj.name AS jupiter_sign_name,
        ws2.name AS saturn_sign_name,
        wu.name AS uranus_sign_name,
        wn.name AS neptune_sign_name,
        wp.name AS pluto_sign_name
      FROM idol i
      LEFT JOIN idol_group ig ON i.id = ig.idol_id
      LEFT JOIN "group" g ON ig.group_id = g.id
      LEFT JOIN idol_media_content imc ON i.id = imc.idol_id
      LEFT JOIN media_content mc ON imc.media_content_id = mc.id
      LEFT JOIN western_zodiac_sign ws ON i.sun_sign_id = ws.id
      LEFT JOIN western_zodiac_sign wm ON i.moon_sign_id = wm.id
      LEFT JOIN western_zodiac_sign wr ON i.rising_sign_id = wr.id
      LEFT JOIN western_zodiac_sign wme ON i.mercury_sign_id = wme.id
      LEFT JOIN western_zodiac_sign wv ON i.venus_sign_id = wv.id
      LEFT JOIN western_zodiac_sign wma ON i.mars_sign_id = wma.id
      LEFT JOIN western_zodiac_sign wj ON i.jupiter_sign_id = wj.id
      LEFT JOIN western_zodiac_sign ws2 ON i.saturn_sign_id = ws2.id
      LEFT JOIN western_zodiac_sign wu ON i.uranus_sign_id = wu.id
      LEFT JOIN western_zodiac_sign wn ON i.neptune_sign_id = wn.id
      LEFT JOIN western_zodiac_sign wp ON i.pluto_sign_id = wp.id
      GROUP BY i.id
    `;

    const result = await this.db.getAllAsync<RawIdolWithRelations>(query);
    return result.map(this.mapIdolWithRelations);
  }

  async getById(id: number): Promise<IdolWithRelations | null> {
    const query = `
      SELECT 
        i.*,
        GROUP_CONCAT(DISTINCT g.id) AS group_ids,
        GROUP_CONCAT(DISTINCT g.name) AS group_names,
        GROUP_CONCAT(DISTINCT ig.is_active) AS idol_actives,
        GROUP_CONCAT(DISTINCT mc.id) AS media_content_ids,
        GROUP_CONCAT(DISTINCT mc.title) AS media_content_titles,
        GROUP_CONCAT(DISTINCT mc.type) AS media_content_types,
        GROUP_CONCAT(DISTINCT imc.role) AS media_content_roles,
        ws.name AS sun_sign_name,
        wm.name AS moon_sign_name,
        wr.name AS rising_sign_name,
        wme.name AS mercury_sign_name,
        wv.name AS venus_sign_name,
        wma.name AS mars_sign_name,
        wj.name AS jupiter_sign_name,
        ws2.name AS saturn_sign_name,
        wu.name AS uranus_sign_name,
        wn.name AS neptune_sign_name,
        wp.name AS pluto_sign_name
      FROM idol i
      LEFT JOIN idol_group ig ON i.id = ig.idol_id
      LEFT JOIN "group" g ON ig.group_id = g.id
      LEFT JOIN idol_media_content imc ON i.id = imc.idol_id
      LEFT JOIN media_content mc ON imc.media_content_id = mc.id
      LEFT JOIN western_zodiac_sign ws ON i.sun_sign_id = ws.id
      LEFT JOIN western_zodiac_sign wm ON i.moon_sign_id = wm.id
      LEFT JOIN western_zodiac_sign wr ON i.rising_sign_id = wr.id
      LEFT JOIN western_zodiac_sign wme ON i.mercury_sign_id = wme.id
      LEFT JOIN western_zodiac_sign wv ON i.venus_sign_id = wv.id
      LEFT JOIN western_zodiac_sign wma ON i.mars_sign_id = wma.id
      LEFT JOIN western_zodiac_sign wj ON i.jupiter_sign_id = wj.id
      LEFT JOIN western_zodiac_sign ws2 ON i.saturn_sign_id = ws2.id
      LEFT JOIN western_zodiac_sign wu ON i.uranus_sign_id = wu.id
      LEFT JOIN western_zodiac_sign wn ON i.neptune_sign_id = wn.id
      LEFT JOIN western_zodiac_sign wp ON i.pluto_sign_id = wp.id
      WHERE i.id = ?
      GROUP BY i.id
    `;

    const result = await this.db.getAllAsync<RawIdolWithRelations>(query, [id]);
    return result.length > 0 ? this.mapIdolWithRelations(result[0]) : null;
  }

  async create(idol: Omit<Idol, 'id'>): Promise<number> {
    const query = `
      INSERT INTO idol (
        name, korean_name, birth_date, image_url,
        sun_sign_id, moon_sign_id, rising_sign_id,
        mercury_sign_id, venus_sign_id, mars_sign_id,
        jupiter_sign_id, saturn_sign_id, uranus_sign_id,
        neptune_sign_id, pluto_sign_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      idol.name,
      idol.korean_name,
      idol.birth_date,
      idol.image_url,
      idol.sun_sign_id,
      idol.moon_sign_id,
      idol.rising_sign_id,
      idol.mercury_sign_id,
      idol.venus_sign_id,
      idol.mars_sign_id,
      idol.jupiter_sign_id,
      idol.saturn_sign_id,
      idol.uranus_sign_id,
      idol.neptune_sign_id,
      idol.pluto_sign_id
    ].map(value => value ?? null);

    const result = await this.db.runAsync(query, values);
    return result.lastInsertRowId as number;
  }

  async update(id: number, idol: Partial<Omit<Idol, 'id'>>): Promise<void> {
    const fields = Object.keys(idol);
    if (fields.length === 0) return;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => idol[field as keyof typeof idol] ?? null);

    const query = `UPDATE idol SET ${setClause} WHERE id = ?`;
    await this.db.runAsync(query, [...values, id]);
  }

  async delete(id: number): Promise<void> {
    await this.db.runAsync('DELETE FROM idol WHERE id = ?', [id]);
  }

  private mapIdolWithRelations(row: RawIdolWithRelations): IdolWithRelations {
    return {
      ...row,
      groups: row.group_ids ? row.group_ids.split(',').map((id: string, index: number) => ({
        group_id: parseInt(id),
        group_name: row.group_names!.split(',')[index],
        is_active: row.idol_actives!.split(',')[index] === '1'
      })) : [],
      media_content: row.media_content_ids ? row.media_content_ids.split(',').map((id: string, index: number) => ({
        media_content_id: parseInt(id),
        media_content_title: row.media_content_titles!.split(',')[index],
        type: row.media_content_types!.split(',')[index] as 'k-drama' | 'variety_show' | 'movie',
        role: row.media_content_roles!.split(',')[index] || null
      })) : [],
      sun_sign_name: row.sun_sign_name || null,
      moon_sign_name: row.moon_sign_name || null,
      rising_sign_name: row.rising_sign_name || null,
      mercury_sign_name: row.mercury_sign_name || null,
      venus_sign_name: row.venus_sign_name || null,
      mars_sign_name: row.mars_sign_name || null,
      jupiter_sign_name: row.jupiter_sign_name || null,
      saturn_sign_name: row.saturn_sign_name || null,
      uranus_sign_name: row.uranus_sign_name || null,
      neptune_sign_name: row.neptune_sign_name || null,
      pluto_sign_name: row.pluto_sign_name || null
    };
  }
} 