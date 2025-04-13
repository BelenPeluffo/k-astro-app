import { createContext, useEffect, useState, useContext } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Idol, Company, Group, IdolWithRelations, MediaContent, MediaContentWithRelations } from "@/database/interfaces";
import { IdolRepository } from "@/database/repository/Idol.repository";
import { CompanyRepository } from "@/database/repository/Company.repository";
import { GroupRepository } from "@/database/repository/Group.repository";
import { MediaContentRepository } from "@/database/repository/MediaContent.repository";

export interface AppContextType {
  idols: IdolWithRelations[];
  companies: Company[];
  groups: Group[];
  mediaContent: MediaContentWithRelations[];
  createIdol: (
    name: string,
    koreanName: string | null,
    birthDate?: string | null,
    groups?: Array<{
      group_id: number;
      is_active: boolean;
    }>,
    signs?: Partial<
      Pick<
        Idol,
        | "sun_sign_id"
        | "moon_sign_id"
        | "rising_sign_id"
        | "mercury_sign_id"
        | "venus_sign_id"
        | "mars_sign_id"
        | "jupiter_sign_id"
        | "saturn_sign_id"
        | "uranus_sign_id"
        | "neptune_sign_id"
        | "pluto_sign_id"
      >
    >
  ) => Promise<void>;
  createCompany: (name: string) => Promise<void>;
  createGroup: (name: string, companyId?: number) => Promise<void>;
  createMediaContent: (
    title: string,
    type: 'k-drama' | 'variety_show' | 'movie',
    idols?: Array<{
      idol_id: number,
      role: string | null
    }>,
    releaseDate?: string | null,
    description?: string | null
  ) => Promise<void>;
  refreshData: () => Promise<void>;
  filterIdols: (filters: {
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
  }) => Promise<void>;
  deleteIdol: (id: number) => Promise<void>;
  deleteGroup: (id: number) => Promise<void>;
  deleteCompany: (id: number) => Promise<void>;
  deleteMediaContent: (id: number) => Promise<void>;
  updateIdol: (
    id: number,
    name: string,
    koreanName: string | null,
    birthDate?: string | null,
    groups?: Array<{
      group_id: number;
      is_active: boolean;
    }>,
    signs?: Partial<
      Pick<
        Idol,
        | "sun_sign_id"
        | "moon_sign_id"
        | "rising_sign_id"
        | "mercury_sign_id"
        | "venus_sign_id"
        | "mars_sign_id"
        | "jupiter_sign_id"
        | "saturn_sign_id"
        | "uranus_sign_id"
        | "neptune_sign_id"
        | "pluto_sign_id"
      >
    >,
    mediaContent?: Array<{
      media_content_id: number;
      role: string | null;
    }>
  ) => Promise<void>;
}

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const database = useSQLiteContext();
  const idolRepository = new IdolRepository(database);
  const companyRepository = new CompanyRepository(database);
  const groupRepository = new GroupRepository(database);
  const mediaContentRepository = new MediaContentRepository(database);

  const [idols, setIdols] = useState<IdolWithRelations[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [mediaContent, setMediaContent] = useState<MediaContentWithRelations[]>([]);

  const refreshData = async () => {
    try {
      const [idolsData, companiesData, groupsData, mediaContentData] = await Promise.all([
        idolRepository.findByFilters({}),
        companyRepository.findAll(),
        groupRepository.findAll(),
        mediaContentRepository.findAllWithRelations()
      ]);

      setIdols(idolsData);
      setCompanies(companiesData);
      setGroups(groupsData);
      setMediaContent(mediaContentData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [database]);

  const createIdol = async (
    name: string,
    koreanName: string | null,
    birthDate?: string | null,
    groups?: Array<{
      group_id: number;
      is_active: boolean;
    }>,
    signs?: Partial<
      Pick<
        Idol,
        | "sun_sign_id"
        | "moon_sign_id"
        | "rising_sign_id"
        | "mercury_sign_id"
        | "venus_sign_id"
        | "mars_sign_id"
        | "jupiter_sign_id"
        | "saturn_sign_id"
        | "uranus_sign_id"
        | "neptune_sign_id"
        | "pluto_sign_id"
      >
    >
  ) => {
    try {
      await idolRepository.create(name, groups, koreanName, birthDate, signs);
      await refreshData();
    } catch (error) {
      console.error('Error creating idol:', error);
      throw error;
    }
  };

  const createCompany = async (name: string) => {
    try {
      await companyRepository.create(name);
      await refreshData();
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  };

  const createGroup = async (name: string, companyId?: number) => {
    try {
      await groupRepository.create(name, companyId);
      await refreshData();
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const createMediaContent = async (
    title: string,
    type: 'k-drama' | 'variety_show' | 'movie',
    idols?: Array<{
      idol_id: number,
      role: string | null
    }>,
    releaseDate?: string | null,
    description?: string | null
  ) => {
    try {
      await mediaContentRepository.create(title, type, idols, releaseDate, description);
      await refreshData();
    } catch (error) {
      console.error('Error creating media content:', error);
      throw error;
    }
  };

  const deleteIdol = async (id: number) => {
    try {
      await idolRepository.delete(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting idol:', error);
      throw error;
    }
  };

  const deleteGroup = async (id: number) => {
    try {
      await groupRepository.delete(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  };

  const deleteCompany = async (id: number) => {
    try {
      await companyRepository.delete(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  };

  const deleteMediaContent = async (id: number) => {
    try {
      await mediaContentRepository.delete(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting media content:', error);
      throw error;
    }
  };

  const filterIdols = async (filters: {
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
  }) => {
    try {
      const filteredIdols = await idolRepository.findByFilters(filters);
      setIdols(filteredIdols);
    } catch (error) {
      console.error('Error filtering idols:', error);
      throw error;
    }
  };

  const updateIdol = async (
    id: number,
    name: string,
    koreanName: string | null,
    birthDate?: string | null,
    groups?: Array<{
      group_id: number;
      is_active: boolean;
    }>,
    signs?: Partial<
      Pick<
        Idol,
        | "sun_sign_id"
        | "moon_sign_id"
        | "rising_sign_id"
        | "mercury_sign_id"
        | "venus_sign_id"
        | "mars_sign_id"
        | "jupiter_sign_id"
        | "saturn_sign_id"
        | "uranus_sign_id"
        | "neptune_sign_id"
        | "pluto_sign_id"
      >
    >,
    mediaContent?: Array<{
      media_content_id: number;
      role: string | null;
    }>
  ) => {
    await idolRepository.update(
      id,
      name,
      groups ?? [],
      koreanName ?? null,
      birthDate ?? null,
      signs,
      mediaContent ?? []
    );
    await refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        idols,
        companies,
        groups,
        mediaContent,
        createIdol,
        createCompany,
        createGroup,
        createMediaContent,
        refreshData,
        filterIdols,
        deleteIdol,
        deleteGroup,
        deleteCompany,
        deleteMediaContent,
        updateIdol,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
