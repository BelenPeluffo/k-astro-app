import * as SQLite from "expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";

// Función para inicializar la base de datos
export const initDatabase = async (db: SQLiteDatabase) => {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS western_zodiac_sign (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS company (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS "group" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company_id INTEGER,
      FOREIGN KEY (company_id) REFERENCES company(id),
      UNIQUE(name, company_id)
    );

    CREATE TABLE IF NOT EXISTS idol (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      korean_name TEXT,
      group_id INTEGER,
      sun_sign_id INTEGER,
      moon_sign_id INTEGER,
      rising_sign_id INTEGER,
      mercury_sign_id INTEGER,
      venus_sign_id INTEGER,
      mars_sign_id INTEGER,
      jupiter_sign_id INTEGER,
      saturn_sign_id INTEGER,
      uranus_sign_id INTEGER,
      neptune_sign_id INTEGER,
      pluto_sign_id INTEGER,
      FOREIGN KEY (group_id) REFERENCES "group"(id),
      FOREIGN KEY (sun_sign_id) REFERENCES western_zodiac_sign(id),
      FOREIGN KEY (moon_sign_id) REFERENCES western_zodiac_sign(id),
      FOREIGN KEY (rising_sign_id) REFERENCES western_zodiac_sign(id),
      FOREIGN KEY (mercury_sign_id) REFERENCES western_zodiac_sign(id),
      FOREIGN KEY (venus_sign_id) REFERENCES western_zodiac_sign(id),
      FOREIGN KEY (mars_sign_id) REFERENCES western_zodiac_sign(id),
      FOREIGN KEY (jupiter_sign_id) REFERENCES western_zodiac_sign(id),
      FOREIGN KEY (saturn_sign_id) REFERENCES western_zodiac_sign(id),
      FOREIGN KEY (uranus_sign_id) REFERENCES western_zodiac_sign(id),
      FOREIGN KEY (neptune_sign_id) REFERENCES western_zodiac_sign(id),
      FOREIGN KEY (pluto_sign_id) REFERENCES western_zodiac_sign(id),
      UNIQUE(name, group_id)
    );
  `);

  // Verificar si la tabla de signos zodiacales está vacía
  const zodiacCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM western_zodiac_sign'
  );

  if (zodiacCount?.count === 0) {
    // Insertar los signos zodiacales solo si la tabla está vacía
    await db.execAsync(`
      INSERT INTO western_zodiac_sign (name) VALUES
        ('Aries'), ('Taurus'), ('Gemini'), ('Cancer'),
        ('Leo'), ('Virgo'), ('Libra'), ('Scorpio'),
        ('Sagittarius'), ('Capricorn'), ('Aquarius'), ('Pisces');
    `);
  }

  // Verificar si hay compañías
  const companyCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM company'
  );

  if (companyCount?.count === 0) {
    // Insertar datos de ejemplo solo si no hay compañías
    // 1. Insertar compañía
    await db.execAsync(`
      INSERT INTO company (name) VALUES ('Cube Entertainment');
    `);

    // 2. Insertar grupo
    await db.execAsync(`
      WITH company_id AS (
        SELECT id FROM company WHERE name = 'Cube Entertainment'
      )
      INSERT INTO "group" (name, company_id)
      SELECT 'I-DLE', id
      FROM company_id;
    `);

    // 3. Insertar idol
    await db.execAsync(`
      WITH group_id AS (
        SELECT id FROM "group" WHERE name = 'I-DLE'
      )
      INSERT INTO idol (name, group_id)
      SELECT 'Soyeon', id
      FROM group_id;
    `);
  }

  console.log('Database initialized successfully');
};
