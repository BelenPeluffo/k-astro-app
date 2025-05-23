import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/App.provider";
import { useSQLiteContext } from "expo-sqlite";
import { WesternZodiacSignRepository } from "@/database/repository/WesternZodiacSign.repository";
import { IdolRepository } from "@/database/repository/Idol.repository";
import { WesternZodiacSign } from "@/database/interfaces";
import { MediaContentWithRelations } from "@/database/interfaces";

export default function EditIdolPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const database = useSQLiteContext();
  const { updateIdol, groups, mediaContent } = useAppContext();
  
  const [name, setName] = useState("");
  const [koreanName, setKoreanName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<Array<{
    group_id: number;
    is_active: boolean;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [selectedMediaContent, setSelectedMediaContent] = useState<Array<{
    media_content_id: number;
    role: string | null;
  }>>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar signos zodiacales
        const zodiacRepository = new WesternZodiacSignRepository(database);
        const signs = await zodiacRepository.findAll();
        setZodiacSigns(signs);

        // Cargar datos del idol
        const idolRepository = new IdolRepository(database);
        const idol = await idolRepository.findWithRelations(Number(id));
        if (idol) {
          setName(idol.name);
          setKoreanName(idol.korean_name || '');
          setBirthDate(idol.birth_date || '');
          setImageUrl(idol.image_url || '');
          setSelectedGroups(idol.groups.map(g => ({
            group_id: g.group_id,
            is_active: g.is_active
          })));
          setSelectedSigns({
            sun_sign_id: idol.sun_sign_id,
            moon_sign_id: idol.moon_sign_id,
            rising_sign_id: idol.rising_sign_id,
            mercury_sign_id: idol.mercury_sign_id,
            venus_sign_id: idol.venus_sign_id,
            mars_sign_id: idol.mars_sign_id,
            jupiter_sign_id: idol.jupiter_sign_id,
            saturn_sign_id: idol.saturn_sign_id,
            uranus_sign_id: idol.uranus_sign_id,
            neptune_sign_id: idol.neptune_sign_id,
            pluto_sign_id: idol.pluto_sign_id,
          });
          setSelectedMediaContent(idol.media_content.map(mc => ({
            media_content_id: mc.media_content_id,
            role: mc.role
          })));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, database]);

  const handleUpdate = async () => {
    if (!name.trim() || selectedGroups.length === 0) {
      Alert.alert("Error", "Por favor completa los campos requeridos");
      return;
    }

    setIsLoading(true);
    try {
      await updateIdol(
        Number(id),
        name,
        koreanName.trim() || null,
        birthDate.trim() || null,
        selectedGroups,
        selectedSigns,
        selectedMediaContent,
        imageUrl.trim() || null
      );
      Alert.alert(
        "Éxito",
        "El idol ha sido actualizado correctamente",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/idol/${id}`)
          }
        ]
      );
    } catch (error) {
      console.error("Error updating idol:", error);
      Alert.alert(
        "Error",
        "No se pudo actualizar el idol. Por favor, intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const planetLabels = {
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

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
      <TextInput
        style={styles.input}
        placeholder="Fecha de Nacimiento (YYYY-MM-DD)"
        value={birthDate}
        onChangeText={setBirthDate}
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="URL de la imagen (opcional)"
        value={imageUrl}
        onChangeText={setImageUrl}
        editable={!isLoading}
      />

      <Text style={styles.sectionTitle}>Grupos</Text>
      {groups.map((group) => (
        <View key={group.id} style={styles.groupSelector}>
          <TouchableOpacity
            style={styles.groupItem}
            onPress={() => {
              const isSelected = selectedGroups.some(g => g.group_id === group.id);
              if (isSelected) {
                setSelectedGroups(selectedGroups.filter(g => g.group_id !== group.id));
              } else {
                if (!selectedGroups.some(g => g.group_id === group.id)) {
                  setSelectedGroups([...selectedGroups, { group_id: group.id, is_active: true }]);
                }
              }
            }}
          >
            <Text style={styles.groupLabel}>{group.name}</Text>
            {selectedGroups.some(g => g.group_id === group.id) && (
              <View style={styles.groupStatusContainer}>
                <Text style={styles.selectedLabel}>Seleccionado</Text>
                <Switch
                  value={selectedGroups.find(g => g.group_id === group.id)?.is_active ?? true}
                  onValueChange={(value) => {
                    setSelectedGroups(selectedGroups.map(g => 
                      g.group_id === group.id ? { ...g, is_active: value } : g
                    ));
                  }}
                />
                <Text style={styles.statusLabel}>
                  {selectedGroups.find(g => g.group_id === group.id)?.is_active 
                    ? 'Activo' 
                    : 'Inactivo'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
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

      <Text style={styles.sectionTitle}>Contenido Multimedia</Text>
      <Text style={styles.subtitle}>Selecciona el contenido en el que ha aparecido</Text>
      {mediaContent.map((content) => (
        <View key={content.id} style={styles.mediaContentItem}>
          <Text>{content.title}</Text>
          <Text style={styles.mediaContentType}>
            {content.type === 'k-drama' ? 'K-Drama' :
             content.type === 'variety_show' ? 'Programa de Variedades' :
             'Película'}
          </Text>
          <TextInput
            style={styles.roleInput}
            placeholder="Rol"
            value={selectedMediaContent.find(mc => mc.media_content_id === content.id)?.role || ''}
            onChangeText={(role) => {
              const existingIndex = selectedMediaContent.findIndex(
                (s) => s.media_content_id === content.id
              );
              
              if (existingIndex >= 0) {
                // Si ya existe, actualizamos el rol
                const newSelectedContent = [...selectedMediaContent];
                newSelectedContent[existingIndex] = {
                  ...newSelectedContent[existingIndex],
                  role: role || null,
                };
                setSelectedMediaContent(newSelectedContent);
              } else {
                // Si no existe, lo agregamos
                setSelectedMediaContent([
                  ...selectedMediaContent,
                  { media_content_id: content.id, role: role || null },
                ]);
              }
            }}
          />
        </View>
      ))}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleUpdate}
        disabled={isLoading || !name.trim() || selectedGroups.length === 0}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Actualizando..." : "Actualizar"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
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
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  groupSelector: {
    marginVertical: 8,
  },
  groupItem: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  groupLabel: {
    flex: 1,
    fontSize: 16,
  },
  groupStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  selectedLabel: {
    marginRight: 8,
  },
  statusLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  mediaContentItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  mediaContentType: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  roleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
  },
}); 