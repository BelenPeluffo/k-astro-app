import { useState, useMemo } from 'react';
import { IdolWithRelations } from '../database/interfaces';

type MediaType = 'k-drama' | 'variety_show' | 'movie' | 'all';

export const useIdolMediaFilter = (idols: IdolWithRelations[]) => {
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType>('all');

  const filteredIdols = useMemo(() => {
    if (selectedMediaType === 'all') {
      return idols;
    }

    return idols.filter(idol => 
      idol.media_content.some(content => content.type === selectedMediaType)
    );
  }, [idols, selectedMediaType]);

  const mediaTypes = useMemo(() => {
    const types = new Set<MediaType>();
    idols.forEach(idol => {
      idol.media_content.forEach(content => {
        types.add(content.type);
      });
    });
    return ['all', ...Array.from(types)];
  }, [idols]);

  return {
    filteredIdols,
    selectedMediaType,
    setSelectedMediaType,
    mediaTypes,
  };
}; 