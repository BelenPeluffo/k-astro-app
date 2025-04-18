import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppContext, AppContextType } from '@/contexts/App.provider';
import { useSQLiteContext } from 'expo-sqlite';
import { WesternZodiacSignRepository } from '@/database/repository/WesternZodiacSign.repository';
import { Picker } from '@react-native-picker/picker';
import { WesternZodiacSign } from '@/database/interfaces';
import { useFiltersState } from '@/hooks/useFiltersState';

export const FiltersScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const database = useSQLiteContext();
  const { filterIdols } = useAppContext() as AppContextType;
  const { applyFilters } = useFiltersState();
  const [zodiacSigns, setZodiacSigns] = useState<WesternZodiacSign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [filters, setFilters] = useState({
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

  useEffect(() => {
    const newFilters = { ...filters };
    let hasChanges = false;
    
    Object.keys(params).forEach(key => {
      if (key in newFilters && params[key] !== newFilters[key as keyof typeof newFilters]) {
        newFilters[key as keyof typeof newFilters] = params[key] as string;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setFilters(newFilters);
    }
  }, [params]);

  const planetLabels = {
    sunSign: "Sol",
    moonSign: "Luna",
    risingSign: "Ascendente",
    mercurySign: "Mercurio",
    venusSign: "Venus",
    marsSign: "Marte",
    jupiterSign: "Júpiter",
    saturnSign: "Saturno",
    uranusSign: "Urano",
    neptuneSign: "Neptuno",
    plutoSign: "Plutón",
  };

  const handleApplyFilters = async () => {
    setIsLoading(true);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      ) as typeof filters;
      
      await filterIdols(cleanFilters);
      applyFilters(cleanFilters);
      router.replace('/');
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
        {Object.entries(planetLabels).map(([key, label]) => (
          <View key={key} style={styles.signSelector}>
            <Text style={styles.planetLabel}>{label}</Text>
            <Picker
              selectedValue={filters[key as keyof typeof filters]}
              onValueChange={(value) => 
                setFilters(prev => ({...prev, [key]: value}))
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
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleApplyFilters}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Aplicando...' : 'Aplicar Filtros'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
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
}); 