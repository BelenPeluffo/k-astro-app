import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppContext, AppContextType } from '@/contexts/App.provider';

export type FilterParams = {
  idolName?: string;
  groupName?: string;
  companyName?: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  mercurySign?: string;
  venusSign?: string;
  marsSign?: string;
  jupiterSign?: string;
  saturnSign?: string;
  uranusSign?: string;
  neptuneSign?: string;
  plutoSign?: string;
  mediaType?: 'k-drama' | 'variety_show' | 'movie';
  mediaContentId?: number;
};

export const filterLabels: Record<keyof FilterParams, string> = {
  idolName: 'Nombre del Idol',
  groupName: 'Nombre del Grupo',
  companyName: 'Nombre de la Compañía',
  sunSign: 'Signo Solar',
  moonSign: 'Signo Lunar',
  risingSign: 'Signo Ascendente',
  mercurySign: 'Signo de Mercurio',
  venusSign: 'Signo de Venus',
  marsSign: 'Signo de Marte',
  jupiterSign: 'Signo de Júpiter',
  saturnSign: 'Signo de Saturno',
  uranusSign: 'Signo de Urano',
  neptuneSign: 'Signo de Neptuno',
  plutoSign: 'Signo de Plutón',
  mediaType: 'Tipo de Contenido',
  mediaContentId: 'Contenido Multimedia'
};

export const useFiltersState = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const context = useAppContext();
  
  if (!context) {
    throw new Error('useFiltersState must be used within an AppProvider');
  }
  
  const { filterIdols, refreshData } = context;
  const [filters, setFilters] = useState<FilterParams>({});

  useEffect(() => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== '')
    ) as FilterParams;
    setFilters(cleanParams);
  }, [params]);

  const filterValidParams = (params: Record<string, any>): FilterParams => {
    return Object.entries(params)
      .filter(([key, value]) => 
        filterLabels.hasOwnProperty(key) && 
        value && 
        value !== '' && 
        value !== 'undefined'
      )
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value
      }), {});
  };

  const clearFilters = async () => {
    await refreshData();
    router.replace('/');
  };

  const applyFilters = async (newFilters: FilterParams) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([_, value]) => value !== '')
    );
    await filterIdols(cleanFilters);
    router.push({
      pathname: '/',
      params: cleanFilters,
    });
  };

  return {
    filters,
    setFilters,
    activeFilters: filterValidParams(params),
    clearFilters,
    applyFilters,
    filterLabels
  };
}; 