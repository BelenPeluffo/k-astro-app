import { createContext, useEffect, useState, useContext } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Idol, Company, Group } from "@/database/interfaces";
import { IdolRepository } from "@/database/repository/Idol.repository";
import { CompanyRepository } from "@/database/repository/Company.repository";
import { GroupRepository } from "@/database/repository/Group.repository";

export interface AppContextType {
  idols: Idol[];
  companies: Company[];
  groups: Group[];
  createIdol: (
    name: string, 
    groupId: number,
    koreanName: string | null,
    signs?: Partial<Pick<Idol, 
      'sun_sign_id' | 
      'moon_sign_id' | 
      'rising_sign_id' | 
      'mercury_sign_id' |
      'venus_sign_id' |
      'mars_sign_id' |
      'jupiter_sign_id' |
      'saturn_sign_id' |
      'uranus_sign_id' |
      'neptune_sign_id' |
      'pluto_sign_id'
    >>
  ) => Promise<void>;
  createCompany: (name: string) => Promise<void>;
  createGroup: (name: string, companyId: number) => Promise<void>;
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
  }) => Promise<void>;
  deleteIdol: (id: number) => Promise<void>;
  deleteGroup: (id: number) => Promise<void>;
  deleteCompany: (id: number) => Promise<void>;
  updateIdol: (
    id: number,
    name: string,
    groupId: number,
    koreanName: string | null,
    signs?: Partial<Pick<Idol,
      'sun_sign_id' |
      'moon_sign_id' |
      'rising_sign_id' |
      'mercury_sign_id' |
      'venus_sign_id' |
      'mars_sign_id' |
      'jupiter_sign_id' |
      'saturn_sign_id' |
      'uranus_sign_id' |
      'neptune_sign_id' |
      'pluto_sign_id'
    >>
  ) => Promise<void>;
}

