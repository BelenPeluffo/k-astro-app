import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAppContext } from '@/contexts/App.provider';
import { GroupRepository } from '@/database/repository/Group.repository';
import { useSQLiteContext } from 'expo-sqlite';

export default function CreateGroupPage() {
  const router = useRouter();
  const database = useSQLiteContext();
  const { createGroup, companies } = useAppContext();
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !companyId) {
      Alert.alert("Error", "Por favor completa los campos requeridos");
      return;
    }

    try {
      setIsLoading(true);
      const repository = new GroupRepository(database);
      const exists = await repository.exists(name, companyId);

      if (exists) {
        Alert.alert(
          "Grupo existente",
          "Ya existe un grupo con este nombre en la misma compañía",
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
                  await createGroup(name, companyId);
                  Alert.alert("Éxito", "Grupo creado correctamente", [
                    { text: "OK", onPress: () => router.replace("/") }
                  ]);
                } catch (error) {
                  Alert.alert("Error", "No se pudo crear el grupo");
                }
              },
              style: "destructive"
            }
          ]
        );
      } else {
        await createGroup(name, companyId);
        Alert.alert("Éxito", "Grupo creado correctamente", [
          { text: "OK", onPress: () => router.replace("/") }
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el grupo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nombre del Grupo"
        value={name}
        onChangeText={setName}
        editable={!isLoading}
      />
      
      <Picker
        selectedValue={companyId}
        onValueChange={(itemValue) => setCompanyId(Number(itemValue))}
        enabled={!isLoading}
      >
        <Picker.Item label="Selecciona una compañía" value={null} />
        {companies.map(company => (
          <Picker.Item 
            key={company.id} 
            label={company.name} 
            value={company.id} 
          />
        ))}
      </Picker>

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={isLoading || !name.trim() || !companyId}
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