/**
 * INEC Ogun State Electoral Data
 * Hierarchical Structure: State -> LGA -> Ward -> Polling Unit
 */

import type { State, LGA, Ward, PollingUnit } from '../types';

// Tier 1: State Level
export const OGUN_STATE: State = {
  code: '27',
  name: 'Ogun'
};

// Tier 2: LGA Level (20 Local Government Areas)
export const LGAS: LGA[] = [
  { code: '01', name: 'Abeokuta North', stateCode: '27' },
  { code: '02', name: 'Abeokuta South', stateCode: '27' },
  { code: '03', name: 'Ado-Odo/Ota', stateCode: '27' },
  { code: '04', name: 'Ewekoro', stateCode: '27' },
  { code: '05', name: 'Ifo', stateCode: '27' },
  { code: '06', name: 'Ijebu East', stateCode: '27' },
  { code: '07', name: 'Ijebu North', stateCode: '27' },
  { code: '08', name: 'Ijebu North-East', stateCode: '27' },
  { code: '09', name: 'Ijebu Ode', stateCode: '27' },
  { code: '10', name: 'Ikene', stateCode: '27' },
  { code: '11', name: 'Ipokia', stateCode: '27' },
  { code: '12', name: 'Obafemi Owode', stateCode: '27' },
  { code: '13', name: 'Odeda', stateCode: '27' },
  { code: '14', name: 'Ogun Waterside', stateCode: '27' },
  { code: '15', name: 'Odogbolu', stateCode: '27' },
  { code: '16', name: 'Ogijo/Likosi', stateCode: '27' },
  { code: '17', name: 'Remo North', stateCode: '27' },
  { code: '18', name: 'Shagamu', stateCode: '27' },
  { code: '19', name: 'Imeko Afon', stateCode: '27' },
  { code: '20', name: 'Other LGAs', stateCode: '27' }
];

// Tier 3: Ward Level (Sample data - Sagamu LGA shown in requirements)
export const WARDS: Ward[] = [
  // Sagamu LGA (Code 20) Wards
  { code: '01', name: 'Oko/Ope/Itula I', lgaCode: '20', stateCode: '27', pollingUnitsCount: 11 },
  { code: '02', name: 'Oko/Ope/Itula II', lgaCode: '20', stateCode: '27', pollingUnitsCount: 17 },
  { code: '03', name: 'Ayegbami/Jokun', lgaCode: '20', stateCode: '27', pollingUnitsCount: 15 },
  { code: '04', name: 'Sabo I', lgaCode: '20', stateCode: '27', pollingUnitsCount: 34 },
  { code: '05', name: 'Sabo II', lgaCode: '20', stateCode: '27', pollingUnitsCount: 30 },
  { code: '06', name: 'Isokun/Oyebajo', lgaCode: '20', stateCode: '27', pollingUnitsCount: 14 },
  { code: '07', name: 'Ljagba', lgaCode: '20', stateCode: '27', pollingUnitsCount: 9 },
  { code: '08', name: 'Latawa', lgaCode: '20', stateCode: '27', pollingUnitsCount: 8 },
  { code: '09', name: 'Ode-Lemo', lgaCode: '20', stateCode: '27', pollingUnitsCount: 12 },
  { code: '10', name: 'Ogijo/Likosi', lgaCode: '20', stateCode: '27', pollingUnitsCount: 56 },
  { code: '11', name: 'Surulere', lgaCode: '20', stateCode: '27', pollingUnitsCount: 18 },
  { code: '12', name: 'Isote', lgaCode: '20', stateCode: '27', pollingUnitsCount: 8 },
  { code: '13', name: 'Simawa/Iwelepe', lgaCode: '20', stateCode: '27', pollingUnitsCount: 25 },
  { code: '14', name: 'Agbowa', lgaCode: '20', stateCode: '27', pollingUnitsCount: 29 },
  { code: '15', name: 'Ibindo/Ituwa/Alara', lgaCode: '20', stateCode: '27', pollingUnitsCount: 9 },
  
  // Sample wards for other LGAs (abbreviated for demo)
  { code: '01', name: 'Ake I', lgaCode: '01', stateCode: '27', pollingUnitsCount: 15 },
  { code: '02', name: 'Ake II', lgaCode: '01', stateCode: '27', pollingUnitsCount: 12 },
  { code: '03', name: 'Kuto I', lgaCode: '01', stateCode: '27', pollingUnitsCount: 18 },
  { code: '04', name: 'Kuto II', lgaCode: '01', stateCode: '27', pollingUnitsCount: 14 },
  { code: '05', name: 'Oke-Ilewo', lgaCode: '01', stateCode: '27', pollingUnitsCount: 16 },
  { code: '06', name: 'Itoku', lgaCode: '01', stateCode: '27', pollingUnitsCount: 11 },
  { code: '07', name: 'Panseke', lgaCode: '01', stateCode: '27', pollingUnitsCount: 13 },
  { code: '08', name: 'Ibara', lgaCode: '01', stateCode: '27', pollingUnitsCount: 10 },
  { code: '09', name: 'Idi-Aba', lgaCode: '01', stateCode: '27', pollingUnitsCount: 12 },
  { code: '10', name: 'Onikolobo', lgaCode: '01', stateCode: '27', pollingUnitsCount: 14 },
  { code: '11', name: 'Abiola Way', lgaCode: '01', stateCode: '27', pollingUnitsCount: 16 },
  { code: '12', name: 'Sapon', lgaCode: '01', stateCode: '27', pollingUnitsCount: 11 },
];

