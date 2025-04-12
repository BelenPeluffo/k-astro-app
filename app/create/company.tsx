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
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAppContext } from "@/contexts/App.provider";
import { useSQLiteContext } from "expo-sqlite";
import { CompanyRepository } from "@/database/repository/Company.repository";

export default function CreateCompanyPage() {
  const router = useRouter();
  const database = useSQLiteContext();
  const { createCompany } = useAppContext();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [existingCompanies, setExistingCompanies] = useState<any[]>([]);

  const handleCreate = async () => {
    if (!name) {
      Alert.alert("Error", "Por favor ingresa el nombre de la compañía");
      return;
    }

    try {
      setIsLoading(true);
      const repository = new CompanyRepository(database);
      
      // Buscar compañías con el mismo nombre
      const foundCompanies = await repository.findByName(name);
      
      if (foundCompanies.length > 0) {
        setExistingCompanies(foundCompanies);
        setShowDuplicateModal(true);
        return;
      }

      // Si no hay coincidencias, crear la compañía
      await createCompany(name);
      
      Alert.alert("Éxito", "Compañía creada correctamente", [
        { text: "OK", onPress: () => router.replace("/") }
      ]);
    } catch (error) {
      console.error('Error al crear compañía:', error);
      Alert.alert("Error", "No se pudo crear la compañía");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnyway = async () => {
    try {
      await createCompany(name);
      setShowDuplicateModal(false);
      Alert.alert("Éxito", "Compañía creada correctamente", [
        { text: "OK", onPress: () => router.replace("/") }
      ]);
    } catch (error) {
      console.error('Error al crear compañía:', error);
      Alert.alert("Error", "No se pudo crear la compañía");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Información Básica</Text>
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
              Ya existen {existingCompanies.length} compañías con nombres similares:
            </Text>
            
            <ScrollView style={styles.modalList}>
              {existingCompanies.map((company) => (
                <TouchableOpacity
                  key={company.id}
                  style={styles.modalListItem}
                  onPress={() => {
                    setShowDuplicateModal(false);
                    router.push(`/company/${company.id}`);
                  }}
                >
                  <Text style={styles.modalListItemText}>
                    {company.name}
                    {` (${company.groups.length} grupos)`}
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
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