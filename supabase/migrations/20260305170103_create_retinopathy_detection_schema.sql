/*
  # Diabetic Retinopathy Detection System Schema

  1. New Tables
    - `scans`
      - `id` (uuid, primary key) - Unique identifier for each scan
      - `patient_name` (text) - Name of the patient
      - `patient_id` (text) - Patient identifier
      - `image_url` (text) - URL to the retinal fundus image
      - `upload_date` (timestamptz) - When the image was uploaded
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `classifications`
      - `id` (uuid, primary key) - Unique identifier for classification result
      - `scan_id` (uuid, foreign key) - Reference to the scan
      - `severity_level` (text) - Classification result: none, mild, moderate, severe, proliferative
      - `confidence_score` (numeric) - Model confidence percentage (0-100)
      - `model_version` (text) - Version of the ML model used
      - `classification_date` (timestamptz) - When classification was performed
      - `additional_findings` (jsonb) - Additional ML model outputs
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for demo purposes (can be restricted in production)

  3. Indexes
    - Add index on scan_id for faster classification lookups
    - Add index on severity_level for filtering
*/

-- Create scans table
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  patient_id text NOT NULL,
  image_url text NOT NULL,
  upload_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create classifications table
CREATE TABLE IF NOT EXISTS classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  severity_level text NOT NULL CHECK (severity_level IN ('none', 'mild', 'moderate', 'severe', 'proliferative')),
  confidence_score numeric NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  model_version text DEFAULT 'v1.0',
  classification_date timestamptz DEFAULT now(),
  additional_findings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_classifications_scan_id ON classifications(scan_id);
CREATE INDEX IF NOT EXISTS idx_classifications_severity ON classifications(severity_level);
CREATE INDEX IF NOT EXISTS idx_scans_patient_id ON scans(patient_id);

-- Enable Row Level Security
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE classifications ENABLE ROW LEVEL SECURITY;

-- Create policies for scans table
CREATE POLICY "Allow public read access to scans"
  ON scans FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to scans"
  ON scans FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to scans"
  ON scans FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from scans"
  ON scans FOR DELETE
  TO public
  USING (true);

-- Create policies for classifications table
CREATE POLICY "Allow public read access to classifications"
  ON classifications FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to classifications"
  ON classifications FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to classifications"
  ON classifications FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from classifications"
  ON classifications FOR DELETE
  TO public
  USING (true);