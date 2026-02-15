/*
  # Enhanced VisaTrack Features

  ## Overview
  Adds advanced features including categorization, multi-channel reminders, 
  visa encyclopedia, and service provider integration.

  ## Schema Changes

  ### Updated `profiles` table
  - Add `language_preference` (text) - User's preferred language (en/zh/km)
  - Add `notification_email` (boolean) - Email notification preference
  - Add `notification_telegram` (boolean) - Telegram notification preference
  - Add `notification_wechat` (boolean) - WeChat notification preference
  - Add `notification_sms` (boolean) - SMS notification preference
  - Add `telegram_id` (text) - Telegram user ID
  - Add `wechat_id` (text) - WeChat user ID
  - Add `phone_number` (text) - Phone number for SMS

  ### Updated `visas` table
  - Add `category` (text) - personal/family/employee
  - Add `person_name` (text) - Name of visa holder if not self
  - Add `relationship` (text) - Relationship to user
  - Add `photo_url` (text) - Uploaded visa photo
  - Add `ocr_data` (jsonb) - OCR extracted data
  - Add `is_encrypted` (boolean) - Whether data is encrypted
  - Add `is_anonymous` (boolean) - Anonymous storage flag

  ### Updated `reminders` table
  - Add `reminder_type` (text) - Type: 7days/3days/same_day
  - Add `channel` (text) - email/telegram/wechat/sms
  - Add `message` (text) - Reminder message content

  ### New `visa_types` table
  - Encyclopedia of visa types with policies and requirements
  - Multi-language support (en/zh/km)
  - Material checklists and requirements

  ### New `service_providers` table
  - Visa agencies, law firms, translation services
  - Contact information and service types
  - Ratings and reviews

  ### New `service_requests` table
  - User requests for services
  - Quotations and booking management

  ## Security
  - All tables maintain RLS policies
  - Encryption flags for sensitive data
  - Anonymous storage options
*/

-- Add new columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'language_preference'
  ) THEN
    ALTER TABLE profiles ADD COLUMN language_preference text DEFAULT 'en';
    ALTER TABLE profiles ADD COLUMN notification_email boolean DEFAULT true;
    ALTER TABLE profiles ADD COLUMN notification_telegram boolean DEFAULT false;
    ALTER TABLE profiles ADD COLUMN notification_wechat boolean DEFAULT false;
    ALTER TABLE profiles ADD COLUMN notification_sms boolean DEFAULT false;
    ALTER TABLE profiles ADD COLUMN telegram_id text;
    ALTER TABLE profiles ADD COLUMN wechat_id text;
    ALTER TABLE profiles ADD COLUMN phone_number text;
  END IF;
END $$;

-- Add new columns to visas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'visas' AND column_name = 'category'
  ) THEN
    ALTER TABLE visas ADD COLUMN category text DEFAULT 'personal';
    ALTER TABLE visas ADD COLUMN person_name text;
    ALTER TABLE visas ADD COLUMN relationship text;
    ALTER TABLE visas ADD COLUMN photo_url text;
    ALTER TABLE visas ADD COLUMN ocr_data jsonb;
    ALTER TABLE visas ADD COLUMN is_encrypted boolean DEFAULT false;
    ALTER TABLE visas ADD COLUMN is_anonymous boolean DEFAULT false;
  END IF;
END $$;

-- Add new columns to reminders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reminders' AND column_name = 'reminder_type'
  ) THEN
    ALTER TABLE reminders ADD COLUMN reminder_type text DEFAULT '7days';
    ALTER TABLE reminders ADD COLUMN channel text DEFAULT 'email';
    ALTER TABLE reminders ADD COLUMN message text;
  END IF;
END $$;

-- Create visa_types table (encyclopedia)
CREATE TABLE IF NOT EXISTS visa_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  country text NOT NULL,
  name_en text NOT NULL,
  name_zh text,
  name_km text,
  description_en text,
  description_zh text,
  description_km text,
  requirements_en text,
  requirements_zh text,
  requirements_km text,
  materials_en jsonb,
  materials_zh jsonb,
  materials_km jsonb,
  duration_days integer,
  processing_time_days integer,
  fee_usd numeric(10,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(code, country)
);

ALTER TABLE visa_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active visa types"
  ON visa_types FOR SELECT
  USING (is_active = true);

