import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const GeneratingReportPage = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/review-report/${templateId}`, { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, templateId]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Thanks for uploading. We're
        </h2>
        <p className="text-xl font-semibold text-gray-900">
          generating report for you.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          This will take just a moment...
        </p>
      </div>
    </div>
  );
};

export default GeneratingReportPage;
