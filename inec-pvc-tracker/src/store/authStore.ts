import { create } from 'zustand';
import { supabase, type Profile } from '../lib/supabaseClient';

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

      // Try to fetch profile, but don't fail if it doesn't exist or RLS blocks it
      let userProfile: User | null = null;
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!profileError && profile) {
          const typedProfile = profile as Profile;
          userProfile = {
            id: typedProfile.id,
            email: typedProfile.email,
            full_name: typedProfile.full_name,
            role: typedProfile.role as 'officer' | 'admin' | 'super_admin',
            assigned_lga_code: typedProfile.assigned_lga_code || undefined,
          };
        }
      } catch (profileErr) {
        console.warn('Profile fetch failed during login, using fallback:', profileErr);
      }

      // If no profile found, use fallback user data from session
      if (!userProfile) {
        let defaultRole: 'officer' | 'admin' | 'super_admin' = 'officer';
        if (email.includes('admin')) {
          defaultRole = 'admin';
        } else if (email.includes('super')) {
          defaultRole = 'super_admin';
        }
        
        userProfile = {
          id: data.user.id,
          email: email,
          full_name: email.split('@')[0],
          role: defaultRole,
          assigned_lga_code: undefined,
        };
      }

      set({ user: userProfile, loading: false });
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

      // Try to fetch profile, but don't block if it fails
      let userProfile: User | null = null;
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profileError && profile) {
          const typedProfile = profile as Profile;
          userProfile = {
            id: typedProfile.id,
            email: typedProfile.email,
            full_name: typedProfile.full_name,
            role: typedProfile.role as 'officer' | 'admin' | 'super_admin',
            assigned_lga_code: typedProfile.assigned_lga_code || undefined,
          };
        }
      } catch (profileErr) {
        console.warn('Profile fetch failed, using fallback:', profileErr);
      }

      // If no profile found/created, use fallback user data from session
      if (!userProfile) {
        const email = session.user.email || '';
        let defaultRole: 'officer' | 'admin' | 'super_admin' = 'officer';
        if (email.includes('admin')) {
          defaultRole = 'admin';
        } else if (email.includes('super')) {
          defaultRole = 'super_admin';
        }
        
        userProfile = {
          id: session.user.id,
          email: email,
          full_name: email.split('@')[0] || 'User',
          role: defaultRole,
          assigned_lga_code: undefined,
        };
      }

      set({ user: userProfile, loading: false });
    } catch (error) {
      console.error('Auth check error:', error);
      set({ user: null, loading: false });
    }
  },
}));
