import { useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { exportDatabase, importDatabase, getLatestBackup } from '../database/backup';
import { Alert } from 'react-native';

export const useBackup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBackup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const db = SQLite.openDatabaseSync('k-astro-app.db');
      const backupPath = await exportDatabase(db);
      Alert.alert(
        'Backup creado',
        `El backup se ha creado exitosamente en: ${backupPath}`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      Alert.alert(
        'Error',
        'No se pudo crear el backup. Por favor, intente nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const restoreBackup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const latestBackup = await getLatestBackup();
      
      if (!latestBackup) {
        Alert.alert(
          'No hay backups',
          'No se encontraron backups disponibles para restaurar.',
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Restaurar backup',
        '¿Está seguro que desea restaurar el último backup? Esto sobrescribirá todos los datos actuales.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Restaurar',
            style: 'destructive',
            onPress: async () => {
              try {
                const db = SQLite.openDatabaseSync('k-astro-app.db');
                await importDatabase(db, latestBackup);
                Alert.alert(
                  'Backup restaurado',
                  'El backup se ha restaurado exitosamente.',
                  [{ text: 'OK' }]
                );
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
                Alert.alert(
                  'Error',
                  'No se pudo restaurar el backup. Por favor, intente nuevamente.',
                  [{ text: 'OK' }]
                );
              }
            }
          }
        ]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      Alert.alert(
        'Error',
        'No se pudo restaurar el backup. Por favor, intente nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createBackup,
    restoreBackup,
    isLoading,
    error
  };
}; 