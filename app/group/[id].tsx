import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { GroupRepository } from '@/database/repository/Group.repository';
import { GroupWithCompany } from '@/database/interfaces';
import { DetailActions } from '@/app/components/DetailActions';
import { useAppContext } from '@/contexts/App.provider';

export default function GroupDetailsPage() {
  const { id } = useLocalSearchParams();
  const database = useSQLiteContext();
  const [group, setGroup] = useState<GroupWithCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { deleteGroup } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    const loadGroup = async () => {
      try {
        const repository = new GroupRepository(database);
        const groupData = await repository.findWithCompany(Number(id));
        setGroup(groupData);
      } catch (error) {
        console.error('Error loading group:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGroup();
  }, [id, database]);

  const handleDelete = () => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que deseas eliminar este grupo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGroup(Number(id));
              Alert.alert("Éxito", "Grupo eliminado correctamente", [
                { text: "OK", onPress: () => router.replace("/") }
              ]);
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el grupo");
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <Text>Grupo no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.title}>{group.name}</Text>
          <Text style={styles.subtitle}>
            {group.company_name || 'Compañía no especificada'}
          </Text>
        </View>
      </ScrollView>
      
      <DetailActions
        onDelete={handleDelete}
        editRoute={`/edit/group/${id}`}
        entityName="grupo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
}); 