import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Edit, CheckCircle } from 'lucide-react';
import apiClient from '../api/client';

interface Report {
  id: string;
  name: string;
  content: string;
  status: string;
  template_id: string;
  created_at: string;
  updated_at: string;
}

const ReportReviewPage = () => {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/reports/${reportId}`);
        setReport(response.data);
        setEditedContent(response.data.content);
        setError(null);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to load report. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handleSaveChanges = async () => {
    if (!report) return;

    try {
      setLoading(true);
      const updatedReport = { ...report, content: editedContent };
      setReport(updatedReport);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error updating report:', err);
      setError('Failed to update report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReport = async () => {
    if (!report) return;

    try {
      setLoading(true);
      const updatedReport = { ...report, status: 'approved' };
      setReport(updatedReport);
      setError(null);
    } catch (err) {
      console.error('Error approving report:', err);
      setError('Failed to approve report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format: string) => {
    if (!report) return;

    try {
      setLoading(true);
      alert(`Exporting report in ${format} format`);
      
      const updatedReport = { ...report, status: 'exported' };
      setReport(updatedReport);
      setError(null);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !report) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
          Report not found.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">{report.name}</h1>
        <div className="flex space-x-2">
          {report.status === 'approved' || report.status === 'exported' ? (
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              Approved
            </div>
          ) : (
            <button
              onClick={handleApproveReport}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Approve Report
            </button>
          )}
          <div className="relative inline-block text-left">
            <button
              onClick={() => handleExportReport('pdf')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Download className="h-4 w-4 mr-1" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Report Preview
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Review and edit the report before approving.
            </p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Content
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveChanges}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(report.content);
                }}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200">
          {isEditing ? (
            <div className="p-4">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                rows={20}
              />
            </div>
          ) : (
            <div 
              className="p-6 prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: report.content }}
            />
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 mb-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default ReportReviewPage;
