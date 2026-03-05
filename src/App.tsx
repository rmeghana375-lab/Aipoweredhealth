import { useState } from 'react';
import { Eye, Brain, Activity } from 'lucide-react';
import { ImageUpload, ClassificationResult } from './components/ImageUpload';
import { ClassificationResults } from './components/ClassificationResults';
import { ScanHistory } from './components/ScanHistory';

function App() {
  const [latestResult, setLatestResult] = useState<ClassificationResult | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleClassificationComplete = (result: ClassificationResult) => {
    setLatestResult(result);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Eye className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Diabetic Retinopathy Detection System
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                AI-powered early detection for vision preservation
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">CNN Model</p>
                <p className="text-sm text-gray-600">Deep Learning Classification</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">5 Severity Levels</p>
                <p className="text-sm text-gray-600">None to Proliferative</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center space-x-3">
              <Eye className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">Early Detection</p>
                <p className="text-sm text-gray-600">Prevent Vision Loss</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <ImageUpload onClassificationComplete={handleClassificationComplete} />

            {latestResult && (
              <ClassificationResults result={latestResult} />
            )}
          </div>

          <div>
            <ScanHistory key={refreshKey} />
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">About This System</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              This AI-powered system uses deep learning to detect diabetic retinopathy from retinal
              fundus images. The model classifies images into five severity levels:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>None:</strong> No diabetic retinopathy detected</li>
              <li><strong>Mild:</strong> Microaneurysms only</li>
              <li><strong>Moderate:</strong> More than microaneurysms but less than severe</li>
              <li><strong>Severe:</strong> Multiple hemorrhages and microaneurysms</li>
              <li><strong>Proliferative:</strong> Neovascularization or vitreous hemorrhage</li>
            </ul>
            <p className="mt-3">
              Early detection through AI-powered screening can help prevent blindness and enable
              timely intervention, especially in low-resource settings where ophthalmologists may be
              scarce.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            AI Healthcare Solutions - Diabetic Retinopathy Detection System
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
