import React, { useContext, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppContext } from '@/contexts/App.provider';
import { ActiveFilters } from '@/app/components/ActiveFilters';

export const HomeScreen = () => {
  const router = useRouter();
  const { idols, filterIdols } = useContext(AppContext);
  const params = useLocalSearchParams();
  const initialRenderRef = useRef(true);
  const previousParamsRef = useRef({});

  useEffect(() => {
    // Evitar la primera ejecución
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    // Convertir params a un objeto normal
    const currentParams = Object.fromEntries(
      Object.entries(params)
        .filter(([_, value]) => value && value !== '' && value !== 'undefined')
    );

    // Comparar con los params anteriores
    const paramsChanged = JSON.stringify(currentParams) !== JSON.stringify(previousParamsRef.current);

    if (paramsChanged) {
      previousParamsRef.current = currentParams;
      if (Object.keys(currentParams).length > 0) {
        filterIdols(currentParams);
      }
    }
  }, [params, filterIdols]);

  const renderIdolItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.idolCard}
      onPress={() => router.push(`/idol/${item.id}`)}
    >
      <Text style={styles.idolName}>{item.name}</Text>
      <Text style={styles.groupName}>{item.group?.name}</Text>
    </TouchableOpacity>
  );

  // Filtrar params vacíos para ActiveFilters
  const activeFilters = Object.fromEntries(
    Object.entries(params)
      .filter(([_, value]) => value && value !== '' && value !== 'undefined')
  );

  return (
    <View style={styles.container}>
      {Object.keys(activeFilters).length > 0 && (
        <ActiveFilters filters={activeFilters} />
      )}
      <FlatList
        data={idols}
        renderItem={renderIdolItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/filters')}
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