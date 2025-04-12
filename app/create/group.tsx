import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAppContext } from "@/contexts/App.provider";
import { useSQLiteContext } from "expo-sqlite";
import { GroupRepository } from "@/database/repository/Group.repository";

export default function CreateGroupPage() {
  const router = useRouter();
  const database = useSQLiteContext();
  const { createGroup, companies } = useAppContext();
  const [name, setName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [existingGroups, setExistingGroups] = useState<any[]>([]);

  const handleCreate = async () => {
    if (!name) {
      Alert.alert("Error", "Por favor ingresa el nombre del grupo");
      return;
    }

    try {
      setIsLoading(true);
      const repository = new GroupRepository(database);
      
      // Buscar grupos con el mismo nombre
      const foundGroups = await repository.findByName(name);
      
      if (foundGroups.length > 0) {
        setExistingGroups(foundGroups);
        setShowDuplicateModal(true);
        return;
      }

      // Si no hay coincidencias, crear el grupo
      await createGroup(name, selectedCompany || undefined);
      
      Alert.alert("Éxito", "Grupo creado correctamente", [
        { text: "OK", onPress: () => router.replace("/") }
      ]);
    } catch (error) {
      console.error('Error al crear grupo:', error);
      Alert.alert("Error", "No se pudo crear el grupo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnyway = async () => {
    try {
      await createGroup(name, selectedCompany || undefined);
      setShowDuplicateModal(false);
      Alert.alert("Éxito", "Grupo creado correctamente", [
        { text: "OK", onPress: () => router.replace("/") }
      ]);
    } catch (error) {
      console.error('Error al crear grupo:', error);
      Alert.alert("Error", "No se pudo crear el grupo");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Información Básica</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del Grupo"
        value={name}
        onChangeText={setName}
        editable={!isLoading}
      />

      <Text style={styles.sectionTitle}>Compañía</Text>
      <Text style={styles.subtitle}>Selecciona la compañía (opcional)</Text>
      <Picker
        selectedValue={selectedCompany}
        onValueChange={(itemValue) => setSelectedCompany(Number(itemValue))}
        enabled={!isLoading}
        style={styles.picker}
      >
        <Picker.Item label="Sin compañía" value={null} />
        {companies.map((company) => (
          <Picker.Item key={company.id} label={company.name} value={company.id} />
        ))}
      </Picker>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={isLoading || !name.trim()}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Creando..." : "Crear"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showDuplicateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDuplicateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¡Atención!</Text>
            <Text style={styles.modalSubtitle}>
              Ya existen {existingGroups.length} grupos con nombres similares:
            </Text>
            
            <ScrollView style={styles.modalList}>
              {existingGroups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={styles.modalListItem}
                  onPress={() => {
                    setShowDuplicateModal(false);
                    router.push(`/group/${group.id}`);
                  }}
                >
                  <Text style={styles.modalListItemText}>
                    {group.name}
                    {group.company_name ? ` - ${group.company_name}` : ''}
                    {` (${group.idols.length} idols)`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowDuplicateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCreate]}
                onPress={handleCreateAnyway}
              >
                <Text style={styles.modalButtonText}>Crear de todos modos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    fontStyle: "italic",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  picker: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalList: {
    maxHeight: 200,
    marginBottom: 15,
  },
  modalListItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalListItemText: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#ccc',
  },
  modalButtonCreate: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 