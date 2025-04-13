import { useEffect, useState } from 'react';
import { MediaContent } from '@/database/interfaces';
import { MediaContentRepository } from '@/database/repository/MediaContent.repository';
import { useSQLiteContext } from 'expo-sqlite';

interface FilterBarProps {
  onFilterChange: (filters: { mediaContentId?: number }) => void;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [mediaContents, setMediaContents] = useState<MediaContent[]>([]);
  const db = useSQLiteContext();
  
  useEffect(() => {
    const loadMediaContents = async () => {
      const mediaContentRepo = new MediaContentRepository(db);
      const contents = await mediaContentRepo.findAll();
      setMediaContents(contents);
    };
    loadMediaContents();
  }, [db]);

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow">
      <select 
        className="px-4 py-2 border rounded-lg"
        aria-label="Seleccionar contenido multimedia"
        onChange={(e) => onFilterChange({ mediaContentId: parseInt(e.target.value) || undefined })}
      >
        <option value="">Todos los contenidos</option>
        {mediaContents.map((content) => (
          <option key={content.id} value={content.id}>
            {content.title}
          </option>
        ))}
      </select>
    </div>
  );
} 