export const AppContext = createContext<AppContextType>({
  idols: [],
  companies: [],
  groups: [],
  createIdol: async () => {},
  createCompany: async () => {},
  createGroup: async () => {},
  refreshData: async () => {},
  filterIdols: async () => {},
  deleteIdol: async () => {},
  deleteGroup: async () => {},
  deleteCompany: async () => {},
  updateIdol: async () => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const database = useSQLiteContext();
  const idolRepository = new IdolRepository(database);
  const companyRepository = new CompanyRepository(database);
  const groupRepository = new GroupRepository(database);

  const [idols, setIdols] = useState<Idol[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const refreshData = async () => {
    const [newIdols, newCompanies, newGroups] = await Promise.all([
      idolRepository.findAll(),
      companyRepository.findAll(),
      groupRepository.findAll(),
    ]);
    setIdols(newIdols);
    setCompanies(newCompanies);
    setGroups(newGroups);
  };

  useEffect(() => {
    refreshData();
  }, [database]);

  const createIdol = async (
    name: string, 
    groupId: number,
    koreanName: string | null,
    signs?: Partial<Pick<Idol, 
      'sun_sign_id' | 
      'moon_sign_id' | 
      'rising_sign_id' | 
      'mercury_sign_id' |
      'venus_sign_id' |
      'mars_sign_id' |
      'jupiter_sign_id' |
      'saturn_sign_id' |
      'uranus_sign_id' |
      'neptune_sign_id' |
      'pluto_sign_id'
    >>
  ) => {
    await idolRepository.create(name, groupId, koreanName, signs);
    await refreshData();
  };

  const createCompany = async (name: string) => {
    await companyRepository.create(name);
    await refreshData();
  };

  const createGroup = async (name: string, companyId: number) => {
    await groupRepository.create(name, companyId);
    await refreshData();
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
  }) => {
    const query = `
      SELECT DISTINCT i.*, g.name as group_name, c.name as company_name 
      FROM idol i
      LEFT JOIN "group" g ON i.group_id = g.id
      LEFT JOIN company c ON g.company_id = c.id
      LEFT JOIN western_zodiac_sign ws_sun ON i.sun_sign_id = ws_sun.id
      LEFT JOIN western_zodiac_sign ws_moon ON i.moon_sign_id = ws_moon.id
      LEFT JOIN western_zodiac_sign ws_rising ON i.rising_sign_id = ws_rising.id
      LEFT JOIN western_zodiac_sign ws_mercury ON i.mercury_sign_id = ws_mercury.id
      LEFT JOIN western_zodiac_sign ws_venus ON i.venus_sign_id = ws_venus.id
      LEFT JOIN western_zodiac_sign ws_mars ON i.mars_sign_id = ws_mars.id
      LEFT JOIN western_zodiac_sign ws_jupiter ON i.jupiter_sign_id = ws_jupiter.id
      LEFT JOIN western_zodiac_sign ws_saturn ON i.saturn_sign_id = ws_saturn.id
      LEFT JOIN western_zodiac_sign ws_uranus ON i.uranus_sign_id = ws_uranus.id
      LEFT JOIN western_zodiac_sign ws_neptune ON i.neptune_sign_id = ws_neptune.id
      LEFT JOIN western_zodiac_sign ws_pluto ON i.pluto_sign_id = ws_pluto.id
      WHERE 1=1
      ${filters.idolName ? 'AND i.name LIKE ?' : ''}
      ${filters.groupName ? 'AND g.name LIKE ?' : ''}
      ${filters.companyName ? 'AND c.name LIKE ?' : ''}
      ${filters.sunSign ? 'AND ws_sun.name LIKE ?' : ''}
      ${filters.moonSign ? 'AND ws_moon.name LIKE ?' : ''}
      ${filters.risingSign ? 'AND ws_rising.name LIKE ?' : ''}
      ${filters.mercurySign ? 'AND ws_mercury.name LIKE ?' : ''}
      ${filters.venusSign ? 'AND ws_venus.name LIKE ?' : ''}
      ${filters.marsSign ? 'AND ws_mars.name LIKE ?' : ''}
      ${filters.jupiterSign ? 'AND ws_jupiter.name LIKE ?' : ''}
      ${filters.saturnSign ? 'AND ws_saturn.name LIKE ?' : ''}
      ${filters.uranusSign ? 'AND ws_uranus.name LIKE ?' : ''}
      ${filters.neptuneSign ? 'AND ws_neptune.name LIKE ?' : ''}
      ${filters.plutoSign ? 'AND ws_pluto.name LIKE ?' : ''}
    `;

    const params = [
      ...(filters.idolName ? [`%${filters.idolName}%`] : []),
      ...(filters.groupName ? [`%${filters.groupName}%`] : []),
      ...(filters.companyName ? [`%${filters.companyName}%`] : []),
      ...(filters.sunSign ? [`%${filters.sunSign}%`] : []),
      ...(filters.moonSign ? [`%${filters.moonSign}%`] : []),
      ...(filters.risingSign ? [`%${filters.risingSign}%`] : []),
      ...(filters.mercurySign ? [`%${filters.mercurySign}%`] : []),
      ...(filters.venusSign ? [`%${filters.venusSign}%`] : []),
      ...(filters.marsSign ? [`%${filters.marsSign}%`] : []),
      ...(filters.jupiterSign ? [`%${filters.jupiterSign}%`] : []),
      ...(filters.saturnSign ? [`%${filters.saturnSign}%`] : []),
      ...(filters.uranusSign ? [`%${filters.uranusSign}%`] : []),
      ...(filters.neptuneSign ? [`%${filters.neptuneSign}%`] : []),
      ...(filters.plutoSign ? [`%${filters.plutoSign}%`] : []),
    ];

    const filteredIdols = await database.getAllAsync(query, params);
    setIdols(filteredIdols as Idol[]);
  };

  const deleteIdol = async (id: number) => {
    await idolRepository.delete(id);
    await refreshData();
  };

  const deleteGroup = async (id: number) => {
    await groupRepository.delete(id);
    await refreshData();
  };

  const deleteCompany = async (id: number) => {
    await companyRepository.delete(id);
    await refreshData();
  };

  const updateIdol = async (
    id: number,
    name: string,
    groupId: number,
    koreanName: string | null,
    signs?: Partial<Pick<Idol,
      'sun_sign_id' |
      'moon_sign_id' |
      'rising_sign_id' |
      'mercury_sign_id' |
      'venus_sign_id' |
      'mars_sign_id' |
      'jupiter_sign_id' |
      'saturn_sign_id' |
      'uranus_sign_id' |
      'neptune_sign_id' |
      'pluto_sign_id'
    >>
  ) => {
    await idolRepository.update(id, name, groupId, koreanName, signs);
    await refreshData();
  };

  return (
    <AppContext.Provider 
      value={{ 
        idols, 
        companies, 
        groups, 
        createIdol, 
        createCompany, 
        createGroup,
        refreshData,
        filterIdols,
        deleteIdol,
        deleteGroup,
        deleteCompany,
        updateIdol,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
