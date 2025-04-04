import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import apiClient from '../api/client';

interface Template {
  id: string;
  name: string;
  description: string;
  template_format: string;
}

const CreateReportPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/templates');
        setTemplates(response.data as unknown as Template[]);
        setError(null);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Failed to load templates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSelectTemplate = (templateId: string) => {
    navigate(`/validate-data/${templateId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-1 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Select a Template</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No templates available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please contact your administrator to add templates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSelectTemplate(template.id)}
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{template.description}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {template.template_format.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <button
                    className="font-medium text-purple-600 hover:text-purple-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTemplate(template.id);
                    }}
                  >
                    Select this template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreateReportPage;
