import { AppProvider } from "@/contexts/App.provider";
import { initDatabase } from "@/database/database";
import { Stack } from "expo-router";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";

// Función para resetear completamente la base de datos
const resetAndInit = async (db: SQLiteDatabase) => {
  try {
    // Desactivar temporalmente las foreign keys para poder eliminar las tablas
    await db.execAsync('PRAGMA foreign_keys = OFF;');
    
    // Eliminar todas las tablas existentes
    await db.execAsync(`
      DROP TABLE IF EXISTS idol_group;
      DROP TABLE IF EXISTS idol;
      DROP TABLE IF EXISTS "group";
      DROP TABLE IF EXISTS company;
      DROP TABLE IF EXISTS western_zodiac_sign;
    `);
    
    // Reactivar foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');
    
    // Inicializar la base de datos desde cero
    await initDatabase(db);
    
    console.log('Base de datos reiniciada correctamente');
  } catch (error) {
    console.error('Error al reiniciar la base de datos:', error);
  }
};

export default function RootLayout() {
  return (
    <SQLiteProvider 
      databaseName="k-astro-app.db" 
      onInit={initDatabase}
    >
      <AppProvider>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "K-Astro",
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="filters" 
          options={{ 
            title: "Filtros",
            presentation: "modal",
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="create" 
          options={{ 
            title: "Crear Nuevo",
            presentation: "modal" 
          }} 
        />
        <Stack.Screen 
          name="create/idol" 
          options={{ 
            title: "Crear Idol" 
          }} 
        />
        <Stack.Screen 
          name="create/group" 
          options={{ 
            title: "Crear Grupo" 
          }} 
        />
        <Stack.Screen 
          name="create/company" 
          options={{ 
            title: "Crear Compañía" 
          }} 
        />
        <Stack.Screen 
          name="idol/[id]" 
          options={{ 
            title: "Detalles del Idol",
          }} 
        />
        <Stack.Screen 
          name="group/[id]" 
          options={{ 
            title: "Detalles del Grupo",
          }} 
        />
        <Stack.Screen 
          name="company/[id]" 
          options={{ 
            title: "Detalles de la Compañía",
          }} 
        />
        <Stack.Screen 
          name="edit/idol/[id]" 
          options={{ 
            title: "Editar Idol",
          }} 
        />
        <Stack.Screen 
          name="timeline" 
          options={{ 
            title: "Línea Temporal",
          }} 
        />
      </Stack>
      </AppProvider>
    </SQLiteProvider>
  );
}
