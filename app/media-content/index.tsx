import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MediaContentWithRelations } from '../../database/interfaces';
import { MediaContentRepository } from '../../database/repository/MediaContent.repository';
import { useApp } from '../../contexts/App.provider';

export default function MediaContentListPage() {
  const router = useRouter();
  const { mediaContent, refreshData } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshData();
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Contenido Multimedia</Text>
        
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/create/media-content')}
        >
          <Text style={styles.createButtonText}>Crear Nuevo Contenido</Text>
        </TouchableOpacity>

        {mediaContent.map((content) => (
          <TouchableOpacity
            key={content.id}
            style={styles.item}
            onPress={() => router.push(`/media-content/${content.id}`)}
          >
            <Text style={styles.itemTitle}>{content.title}</Text>
            <Text style={styles.itemType}>
              {content.type === 'k-drama' ? 'K-Drama' :
               content.type === 'variety_show' ? 'Programa de Variedades' :
               'Película'}
            </Text>
            {content.release_date && (
              <Text style={styles.itemDate}>
                Fecha de lanzamiento: {content.release_date}
              </Text>
            )}
            <Text style={styles.itemIdols}>
              Participantes: {content.idols.length}
            </Text>
          </TouchableOpacity>
        ))}
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
  createButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  createButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemType: {
    color: '#666',
    marginBottom: 5,
  },
  itemDate: {
    color: '#666',
    marginBottom: 5,
  },
  itemIdols: {
    color: '#666',
  },
}); 