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
  { key: 'sun', label: 'Sol', signKey: 'sun_sign_name' as keyof IdolWithRelations, filterKey: 'sunSign' as const },
  { key: 'moon', label: 'Luna', signKey: 'moon_sign_name' as keyof IdolWithRelations, filterKey: 'moonSign' as const },
  { key: 'rising', label: 'Ascendente', signKey: 'rising_sign_name' as keyof IdolWithRelations, filterKey: 'risingSign' as const },
  { key: 'mercury', label: 'Mercurio', signKey: 'mercury_sign_name' as keyof IdolWithRelations, filterKey: 'mercurySign' as const },
  { key: 'venus', label: 'Venus', signKey: 'venus_sign_name' as keyof IdolWithRelations, filterKey: 'venusSign' as const },
  { key: 'mars', label: 'Marte', signKey: 'mars_sign_name' as keyof IdolWithRelations, filterKey: 'marsSign' as const },
  { key: 'jupiter', label: 'Júpiter', signKey: 'jupiter_sign_name' as keyof IdolWithRelations, filterKey: 'jupiterSign' as const },
  { key: 'saturn', label: 'Saturno', signKey: 'saturn_sign_name' as keyof IdolWithRelations, filterKey: 'saturnSign' as const },
  { key: 'uranus', label: 'Urano', signKey: 'uranus_sign_name' as keyof IdolWithRelations, filterKey: 'uranusSign' as const },
  { key: 'neptune', label: 'Neptuno', signKey: 'neptune_sign_name' as keyof IdolWithRelations, filterKey: 'neptuneSign' as const },
  { key: 'pluto', label: 'Plutón', signKey: 'pluto_sign_name' as keyof IdolWithRelations, filterKey: 'plutoSign' as const },
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

  const handleDelete = async () => {
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

  const handleEdit = () => {
    router.push(`/edit/idol/${id}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{idol.name}</Text>
        {idol.korean_name && (
          <Text style={styles.subtitle}>Nombre coreano: {idol.korean_name}</Text>
        )}
        {idol.birth_date && (
          <Text style={styles.subtitle}>Fecha de nacimiento: {idol.birth_date}</Text>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grupos</Text>
          {idol.groups.map((group, index) => (
            <View key={`group-${group.group_id}-${index}`} style={styles.groupItem}>
              <Text style={styles.groupName}>{group.group_name}</Text>
              <Text style={styles.groupStatus}>
                {group.is_active ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contenido Multimedia</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push(`/create/media-content?idolId=${id}`)}
          >
            <Text style={styles.addButtonText}>+ Agregar Contenido</Text>
          </TouchableOpacity>
          {idol.media_content.map((content, index) => (
            <TouchableOpacity
              key={`media-${content.media_content_id}-${index}`}
              style={styles.mediaContentItem}
              onPress={() => router.push(`/media-content/${content.media_content_id}`)}
            >
              <Text style={styles.mediaContentTitle}>{content.media_content_title}</Text>
              <Text style={styles.mediaContentType}>
                {content.type === 'k-drama' ? 'K-Drama' :
                 content.type === 'variety_show' ? 'Programa de Variedades' :
                 'Película'}
              </Text>
              {content.role && (
                <Text style={styles.mediaContentRole}>Rol: {content.role}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Signos Zodiacales</Text>
          {PLANETS.map((planet) => {
            const signName = idol[planet.signKey];
            if (!signName) return null;
            return (
              <View key={planet.key} style={styles.signItem}>
                <Text style={styles.signLabel}>{planet.label}:</Text>
                <Text style={styles.signValue}>{signName}</Text>
              </View>
            );
          })}
        </View>

        <DetailActions 
          onDelete={handleDelete}
          editRoute={`/edit/idol/${id}`}
          entityName="idol"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  groupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  groupName: {
    fontSize: 16,
  },
  groupStatus: {
    color: '#666',
  },
  mediaContentItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  mediaContentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mediaContentType: {
    color: '#666',
    marginTop: 5,
  },
  mediaContentRole: {
    color: '#666',
    marginTop: 5,
  },
  signItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  signLabel: {
    fontWeight: 'bold',
    width: 100,
  },
  signValue: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 