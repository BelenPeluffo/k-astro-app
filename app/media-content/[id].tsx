import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MediaContentWithRelations } from '@/database/interfaces';
import { MediaContentRepository } from '@/database/repository/MediaContent.repository';
import { useAppContext } from '@/contexts/App.provider';
import { DetailActions } from '@/app/components/DetailActions';

export default function MediaContentDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const context = useAppContext();
  const [content, setContent] = useState<MediaContentWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!context) {
        setError('El contexto de la aplicación no está disponible');
        setLoading(false);
        return;
      }

      if (typeof id === 'string') {
        try {
          const foundContent = context.mediaContent.find((c: MediaContentWithRelations) => c.id === Number(id));
          if (foundContent) {
            setContent(foundContent);
          } else {
            setError('Contenido no encontrado');
          }
        } catch (err) {
          setError('Error al cargar el contenido');
          console.error('Error loading content:', err);
        }
      }
      setLoading(false);
    };

    fetchContent();
  }, [id, context]);

  const handleDelete = async () => {
    if (!context) {
      Alert.alert('Error', 'El contexto de la aplicación no está disponible');
      return;
    }
    
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este contenido multimedia?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await context.deleteMediaContent(Number(id));
              router.back();
            } catch (error) {
              console.error('Error deleting media content:', error);
              Alert.alert('Error', 'No se pudo eliminar el contenido multimedia');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!content) {
    return (
      <View style={styles.container}>
        <Text>Contenido no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{content.title}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información General</Text>
          <Text style={styles.info}>
            Tipo: {content.type === 'k-drama' ? 'K-Drama' :
                  content.type === 'variety_show' ? 'Programa de Variedades' :
                  'Película'}
          </Text>
          {content.release_date && (
            <Text style={styles.info}>
              Fecha de lanzamiento: {content.release_date}
            </Text>
          )}
          {content.description && (
            <Text style={styles.info}>
              Descripción: {content.description}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participantes</Text>
          {content.idols.map((idol) => (
            <TouchableOpacity
              key={idol.idol_id}
              style={styles.idolItem}
              onPress={() => router.push({
                pathname: '/idol/[id]',
                params: { id: idol.idol_id }
              })}
            >
              <Text style={styles.idolName}>{idol.idol_name}</Text>
              {idol.role && (
                <Text style={styles.idolRole}>Rol: {idol.role}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <DetailActions 
          onDelete={handleDelete}
          editRoute={`/edit/media-content/${id}`}
          entityName="contenido multimedia"
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
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  idolItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  idolName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  idolRole: {
    fontSize: 14,
    color: '#666',
  },
  error: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 