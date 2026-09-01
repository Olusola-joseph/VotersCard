/**
 * INEC PVC Distribution Tracking Application
 * Hierarchical Electoral Structure Types
 */

// User Profile with Role
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'officer' | 'admin' | 'super_admin';
  assigned_lga_code?: string;
  assigned_ward_code?: string;
  phone_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Tier 1: State Level
export interface State {
  code: string;
  name: string;
}

// Tier 2: LGA Level
export interface LGA {
  code: string;
  name: string;
  stateCode: string;
  total_wards?: number;
  total_pus?: number;
}

// Tier 3: Ward Level
export interface Ward {
  code: string;
  name: string;
  lgaCode: string;
  stateCode: string;
  total_pus?: number;
  pollingUnitsCount?: number;
  full_delimitation?: string;
}

// Tier 4: Polling Unit Level
export interface PollingUnit {
  code: string;
  name: string;
  wardCode: string;
  lgaCode: string;
  stateCode: string;
  full_delimitation?: string;
  registeredVoters?: number;
  pvcCollected?: number;
  pvcPending?: number;
  address?: string;
}

// Delimitation Data Interface (Parsed Code)
export interface DelimitationData {
  fullCode: string;        // "27/20/15/008"
  stateCode: string;       // "27"
  stateName: string;       // "Ogun"
  lgaCode: string;         // "20"
  lgaName: string;         // "Sagamu"
  wardCode: string;        // "15"
  wardName: string;        // "Ibindo/Ituwa/Alara"
  puCode: string;          // "008"
  puName: string;          // "Town Hall, Sagamu II"
}

// PVC Distribution Record
export interface PVCDistribution {
  id: string;
  vin: string;
  full_name: string;
  date_of_birth?: string;
  gender?: 'MALE' | 'FEMALE';
  occupation?: string;
  residential_address?: string;
  date_of_registration?: string;
  batch_number?: string;
  serial_number?: string;
  delimitation_full: string;
  state_code: string;
  lga_code: string;
  ward_code: string;
  pu_code: string;
  issued_by: string;
  issued_by_name: string;
  issued_at: string;
  scan_method: 'qr_only' | 'ocr_only' | 'dual_scan' | 'manual';
  status: 'issued' | 'pending' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalLGAs: number;
  totalWards: number;
  totalPollingUnits: number;
  totalRegisteredVoters: number;
  totalPVCCollected: number;
  totalPVCPending: number;
  overallCollectionPercentage: number;
  lgasCompleted: number;
  lgasInProgress: number;
  lgasPending: number;
  todayIssued?: number;
  totalOfficers?: number;
  dualScans?: number;
  manualEntries?: number;
}

// Officer Stats
export interface OfficerStats {
  totalIssued: number;
  todayIssued: number;
  dualScans: number;
  manualEntries: number;
  recentDistributions: PVCDistribution[];
}

// PVC Distribution Status per Polling Unit
export interface PVCDistributionStatus {
  puId: string;
  totalRegistered: number;
  pvcCollected: number;
  pvcPending: number;
  collectionPercentage: number;
  lastUpdated: Date;
  status: 'completed' | 'in-progress' | 'pending' | 'delayed';
}

// Distribution Record
export interface DistributionRecord {
  id: string;
  delimitationCode: string;
  batchNumber: string;
  distributedDate: Date;
  distributedBy: string;
  receivedBy: string;
  quantity: number;
  status: 'distributed' | 'pending' | 'cancelled';
  notes?: string;
}

// Filter Options
export interface FilterOptions {
  lgaCode?: string;
  wardCode?: string;
  status?: 'completed' | 'in-progress' | 'pending' | 'delayed';
  dateFrom?: Date;
  dateTo?: Date;
}
