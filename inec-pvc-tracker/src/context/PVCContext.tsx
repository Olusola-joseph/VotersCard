/**
 * PVC Distribution Context
 * Manages application state for PVC tracking with Supabase integration
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type {
  DashboardStats,
  PVCDistributionStatus,
  DistributionRecord,
  FilterOptions,
  DelimitationData
} from '../types';
import { parseDelimitationCode } from '../utils/delimitationParser';
import { getAllPollingUnits } from '../data/electoralData';
import {
  fetchPVCDistributions,
  createPVCDistribution
} from '../services/supabaseServices';
import { supabase } from '../lib/supabaseClient';

interface PVCContextType {
  // State
  distributionStatuses: PVCDistributionStatus[];
  distributionRecords: DistributionRecord[];
  filters: FilterOptions;
  
  // Supabase Integration
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setFilters: (filters: FilterOptions) => void;
  updatePVCDistribution: (puId: string, collected: number) => void;
  addDistributionRecord: (record: Omit<DistributionRecord, 'id'>) => void;
  parseAndLookupCode: (code: string) => DelimitationData | null;
  
  // Supabase Actions
  syncWithSupabase: () => Promise<void>;
  recordPVCScan: (pvcData: any) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Computed
  dashboardStats: DashboardStats;
  filteredStatuses: PVCDistributionStatus[];
}

const PVCContext = createContext<PVCContextType | undefined>(undefined);

// Generate initial mock data
const generateInitialStatuses = (): PVCDistributionStatus[] => {
  const pollingUnits = getAllPollingUnits();
  
  return pollingUnits.map((pu) => {
    const registeredVoters = pu.registeredVoters || Math.floor(Math.random() * 500) + 200;
    const pvcCollected = Math.floor(registeredVoters * (Math.random() * 0.8 + 0.1));
    const pvcPending = registeredVoters - pvcCollected;
    const collectionPercentage = Math.round((pvcCollected / registeredVoters) * 100);
    
    let status: PVCDistributionStatus['status'] = 'pending';
    if (collectionPercentage >= 90) status = 'completed';
    else if (collectionPercentage >= 50) status = 'in-progress';
    else if (collectionPercentage >= 20) status = 'in-progress';
    else status = 'delayed';
    
    return {
      puId: `${pu.stateCode}/${pu.lgaCode}/${pu.wardCode}/${pu.code}`,
      totalRegistered: registeredVoters,
      pvcCollected,
      pvcPending,
      collectionPercentage,
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      status
    };
  });
};

const generateInitialRecords = (): DistributionRecord[] => {
  const records: DistributionRecord[] = [];
  const statuses = generateInitialStatuses();
  
  // Generate some sample distribution records
  statuses.slice(0, 10).forEach((status, index) => {
    records.push({
      id: `REC-${String(index + 1).padStart(4, '0')}`,
      delimitationCode: status.puId,
      batchNumber: `BATCH-${2024001 + index}`,
      distributedDate: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
      distributedBy: `OFFICER-${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`,
      receivedBy: `WARD_AGENT-${String(Math.floor(Math.random() * 200) + 1).padStart(3, '0')}`,
      quantity: status.pvcCollected,
      status: 'distributed',
      notes: index % 3 === 0 ? 'Successful distribution' : undefined
    });
  });
  
  return records;
};

export const PVCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [distributionStatuses, setDistributionStatuses] = useState<PVCDistributionStatus[]>(generateInitialStatuses);
  const [distributionRecords, setDistributionRecords] = useState<DistributionRecord[]>(generateInitialRecords);
  const [filters, setFiltersState] = useState<FilterOptions>({});
  
  // Supabase connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check Supabase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('lga_reference').select('count').limit(1);
        
        if (error) {
          if (error.message.includes('YOUR_SUPABASE')) {
            console.log('ℹ️  Supabase not configured yet. Using local data.');
            setIsConnected(false);
          } else {
            throw error;
          }
        } else {
          setIsConnected(true);
          // Load data from Supabase if connected
          await syncWithSupabase();
        }
      } catch (err: any) {
        console.error('Supabase connection error:', err);
        setError(err.message);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
  }, []);

  // Sync data from Supabase
  const syncWithSupabase = useCallback(async () => {
    try {
      setIsLoading(true);
      const distributions = await fetchPVCDistributions({ limit: 100 });
      
      // Convert Supabase data to local format
      const newRecords: DistributionRecord[] = distributions.map(dist => ({
        id: dist.id,
        delimitationCode: dist.delimitation_full,
        batchNumber: dist.batch_number || 'N/A',
        distributedDate: new Date(dist.issued_at),
        distributedBy: dist.issued_by_name,
        receivedBy: 'System',
        quantity: 1,
        status: dist.status === 'issued' ? 'distributed' : 'pending'
      }));
      
      setDistributionRecords(newRecords);
      setError(null);
    } catch (err: any) {
      console.error('Error syncing with Supabase:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Record PVC scan to Supabase
  const recordPVCScan = useCallback(async (pvcData: any) => {
    try {
      await createPVCDistribution({
        vin: pvcData.vin,
        full_name: pvcData.full_name,
        date_of_birth: pvcData.date_of_birth,
        gender: pvcData.gender,
        occupation: pvcData.occupation,
        residential_address: pvcData.residential_address,
        date_of_registration: pvcData.date_of_registration,
        batch_number: pvcData.batch_number,
        serial_number: pvcData.serial_number,
        delimitation_full: pvcData.delimitation_full,
        lga_code: pvcData.lga_code,
        ward_code: pvcData.ward_code,
        pu_code: pvcData.pu_code,
        issued_by_name: pvcData.issued_by_name,
        issued_by: pvcData.issued_by,
        issued_by_lga_code: pvcData.issued_by_lga_code,
        scan_method: pvcData.scan_method
      });
      
      // Refresh local data
      await syncWithSupabase();
    } catch (err: any) {
      console.error('Error recording PVC scan:', err);
      throw err;
    }
  }, [syncWithSupabase]);

  // Refresh data from Supabase
  const refreshData = useCallback(async () => {
    await syncWithSupabase();
  }, [syncWithSupabase]);

  // Update filters
  const setFilters = useCallback((newFilters: FilterOptions) => {
    setFiltersState(newFilters);
  }, []);

  // Update PVC distribution for a polling unit
  const updatePVCDistribution = useCallback((puId: string, collected: number) => {
    setDistributionStatuses(prev => prev.map(status => {
      if (status.puId === puId) {
        const pvcPending = status.totalRegistered - collected;
        const collectionPercentage = Math.round((collected / status.totalRegistered) * 100);
        
        let newStatus: PVCDistributionStatus['status'] = 'pending';
        if (collectionPercentage >= 90) newStatus = 'completed';
        else if (collectionPercentage >= 50) newStatus = 'in-progress';
        else if (collectionPercentage >= 20) newStatus = 'in-progress';
        else newStatus = 'delayed';
        
        return {
          ...status,
          pvcCollected: collected,
          pvcPending,
          collectionPercentage,
          lastUpdated: new Date(),
          status: newStatus
        };
      }
      return status;
    }));
  }, []);

  // Add a new distribution record
  const addDistributionRecord = useCallback((record: Omit<DistributionRecord, 'id'>) => {
    const newRecord: DistributionRecord = {
      ...record,
      id: `REC-${String(distributionRecords.length + 1).padStart(4, '0')}`
    };
    setDistributionRecords(prev => [...prev, newRecord]);
  }, [distributionRecords.length]);

  // Parse and lookup delimitation code
  const parseAndLookupCode = useCallback((code: string): DelimitationData | null => {
    return parseDelimitationCode(code);
  }, []);

  // Compute dashboard statistics
  const dashboardStats = useMemo<DashboardStats>(() => {
    const allPollingUnits = getAllPollingUnits();
    
    // Count unique LGAs and Wards with data
    const lgasWithData = new Set(allPollingUnits.map(pu => pu.lgaCode));
    const wardsWithData = new Set(allPollingUnits.map(pu => `${pu.lgaCode}/${pu.wardCode}`));
    
    const totalRegistered = distributionStatuses.reduce((sum, s) => sum + s.totalRegistered, 0);
    const totalCollected = distributionStatuses.reduce((sum, s) => sum + s.pvcCollected, 0);
    const totalPending = distributionStatuses.reduce((sum, s) => sum + s.pvcPending, 0);
    
    const overallPercentage = totalRegistered > 0 
      ? Math.round((totalCollected / totalRegistered) * 100) 
      : 0;
    
    const lgasCompleted = new Set<string>();
    const lgasInProgress = new Set<string>();
    const lgasPending = new Set<string>();
    
    distributionStatuses.forEach(status => {
      const lgaCode = status.puId.split('/')[1];
      
      if (status.status === 'completed') {
        lgasCompleted.add(lgaCode);
      } else if (status.status === 'in-progress') {
        lgasInProgress.add(lgaCode);
      } else {
        lgasPending.add(lgaCode);
      }
    });
    
    return {
      totalLGAs: lgasWithData.size,
      totalWards: wardsWithData.size,
      totalPollingUnits: allPollingUnits.length,
      totalRegisteredVoters: totalRegistered,
      totalPVCCollected: totalCollected,
      totalPVCPending: totalPending,
      overallCollectionPercentage: overallPercentage,
      lgasCompleted: lgasCompleted.size,
      lgasInProgress: lgasInProgress.size,
      lgasPending: lgasPending.size
    };
  }, [distributionStatuses]);

  // Filter statuses based on current filters
  const filteredStatuses = useMemo(() => {
    return distributionStatuses.filter(status => {
      const parts = status.puId.split('/');
      const lgaCode = parts[1];
      const wardCode = parts[2];
      
      if (filters.lgaCode && lgaCode !== filters.lgaCode) {
        return false;
      }
      
      if (filters.wardCode && wardCode !== filters.wardCode) {
        return false;
      }
      
      if (filters.status && status.status !== filters.status) {
        return false;
      }
      
      if (filters.dateFrom && status.lastUpdated < filters.dateFrom) {
        return false;
      }
      
      if (filters.dateTo && status.lastUpdated > filters.dateTo) {
        return false;
      }
      
      return true;
    });
  }, [distributionStatuses, filters]);

  const value: PVCContextType = {
    distributionStatuses,
    distributionRecords,
    filters,
    setFilters,
    updatePVCDistribution,
    addDistributionRecord,
    parseAndLookupCode,
    dashboardStats,
    filteredStatuses,
    // Supabase integration
    isConnected,
    isLoading,
    error,
    syncWithSupabase,
    recordPVCScan,
    refreshData
  };

  return (
    <PVCContext.Provider value={value}>
      {children}
    </PVCContext.Provider>
  );
};

export const usePVC = (): PVCContextType => {
  const context = useContext(PVCContext);
  if (context === undefined) {
    throw new Error('usePVC must be used within a PVCProvider');
  }
  return context;
};

export default PVCContext;
