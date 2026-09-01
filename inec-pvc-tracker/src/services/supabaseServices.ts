/**
 * Supabase Database Services
 * CRUD operations and real-time data synchronization
 */

import { supabase } from '../lib/supabaseClient';
import type { PVCDistribution, LGAReference, WardReference, PUReference, Profile } from '../lib/supabaseClient';

// ==================== LGA Services ====================

export const fetchAllLGAs = async (): Promise<LGAReference[]> => {
  const { data, error } = await supabase
    .from('lga_reference')
    .select('*')
    .eq('state_code', '27')
    .order('lga_code');
  
  if (error) {
    console.error('Error fetching LGAs:', error);
    throw error;
  }
  
  return data || [];
};

export const fetchLGAByCode = async (code: string): Promise<LGAReference | null> => {
  const { data, error } = await supabase
    .from('lga_reference')
    .select('*')
    .eq('lga_code', code)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Row not found
    console.error('Error fetching LGA:', error);
    throw error;
  }
  
  return data;
};

// ==================== Ward Services ====================

export const fetchWardsByLGA = async (lgaCode: string): Promise<WardReference[]> => {
  const { data, error } = await supabase
    .from('ward_reference')
    .select('*')
    .eq('lga_code', lgaCode)
    .order('ward_code');
  
  if (error) {
    console.error('Error fetching wards:', error);
    throw error;
  }
  
  return data || [];
};

export const fetchWardByCode = async (lgaCode: string, wardCode: string): Promise<WardReference | null> => {
  const { data, error } = await supabase
    .from('ward_reference')
    .select('*')
    .eq('lga_code', lgaCode)
    .eq('ward_code', wardCode)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching ward:', error);
    throw error;
  }
  
  return data;
};

// ==================== Polling Unit Services ====================

export const fetchPollingUnitsByWard = async (lgaCode: string, wardCode: string): Promise<PUReference[]> => {
  const { data, error } = await supabase
    .from('pu_reference')
    .select('*')
    .eq('lga_code', lgaCode)
    .eq('ward_code', wardCode)
    .order('pu_code');
  
  if (error) {
    console.error('Error fetching polling units:', error);
    throw error;
  }
  
  return data || [];
};

export const fetchPUByDelimitation = async (delimitation: string): Promise<PUReference | null> => {
  const { data, error } = await supabase
    .from('pu_reference')
    .select('*')
    .eq('full_delimitation', delimitation)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching PU:', error);
    throw error;
  }
  
  return data;
};

// ==================== PVC Distribution Services ====================

export const createPVCDistribution = async (pvcData: {
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
  lga_code: string;
  ward_code: string;
  pu_code: string;
  issued_by_name: string;
  issued_by?: string;
  issued_by_lga_code?: string;
  scan_method?: 'qr_only' | 'ocr_only' | 'dual_scan' | 'manual';
}): Promise<PVCDistribution> => {
  const insertData = {
    ...pvcData,
    state_code: '27',
    status: 'issued'
  };
  
  const { data, error } = await supabase
    .from('pvc_distributions')
    .insert(insertData as any)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating PVC distribution:', error);
    throw error;
  }
  
  return data as PVCDistribution;
};

export const fetchPVCDistributions = async (filters?: {
  lga_code?: string;
  ward_code?: string;
  pu_code?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
}): Promise<PVCDistribution[]> => {
  let query = supabase.from('pvc_distributions').select('*');
  
  if (filters?.lga_code) {
    query = query.eq('lga_code', filters.lga_code);
  }
  
  if (filters?.ward_code) {
    query = query.eq('ward_code', filters.ward_code);
  }
  
  if (filters?.pu_code) {
    query = query.eq('pu_code', filters.pu_code);
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.date_from) {
    query = query.gte('issued_at', filters.date_from);
  }
  
  if (filters?.date_to) {
    query = query.lte('issued_at', filters.date_to);
  }
  
  query = query.order('issued_at', { ascending: false });
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    // Don't throw on RLS or recursion errors - return empty array instead
    console.warn('Warning fetching PVC distributions:', error.message);
    return [];
  }
  
  return data || [];
};

export const fetchPVCDistributionByVIN = async (vin: string): Promise<PVCDistribution | null> => {
  const { data, error } = await supabase
    .from('pvc_distributions')
    .select('*')
    .eq('vin', vin)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching PVC by VIN:', error);
    throw error;
  }
  
  return data;
};

export const updatePVCDistribution = async (
  id: string,
  updates: Partial<PVCDistribution>
): Promise<PVCDistribution> => {
  const { data, error } = await supabase
    .from('pvc_distributions')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single() as { data: PVCDistribution | null; error: any };
  
  if (error) {
    console.error('Error updating PVC distribution:', error);
    throw error;
  }
  
  return data!;
};

export const cancelPVCDistribution = async (id: string): Promise<PVCDistribution> => {
  return updatePVCDistribution(id, { status: 'cancelled' });
};

// ==================== Statistics Services ====================

export const fetchPVCStatsByHierarchy = async (params?: {
  state_code?: string;
  lga_code?: string;
  ward_code?: string;
  start_date?: string;
  end_date?: string;
}): Promise<any[]> => {
  const { data, error } = await supabase.rpc('get_pvc_stats_by_hierarchy', {
    p_state_code: params?.state_code || '27',
    p_lga_code: params?.lga_code ?? null,
    p_ward_code: params?.ward_code ?? null,
    p_start_date: params?.start_date ?? null,
    p_end_date: params?.end_date ?? null
  } as any);
  
  if (error) {
    console.error('Error fetching PVC stats:', error);
    throw error;
  }
  
  return data || [];
};

export const fetchDailySummary = async (startDate?: string, endDate?: string) => {
  let query = supabase.from('daily_pvc_summary').select('*');
  
  if (startDate) {
    query = query.gte('distribution_date', startDate);
  }
  
  if (endDate) {
    query = query.lte('distribution_date', endDate);
  }
  
  const { data, error } = await query.order('distribution_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching daily summary:', error);
    throw error;
  }
  
  return data || [];
};

// ==================== Profile Services ====================

export const getCurrentUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching user profile:', error);
    throw error;
  }
  
  return data;
};

export const createUserProfile = async (profile: {
  id: string;
  full_name: string;
  email: string;
  role: 'officer' | 'admin' | 'super_admin';
  assigned_lga_code?: string;
  assigned_ward_code?: string;
  phone_number?: string;
}): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile as any)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
  
  return data as Profile;
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Profile>
): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates as any)
    .eq('id', userId)
    .select()
    .single() as { data: Profile | null; error: any };
  
  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  
  return data!;
};

// ==================== Real-time Subscription Helpers ====================

export const subscribeToRealtimeUpdates = (
  tableName: 'pvc_distributions' | 'profiles',
  callback: (payload: any) => void
) => {
  const channelName = `${tableName}_realtime`;
  const channel = supabase.channel(channelName);
  
  channel.on(
    'postgres_changes',
    { event: '*', schema: 'public', table: tableName },
    callback
  ).subscribe();
  
  return channel;
};
