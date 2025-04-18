import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useAppContext } from '../../contexts/App.provider';
import { useIdolMediaFilter } from '../../hooks/useIdolMediaFilter';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { IdolWithRelations } from '../../database/interfaces';

export default function IdolList() {
  const context = useAppContext();
  const { filteredIdols, selectedMediaType, setSelectedMediaType, mediaTypes } = useIdolMediaFilter(context?.idols || []);

  const renderIdolItem = ({ item }: { item: IdolWithRelations }) => (
    <TouchableOpacity
      style={styles.idolItem}
      onPress={() => router.push({
        pathname: '/idol/[id]',
        params: { id: item.id }
      })}
    >
      <View style={styles.idolInfo}>
        {item.image_url && (
          <Image
            source={{ uri: item.image_url }}
            style={styles.idolImage}
            resizeMode="cover"
          />
        )}
        <Text style={styles.idolName}>{item.name}</Text>
        {item.korean_name && (
          <Text style={styles.koreanName}>{item.korean_name}</Text>
        )}
        {item.groups.length > 0 && (
          <Text style={styles.groupName}>
            {item.groups.map(g => g.group_name).join(', ')}
          </Text>
        )}
        {item.media_content.length > 0 && (
          <View style={styles.mediaContent}>
            <Text style={styles.mediaTitle}>Contenido:</Text>
            {item.media_content.map((content, index) => (
              <Text key={index} style={styles.mediaItem}>
                • {content.media_content_title} ({content.type})
              </Text>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (!context) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar por tipo de contenido:</Text>
        <Picker
          selectedValue={selectedMediaType}
          onValueChange={(value) => setSelectedMediaType(value)}
          style={styles.picker}
        >
          {mediaTypes.map((type) => (
            <Picker.Item
              key={type}
              label={type === 'all' ? 'Todos' : type}
              value={type}
            />
          ))}
        </Picker>
      </View>
      <FlatList
        data={filteredIdols}
        renderItem={renderIdolItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  idolItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  idolInfo: {
    flex: 1,
  },
  idolImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  idolName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  koreanName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  mediaContent: {
    marginTop: 8,
  },
  mediaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mediaItem: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    width: '100%',
    height: 50,
  },
}); 