// Tier 4: Polling Unit Level (Sample data)
export const POLLING_UNITS: PollingUnit[] = [
  // Ward 15 (Ibindo/Ituwa/Alara) - Sagamu LGA
  { code: '001', name: 'Primary School, Ibindo', wardCode: '15', lgaCode: '20', stateCode: '27', address: 'Ibindo Road, Sagamu', registeredVoters: 450 },
  { code: '002', name: 'Town Hall, Sagamu II', wardCode: '15', lgaCode: '20', stateCode: '27', address: 'Town Hall Street, Sagamu', registeredVoters: 380 },
  { code: '003', name: 'Community Center, Ituwa', wardCode: '15', lgaCode: '20', stateCode: '27', address: 'Ituwa Main Road', registeredVoters: 520 },
  { code: '004', name: 'Alara Primary School', wardCode: '15', lgaCode: '20', stateCode: '27', address: 'Alara Village', registeredVoters: 310 },
  { code: '005', name: 'Ibindo Market Square', wardCode: '15', lgaCode: '20', stateCode: '27', address: 'Market Road, Ibindo', registeredVoters: 290 },
  { code: '006', name: 'Ituwa Health Center', wardCode: '15', lgaCode: '20', stateCode: '27', address: 'Health Center Lane', registeredVoters: 340 },
  { code: '007', name: 'Alara Community Hall', wardCode: '15', lgaCode: '20', stateCode: '27', address: 'Community Hall Road', registeredVoters: 275 },
  { code: '008', name: 'Ibindo Baptist Church', wardCode: '15', lgaCode: '20', stateCode: '27', address: 'Church Street, Ibindo', registeredVoters: 395 },
  { code: '009', name: 'Ituwa Mosque', wardCode: '15', lgaCode: '20', stateCode: '27', address: 'Mosque Road, Ituwa', registeredVoters: 420 },
  
  // Ward 10 (Ogijo/Likosi) - Sample PUs
  { code: '001', name: 'Ogijo Town Hall', wardCode: '10', lgaCode: '20', stateCode: '27', address: 'Town Hall Road, Ogijo', registeredVoters: 550 },
  { code: '002', name: 'Likosi Primary School', wardCode: '10', lgaCode: '20', stateCode: '27', address: 'School Lane, Likosi', registeredVoters: 480 },
  { code: '003', name: 'Ogijo Market Complex', wardCode: '10', lgaCode: '20', stateCode: '27', address: 'Market Street', registeredVoters: 620 },
  
  // Ward 04 (Sabo I) - Sample PUs
  { code: '001', name: 'Sabo Community Center', wardCode: '04', lgaCode: '20', stateCode: '27', address: 'Sabo Main Road', registeredVoters: 400 },
  { code: '002', name: 'Sabo Primary School', wardCode: '04', lgaCode: '20', stateCode: '27', address: 'Education Street', registeredVoters: 350 },
  
  // Abeokuta North Wards - Sample PUs
  { code: '001', name: 'Ake Primary School', wardCode: '01', lgaCode: '01', stateCode: '27', address: 'Ake Road, Abeokuta', registeredVoters: 420 },
  { code: '002', name: 'Ake Community Hall', wardCode: '01', lgaCode: '01', stateCode: '27', address: 'Hall Street, Ake', registeredVoters: 380 },
];

// Helper functions to get electoral data
export const getState = (): State => OGUN_STATE;

export const getLGAByCode = (code: string): LGA | undefined => {
  return LGAS.find(lga => lga.code === code);
};

export const getLGAs = (): LGA[] => LGAS;

export const getWardsByLGA = (lgaCode: string): Ward[] => {
  return WARDS.filter(ward => ward.lgaCode === lgaCode);
};

export const getWardByCode = (lgaCode: string, wardCode: string): Ward | undefined => {
  return WARDS.find(ward => ward.lgaCode === lgaCode && ward.code === wardCode);
};

export const getPollingUnitsByWard = (lgaCode: string, wardCode: string): PollingUnit[] => {
  return POLLING_UNITS.filter(pu => pu.lgaCode === lgaCode && pu.wardCode === wardCode);
};

export const getPollingUnitByCode = (
  stateCode: string,
  lgaCode: string,
  wardCode: string,
  puCode: string
): PollingUnit | undefined => {
  return POLLING_UNITS.find(
    pu => pu.stateCode === stateCode && pu.lgaCode === lgaCode && 
          pu.wardCode === wardCode && pu.code === puCode
  );
};

export const getAllPollingUnits = (): PollingUnit[] => POLLING_UNITS;

export const getTotalPollingUnitsCount = (): number => {
  return WARDS.reduce((total, ward) => total + (ward.pollingUnitsCount || 0), 0);
};
