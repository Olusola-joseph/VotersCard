/**
 * Supabase Client Initialization
 * Real-time database connection for INEC PVC Tracker
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';

// Type definitions for database tables
export interface Database {
  public: {
    Tables: {
      lga_reference: {
        Row: {
          lga_code: string;
          lga_name: string;
          state_code: string;
          total_wards: number | null;
          total_pus: number | null;
          created_at: string;
        };
        Insert: {
          lga_code: string;
          lga_name: string;
          state_code?: string;
          total_wards?: number | null;
          total_pus?: number | null;
          created_at?: string;
        };
        Update: {
          lga_code?: string;
          lga_name?: string;
          state_code?: string;
          total_wards?: number | null;
          total_pus?: number | null;
          created_at?: string;
        };
      };
      ward_reference: {
        Row: {
          id: string;
          ward_code: string;
          ward_name: string;
          lga_code: string;
          full_delimitation: string | null;
          total_pus: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ward_code: string;
          ward_name: string;
          lga_code: string;
          full_delimitation?: string | null;
          total_pus?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ward_code?: string;
          ward_name?: string;
          lga_code?: string;
          full_delimitation?: string | null;
          total_pus?: number | null;
          created_at?: string;
        };
      };
      pu_reference: {
        Row: {
          id: string;
          pu_code: string;
          pu_name: string;
          ward_code: string;
          lga_code: string;
          full_delimitation: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pu_code: string;
          pu_name: string;
          ward_code: string;
          lga_code: string;
          full_delimitation: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          pu_code?: string;
          pu_name?: string;
          ward_code?: string;
          lga_code?: string;
          full_delimitation?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: 'officer' | 'admin' | 'super_admin';
          assigned_lga_code: string | null;
          assigned_ward_code: string | null;
          phone_number: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role: 'officer' | 'admin' | 'super_admin';
          assigned_lga_code?: string | null;
          assigned_ward_code?: string | null;
          phone_number?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: 'officer' | 'admin' | 'super_admin';
          assigned_lga_code?: string | null;
          assigned_ward_code?: string | null;
          phone_number?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      pvc_distributions: {
        Row: {
          id: string;
          vin: string;
          full_name: string;
          date_of_birth: string | null;
          gender: 'MALE' | 'FEMALE' | null;
          occupation: string | null;
          residential_address: string | null;
          date_of_registration: string | null;
          batch_number: string | null;
          serial_number: string | null;
          delimitation_full: string;
          state_code: string;
          lga_code: string;
          ward_code: string;
          pu_code: string;
          pu_id: string | null;
          issued_by: string | null;
          issued_by_name: string;
          issued_by_lga_code: string | null;
          issued_at: string;
          scan_method: 'qr_only' | 'ocr_only' | 'dual_scan' | 'manual' | null;
          status: 'issued' | 'pending' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vin: string;
          full_name: string;
          date_of_birth?: string | null;
          gender?: 'MALE' | 'FEMALE' | null;
          occupation?: string | null;
          residential_address?: string | null;
          date_of_registration?: string | null;
          batch_number?: string | null;
          serial_number?: string | null;
          delimitation_full: string;
          state_code?: string;
          lga_code: string;
          ward_code: string;
          pu_code: string;
          pu_id?: string | null;
          issued_by?: string | null;
          issued_by_name: string;
          issued_by_lga_code?: string | null;
          issued_at?: string;
          scan_method?: 'qr_only' | 'ocr_only' | 'dual_scan' | 'manual' | null;
          status?: 'issued' | 'pending' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vin?: string;
          full_name?: string;
          date_of_birth?: string | null;
          gender?: 'MALE' | 'FEMALE' | null;
          occupation?: string | null;
          residential_address?: string | null;
          date_of_registration?: string | null;
          batch_number?: string | null;
          serial_number?: string | null;
          delimitation_full?: string;
          state_code?: string;
          lga_code?: string;
          ward_code?: string;
          pu_code?: string;
          pu_id?: string | null;
          issued_by?: string | null;
          issued_by_name?: string;
          issued_by_lga_code?: string | null;
          issued_at?: string;
          scan_method?: 'qr_only' | 'ocr_only' | 'dual_scan' | 'manual' | null;
          status?: 'issued' | 'pending' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      daily_pvc_summary: {
        Row: {
          distribution_date: string | null;
          state_code: string | null;
          lga_code: string | null;
          ward_code: string | null;
          pu_code: string | null;
          total_issued: number | null;
          total_officers: number | null;
          dual_scans: number | null;
          manual_entries: number | null;
        };
      };
    };
  };
}

// Create Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper functions for real-time subscriptions
export const subscribeToPVCDistributions = (
  callback: (payload: any) => void,
  filters?: { lga_code?: string; ward_code?: string }
) => {
  let channelName = 'pvc_distributions_changes';
  let filterConfig: any = { event: '*', schema: 'public', table: 'pvc_distributions' };
  
  if (filters?.lga_code && filters?.ward_code) {
    channelName = `pvc:${filters.lga_code}:${filters.ward_code}`;
  } else if (filters?.lga_code) {
    channelName = `pvc:${filters.lga_code}`;
  }
  
  const channel = supabase.channel(channelName);
  
  channel.on('postgres_changes', filterConfig, callback).subscribe();
  
  return channel;
};

export const unsubscribeFromChannel = (channel: any) => {
  supabase.removeChannel(channel);
};

// Export types for convenience
export type LGAReference = Database['public']['Tables']['lga_reference']['Row'];
export type WardReference = Database['public']['Tables']['ward_reference']['Row'];
export type PUReference = Database['public']['Tables']['pu_reference']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type PVCDistribution = Database['public']['Tables']['pvc_distributions']['Row'];
export type DailyPVCSummary = Database['public']['Views']['daily_pvc_summary']['Row'];
