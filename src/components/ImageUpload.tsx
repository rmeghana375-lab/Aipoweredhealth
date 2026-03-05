import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onClassificationComplete: (result: ClassificationResult) => void;
}

export interface ClassificationResult {
  scan_id: string;
  classification_id: string;
  result: {
    severity_level: string;
    confidence_score: number;
    additional_findings: {
      microaneurysms: boolean;
      hemorrhages: boolean;
      exudates: boolean;
      neovascularization: boolean;
    };
    recommendations: string;
  };
}

export function ImageUpload({ onClassificationComplete }: ImageUploadProps) {
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!patientName || !patientId || !selectedImage) {
      setError('Please fill in all fields and select an image');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/classify-retinopathy`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_name: patientName,
          patient_id: patientId,
          image_data: selectedImage,
          use_demo_mode: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Classification failed');
      }

      const result = await response.json();
      onClassificationComplete(result);

      setPatientName('');
      setPatientId('');
      setSelectedImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during classification');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Retinal Image</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-2">
            Patient Name
          </label>
          <input
            type="text"
            id="patientName"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter patient name"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-2">
            Patient ID
          </label>
          <input
            type="text"
            id="patientId"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter patient ID"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Retinal Fundus Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
            <div className="space-y-1 text-center">
              {selectedImage ? (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Selected retinal scan"
                    className="mx-auto h-48 w-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                    disabled={isProcessing}
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageSelect}
                        disabled={isProcessing}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isProcessing || !selectedImage || !patientName || !patientId}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              Analyzing Image...
            </>
          ) : (
            'Analyze Image'
          )}
        </button>
      </form>
    </div>
  );
}
