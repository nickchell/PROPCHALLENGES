import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface TradingHistoryRecord {
  id: string;
  created_at: string;
  user_name: string;
  phase: number;
  day_number: number;
  wins: number;
  losses: number;
  risk_used: number;
  daily_pl: number;
  balance: number;
  peak_balance: number;
  drawdown: number;
  status: 'Ongoing' | 'Pass' | 'Fail';
}

export interface UserProfile {
  name: string;
  displayName: string;
}

export const USER_PROFILES: UserProfile[] = [
  { name: 'nico', displayName: 'Nico' },
  { name: 'adrian', displayName: 'Adrian' }
];