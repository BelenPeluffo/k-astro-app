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
import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/App.provider";
import { useSQLiteContext } from "expo-sqlite";
import { IdolRepository } from "@/database/repository/Idol.repository";
import { IdolWithRelations } from "@/database/interfaces";

export default function CreateMediaContentPage() {
  const router = useRouter();
  const database = useSQLiteContext();
  const { createMediaContent, idols } = useAppContext();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<'k-drama' | 'variety_show' | 'movie'>('k-drama');
  const [selectedIdols, setSelectedIdols] = useState<Array<{
    idol_id: number;
    role: string | null;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [releaseDate, setReleaseDate] = useState("");
  const [description, setDescription] = useState("");
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [existingMediaContent, setExistingMediaContent] = useState<any[]>([]);

  const handleCreate = async () => {
    if (!title) {
      Alert.alert("Error", "El título es requerido");
      return;
    }

    setIsLoading(true);
    try {
      await createMediaContent(
        title,
        type,
        selectedIdols,
        releaseDate || null,
        description || null
      );
      router.back();
    } catch (error) {
      console.error("Error creating media content:", error);
      Alert.alert("Error", "No se pudo crear el contenido multimedia");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ingrese el título"
        />

        <Text style={styles.label}>Tipo</Text>
        <Picker
          selectedValue={type}
          onValueChange={(value) => setType(value as 'k-drama' | 'variety_show' | 'movie')}
          style={styles.picker}
        >
          <Picker.Item label="K-Drama" value="k-drama" />
          <Picker.Item label="Programa de Variedades" value="variety_show" />
          <Picker.Item label="Película" value="movie" />
        </Picker>

        <Text style={styles.label}>Fecha de Lanzamiento</Text>
        <TextInput
          style={styles.input}
          value={releaseDate}
          onChangeText={setReleaseDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Ingrese una descripción"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Idols</Text>
        {idols.map((idol) => (
          <View key={idol.id} style={styles.idolItem}>
            <Text>{idol.name}</Text>
            <TextInput
              style={styles.roleInput}
              placeholder="Rol"
              onChangeText={(role) => {
                const existingIndex = selectedIdols.findIndex(
                  (s) => s.idol_id === idol.id
                );
                if (existingIndex >= 0) {
                  const newSelectedIdols = [...selectedIdols];
                  newSelectedIdols[existingIndex] = {
                    idol_id: idol.id,
                    role: role || null,
                  };
                  setSelectedIdols(newSelectedIdols);
                } else {
                  setSelectedIdols([
                    ...selectedIdols,
                    { idol_id: idol.id, role: role || null },
                  ]);
                }
              }}
            />
          </View>
        ))}

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreate}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Creando..." : "Crear"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDuplicateModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Contenido multimedia similar encontrado
            </Text>
            {existingMediaContent.map((content) => (
              <Text key={content.id} style={styles.modalText}>
                {content.title} ({content.type})
              </Text>
            ))}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowDuplicateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleCreate}
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
    backgroundColor: "#fff",
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    borderRadius: 5,
  },
  idolItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  roleInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 5,
    width: 150,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: "#FF3B30",
  },
  modalButtonConfirm: {
    backgroundColor: "#34C759",
  },
  modalButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
}); 