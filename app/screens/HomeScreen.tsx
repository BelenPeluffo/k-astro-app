import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/contexts/App.provider';
import { ActiveFilters } from '@/app/components/ActiveFilters';
import { useFiltersState } from '@/hooks/useFiltersState';

export const HomeScreen = () => {
  const router = useRouter();
  const { idols } = useAppContext();
  const { activeFilters } = useFiltersState();

  const renderIdolItem = ({ item }) => {
    const activeGroup = item.groups?.find(g => g.is_active);
    
    return (
      <TouchableOpacity 
        style={styles.idolCard}
        onPress={() => router.push(`/idol/${item.id}`)}
      >
        <Text style={styles.idolName}>{item.name}</Text>
        <Text style={styles.groupName}>
          {activeGroup ? activeGroup.group_name : 'Sin grupo activo'}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleFiltersPress = () => {
    // Forzar la navegación como modal
    router.push({
      pathname: '/filters',
      // params: activeFilters // Pasar los filtros actuales
    });
  };

  return (
    <View style={styles.container}>
      {Object.keys(activeFilters).length > 0 && (
        <ActiveFilters filters={activeFilters} />
      )}
      <FlatList
        data={idols}
        renderItem={renderIdolItem}
        keyExtractor={(item) => `idol-${item.id}`}
        style={styles.list}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleFiltersPress}
        >
          <Text style={styles.buttonText}>Filtros</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/create')}
        >
          <Text style={styles.buttonText}>Crear Nuevo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  list: {
    flex: 1,
  },
  idolCard: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  idolName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupName: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 