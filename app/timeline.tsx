import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useAppContext } from '@/contexts/App.provider';
import { useEffect, useState } from 'react';
import { IdolWithRelations } from '@/database/interfaces';
import { useRouter } from 'expo-router';

// Zodiac sign color mapping
const zodiacColors: Record<string, string> = {
  'Aries': '#FF5252',      // Rojo brillante
  'Taurus': '#4CAF50',     // Verde
  'Gemini': '#FFC107',     // Amarillo
  'Cancer': '#9C27B0',     // Púrpura
  'Leo': '#FF9800',        // Naranja
  'Virgo': '#00BCD4',      // Cian
  'Libra': '#E91E63',      // Rosa
  'Scorpio': '#3F51B5',    // Índigo
  'Sagittarius': '#FF5722', // Naranja oscuro
  'Capricorn': '#795548',   // Marrón
  'Aquarius': '#2196F3',    // Azul
  'Pisces': '#009688',      // Verde azulado
};

export default function TimelinePage() {
  const context = useAppContext();
  const [sortedIdols, setSortedIdols] = useState<IdolWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [selectedIdol, setSelectedIdol] = useState<IdolWithRelations | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

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

  const getZodiacColor = (signName: string | null) => {
    if (!signName) return '#007AFF'; // Default color if no sign
    return zodiacColors[signName] || '#007AFF';
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
              <TouchableOpacity 
                style={[styles.timelineDot, { backgroundColor: getZodiacColor(idol.sun_sign_name) }]}
                onPress={() => {
                  setSelectedIdol(idol);
                  setShowTooltip(true);
                }}
              />
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

      <Modal
        visible={showTooltip}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTooltip(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTooltip(false)}
        >
          <View style={styles.tooltipContainer}>
            <Text style={styles.tooltipTitle}>Signo Zodiacal</Text>
            <Text style={styles.tooltipText}>
              {selectedIdol?.sun_sign_name || 'No disponible'}
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    minWidth: 200,
    alignItems: 'center',
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tooltipText: {
    fontSize: 16,
    color: '#666',
  },
}); 