export interface Region {
  id: string;
  name: string;
  capital: string;
  code: string;
}

export interface Municipality {
  id: string;
  name: string;
  type: 'Metropolitan' | 'Municipal' | 'District';
  regionId: string;
  capital: string;
  population?: number;
  area?: number; // in km²
  established?: string;
  isRegistered?: boolean;
  adminContact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export const GHANA_REGIONS: Region[] = [
  { id: 'greater-accra', name: 'Greater Accra Region', capital: 'Accra', code: 'GAR' },
  { id: 'ashanti', name: 'Ashanti Region', capital: 'Kumasi', code: 'ASH' },
  { id: 'western', name: 'Western Region', capital: 'Sekondi-Takoradi', code: 'WR' },
  { id: 'central', name: 'Central Region', capital: 'Cape Coast', code: 'CR' },
  { id: 'volta', name: 'Volta Region', capital: 'Ho', code: 'VR' },
  { id: 'eastern', name: 'Eastern Region', capital: 'Koforidua', code: 'ER' },
  { id: 'northern', name: 'Northern Region', capital: 'Tamale', code: 'NR' },
  { id: 'upper-east', name: 'Upper East Region', capital: 'Bolgatanga', code: 'UER' },
  { id: 'upper-west', name: 'Upper West Region', capital: 'Wa', code: 'UWR' },
  { id: 'brong-ahafo', name: 'Brong-Ahafo Region', capital: 'Sunyani', code: 'BAR' },
  { id: 'western-north', name: 'Western North Region', capital: 'Sefwi Wiawso', code: 'WNR' },
  { id: 'ahafo', name: 'Ahafo Region', capital: 'Goaso', code: 'AHR' },
  { id: 'bono', name: 'Bono Region', capital: 'Sunyani', code: 'BR' },
  { id: 'bono-east', name: 'Bono East Region', capital: 'Techiman', code: 'BER' },
  { id: 'oti', name: 'Oti Region', capital: 'Dambai', code: 'OR' },
  { id: 'savannah', name: 'Savannah Region', capital: 'Damongo', code: 'SR' },
  { id: 'north-east', name: 'North East Region', capital: 'Nalerigu', code: 'NER' },
];

// Major municipalities across Ghana (sample - this would be expanded to include all 260+ MMDAs)
export const GHANA_MUNICIPALITIES: Municipality[] = [
  // Greater Accra Region
  {
    id: 'accra-metropolitan',
    name: 'Accra Metropolitan Assembly',
    type: 'Metropolitan',
    regionId: 'greater-accra',
    capital: 'Accra',
    population: 2291352,
    area: 225.67,
    established: '1988'
  },
  {
    id: 'tema-metropolitan',
    name: 'Tema Metropolitan Assembly',
    type: 'Metropolitan',
    regionId: 'greater-accra',
    capital: 'Tema',
    population: 402637,
    area: 160.0,
    established: '1990'
  },
  {
    id: 'ga-east-municipal',
    name: 'Ga East Municipal Assembly',
    type: 'Municipal',
    regionId: 'greater-accra',
    capital: 'Abokobi',
    population: 259668,
    area: 166.0,
    established: '2004'
  },
  {
    id: 'ga-west-municipal',
    name: 'Ga West Municipal Assembly',
    type: 'Municipal',
    regionId: 'greater-accra',
    capital: 'Amasaman',
    population: 262742,
    area: 364.0,
    established: '2004'
  },
  {
    id: 'ga-south-municipal',
    name: 'Ga South Municipal Assembly',
    type: 'Municipal',
    regionId: 'greater-accra',
    capital: 'Ngleshie Amanfro',
    population: 411377,
    area: 909.0,
    established: '2012'
  },

  // Ashanti Region
  {
    id: 'kumasi-metropolitan',
    name: 'Kumasi Metropolitan Assembly',
    type: 'Metropolitan',
    regionId: 'ashanti',
    capital: 'Kumasi',
    population: 2035064,
    area: 254.0,
    established: '1988'
  },
  {
    id: 'obuasi-municipal',
    name: 'Obuasi Municipal Assembly',
    type: 'Municipal',
    regionId: 'ashanti',
    capital: 'Obuasi',
    population: 175043,
    area: 162.4,
    established: '2004'
  },
  {
    id: 'ejisu-municipal',
    name: 'Ejisu Municipal Assembly',
    type: 'Municipal',
    regionId: 'ashanti',
    capital: 'Ejisu',
    population: 143762,
    area: 637.2,
    established: '2008'
  },

  // Western Region
  {
    id: 'sekondi-takoradi-metropolitan',
    name: 'Sekondi-Takoradi Metropolitan Assembly',
    type: 'Metropolitan',
    regionId: 'western',
    capital: 'Sekondi-Takoradi',
    population: 445205,
    area: 385.0,
    established: '1988'
  },
  {
    id: 'tarkwa-nsuaem-municipal',
    name: 'Tarkwa-Nsuaem Municipal Assembly',
    type: 'Municipal',
    regionId: 'western',
    capital: 'Tarkwa',
    population: 90477,
    area: 2354.0,
    established: '2004'
  },

  // Central Region
  {
    id: 'cape-coast-metropolitan',
    name: 'Cape Coast Metropolitan Assembly',
    type: 'Metropolitan',
    regionId: 'central',
    capital: 'Cape Coast',
    population: 169894,
    area: 122.0,
    established: '1988'
  },
  {
    id: 'elmina-municipal',
    name: 'Komenda-Edina-Eguafo-Abirem Municipal Assembly',
    type: 'Municipal',
    regionId: 'central',
    capital: 'Elmina',
    population: 144705,
    area: 452.0,
    established: '2004'
  },

  // Northern Region
  {
    id: 'tamale-metropolitan',
    name: 'Tamale Metropolitan Assembly',
    type: 'Metropolitan',
    regionId: 'northern',
    capital: 'Tamale',
    population: 371351,
    area: 646.9,
    established: '2004'
  },

  // Eastern Region
  {
    id: 'new-juaben-municipal',
    name: 'New Juaben Municipal Assembly',
    type: 'Municipal',
    regionId: 'eastern',
    capital: 'Koforidua',
    population: 176811,
    area: 110.0,
    established: '2004'
  },

  // Volta Region
  {
    id: 'ho-municipal',
    name: 'Ho Municipal Assembly',
    type: 'Municipal',
    regionId: 'volta',
    capital: 'Ho',
    population: 177281,
    area: 2564.0,
    established: '2004'
  }
];

// Helper functions
export function getMunicipalitiesByRegion(regionId: string): Municipality[] {
  return GHANA_MUNICIPALITIES.filter(municipality => municipality.regionId === regionId);
}

export function getRegionById(regionId: string): Region | undefined {
  return GHANA_REGIONS.find(region => region.id === regionId);
}

export function getMunicipalityById(municipalityId: string): Municipality | undefined {
  return GHANA_MUNICIPALITIES.find(municipality => municipality.id === municipalityId);
}

export function getRegisteredMunicipalities(): Municipality[] {
  return GHANA_MUNICIPALITIES.filter(municipality => municipality.isRegistered);
}

export function getUnregisteredMunicipalities(): Municipality[] {
  return GHANA_MUNICIPALITIES.filter(municipality => !municipality.isRegistered);
}

// Municipality types for filtering
export const MUNICIPALITY_TYPES = ['Metropolitan', 'Municipal', 'District'] as const;

export type MunicipalityType = typeof MUNICIPALITY_TYPES[number];
