// Interfaz para los signos zodiacales
export interface WesternZodiacSign {
  id: number;
  name: string;
}

// Interfaz para las compañías
export interface Company {
  id: number;
  name: string;
}

// Interfaz para los grupos
export interface Group {
  id: number;
  name: string;
  company_id: number;
}

// Interfaz para los idols
export interface Idol {
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
}

// Interfaces extendidas con relaciones (opcional, pero útil)
export interface GroupWithCompany extends Group {
  company?: Company;
}

export interface IdolWithRelations extends Idol {
  groups: {
    group_id: number;
    group_name: string;
    is_active: boolean;
  }[];
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
}

export interface GroupWithRelations extends Group {
  company_name: string | null;
  idols: {
    idol_id: number;
    idol_name: string;
    is_active: boolean;
  }[];
  // Propiedades temporales para el mapeo
  idol_ids?: string;
  idol_names?: string;
  idol_actives?: string;
}

export interface CompanyWithRelations extends Company {
  groups: {
    group_id: number;
    group_name: string;
  }[];
  // Propiedades temporales para el mapeo
  group_ids?: string;
  group_names?: string;
}
