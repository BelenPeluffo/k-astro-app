import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/App.provider";
import { useSQLiteContext } from "expo-sqlite";
import { MediaContentRepository } from "@/database/repository/MediaContent.repository";
import { MediaContentWithRelations } from "@/database/interfaces";

export default function EditMediaContentPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const database = useSQLiteContext();
  const { idols } = useAppContext();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<'k-drama' | 'variety_show' | 'movie'>('k-drama');
  const [selectedIdols, setSelectedIdols] = useState<Array<{
    idol_id: number;
    role: string | null;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [releaseDate, setReleaseDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const repository = new MediaContentRepository(database);
        const mediaContent = await repository.findWithRelations(Number(id));
        if (mediaContent) {
          setTitle(mediaContent.title);
          setType(mediaContent.type);
          setReleaseDate(mediaContent.release_date || '');
          setDescription(mediaContent.description || '');
          setSelectedIdols(mediaContent.idols.map(i => ({
            idol_id: i.idol_id,
            role: i.role
          })));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'No se pudo cargar el contenido multimedia');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, database]);

  const handleUpdate = async () => {
    if (!title) {
      Alert.alert("Error", "El título es requerido");
      return;
    }

    setIsLoading(true);
    try {
      const repository = new MediaContentRepository(database);
      await repository.update(
        Number(id),
        title,
        type,
        selectedIdols,
        releaseDate || null,
        description || null
      );
      router.back();
    } catch (error) {
      console.error("Error updating media content:", error);
      Alert.alert("Error", "No se pudo actualizar el contenido multimedia");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

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
        {idols.map((idol) => {
          const existingRole = selectedIdols.find(s => s.idol_id === idol.id)?.role;
          return (
            <View key={idol.id} style={styles.idolItem}>
              <Text>{idol.name}</Text>
              <TextInput
                style={styles.roleInput}
                placeholder="Rol"
                value={existingRole || ''}
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
          );
        })}

        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Actualizando..." : "Actualizar"}
          </Text>
        </TouchableOpacity>
      </View>
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
}); 