-- Create service_providers table
CREATE TABLE IF NOT EXISTS service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  description text,
  contact_email text,
  contact_phone text,
  contact_telegram text,
  contact_wechat text,
  address text,
  website text,
  services jsonb,
  rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  commission_rate numeric(5,2),
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active service providers"
  ON service_providers FOR SELECT
  USING (is_active = true);

-- Create service_requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES service_providers(id) ON DELETE SET NULL,
  visa_id uuid REFERENCES visas(id) ON DELETE SET NULL,
  service_type text NOT NULL,
  status text DEFAULT 'pending',
  message text,
  quoted_price numeric(10,2),
  quoted_at timestamptz,
  accepted_at timestamptz,
  completed_at timestamptz,
  rating integer,
  review text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own service requests"
  ON service_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own service requests"
  ON service_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own service requests"
  ON service_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own service requests"
  ON service_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_visa_types_country ON visa_types(country);
CREATE INDEX IF NOT EXISTS idx_visa_types_code ON visa_types(code);
CREATE INDEX IF NOT EXISTS idx_service_providers_type ON service_providers(type);
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_visas_category ON visas(category);

-- Insert sample visa types for Cambodia
INSERT INTO visa_types (code, country, name_en, name_zh, name_km, description_en, description_zh, description_km, duration_days, processing_time_days, fee_usd, materials_en)
VALUES 
  ('EB', 'Cambodia', 'Business Visa', '商务签证', 'ទិដ្ឋាការអាជីវកម្ម', 'Business visa for Cambodia valid for multiple entries', '柬埔寨商务签证，支持多次入境', 'ទិដ្ឋាការអាជីវកម្មសម្រាប់កម្ពុជា', 365, 3, 35.00, '["Passport (valid 6+ months)", "Photo (4x6cm)", "Business letter", "Company registration"]'::jsonb),
  ('ER', 'Cambodia', 'Retirement Visa', '退休签证', 'ទិដ្ឋាការចូលនិវត្តន៍', 'Retirement visa for those 55+ years old', '适用于55岁以上人士的退休签证', 'ទិដ្ឋាការសម្រាប់អ្នកចូលនិវត្តន៍', 365, 5, 290.00, '["Passport (valid 6+ months)", "Photo (4x6cm)", "Age proof (55+)", "Financial proof"]'::jsonb),
  ('EG', 'Cambodia', 'Ordinary Visa', '普通签证', 'ទិដ្ឋាការធម្មតា', 'Standard visa for Cambodia', '柬埔寨标准签证', 'ទិដ្ឋាការធម្មតា', 30, 3, 30.00, '["Passport (valid 6+ months)", "Photo (4x6cm)", "Return ticket", "Hotel booking"]'::jsonb),
  ('ES', 'Cambodia', 'Student Visa', '学生签证', 'ទិដ្ឋាការសិស្ស', 'Student visa for educational purposes', '用于教育目的的学生签证', 'ទិដ្ឋាការសម្រាប់សិស្ស', 365, 5, 35.00, '["Passport (valid 6+ months)", "Photo (4x6cm)", "Admission letter", "Financial proof"]'::jsonb)
ON CONFLICT (code, country) DO NOTHING;

-- Insert sample service providers
INSERT INTO service_providers (name, type, description, contact_email, contact_phone, services, is_verified, is_active)
VALUES 
  ('Cambodia Visa Services', 'visa_agency', 'Professional visa processing and renewal services', 'info@cambodiavisa.com', '+855-23-123456', '["visa_renewal", "visa_extension", "visa_consultation"]'::jsonb, true, true),
  ('Global Law Associates', 'law_firm', 'Immigration and visa legal services', 'contact@globallaw.com', '+855-23-234567', '["legal_consultation", "visa_appeals", "immigration_advice"]'::jsonb, true, true),
  ('QuickTranslate KH', 'translation', 'Document translation services', 'hello@quicktranslate.com', '+855-23-345678', '["document_translation", "certified_translation", "notarization"]'::jsonb, true, true)
ON CONFLICT DO NOTHING;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_visa_types_updated_at ON visa_types;
CREATE TRIGGER update_visa_types_updated_at
  BEFORE UPDATE ON visa_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_providers_updated_at ON service_providers;
CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON service_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_requests_updated_at ON service_requests;
CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
