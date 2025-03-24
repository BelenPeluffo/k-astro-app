import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/App.provider';
import { useSQLiteContext } from 'expo-sqlite';
import { IdolRepository } from '@/database/repository/Idol.repository';
import { IdolWithRelations } from '@/database/interfaces';
import { useRouter } from 'expo-router';
import { DetailActions } from '@/app/components/DetailActions';
import React from 'react';
import { useFiltersState } from '@/hooks/useFiltersState';

const PLANETS = [
  { key: 'sun', label: 'Sol', signKey: 'sun_sign_name', filterKey: 'sunSign' },
  { key: 'moon', label: 'Luna', signKey: 'moon_sign_name', filterKey: 'moonSign' },
  { key: 'rising', label: 'Ascendente', signKey: 'rising_sign_name', filterKey: 'risingSign' },
  { key: 'mercury', label: 'Mercurio', signKey: 'mercury_sign_name', filterKey: 'mercurySign' },
  { key: 'venus', label: 'Venus', signKey: 'venus_sign_name', filterKey: 'venusSign' },
  { key: 'mars', label: 'Marte', signKey: 'mars_sign_name', filterKey: 'marsSign' },
  { key: 'jupiter', label: 'Júpiter', signKey: 'jupiter_sign_name', filterKey: 'jupiterSign' },
  { key: 'saturn', label: 'Saturno', signKey: 'saturn_sign_name', filterKey: 'saturnSign' },
  { key: 'uranus', label: 'Urano', signKey: 'uranus_sign_name', filterKey: 'uranusSign' },
  { key: 'neptune', label: 'Neptuno', signKey: 'neptune_sign_name', filterKey: 'neptuneSign' },
  { key: 'pluto', label: 'Plutón', signKey: 'pluto_sign_name', filterKey: 'plutoSign' },
];

export default function IdolDetailsPage() {
  const { id } = useLocalSearchParams();
  const database = useSQLiteContext();
  const [idol, setIdol] = useState<IdolWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { deleteIdol, filterIdols } = useAppContext();
  const { applyFilters } = useFiltersState();

  useEffect(() => {
    const loadIdol = async () => {
      try {
        const repository = new IdolRepository(database);
        const idolData = await repository.findWithRelations(Number(id));
        setIdol(idolData);
      } catch (error) {
        console.error('Error loading idol:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadIdol();
  }, [id, database]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!idol) {
    return (
      <View style={styles.container}>
        <Text>Idol no encontrado</Text>
      </View>
    );
  }

  const handleSignPress = async (planet: string, sign: string) => {
    try {
      const filters = { [planet]: sign };
      await filterIdols(filters);
      router.replace({
        pathname: '/',
        params: filters
      });
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que deseas eliminar este idol?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteIdol(Number(id));
              Alert.alert("Éxito", "Idol eliminado correctamente", [
                { text: "OK", onPress: () => router.replace("/") }
              ]);
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el idol");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.title}>{idol.name}</Text>
          {idol.korean_name && (
            <Text style={styles.koreanName}>{idol.korean_name}</Text>
          )}
          <View style={styles.subtitleContainer}>
            {idol.groups && idol.groups.length > 0 ? (
              idol.groups.map((group, index) => (
                <React.Fragment key={group.group_id}>
                  <TouchableOpacity 
                    onPress={() => router.push(`/group/${group.group_id}`)}
                  >
                    <Text style={[styles.subtitle, styles.link]}>
                      {group.group_name}
                      {group.is_active ? '' : ' (Inactivo)'}
                    </Text>
                  </TouchableOpacity>
                  {index < idol.groups.length - 1 && (
                    <Text style={styles.subtitle}> • </Text>
                  )}
                </React.Fragment>
              ))
            ) : (
              <Text style={styles.subtitle}>Sin grupos asignados</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Carta Astral</Text>
          {PLANETS.map(planet => (
            <View key={planet.key} style={styles.signInfo}>
              <Text style={styles.label}>{planet.label}:</Text>
              {idol[planet.signKey] ? (
                <TouchableOpacity
                  onPress={() => handleSignPress(planet.filterKey, idol[planet.signKey])}
                >
                  <Text style={styles.link}>{idol[planet.signKey]}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.noSign}>No especificado</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
      
      <DetailActions
        onDelete={handleDelete}
        editRoute={`/edit/idol/${id}`}
        entityName="idol"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  signInfo: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  label: {
    fontWeight: '500',
    marginRight: 8,
    minWidth: 100,
    fontSize: 16,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  noSign: {
    color: '#666',
    fontStyle: 'italic',
    fontSize: 16,
  },
  koreanName: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
}); 