
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://ebvyuyfzfmvwearozskj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVidnl1eWZ6Zm12d2Vhcm96c2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwODMxNDMsImV4cCI6MjA2MjY1OTE0M30.y7h00ZkK8mk2q1E4qIe4GxeOiDCyix33Hapa5wZL_RM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Add debug logging for database operations
const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('achievements').select('*');
    if (error) {
      console.error('Debug - Error accessing achievements table:', error.message);
      console.error('Debug - Error details:', error);
    } else {
      console.log('Debug - Successfully connected to achievements table, found rows:', data?.length || 0);
    }
  } catch (error) {
    console.error('Debug - Unexpected error:', error);
  }
};

// Execute the check
checkDatabaseConnection();

// Helper function to get storage URL
export const getStorageUrl = async (bucket: string, path: string): Promise<string | null> => {
  try {
    const { data } = await supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting storage URL:', error);
    return null;
  }
};
