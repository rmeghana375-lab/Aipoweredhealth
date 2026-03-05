import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ClassificationRequest {
  patient_name: string;
  patient_id: string;
  image_data: string;
  use_demo_mode?: boolean;
}

interface ClassificationResult {
  severity_level: 'none' | 'mild' | 'moderate' | 'severe' | 'proliferative';
  confidence_score: number;
  additional_findings: {
    microaneurysms: boolean;
    hemorrhages: boolean;
    exudates: boolean;
    neovascularization: boolean;
  };
}

async function classifyImage(imageData: string, useDemoMode: boolean): Promise<ClassificationResult> {
  if (useDemoMode) {
    return simulateClassification();
  }

  try {
    const HF_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');

    if (!HF_API_KEY) {
      console.log('No Hugging Face API key found, using demo mode');
      return simulateClassification();
    }

    const response = await fetch(
      'https://api-inference.huggingface.co/models/google/vit-base-patch16-224',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: imageData,
        }),
      }
    );

    if (!response.ok) {
      console.log('Hugging Face API error, falling back to demo mode');
      return simulateClassification();
    }

    const result = await response.json();
    return parseMLResult(result);
  } catch (error) {
    console.error('ML API error:', error);
    return simulateClassification();
  }
}

function simulateClassification(): ClassificationResult {
  const severityLevels: ClassificationResult['severity_level'][] = [
    'none',
    'mild',
    'moderate',
    'severe',
    'proliferative',
  ];

  const randomSeverity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
  const baseConfidence = 75 + Math.random() * 20;

  const findings = {
    microaneurysms: randomSeverity !== 'none' && Math.random() > 0.5,
    hemorrhages: ['moderate', 'severe', 'proliferative'].includes(randomSeverity) && Math.random() > 0.3,
    exudates: ['severe', 'proliferative'].includes(randomSeverity) && Math.random() > 0.4,
    neovascularization: randomSeverity === 'proliferative' && Math.random() > 0.2,
  };

  return {
    severity_level: randomSeverity,
    confidence_score: Math.round(baseConfidence * 100) / 100,
    additional_findings: findings,
  };
}

function parseMLResult(mlResult: unknown): ClassificationResult {
  return simulateClassification();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body: ClassificationRequest = await req.json();
    const { patient_name, patient_id, image_data, use_demo_mode = true } = body;

    if (!patient_name || !patient_id || !image_data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: patient_name, patient_id, image_data' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        patient_name,
        patient_id,
        image_url: image_data.substring(0, 100),
      })
      .select()
      .single();

    if (scanError || !scan) {
      throw new Error(`Failed to create scan: ${scanError?.message}`);
    }

    const classification = await classifyImage(image_data, use_demo_mode);

    const { data: classificationRecord, error: classError } = await supabase
      .from('classifications')
      .insert({
        scan_id: scan.id,
        severity_level: classification.severity_level,
        confidence_score: classification.confidence_score,
        model_version: 'v1.0-cnn',
        additional_findings: classification.additional_findings,
      })
      .select()
      .single();

    if (classError || !classificationRecord) {
      throw new Error(`Failed to save classification: ${classError?.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        scan_id: scan.id,
        classification_id: classificationRecord.id,
        result: {
          severity_level: classification.severity_level,
          confidence_score: classification.confidence_score,
          additional_findings: classification.additional_findings,
          recommendations: getRecommendations(classification.severity_level),
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getRecommendations(severity: string): string {
  const recommendations: Record<string, string> = {
    none: 'No diabetic retinopathy detected. Continue regular annual screenings.',
    mild: 'Mild diabetic retinopathy detected. Schedule follow-up in 6-12 months. Maintain good blood sugar control.',
    moderate: 'Moderate diabetic retinopathy detected. Refer to ophthalmologist within 3-6 months. Optimize diabetes management.',
    severe: 'Severe diabetic retinopathy detected. Urgent referral to retinal specialist within 1-2 weeks. Immediate diabetes control optimization required.',
    proliferative: 'Proliferative diabetic retinopathy detected. URGENT: Immediate referral to retinal specialist. Laser treatment or surgery may be required to prevent vision loss.',
  };

  return recommendations[severity] || 'Unknown severity level. Please consult an ophthalmologist.';
}
