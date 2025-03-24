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
    groups: Array<{
      group_id: number,
      is_active: boolean
    }>,
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
    groups: Array<{
      group_id: number,
      is_active: boolean
    }>,
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
    await idolRepository.create(name, groups, koreanName, signs);
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

  const filterIdols = async (filters: any) => {
    const repository = new IdolRepository(database);
    
    // Log de los filtros recibidos
    console.log('Filtros aplicados:', filters);
    
    // Comenzamos con la tabla base y los JOINs necesarios
    let query = `
      SELECT DISTINCT i.*, 
        g.name as group_name,
        c.name as company_name,
        ws_sun.name as sun_sign_name,
        ws_moon.name as moon_sign_name,
        ws_rising.name as rising_sign_name,
        ws_mercury.name as mercury_sign_name,
        ws_venus.name as venus_sign_name,
        ws_mars.name as mars_sign_name,
        ws_jupiter.name as jupiter_sign_name,
        ws_saturn.name as saturn_sign_name,
        ws_uranus.name as uranus_sign_name,
        ws_neptune.name as neptune_sign_name,
        ws_pluto.name as pluto_sign_name
      FROM idol i
    `;

    // Si hay filtro de compañía o grupo, necesitamos toda la cadena de relaciones
    if (filters.companyName || filters.groupName) {
      query += `
        INNER JOIN idol_group ig ON i.id = ig.idol_id AND ig.is_active = 1
        INNER JOIN \`group\` g ON ig.group_id = g.id
        ${filters.companyName ? 'INNER JOIN company c ON g.company_id = c.id' : 'LEFT JOIN company c ON g.company_id = c.id'}
      `;
    } else {
      query += `
        LEFT JOIN idol_group ig ON i.id = ig.idol_id AND ig.is_active = 1
        LEFT JOIN \`group\` g ON ig.group_id = g.id
        LEFT JOIN company c ON g.company_id = c.id
      `;
    }

    // JOINs para signos zodiacales
    query += `
      ${filters.sunSign ? 'INNER' : 'LEFT'} JOIN western_zodiac_sign ws_sun ON i.sun_sign_id = ws_sun.id
      ${filters.moonSign ? 'INNER' : 'LEFT'} JOIN western_zodiac_sign ws_moon ON i.moon_sign_id = ws_moon.id
      ${filters.risingSign ? 'INNER' : 'LEFT'} JOIN western_zodiac_sign ws_rising ON i.rising_sign_id = ws_rising.id
      ${filters.mercurySign ? 'INNER' : 'LEFT'} JOIN western_zodiac_sign ws_mercury ON i.mercury_sign_id = ws_mercury.id
      ${filters.venusSign ? 'INNER' : 'LEFT'} JOIN western_zodiac_sign ws_venus ON i.venus_sign_id = ws_venus.id
      ${filters.marsSign ? 'INNER' : 'LEFT'} JOIN western_zodiac_sign ws_mars ON i.mars_sign_id = ws_mars.id
      ${filters.jupiterSign ? 'INNER' : 'LEFT'} JOIN western_zodiac_sign ws_jupiter ON i.jupiter_sign_id = ws_jupiter.id
      ${filters.saturnSign ? 'INNER' : 'LEFT'} JOIN western_zodiac_sign ws_saturn ON i.saturn_sign_id = ws_saturn.id
      ${filters.uranusSign ? 'INNER' : 'LEFT'} JOIN western_zodiac_sign ws_uranus ON i.uranus_sign_id = ws_uranus.id
      ${filters.neptuneSign ? 'INNER' : 'LEFT'} JOIN western_zodiac_sign ws_neptune ON i.neptune_sign_id = ws_neptune.id
      ${filters.plutoSign ? 'INNER' : 'LEFT'} JOIN western_zodiac_sign ws_pluto ON i.pluto_sign_id = ws_pluto.id
    `;

    // Condiciones WHERE
    query += `WHERE 1=1
      ${filters.idolName ? 'AND i.name LIKE ?' : ''}
      ${filters.groupName ? 'AND g.name LIKE ?' : ''}
      ${filters.companyName ? 'AND c.name LIKE ?' : ''}
      ${filters.sunSign ? 'AND ws_sun.name LIKE ?' : ''}
      ${filters.moonSign ? 'AND ws_moon.name LIKE ?' : ''}
      ${filters.risingSign ? 'AND ws_rising.name LIKE ?' : ''}
      ${filters.mercurySign ? 'AND ws_mercury.name LIKE ?' : ''}
      ${filters.venusSign ? 'AND ws_venus.name LIKE ?' : ''}
    `;

    const params = [];
    if (filters.idolName) params.push(`%${filters.idolName}%`);
    if (filters.groupName) params.push(`%${filters.groupName}%`);
    if (filters.companyName) params.push(`%${filters.companyName}%`);
    if (filters.sunSign) params.push(`%${filters.sunSign}%`);
    if (filters.moonSign) params.push(`%${filters.moonSign}%`);
    if (filters.risingSign) params.push(`%${filters.risingSign}%`);
    if (filters.mercurySign) params.push(`%${filters.mercurySign}%`);
    if (filters.venusSign) params.push(`%${filters.venusSign}%`);

    try {
      // Log de la consulta y parámetros
      console.log('Query SQL:', query);
      console.log('Parámetros:', params);

      const results = await database.getAllAsync(query, params);
      
      // Log de los resultados
      console.log('Resultados obtenidos:', results);
      
      // Procesar los resultados para incluir la información del grupo
      const processedResults = results.map(idol => ({
        ...idol,
        group: idol.group_name ? { name: idol.group_name } : null
      }));

      setIdols(processedResults);
    } catch (error) {
      console.error('Error en filterIdols:', error);
      throw error;
    }
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
