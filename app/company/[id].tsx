import { View, Text, StyleSheet, ScrollView, FlatList, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { CompanyRepository } from '@/database/repository/Company.repository';
import { Company } from '@/database/interfaces';
import { GroupRepository } from '@/database/repository/Group.repository';
import { DetailActions } from '@/app/components/DetailActions';
import { useAppContext } from '@/contexts/App.provider';
import { useRouter } from 'expo-router';

interface CompanyWithGroups extends Company {
  groups: { id: number; name: string }[];
}

export default function CompanyDetailsPage() {
  const { id } = useLocalSearchParams();
  const database = useSQLiteContext();
  const [company, setCompany] = useState<CompanyWithGroups | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { deleteCompany } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    const loadCompany = async () => {
      try {
        const companyRepo = new CompanyRepository(database);
        const groupRepo = new GroupRepository(database);
        
        const companyData = await companyRepo.findById(Number(id));
        if (companyData) {
          const groups = await groupRepo.findByCompanyId(Number(id));
          setCompany({ ...companyData, groups });
        }
      } catch (error) {
        console.error('Error loading company:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompany();
  }, [id, database]);

  const handleDelete = () => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que deseas eliminar esta compañía?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCompany(Number(id));
              Alert.alert("Éxito", "Compañía eliminada correctamente", [
                { text: "OK", onPress: () => router.replace("/") }
              ]);
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar la compañía");
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

  if (!company) {
    return (
      <View style={styles.container}>
        <Text>Compañía no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.title}>{company.name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grupos</Text>
          {company.groups.length > 0 ? (
            company.groups.map(group => (
              <View key={group.id} style={styles.groupItem}>
                <Text style={styles.groupName}>{group.name}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay grupos registrados</Text>
          )}
        </View>
      </ScrollView>
      
      <DetailActions
        onDelete={handleDelete}
        editRoute={`/edit/company/${id}`}
        entityName="compañía"
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  groupItem: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    fontSize: 16,
  },
}); 