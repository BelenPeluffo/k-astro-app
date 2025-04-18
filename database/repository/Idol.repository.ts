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
      image_url: string | null;
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
      media_content_ids: string;
      media_content_titles: string;
      media_content_types: string;
      media_content_roles: string;
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
              GROUP_CONCAT(DISTINCT ig.group_id) as group_ids,
              GROUP_CONCAT(DISTINCT g.name) as group_names,
              GROUP_CONCAT(DISTINCT ig.is_active) as group_actives,
              GROUP_CONCAT(DISTINCT imc.media_content_id) as media_content_ids,
              GROUP_CONCAT(DISTINCT mc.title) as media_content_titles,
              GROUP_CONCAT(DISTINCT mc.type) as media_content_types,
              GROUP_CONCAT(DISTINCT imc.role) as media_content_roles,
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
       LEFT JOIN idol_media_content imc ON i.id = imc.idol_id
       LEFT JOIN media_content mc ON imc.media_content_id = mc.id
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

    // Procesar el contenido multimedia concatenado
    const mediaContentIds = result.media_content_ids ? result.media_content_ids.split(',').map(Number) : [];
    const mediaContentTitles = result.media_content_titles ? result.media_content_titles.split(',') : [];
    const mediaContentTypes = result.media_content_types ? result.media_content_types.split(',') as ('k-drama' | 'variety_show' | 'movie')[] : [];
    const mediaContentRoles = result.media_content_roles ? result.media_content_roles.split(',') : [];

    const mediaContent = mediaContentIds.map((media_content_id, index) => ({
      media_content_id,
      media_content_title: mediaContentTitles[index],
      type: mediaContentTypes[index],
      role: mediaContentRoles[index] || null
    }));

    // Eliminar las propiedades concatenadas del resultado
    const { 
      group_ids, 
      group_names, 
      group_actives, 
      media_content_ids, 
      media_content_titles, 
      media_content_types, 
      media_content_roles, 
      ...idol 
    } = result;

    return {
      ...idol,
      groups,
      media_content: mediaContent
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
    imageUrl: string | null = null,
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
      const columns = ['name', 'korean_name', 'birth_date', 'image_url', ...signColumns];
      const values = ['?', '?', '?', '?', ...signColumns.map(() => '?')];
      const params = [name, koreanName, birthDate, imageUrl, ...signColumns.map(col => {
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
    groups: Array<{
      group_id: number;
      is_active: boolean;
    }>,
    koreanName: string | null,
    birthDate: string | null,
    imageUrl: string | null,
    signs?: Partial<
      Pick<
        Idol,
        | "sun_sign_id"
        | "moon_sign_id"
        | "rising_sign_id"
        | "mercury_sign_id"
        | "venus_sign_id"
        | "mars_sign_id"
        | "jupiter_sign_id"
        | "saturn_sign_id"
        | "uranus_sign_id"
        | "neptune_sign_id"
        | "pluto_sign_id"
      >
    >,
    mediaContent?: Array<{
      media_content_id: number;
      role: string | null;
    }>
  ): Promise<void> {
    await this.db.execAsync('BEGIN TRANSACTION');
    
    try {
      // Actualizar datos básicos del idol
      await this.execute(
        `UPDATE ${this.tableName} 
         SET name = ?, 
             korean_name = ?, 
             birth_date = ?,
             image_url = ?,
             sun_sign_id = ?,
             moon_sign_id = ?,
             rising_sign_id = ?,
             mercury_sign_id = ?,
             venus_sign_id = ?,
             mars_sign_id = ?,
             jupiter_sign_id = ?,
             saturn_sign_id = ?,
             uranus_sign_id = ?,
             neptune_sign_id = ?,
             pluto_sign_id = ?
         WHERE id = ?`,
        [
          name,
          koreanName,
          birthDate,
          imageUrl,
          signs?.sun_sign_id ?? null,
          signs?.moon_sign_id ?? null,
          signs?.rising_sign_id ?? null,
          signs?.mercury_sign_id ?? null,
          signs?.venus_sign_id ?? null,
          signs?.mars_sign_id ?? null,
          signs?.jupiter_sign_id ?? null,
          signs?.saturn_sign_id ?? null,
          signs?.uranus_sign_id ?? null,
          signs?.neptune_sign_id ?? null,
          signs?.pluto_sign_id ?? null,
          id,
        ]
      );

      // Actualizar grupos
      await this.execute('DELETE FROM idol_group WHERE idol_id = ?', [id]);
      for (const group of groups) {
        await this.execute(
          'INSERT INTO idol_group (idol_id, group_id, is_active) VALUES (?, ?, ?)',
          [id, group.group_id, group.is_active ? 1 : 0]
        );
      }

      // Actualizar contenido multimedia
      await this.execute('DELETE FROM idol_media_content WHERE idol_id = ?', [id]);
      if (mediaContent) {
        for (const content of mediaContent) {
          await this.execute(
            'INSERT INTO idol_media_content (idol_id, media_content_id, role) VALUES (?, ?, ?)',
            [id, content.media_content_id, content.role]
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

  async findByFilters(filters: {
    idolName?: string;
    groupName?: string;
    companyName?: string;
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    mercurySign?: string;
    venusSign?: string;
    marsSign?: string;
    jupiterSign?: string;
    saturnSign?: string;
    uranusSign?: string;
    neptuneSign?: string;
    plutoSign?: string;
    mediaType?: 'k-drama' | 'variety_show' | 'movie';
    mediaContentId?: number;
  }): Promise<IdolWithRelations[]> {
    let query = `
      SELECT i.*, 
        GROUP_CONCAT(DISTINCT ig.group_id) as group_ids,
        GROUP_CONCAT(DISTINCT g.name) as group_names,
        GROUP_CONCAT(DISTINCT ig.is_active) as group_actives,
        GROUP_CONCAT(DISTINCT imc.media_content_id) as media_content_ids,
        GROUP_CONCAT(DISTINCT mc.title) as media_content_titles,
        GROUP_CONCAT(DISTINCT mc.type) as media_content_types,
        GROUP_CONCAT(DISTINCT imc.role) as media_content_roles,
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
      LEFT JOIN idol_media_content imc ON i.id = imc.idol_id
      LEFT JOIN media_content mc ON imc.media_content_id = mc.id
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
      WHERE 1=1
    `;

    const params: any[] = [];

    if (filters.idolName) {
      query += ` AND (i.name LIKE ? OR i.korean_name LIKE ?)`;
      const searchTerm = `%${filters.idolName}%`;
      params.push(searchTerm, searchTerm);
    }

    if (filters.groupName) {
      query += ` AND g.name LIKE ?`;
      params.push(`%${filters.groupName}%`);
    }

    if (filters.companyName) {
      query += ` AND EXISTS (
        SELECT 1 FROM "group" g2
        JOIN company c ON g2.company_id = c.id
        WHERE g2.id = g.id AND c.name LIKE ?
      )`;
      params.push(`%${filters.companyName}%`);
    }

    if (filters.mediaType) {
      query += ` AND mc.type = ?`;
      params.push(filters.mediaType);
    }

    if (filters.mediaContentId) {
      query += ` AND mc.id = ?`;
      params.push(filters.mediaContentId);
    }

    // Agregar filtros de signos zodiacales
    const signFilters = {
      sunSign: { column: 'ws_sun.name', value: filters.sunSign },
      moonSign: { column: 'ws_moon.name', value: filters.moonSign },
      risingSign: { column: 'ws_rising.name', value: filters.risingSign },
      mercurySign: { column: 'ws_mercury.name', value: filters.mercurySign },
      venusSign: { column: 'ws_venus.name', value: filters.venusSign },
      marsSign: { column: 'ws_mars.name', value: filters.marsSign },
      jupiterSign: { column: 'ws_jupiter.name', value: filters.jupiterSign },
      saturnSign: { column: 'ws_saturn.name', value: filters.saturnSign },
      uranusSign: { column: 'ws_uranus.name', value: filters.uranusSign },
      neptuneSign: { column: 'ws_neptune.name', value: filters.neptuneSign },
      plutoSign: { column: 'ws_pluto.name', value: filters.plutoSign },
    };

    Object.entries(signFilters).forEach(([_, { column, value }]) => {
      if (value) {
        query += ` AND ${column} = ?`;
        params.push(value);
      }
    });

    query += ` GROUP BY i.id`;

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
      media_content_ids: string;
      media_content_titles: string;
      media_content_types: string;
      media_content_roles: string;
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
    }>(query, params);

    return results.map(result => {
      // Procesar los grupos concatenados
      const groupIds = result.group_ids ? result.group_ids.split(',').map(Number) : [];
      const groupNames = result.group_names ? result.group_names.split(',') : [];
      const groupActives = result.group_actives ? result.group_actives.split(',').map(Number).map(Boolean) : [];

      const groups = groupIds.map((group_id, index) => ({
        group_id,
        group_name: groupNames[index],
        is_active: groupActives[index]
      }));

      // Procesar el contenido multimedia concatenado
      const mediaContentIds = result.media_content_ids ? result.media_content_ids.split(',').map(Number) : [];
      const mediaContentTitles = result.media_content_titles ? result.media_content_titles.split(',') : [];
      const mediaContentTypes = result.media_content_types ? result.media_content_types.split(',') as ('k-drama' | 'variety_show' | 'movie')[] : [];
      const mediaContentRoles = result.media_content_roles ? result.media_content_roles.split(',') : [];

      const mediaContent = mediaContentIds.map((media_content_id, index) => ({
        media_content_id,
        media_content_title: mediaContentTitles[index],
        type: mediaContentTypes[index],
        role: mediaContentRoles[index] || null
      }));

      // Eliminar las propiedades concatenadas del resultado
      const { 
        group_ids, 
        group_names, 
        group_actives, 
        media_content_ids, 
        media_content_titles, 
        media_content_types, 
        media_content_roles, 
        ...idol 
      } = result;

      return {
        ...idol,
        groups,
        media_content: mediaContent
      };
    });
  }

  async findAllWithRelations(): Promise<IdolWithRelations[]> {
    const results = await this.db.getAllAsync<{
      id: number;
      name: string;
      korean_name: string | null;
      birth_date: string | null;
      image_url: string | null;
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
      media_content_ids: string;
      media_content_titles: string;
      media_content_types: string;
      media_content_roles: string;
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
      SELECT i.*, 
        GROUP_CONCAT(ig.group_id) as group_ids,
        GROUP_CONCAT(g.name) as group_names,
        GROUP_CONCAT(ig.is_active) as group_actives,
        GROUP_CONCAT(imc.media_content_id) as media_content_ids,
        GROUP_CONCAT(mc.title) as media_content_titles,
        GROUP_CONCAT(mc.type) as media_content_types,
        GROUP_CONCAT(imc.role) as media_content_roles,
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
      LEFT JOIN idol_media_content imc ON i.id = imc.idol_id
      LEFT JOIN media_content mc ON imc.media_content_id = mc.id
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
      GROUP BY i.id
    `);

    return results.map(result => {
      // Procesar los grupos concatenados
      const groupIds = result.group_ids ? result.group_ids.split(',').map(Number) : [];
      const groupNames = result.group_names ? result.group_names.split(',') : [];
      const groupActives = result.group_actives ? result.group_actives.split(',').map(Number).map(Boolean) : [];

      const groups = groupIds.map((group_id, index) => ({
        group_id,
        group_name: groupNames[index],
        is_active: groupActives[index]
      }));

      // Procesar el contenido multimedia concatenado
      const mediaContentIds = result.media_content_ids ? result.media_content_ids.split(',').map(Number) : [];
      const mediaContentTitles = result.media_content_titles ? result.media_content_titles.split(',') : [];
      const mediaContentTypes = result.media_content_types ? result.media_content_types.split(',') as ('k-drama' | 'variety_show' | 'movie')[] : [];
      const mediaContentRoles = result.media_content_roles ? result.media_content_roles.split(',') : [];

      const mediaContent = mediaContentIds.map((media_content_id, index) => ({
        media_content_id,
        media_content_title: mediaContentTitles[index],
        type: mediaContentTypes[index],
        role: mediaContentRoles[index] || null
      }));

      // Eliminar las propiedades concatenadas del resultado
      const { 
        group_ids, 
        group_names, 
        group_actives, 
        media_content_ids, 
        media_content_titles, 
        media_content_types, 
        media_content_roles, 
        ...idol 
      } = result;

      return {
        ...idol,
        groups,
        media_content: mediaContent
      };
    });
  }
}