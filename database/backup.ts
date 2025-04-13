import * as SQLite from "expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Función para exportar la base de datos a un archivo JSON
export const exportDatabase = async (db: SQLiteDatabase): Promise<string> => {
  try {
    // Obtener datos de todas las tablas
    const tables = ['western_zodiac_sign', 'company', '"group"', 'idol', 'idol_group'];
    const backupData: Record<string, any[]> = {};

    for (const table of tables) {
      const data = await db.getAllAsync(`SELECT * FROM ${table}`);
      backupData[table.replace(/"/g, '')] = data;
    }

    // Crear el directorio de backup si no existe
    const backupDir = `${FileSystem.documentDirectory}backups`;
    const dirInfo = await FileSystem.getInfoAsync(backupDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });
    }

    // Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${backupDir}/backup_${timestamp}.json`;

    // Guardar el backup
    await FileSystem.writeAsStringAsync(
      backupPath,
      JSON.stringify(backupData, null, 2)
    );

    return backupPath;
  } catch (error) {
    console.error('Error al exportar la base de datos:', error);
    throw error;
  }
};

// Función para importar datos desde un archivo JSON
export const importDatabase = async (db: SQLiteDatabase, backupPath: string): Promise<void> => {
  try {
    // Leer el archivo de backup
    const backupContent = await FileSystem.readAsStringAsync(backupPath);
    const backupData = JSON.parse(backupContent);

    // Iniciar una transacción
    await db.execAsync('BEGIN TRANSACTION');
    
    try {
      // Limpiar las tablas existentes
      const tables = ['idol_group', 'idol', '"group"', 'company', 'western_zodiac_sign'];
      for (const table of tables) {
        await db.execAsync(`DELETE FROM ${table}`);
      }

      // Restaurar los datos en el orden correcto para mantener las relaciones
      if (backupData.western_zodiac_sign) {
        for (const sign of backupData.western_zodiac_sign) {
          await db.execAsync(
            `INSERT INTO western_zodiac_sign (id, name) VALUES (${sign.id}, '${sign.name}')`
          );
        }
      }

      if (backupData.company) {
        for (const company of backupData.company) {
          await db.execAsync(
            `INSERT INTO company (id, name) VALUES (${company.id}, '${company.name}')`
          );
        }
      }

      if (backupData.group) {
        for (const group of backupData.group) {
          await db.execAsync(
            `INSERT INTO "group" (id, name, company_id) VALUES (${group.id}, '${group.name}', ${group.company_id})`
          );
        }
      }

      if (backupData.idol) {
        for (const idol of backupData.idol) {
          await db.execAsync(
            `INSERT INTO idol (
              id, name, korean_name, birth_date,
              sun_sign_id, moon_sign_id, rising_sign_id,
              mercury_sign_id, venus_sign_id, mars_sign_id,
              jupiter_sign_id, saturn_sign_id, uranus_sign_id,
              neptune_sign_id, pluto_sign_id
            ) VALUES (
              ${idol.id}, '${idol.name}', ${idol.korean_name ? `'${idol.korean_name}'` : 'NULL'}, 
              ${idol.birth_date ? `'${idol.birth_date}'` : 'NULL'},
              ${idol.sun_sign_id || 'NULL'}, ${idol.moon_sign_id || 'NULL'}, ${idol.rising_sign_id || 'NULL'},
              ${idol.mercury_sign_id || 'NULL'}, ${idol.venus_sign_id || 'NULL'}, ${idol.mars_sign_id || 'NULL'},
              ${idol.jupiter_sign_id || 'NULL'}, ${idol.saturn_sign_id || 'NULL'}, ${idol.uranus_sign_id || 'NULL'},
              ${idol.neptune_sign_id || 'NULL'}, ${idol.pluto_sign_id || 'NULL'}
            )`
          );
        }
      }

      if (backupData.idol_group) {
        for (const relation of backupData.idol_group) {
          await db.execAsync(
            `INSERT INTO idol_group (idol_id, group_id, is_active) VALUES (${relation.idol_id}, ${relation.group_id}, ${relation.is_active ? 1 : 0})`
          );
        }
      }

      await db.execAsync('COMMIT');
      console.log('Base de datos restaurada exitosamente');
    } catch (error) {
      await db.execAsync('ROLLBACK');
      console.error('Error al importar la base de datos:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error al importar la base de datos:', error);
    throw error;
  }
};

// Función para verificar si la base de datos está vacía
export const isDatabaseEmpty = async (db: SQLiteDatabase): Promise<boolean> => {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM idol'
    );
    return result?.count === 0;
  } catch (error) {
    console.error('Error al verificar si la base de datos está vacía:', error);
    throw error;
  }
};

// Función para obtener el último backup disponible
export const getLatestBackup = async (): Promise<string | null> => {
  try {
    const backupDir = `${FileSystem.documentDirectory}backups`;
    const dirInfo = await FileSystem.getInfoAsync(backupDir);
    
    if (!dirInfo.exists) {
      return null;
    }

    const files = await FileSystem.readDirectoryAsync(backupDir);
    const backupFiles = files
      .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
      .sort()
      .reverse();

    return backupFiles.length > 0 ? `${backupDir}/${backupFiles[0]}` : null;
  } catch (error) {
    console.error('Error al obtener el último backup:', error);
    return null;
  }
}; 