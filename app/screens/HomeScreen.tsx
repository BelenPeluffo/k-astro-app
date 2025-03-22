import React, { useContext, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppContext } from '@/contexts/App.provider';

export const HomeScreen = () => {
  const router = useRouter();
  const { idols, filterIdols } = useContext(AppContext);
  const params = useLocalSearchParams();

  useEffect(() => {
    if (Object.keys(params).length > 0) {
      filterIdols(params);
    }
  }, [params]);

  const renderIdolItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.idolCard}
      onPress={() => router.push(`/idol/${item.id}`)}
    >
      <Text style={styles.idolName}>{item.name}</Text>
      <Text style={styles.groupName}>{item.group?.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={idols}
        renderItem={renderIdolItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/filters' as any)}
        >
          <Text style={styles.buttonText}>Filtros</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/create' as any)}
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