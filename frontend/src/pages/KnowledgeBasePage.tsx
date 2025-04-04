import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle, HelpCircle } from 'lucide-react';
import apiClient from '../api/client';

interface Question {
  id: string;
  text: string;
  context: string;
  answer: string | null;
  confidence_score: number | null;
}

const KnowledgeBasePage = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/questions');
        setQuestions(response.data as Question[]);
        setError(null);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter(
    (question) =>
      question.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (question.context && question.context.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleGenerateAnswers = async () => {
    try {
      setLoading(true);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const updatedQuestions = questions.map((question) => ({
        ...question,
        answer: question.answer || `Sample answer for: ${question.text}`,
        confidence_score: question.confidence_score || Math.random() * 0.3 + 0.7, // Random score between 0.7 and 1.0
      }));
      
      setQuestions(updatedQuestions);
      setError(null);
    } catch (err) {
      console.error('Error generating answers:', err);
      setError('Failed to generate answers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate(`/generating-report/${templateId}`);
  };

  const getConfidenceColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-800';
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.8) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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
        <h1 className="text-2xl font-semibold text-gray-900">Knowledge Base</h1>
        <div></div>
      </div>

      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Generate Answers
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Our AI will analyze your data and generate answers to the questions below.
              You can review and edit the answers before finalizing your report.
            </p>
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={handleGenerateAnswers}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {loading ? 'Processing...' : 'Generate Answers'}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredQuestions.map((question) => (
            <li key={question.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-1">
                    {question.answer ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <HelpCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-purple-600">{question.text}</p>
                      {question.confidence_score !== null && (
                        <div className="ml-2 flex-shrink-0 flex">
                          <p
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getConfidenceColor(
                              question.confidence_score
                            )}`}
                          >
                            {Math.round(question.confidence_score * 100)}% confidence
                          </p>
                        </div>
                      )}
                    </div>
                    {question.context && (
                      <p className="text-xs text-gray-500 mt-1">
                        Context: {question.context}
                      </p>
                    )}
                    {question.answer && (
                      <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                        {question.answer}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleContinue}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Continue to Report Generation
        </button>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
