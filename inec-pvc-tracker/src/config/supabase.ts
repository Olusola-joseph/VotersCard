/**
 * Supabase Configuration
 * Environment variables for Supabase connection
 */

// IMPORTANT: Replace these with your actual Supabase credentials
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Validate configuration
if (!SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
  console.warn('⚠️  VITE_SUPABASE_URL is not configured. Please set it in your .env file.');
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('⚠️  VITE_SUPABASE_ANON_KEY is not configured. Please set it in your .env file.');
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
