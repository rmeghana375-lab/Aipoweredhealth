import { useEffect, useState } from 'react';
import { Clock, User, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ScanWithClassification } from '../types/database';

export function ScanHistory() {
  const [scans, setScans] = useState<ScanWithClassification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const { data: scansData, error: scansError } = await supabase
        .from('scans')
        .select('*')
        .order('upload_date', { ascending: false })
        .limit(10);

      if (scansError) throw scansError;

      if (scansData) {
        const scansWithClassifications = await Promise.all(
          scansData.map(async (scan) => {
            const { data: classification } = await supabase
              .from('classifications')
              .select('*')
              .eq('scan_id', scan.id)
              .maybeSingle();

            return {
              ...scan,
              classification: classification || undefined,
            };
          })
        );

        setScans(scansWithClassifications);
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityBadgeColor = (severity?: string) => {
    switch (severity) {
      case 'none':
        return 'bg-green-100 text-green-800';
      case 'mild':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderate':
        return 'bg-orange-100 text-orange-800';
      case 'severe':
        return 'bg-red-100 text-red-800';
      case 'proliferative':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Scans</h2>

      {scans.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No scans yet. Upload your first retinal image to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900">{scan.patient_name}</p>
                      <p className="text-sm text-gray-500">ID: {scan.patient_id}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(scan.upload_date)}</span>
                  </div>
                </div>

                <div className="text-right">
                  {scan.classification ? (
                    <>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSeverityBadgeColor(
                          scan.classification.severity_level
                        )}`}
                      >
                        {scan.classification.severity_level}
                      </span>
                      <p className="text-sm text-gray-500 mt-2">
                        {scan.classification.confidence_score.toFixed(1)}% confidence
                      </p>
                    </>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      Processing
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
