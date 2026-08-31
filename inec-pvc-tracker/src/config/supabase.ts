/**
 * Supabase Configuration
 * Environment variables for Supabase connection
 */

// Load environment variables from .env file
const loadEnv = () => {
  if (typeof window !== 'undefined') {
    return {
      VITE_SUPABASE_URL: (window as any).env?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: (window as any).env?.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
    };
  }
  return {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
  };
};

const env = loadEnv();

export const SUPABASE_URL = env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || '';

// Validate configuration with better error messages
if (!SUPABASE_URL) {
  console.error('❌ VITE_SUPABASE_URL is not configured. Please check your .env file.');
} else {
  console.log('✅ Supabase URL configured:', SUPABASE_URL);
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not configured. Please check your .env file.');
} else {
  console.log('✅ Supabase Anon Key configured');
}

export const DATABASE_CONFIG = {
  stateCode: '27', // Ogun State
  appName: 'INEC PVC Tracker',
  version: '1.0.0'
};

// Export WebSocket for Node.js environments (if needed)
export const getWebSocketTransport = () => {
  if (typeof window === 'undefined') {
    // Node.js environment
    try {
      return require('ws');
    } catch (e) {
      console.warn('WebSocket not available in Node.js environment');
      return null;
    }
  }
  // Browser environment - native WebSocket available
  return undefined;
};
