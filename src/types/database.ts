export type SeverityLevel = 'none' | 'mild' | 'moderate' | 'severe' | 'proliferative';

export interface Scan {
  id: string;
  patient_name: string;
  patient_id: string;
  image_url: string;
  upload_date: string;
  created_at: string;
}

export interface Classification {
  id: string;
  scan_id: string;
  severity_level: SeverityLevel;
  confidence_score: number;
  model_version: string;
  classification_date: string;
  additional_findings: {
    microaneurysms: boolean;
    hemorrhages: boolean;
    exudates: boolean;
    neovascularization: boolean;
  };
  created_at: string;
}

export interface ScanWithClassification extends Scan {
  classification?: Classification;
}

export interface Database {
  public: {
    Tables: {
      scans: {
        Row: Scan;
        Insert: Omit<Scan, 'id' | 'upload_date' | 'created_at'>;
        Update: Partial<Omit<Scan, 'id' | 'created_at'>>;
      };
      classifications: {
        Row: Classification;
        Insert: Omit<Classification, 'id' | 'classification_date' | 'created_at'>;
        Update: Partial<Omit<Classification, 'id' | 'created_at'>>;
      };
    };
  };
}
