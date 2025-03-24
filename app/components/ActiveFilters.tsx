import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFiltersState, FilterParams } from '@/hooks/useFiltersState';

interface ActiveFiltersProps {
  filters: FilterParams;
}

export const ActiveFilters = ({ filters }: ActiveFiltersProps) => {
  const { clearFilters, filterLabels } = useFiltersState();
  const [isClearing, setIsClearing] = useState(false);

  if (Object.keys(filters).length === 0) return null;

  const handleClearFilters = async () => {
    setIsClearing(true);
    try {
      await clearFilters();
    } catch (error) {
      console.error('Error al limpiar filtros:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filtros activos:</Text>
        <TouchableOpacity 
          onPress={handleClearFilters}
          disabled={isClearing}
        >
          <Text style={styles.clearButton}>
            {isClearing ? 'Limpiando...' : 'Limpiar'}
          </Text>
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