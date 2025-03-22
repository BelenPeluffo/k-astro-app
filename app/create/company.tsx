import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAppContext } from '@/contexts/App.provider';
import { Alert } from 'react-native';
import { CompanyRepository } from '@/database/repository/Company.repository';
import { useSQLiteContext } from 'expo-sqlite';

export default function CreateCompanyPage() {
  const router = useRouter();
  const database = useSQLiteContext();
  const { createCompany } = useAppContext();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!name) {
      Alert.alert("Error", "Por favor ingresa el nombre de la compañía");
      return;
    }

    try {
      setIsLoading(true);
      const repository = new CompanyRepository(database);
      const exists = await repository.exists(name);

      if (exists) {
        Alert.alert(
          "Compañía existente",
          "Ya existe una compañía con este nombre",
          [
            {
              text: "Volver al inicio",
              onPress: () => router.replace("/"),
              style: "cancel"
            },
            {
              text: "Crear de todos modos",
              onPress: async () => {
                try {
                  await createCompany(name);
                  Alert.alert("Éxito", "Compañía creada correctamente", [
                    { text: "OK", onPress: () => router.replace("/") }
                  ]);
                } catch (error) {
                  Alert.alert("Error", "No se pudo crear la compañía");
                }
              },
              style: "destructive"
            }
          ]
        );
      } else {
        await createCompany(name);
        Alert.alert("Éxito", "Compañía creada correctamente", [
          { text: "OK", onPress: () => router.replace("/") }
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la compañía");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nombre de la Compañía"
        value={name}
        onChangeText={setName}
        editable={!isLoading}
      />
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Creando...' : 'Crear'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
}); 