import { AlertCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { ClassificationResult } from './ImageUpload';

interface ClassificationResultsProps {
  result: ClassificationResult;
}

export function ClassificationResults({ result }: ClassificationResultsProps) {
  const { severity_level, confidence_score, additional_findings, recommendations } = result.result;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'none':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'mild':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'proliferative':
        return 'bg-red-200 text-red-900 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'none':
        return <CheckCircle className="h-6 w-6" />;
      case 'mild':
        return <AlertCircle className="h-6 w-6" />;
      case 'moderate':
        return <AlertTriangle className="h-6 w-6" />;
      case 'severe':
      case 'proliferative':
        return <XCircle className="h-6 w-6" />;
      default:
        return <AlertCircle className="h-6 w-6" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-blue-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Classification Results</h2>

      <div
        className={`p-6 rounded-lg border-2 ${getSeverityColor(severity_level)} flex items-start space-x-4`}
      >
        <div className="flex-shrink-0">{getSeverityIcon(severity_level)}</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold capitalize mb-2">
            {severity_level === 'none' ? 'No' : severity_level} Diabetic Retinopathy
          </h3>
          <p className={`text-lg font-semibold ${getConfidenceColor(confidence_score)}`}>
            Confidence: {confidence_score.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Additional Findings</h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(additional_findings).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <div
                className={`w-4 h-4 rounded-full ${
                  value ? 'bg-red-500' : 'bg-green-500'
                }`}
              />
              <span className="text-sm text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`rounded-lg p-6 ${
          severity_level === 'severe' || severity_level === 'proliferative'
            ? 'bg-red-50 border-2 border-red-200'
            : 'bg-blue-50 border-2 border-blue-200'
        }`}
      >
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
          {(severity_level === 'severe' || severity_level === 'proliferative') && (
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          )}
          Recommendations
        </h4>
        <p
          className={`text-sm ${
            severity_level === 'severe' || severity_level === 'proliferative'
              ? 'text-red-900'
              : 'text-blue-900'
          }`}
        >
          {recommendations}
        </p>
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 rounded p-4">
        <p className="font-medium mb-1">Disclaimer</p>
        <p>
          This is an AI-assisted diagnostic tool for screening purposes only. Results should be
          confirmed by a qualified ophthalmologist. This system does not replace professional
          medical judgment.
        </p>
      </div>
    </div>
  );
}
