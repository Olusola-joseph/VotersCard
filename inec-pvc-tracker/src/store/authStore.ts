import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'officer' | 'admin' | 'super_admin';
  assigned_lga_code?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      const user: User = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role as 'officer' | 'admin' | 'super_admin',
        assigned_lga_code: profile.assigned_lga_code || undefined,
      };

      set({ user, loading: false });
      return { error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      return { error: error.message || 'Invalid login credentials' };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, loading: false });
  },

  checkAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        set({ user: null, loading: false });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        const user: User = {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role as 'officer' | 'admin' | 'super_admin',
          assigned_lga_code: profile.assigned_lga_code || undefined,
        };
        set({ user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({ user: null, loading: false });
    }
  },
}));
