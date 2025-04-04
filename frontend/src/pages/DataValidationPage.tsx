import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';

interface DataPoint {
  id: string;
  name: string;
  value: string;
  status: 'valid' | 'invalid' | 'warning';
  message?: string;
  isEditing: boolean;
}

interface DataSource {
  id: string;
  name: string;
  connector_type: string;
  last_synced: string | null;
  files: {
    id: string;
    filename: string;
    file_type: string;
    size: number;
  }[];
}

const DataValidationPage = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    {
      id: '1',
      name: 'Total Sales',
      value: '$1,245,000',
      status: 'valid',
      isEditing: false,
    },
    {
      id: '2',
      name: 'Customer Retention Rate',
      value: '87.5%',
      status: 'valid',
      isEditing: false,
    },
    {
      id: '3',
      name: 'Average Order Value',
      value: '$125',
      status: 'warning',
      message: 'Value is 15% lower than previous period',
      isEditing: false,
    },
    {
      id: '4',
      name: 'Customer Acquisition Cost',
      value: '$45',
      status: 'invalid',
      message: 'Data missing for Q1 2025',
      isEditing: false,
    },
  ]);

  const handleEdit = (id: string) => {
    setDataPoints(points =>
      points.map(point =>
        point.id === id
          ? { ...point, isEditing: true }
          : point
      )
    );
  };

  const handleSave = (id: string, newValue: string) => {
    setDataPoints(points =>
      points.map(point =>
        point.id === id
          ? { ...point, value: newValue, isEditing: false }
          : point
      )
    );
  };

  const handleCancel = (id: string) => {
    setDataPoints(points =>
      points.map(point =>
        point.id === id
          ? { ...point, isEditing: false }
          : point
      )
    );
  };

  useEffect(() => {
    const fetchDataSources = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/data-sources');
        setDataSources(response.data as unknown as DataSource[]);
        setError(null);
      } catch (err) {
        console.error('Error fetching data sources:', err);
        setError('Failed to load data sources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDataSources();
  }, []);

  const handleContinue = () => {
    navigate(`/knowledge-base/${templateId}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'invalid':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Validate Data</h1>
        <div></div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            Connected Data Sources
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            These data sources will be used to generate your report.
          </p>
        </div>
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
              {error}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {dataSources.map((source) => (
                <li key={source.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">{source.name}</p>
                      <p className="text-sm text-gray-500">
                        Type: {source.connector_type}
                      </p>
                      {source.last_synced && (
                        <p className="text-xs text-gray-400">
                          Last synced: {new Date(source.last_synced).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Connected
                      </span>
                    </div>
                  </div>
                  {source.files && source.files.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500 mb-1">Files:</p>
                      <div className="flex flex-wrap gap-2">
                        {source.files.map((file) => (
                          <span
                            key={file.id}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {file.filename}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            Data Validation
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Review and correct any data issues before proceeding.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {dataPoints.map((point) => (
              <li key={point.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(point.status)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{point.name}</p>
                      {point.message && (
                        <p className="text-xs text-gray-500">{point.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    {point.isEditing ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          defaultValue={point.value}
                          className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSave(point.id, e.currentTarget.value);
                            } else if (e.key === 'Escape') {
                              handleCancel(point.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            const input = document.querySelector(`input[type="text"]`) as HTMLInputElement;
                            handleSave(point.id, input?.value || point.value);
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleCancel(point.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">{point.value}</span>
                        <button
                          onClick={() => handleEdit(point.id)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default DataValidationPage;
