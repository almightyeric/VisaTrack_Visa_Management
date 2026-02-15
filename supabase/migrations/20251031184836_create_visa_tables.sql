/*
  # VisaTrack Database Schema

  ## Overview
  Creates the complete database structure for the VisaTrack visa management system.

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, FK to auth.users) - User identifier
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `visas`
  - `id` (uuid, PK) - Unique visa identifier
  - `user_id` (uuid, FK to profiles) - Owner of the visa record
  - `country` (text) - Destination country
  - `visa_type` (text) - Type of visa (tourist, business, student, work, etc.)
  - `visa_number` (text) - Official visa number
  - `issue_date` (date) - Date visa was issued
  - `expiry_date` (date) - Date visa expires
  - `entry_type` (text) - Single/Multiple entry
  - `status` (text) - Current status (active, expired, pending, cancelled)
  - `notes` (text) - Additional notes
  - `document_url` (text) - URL to uploaded visa document
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `reminders`
  - `id` (uuid, PK) - Unique reminder identifier
  - `visa_id` (uuid, FK to visas) - Associated visa
  - `user_id` (uuid, FK to profiles) - Reminder owner
  - `reminder_date` (date) - When to send reminder
  - `days_before` (integer) - Days before expiry
  - `is_sent` (boolean) - Whether reminder was sent
  - `sent_at` (timestamptz) - When reminder was sent
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Policies enforce user_id matching auth.uid()
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create visas table
CREATE TABLE IF NOT EXISTS visas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  country text NOT NULL,
  visa_type text NOT NULL,
  visa_number text,
  issue_date date,
  expiry_date date NOT NULL,
  entry_type text DEFAULT 'single',
  status text DEFAULT 'active',
  notes text DEFAULT '',
  document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE visas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own visas"
  ON visas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visas"
  ON visas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visas"
  ON visas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own visas"
  ON visas FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visa_id uuid NOT NULL REFERENCES visas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_date date NOT NULL,
  days_before integer NOT NULL,
  is_sent boolean DEFAULT false,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visas_user_id ON visas(user_id);
CREATE INDEX IF NOT EXISTS idx_visas_expiry_date ON visas(expiry_date);
CREATE INDEX IF NOT EXISTS idx_visas_status ON visas(status);
CREATE INDEX IF NOT EXISTS idx_reminders_visa_id ON reminders(visa_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(reminder_date);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_visas_updated_at ON visas;
CREATE TRIGGER update_visas_updated_at
  BEFORE UPDATE ON visas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
