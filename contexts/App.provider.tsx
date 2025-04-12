import { createContext, useEffect, useState, useContext } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Idol, Company, Group, IdolWithRelations } from "@/database/interfaces";
import { IdolRepository } from "@/database/repository/Idol.repository";
import { CompanyRepository } from "@/database/repository/Company.repository";
import { GroupRepository } from "@/database/repository/Group.repository";

export interface AppContextType {
  idols: IdolWithRelations[];
  companies: Company[];
  groups: Group[];
  createIdol: (
    name: string,
    groups: Array<{
      group_id: number;
      is_active: boolean;
    }>,
    koreanName: string | null,
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
    groups: Array<{
      group_id: number;
      is_active: boolean;
    }>,
    koreanName: string | null,
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

  const [idols, setIdols] = useState<IdolWithRelations[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const refreshData = async () => {
    try {
      const [newIdols, newCompanies, newGroups] = await Promise.all([
        Promise.all(
          (
            await idolRepository.findAll()
          ).map((idol) => idolRepository.findWithRelations(idol.id))
        ),
        companyRepository.findAll(),
        groupRepository.findAll(),
      ]);
      setIdols(
        newIdols.filter((idol): idol is IdolWithRelations => idol !== null)
      );
      setCompanies(newCompanies);
      setGroups(newGroups);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [database]);

  const createIdol = async (
    name: string,
    groups: Array<{
      group_id: number;
      is_active: boolean;
    }>,
    koreanName: string | null,
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
    let query = `
      SELECT DISTINCT 
        i.*,
        GROUP_CONCAT(g.id) as group_ids,
        GROUP_CONCAT(g.name) as group_names,
        GROUP_CONCAT(ig.is_active) as group_actives,
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
      LEFT JOIN idol_group ig ON i.id = ig.idol_id
      LEFT JOIN \`group\` g ON ig.group_id = g.id
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
      GROUP BY i.id
    `;

    const params: (string | number)[] = [];

    // Agregar condiciones WHERE para cada filtro
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        switch (key) {
          case "sunSign":
            query += " AND ws_sun.name = ?";
            params.push(value);
            break;
          case "moonSign":
            query += " AND ws_moon.name = ?";
            params.push(value);
            break;
          // ... agregar casos similares para otros signos
        }
      }
    });

    try {
      const results = await database.getAllAsync<{
        id: number;
        name: string;
        korean_name: string | null;
        sun_sign_id: number | null;
        moon_sign_id: number | null;
        rising_sign_id: number | null;
        mercury_sign_id: number | null;
        venus_sign_id: number | null;
        mars_sign_id: number | null;
        jupiter_sign_id: number | null;
        saturn_sign_id: number | null;
        uranus_sign_id: number | null;
        neptune_sign_id: number | null;
        pluto_sign_id: number | null;
        group_ids: string;
        group_names: string;
        group_actives: string;
        sun_sign_name: string | null;
        moon_sign_name: string | null;
        rising_sign_name: string | null;
        mercury_sign_name: string | null;
        venus_sign_name: string | null;
        mars_sign_name: string | null;
        jupiter_sign_name: string | null;
        saturn_sign_name: string | null;
        uranus_sign_name: string | null;
        neptune_sign_name: string | null;
        pluto_sign_name: string | null;
      }>(query, params);

      const processedResults = results.map((result) => {
        const groupIds = result.group_ids
          ? result.group_ids.split(",").map(Number)
          : [];
        const groupNames = result.group_names
          ? result.group_names.split(",")
          : [];
        const groupActives = result.group_actives
          ? result.group_actives.split(",").map((n: string) => n === "1")
          : [];

        const groups = groupIds.map((groupId: number, index: number) => ({
          group_id: groupId,
          group_name: groupNames[index],
          is_active: groupActives[index],
        }));

        return {
          id: result.id,
          name: result.name,
          korean_name: result.korean_name,
          sun_sign_id: result.sun_sign_id,
          moon_sign_id: result.moon_sign_id,
          rising_sign_id: result.rising_sign_id,
          mercury_sign_id: result.mercury_sign_id,
          venus_sign_id: result.venus_sign_id,
          mars_sign_id: result.mars_sign_id,
          jupiter_sign_id: result.jupiter_sign_id,
          saturn_sign_id: result.saturn_sign_id,
          uranus_sign_id: result.uranus_sign_id,
          neptune_sign_id: result.neptune_sign_id,
          pluto_sign_id: result.pluto_sign_id,
          groups,
          sun_sign_name: result.sun_sign_name,
          moon_sign_name: result.moon_sign_name,
          rising_sign_name: result.rising_sign_name,
          mercury_sign_name: result.mercury_sign_name,
          venus_sign_name: result.venus_sign_name,
          mars_sign_name: result.mars_sign_name,
          jupiter_sign_name: result.jupiter_sign_name,
          saturn_sign_name: result.saturn_sign_name,
          uranus_sign_name: result.uranus_sign_name,
          neptune_sign_name: result.neptune_sign_name,
          pluto_sign_name: result.pluto_sign_name,
        } as IdolWithRelations;
      });

      setIdols(processedResults);
    } catch (error) {
      console.error("Error en filterIdols:", error);
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
    groups: Array<{
      group_id: number;
      is_active: boolean;
    }>,
    koreanName: string | null,
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
    await idolRepository.update(id, name, groups, koreanName, signs);
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
