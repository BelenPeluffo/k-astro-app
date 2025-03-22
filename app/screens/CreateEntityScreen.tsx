import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';

export const CreateEntityScreen = () => {
  const router = useRouter();

  const entities = [
    { name: 'Idol', route: '/create/idol' },
    { name: 'Grupo', route: '/create/group' },
    { name: 'Compañía', route: '/create/company' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Qué deseas crear?</Text>
      
      {entities.map((entity) => (
        <TouchableOpacity
          key={entity.name}
          style={styles.entityButton}
          onPress={() => router.push(entity.route)}
        >
          <Text style={styles.entityButtonText}>
            Crear {entity.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  entityButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  entityButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
}); 