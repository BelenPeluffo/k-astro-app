import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppContext } from '@/contexts/App.provider';
import { useEffect, useState } from 'react';
import { IdolWithRelations } from '@/database/interfaces';
import { useRouter } from 'expo-router';

export default function TimelinePage() {
  const context = useAppContext();
  const [sortedIdols, setSortedIdols] = useState<IdolWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!context) {
      setIsLoading(false);
      return;
    }

    const idols = context.idols || [];
    // Filtrar y ordenar idols por fecha de nacimiento
    const idolsWithBirthDate = idols.filter((idol: IdolWithRelations) => idol.birth_date);
    const sorted = [...idolsWithBirthDate].sort((a, b) => {
      if (!a.birth_date || !b.birth_date) return 0;
      return new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime();
    });
    setSortedIdols(sorted);
    setIsLoading(false);
  }, [context]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Fecha desconocida';
    // Mostrar la fecha en formato DD/MM/YYYY
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Línea Temporal de Idols</Text>
      <ScrollView style={styles.timeline}>
        {sortedIdols.length > 0 ? (
          sortedIdols.map((idol) => (
            <TouchableOpacity 
              key={idol.id} 
              style={styles.timelineItem}
              onPress={() => router.push(`/idol/${idol.id}`)}
            >
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.idolName}>{idol.name}</Text>
                <Text style={styles.birthDate}>
                  {formatDate(idol.birth_date)}
                </Text>
                <Text style={styles.groups}>
                  {idol.groups?.map(g => g.group_name).join(', ') || 'Sin grupos'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noData}>No hay idols con fecha de nacimiento registrada</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  timeline: {
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    marginRight: 16,
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  idolName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  birthDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  groups: {
    fontSize: 14,
    color: '#888',
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
}); 