import axios from 'axios';

const mockData = {
  reports: [
    {
      id: '1',
      name: 'Q1 Financial Report',
      status: 'draft',
      created_at: '2025-03-01T10:00:00Z',
      updated_at: '2025-03-15T14:30:00Z',
      content: '<h1>Q1 Financial Report</h1><p>This is a sample financial report for Q1 2025.</p><h2>Revenue</h2><p>Total revenue: $1.2M</p><h2>Expenses</h2><p>Total expenses: $800K</p><h2>Profit</h2><p>Net profit: $400K</p>'
    },
    {
      id: '2',
      name: 'Annual Marketing Analysis',
      status: 'approved',
      created_at: '2025-02-10T09:15:00Z',
      updated_at: '2025-03-20T11:45:00Z',
      content: '<h1>Annual Marketing Analysis</h1><p>This report analyzes our marketing efforts for the past year.</p><h2>Campaign Performance</h2><p>Our digital campaigns saw a 15% increase in engagement.</p><h2>ROI Analysis</h2><p>Marketing ROI improved by 22% compared to previous year.</p>'
    }
  ],
  templates: [
    {
      id: '1',
      name: 'Financial Report Template',
      description: 'Standard template for quarterly and annual financial reports',
      template_format: 'html'
    },
    {
      id: '2',
      name: 'Marketing Analysis Template',
      description: 'Template for analyzing marketing campaign performance',
      template_format: 'html'
    },
    {
      id: '3',
      name: 'Project Status Report',
      description: 'Template for reporting project progress and milestones',
      template_format: 'html'
    }
  ],
  data_sources: [
    {
      id: '1',
      name: 'Financial Database',
      connector_type: 'SQL',
      last_synced: '2025-03-25T08:30:00Z',
      files: [
        { id: '1', filename: 'q1_financials.csv' },
        { id: '2', filename: 'revenue_data.xlsx' }
      ]
    },
    {
      id: '2',
      name: 'Marketing Analytics',
      connector_type: 'API',
      last_synced: '2025-03-24T14:45:00Z',
      files: [
        { id: '3', filename: 'campaign_metrics.json' }
      ]
    }
  ],
  questions: [
    {
      id: '1',
      text: 'What was the total revenue for Q1?',
      context: 'Financial performance',
      answer: 'The total revenue for Q1 was $1.2 million, representing a 15% increase over the same period last year.',
      confidence_score: 0.95
    },
    {
      id: '2',
      text: 'What were the main expense categories?',
      context: 'Financial performance',
      answer: 'The main expense categories were: Marketing (35%), Operations (25%), R&D (20%), and Administrative (20%).',
      confidence_score: 0.92
    },
    {
      id: '3',
      text: 'How did our digital marketing campaigns perform?',
      context: 'Marketing performance',
      answer: 'Digital marketing campaigns showed a 22% increase in ROI compared to previous quarters, with social media being the top performing channel.',
      confidence_score: 0.88
    }
  ]
};

const apiClient = {
  get: async (url) => {
    console.log(`Mock API GET request to: ${url}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (url === '/reports') {
      return { data: mockData.reports };
    } else if (url.startsWith('/reports/')) {
      const reportId = url.split('/')[2];
      const report = mockData.reports.find(r => r.id === reportId);
      if (report) {
        return { data: report };
      }
      throw new Error('Report not found');
    } else if (url === '/templates') {
      return { data: mockData.templates };
    } else if (url === '/data-sources') {
      return { data: mockData.data_sources };
    } else if (url === '/questions') {
      return { data: mockData.questions };
    }
    
    throw new Error(`Endpoint not found: ${url}`);
  },
  
  post: async (url, data) => {
    console.log(`Mock API POST request to: ${url}`, data);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (url === '/reports') {
      const newReport = {
        id: String(mockData.reports.length + 1),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockData.reports.push(newReport);
      return { data: newReport };
    }
    
    throw new Error(`Endpoint not found: ${url}`);
  },
  
  put: async (url, data) => {
    console.log(`Mock API PUT request to: ${url}`, data);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (url.startsWith('/reports/')) {
      const reportId = url.split('/')[2];
      const reportIndex = mockData.reports.findIndex(r => r.id === reportId);
      if (reportIndex !== -1) {
        mockData.reports[reportIndex] = {
          ...mockData.reports[reportIndex],
          ...data,
          updated_at: new Date().toISOString()
        };
        return { data: mockData.reports[reportIndex] };
      }
      throw new Error('Report not found');
    }
    
    throw new Error(`Endpoint not found: ${url}`);
  },
  
  delete: async (url) => {
    console.log(`Mock API DELETE request to: ${url}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (url.startsWith('/reports/')) {
      const reportId = url.split('/')[2];
      const reportIndex = mockData.reports.findIndex(r => r.id === reportId);
      if (reportIndex !== -1) {
        const deletedReport = mockData.reports[reportIndex];
        mockData.reports.splice(reportIndex, 1);
        return { data: deletedReport };
      }
      throw new Error('Report not found');
    }
    
    throw new Error(`Endpoint not found: ${url}`);
  }
};

export default apiClient;
