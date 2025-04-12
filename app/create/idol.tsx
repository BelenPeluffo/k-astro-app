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
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/App.provider";
import { useSQLiteContext } from "expo-sqlite";
import { WesternZodiacSignRepository } from "@/database/repository/WesternZodiacSign.repository";
import { WesternZodiacSign } from "@/database/interfaces";
import { IdolRepository } from "@/database/repository/Idol.repository";

export default function CreateIdolPage() {
  const router = useRouter();
  const database = useSQLiteContext();
  const { createIdol, groups } = useAppContext();
  const [name, setName] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<Array<{
    group_id: number;
    is_active: boolean;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [zodiacSigns, setZodiacSigns] = useState<WesternZodiacSign[]>([]);
  const [selectedSigns, setSelectedSigns] = useState<Record<string, number | null>>({
    sun_sign_id: null,
    moon_sign_id: null,
    rising_sign_id: null,
    mercury_sign_id: null,
    venus_sign_id: null,
    mars_sign_id: null,
    jupiter_sign_id: null,
    saturn_sign_id: null,
    uranus_sign_id: null,
    neptune_sign_id: null,
    pluto_sign_id: null,
  });
  const [koreanName, setKoreanName] = useState("");

  useEffect(() => {
    const loadZodiacSigns = async () => {
      const repository = new WesternZodiacSignRepository(database);
      const signs = await repository.findAll();
      setZodiacSigns(signs);
    };
    loadZodiacSigns();
  }, [database]);

  const handleCreate = async () => {
    if (!name) {
      Alert.alert("Error", "Por favor ingresa el nombre del idol");
      return;
    }

    try {
      setIsLoading(true);
      const repository = new IdolRepository(database);
      
      // Buscar idols con el mismo nombre
      const existingIdols = await repository.findByName(name);
      
      if (existingIdols.length > 0) {
        // Mostrar alerta con las coincidencias
        Alert.alert(
          "¡Atención!",
          `Ya existen ${existingIdols.length} idols con nombres similares. ¿Deseas ver los detalles de alguno de ellos?`,
          [
            ...existingIdols.map(idol => ({
              text: `${idol.name}${idol.korean_name ? ` (${idol.korean_name})` : ''} - ${idol.groups.map(g => g.group_name).join(', ')}`,
              onPress: () => {
                router.push(`/idol/${idol.id}`);
              }
            })),
            {
              text: "Crear de todos modos",
              onPress: async () => {
                await createIdol(
                  name,
                  selectedGroups.length > 0 ? selectedGroups : undefined,
                  koreanName || null,
                  selectedSigns
                );
                Alert.alert("Éxito", "Idol creado correctamente", [
                  { text: "OK", onPress: () => router.replace("/") }
                ]);
              },
              style: "default"
            },
            {
              text: "Cancelar",
              style: "cancel"
            }
          ]
        );
        return;
      }

      // Si no hay coincidencias, crear el idol
      await createIdol(
        name,
        selectedGroups.length > 0 ? selectedGroups : undefined,
        koreanName || null,
        selectedSigns
      );
      
      Alert.alert("Éxito", "Idol creado correctamente", [
        { text: "OK", onPress: () => router.replace("/") }
      ]);
    } catch (error) {
      console.error('Error al crear idol:', error);
      Alert.alert("Error", "No se pudo crear el idol");
    } finally {
      setIsLoading(false);
    }
  };

  const planetLabels: Record<string, string> = {
    sun_sign_id: "Sol",
    moon_sign_id: "Luna",
    rising_sign_id: "Ascendente",
    mercury_sign_id: "Mercurio",
    venus_sign_id: "Venus",
    mars_sign_id: "Marte",
    jupiter_sign_id: "Júpiter",
    saturn_sign_id: "Saturno",
    uranus_sign_id: "Urano",
    neptune_sign_id: "Neptuno",
    pluto_sign_id: "Plutón",
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Información Básica</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del Idol"
        value={name}
        onChangeText={setName}
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Nombre en Coreano (opcional)"
        value={koreanName}
        onChangeText={setKoreanName}
        editable={!isLoading}
      />

      <Text style={styles.sectionTitle}>Grupos</Text>
      <Text style={styles.subtitle}>Selecciona los grupos</Text>

      {groups.map((group) => (
        <TouchableOpacity
          key={group.id}
          style={styles.groupSelector}
          onPress={() => {
            if (selectedGroups.some(g => g.group_id === group.id)) {
              setSelectedGroups(selectedGroups.filter((g) => g.group_id !== group.id));
            } else {
              setSelectedGroups([...selectedGroups, {
                group_id: group.id,
                is_active: true
              }]);
            }
          }}
        >
          <Text style={styles.groupLabel}>{group.name}</Text>
          {selectedGroups.some(g => g.group_id === group.id) && (
            <Text style={styles.selectedLabel}>Seleccionado</Text>
          )}
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Carta Astral</Text>
      <Text style={styles.subtitle}>Todos los campos son opcionales</Text>

      {Object.entries(planetLabels).map(([key, label]) => (
        <View key={key} style={styles.signSelector}>
          <Text style={styles.planetLabel}>{label}</Text>
          <Picker
            selectedValue={selectedSigns[key]}
            onValueChange={(itemValue) =>
              setSelectedSigns((prev) => ({
                ...prev,
                [key]: itemValue ? Number(itemValue) : null,
              }))
            }
            enabled={!isLoading}
            style={styles.picker}
          >
            <Picker.Item label="No especificado" value={null} />
            {zodiacSigns.map((sign) => (
              <Picker.Item key={sign.id} label={sign.name} value={sign.id} />
            ))}
          </Picker>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={isLoading || !name.trim()}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Creando..." : "Crear"}
        </Text>
      </TouchableOpacity>
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
  signSelector: {
    marginBottom: 16,
  },
  planetLabel: {
    fontSize: 16,
    marginBottom: 4,
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
  groupSelector: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  groupLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  selectedLabel: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "bold",
  },
});
