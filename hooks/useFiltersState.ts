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
  const initialRenderRef = useRef(true);
  const previousParamsRef = useRef({});

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

  const clearFilters = () => {
    router.replace({
      pathname: '/',
      params: {}
    });
  };

  const applyFilters = (filters: FilterParams) => {
    const validFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value && value !== '')
    );
    
    router.push({
      pathname: '/',
      params: validFilters
    });
  };

  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    const currentParams = filterValidParams(params);
    const paramsChanged = JSON.stringify(currentParams) !== JSON.stringify(previousParamsRef.current);

    if (paramsChanged) {
      previousParamsRef.current = currentParams;
      if (Object.keys(currentParams).length === 0) {
        refreshData();
      } else {
        filterIdols(currentParams);
      }
    }
  }, [params, filterIdols, refreshData]);

  return {
    activeFilters: filterValidParams(params),
    clearFilters,
    applyFilters,
    filterLabels
  };
}; 