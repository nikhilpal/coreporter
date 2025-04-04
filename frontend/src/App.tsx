import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ReportsPage from './pages/ReportsPage';
import CreateReportPage from './pages/CreateReportPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import DataValidationPage from './pages/DataValidationPage';
import GeneratingReportPage from './pages/GeneratingReportPage';
import ReportReviewPage from './pages/ReportReviewPage';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<ReportsPage />} />
          <Route path="/create" element={<CreateReportPage />} />
          <Route path="/knowledge-base/:templateId" element={<KnowledgeBasePage />} />
          <Route path="/validate-data/:templateId" element={<DataValidationPage />} />
          <Route path="/generating-report/:templateId" element={<GeneratingReportPage />} />
          <Route path="/review-report/:reportId" element={<ReportReviewPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
