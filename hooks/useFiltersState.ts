import { useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppContext } from '@/contexts/App.provider';

export const filterLabels = {
  idolName: "Nombre del Idol",
  groupName: "Grupo",
  companyName: "Compañía",
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

export interface FilterParams {
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
}

export const useFiltersState = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { filterIdols, refreshData } = useAppContext();

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

  const applyFilters = async (filters: FilterParams) => {
    const validFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value && value !== '')
    );
    
    await filterIdols(validFilters);
    router.replace({
      pathname: '/',
      params: validFilters
    });
  };

  return {
    activeFilters: filterValidParams(params),
    clearFilters,
    applyFilters,
    filterLabels
  };
}; 