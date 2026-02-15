import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl || 'missing',
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  language_preference: string;
  notification_email: boolean;
  notification_telegram: boolean;
  notification_wechat: boolean;
  notification_sms: boolean;
  telegram_id: string | null;
  wechat_id: string | null;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Visa {
  id: string;
  user_id: string;
  country: string;
  visa_type: string;
  visa_number: string | null;
  issue_date: string | null;
  expiry_date: string;
  entry_type: string;
  status: string;
  notes: string;
  document_url: string | null;
  category: string;
  person_name: string | null;
  relationship: string | null;
  photo_url: string | null;
  ocr_data: any;
  is_encrypted: boolean;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  visa_id: string;
  user_id: string;
  reminder_date: string;
  days_before: number;
  reminder_type: string;
  channel: string;
  message: string | null;
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
}

export interface VisaType {
  id: string;
  code: string;
  country: string;
  name_en: string;
  name_zh: string | null;
  name_km: string | null;
  description_en: string | null;
  description_zh: string | null;
  description_km: string | null;
  requirements_en: string | null;
  requirements_zh: string | null;
  requirements_km: string | null;
  materials_en: any;
  materials_zh: any;
  materials_km: any;
  duration_days: number | null;
  processing_time_days: number | null;
  fee_usd: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  type: string;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_telegram: string | null;
  contact_wechat: string | null;
  address: string | null;
  website: string | null;
  services: any;
  rating: number;
  review_count: number;
  commission_rate: number | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  user_id: string;
  provider_id: string | null;
  visa_id: string | null;
  service_type: string;
  status: string;
  message: string | null;
  quoted_price: number | null;
  quoted_at: string | null;
  accepted_at: string | null;
  completed_at: string | null;
  rating: number | null;
  review: string | null;
  created_at: string;
  updated_at: string;
}
