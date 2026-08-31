/**
 * INEC PVC Distribution Tracking Application
 * Hierarchical Electoral Structure Types
 */

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
}

// Tier 3: Ward Level
export interface Ward {
  code: string;
  name: string;
  lgaCode: string;
  stateCode: string;
  pollingUnitsCount: number;
}

// Tier 4: Polling Unit Level
export interface PollingUnit {
  code: string;
  name: string;
  wardCode: string;
  lgaCode: string;
  stateCode: string;
  address: string;
  registeredVoters?: number;
  pvcCollected?: number;
  pvcPending?: number;
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

// PVC Distribution Status
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
  status: 'distributed' | 'pending' | 'returned';
  notes?: string;
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
}

// Filter Options
export interface FilterOptions {
  lgaCode?: string;
  wardCode?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
