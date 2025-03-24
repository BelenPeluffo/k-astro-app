import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface ActiveFiltersProps {
  filters: Record<string, string>;
}

const filterLabels = {
  idolName: "Nombre del Idol",
  groupName: "Grupo",
  companyName: "Compañía",
  sunSign: "Sol",
  moonSign: "Luna",
  risingSign: "Ascendente",
  mercurySign: "Mercurio",
  venusSign: "Venus",
  marsSign: "Marte",
  jupiterSign: "Júpiter",
  saturnSign: "Saturno",
  uranusSign: "Urano",
  neptuneSign: "Neptuno",
  plutoSign: "Plutón",
};

export const ActiveFilters = ({ filters }: ActiveFiltersProps) => {
  const router = useRouter();

  if (Object.keys(filters).length === 0) return null;

  const clearFilters = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filtros activos:</Text>
        <TouchableOpacity onPress={clearFilters}>
          <Text style={styles.clearButton}>Limpiar</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal style={styles.filtersContainer}>
        {Object.entries(filters).map(([key, value]) => {
          const label = filterLabels[key] || key;
          return (
            <View key={key} style={styles.filterTag}>
              <Text style={styles.filterText}>{label}: {value}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearButton: {
    color: '#007AFF',
    fontSize: 14,
  },
  filtersContainer: {
    flexDirection: 'row',
  },
  filterTag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterText: {
    fontSize: 12,
  },
}); 