import React from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useBackup } from '../../hooks/useBackup';

export const BackupActions = () => {
  const { createBackup, restoreBackup, isLoading } = useBackup();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.createButton]}
        onPress={createBackup}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Crear Backup</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.restoreButton]}
        onPress={restoreBackup}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Restaurar Backup</Text>
      </TouchableOpacity>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    backgroundColor: '#2089dc',
  },
  restoreButton: {
    backgroundColor: '#ff9800',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 