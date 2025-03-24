import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useAppContext } from '@/contexts/App.provider';
import { useFiltersState, filterLabels, FilterParams } from '@/hooks/useFiltersState';
import { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Text, View, TextInput, StyleSheet } from 'react-native';
import { WesternZodiacSignRepository } from '@/database/repository/WesternZodiacSign.repository';
import { WesternZodiacSign } from '@/database/interfaces';
import { Picker } from '@react-native-picker/picker';

export default function FiltersPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const database = useSQLiteContext();
  const { filterIdols } = useAppContext();
  const { applyFilters } = useFiltersState();
  const [zodiacSigns, setZodiacSigns] = useState<WesternZodiacSign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [filters, setFilters] = useState<FilterParams>({
    idolName: '',
    groupName: '',
    companyName: '',
    sunSign: '',
    moonSign: '',
    risingSign: '',
    mercurySign: '',
    venusSign: '',
    marsSign: '',
    jupiterSign: '',
    saturnSign: '',
    uranusSign: '',
    neptuneSign: '',
    plutoSign: '',
  });

  useEffect(() => {
    const loadZodiacSigns = async () => {
      const repository = new WesternZodiacSignRepository(database);
      const signs = await repository.findAll();
      setZodiacSigns(signs);
    };
    loadZodiacSigns();
  }, [database]);

  const handleApplyFilters = async () => {
    setIsLoading(true);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      ) as FilterParams;
      await filterIdols(cleanFilters);
      applyFilters(cleanFilters);
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Filtros</Text>

      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Información General</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre del Idol"
          value={filters.idolName}
          onChangeText={(text) => setFilters({...filters, idolName: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Nombre del Grupo"
          value={filters.groupName}
          onChangeText={(text) => setFilters({...filters, groupName: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Nombre de la Compañía"
          value={filters.companyName}
          onChangeText={(text) => setFilters({...filters, companyName: text})}
        />
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Signos Zodiacales</Text>
        {Object.entries(filterLabels).map(([key, label]) => {
          if (key === 'idolName' || key === 'groupName' || key === 'companyName') return null;
          const filterKey = key as keyof FilterParams;
          return (
            <View key={key} style={styles.signSelector}>
              <Text style={styles.planetLabel}>{label}</Text>
              <Picker
                selectedValue={filters[filterKey]}
                onValueChange={(value) => 
                  setFilters(prev => ({...prev, [filterKey]: value}))
                }
                style={styles.picker}
              >
                <Picker.Item label="Cualquier signo" value="" />
                {zodiacSigns.map((sign) => (
                  <Picker.Item 
                    key={sign.id} 
                    label={sign.name} 
                    value={sign.name}
                  />
                ))}
              </Picker>
            </View>
          );
        })}
      </View>

      <TouchableOpacity 
        style={[styles.applyButton, isLoading && styles.buttonDisabled]}
        onPress={handleApplyFilters}
        disabled={isLoading}
      >
        <Text style={styles.applyButtonText}>
          {isLoading ? 'Aplicando...' : 'Aplicar Filtros'}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  signSelector: {
    marginBottom: 16,
  },
  planetLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  applyButton: {
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
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 