interface Report {
  id: string;
  name: string;
  status: string;
  template_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  template_format: string;
}

interface DataSource {
  id: string;
  name: string;
  connector_type: string;
  auth_type: string;
  status: string;
  last_synced: string;
  files?: Array<{
    id: string;
    filename: string;
  }>;
}

interface Question {
  id: string;
  text: string;
  context: string;
  answer: string | null;
  confidence_score: number | null;
}

const mockData: {
  reports: Report[];
  templates: Template[];
  data_sources: DataSource[];
  questions: Question[];
} = {
  reports: [
    {
      id: '1',
      name: 'Q1 Financial Report',
      status: 'draft',
      template_id: '1',
      content: '<h1>Q1 Financial Report</h1><p>This is a sample financial report for Q1 2025.</p><h2>Revenue</h2><p>Total revenue: $1.2M</p><h2>Expenses</h2><p>Total expenses: $800K</p><h2>Profit</h2><p>Net profit: $400K</p>',
      created_at: '2025-03-01T10:00:00Z',
      updated_at: '2025-03-15T14:30:00Z'
    },
    {
      id: '2',
      name: 'Annual Marketing Analysis',
      status: 'approved',
      template_id: '2',
      content: '<h1>Annual Marketing Analysis</h1><p>This report analyzes our marketing efforts for the past year.</p><h2>Campaign Performance</h2><p>Our digital campaigns saw a 15% increase in engagement.</p><h2>ROI Analysis</h2><p>Marketing ROI improved by 22% compared to previous year.</p>',
      created_at: '2025-02-10T09:15:00Z',
      updated_at: '2025-03-20T11:45:00Z'
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
      auth_type: 'API_KEY',
      status: 'connected',
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
      auth_type: 'OAUTH',
      status: 'connected',
      last_synced: '2025-03-24T14:45:00Z',
      files: [
        { id: '3', filename: 'campaign_metrics.json' }
      ]
    },
    {
      id: '3',
      name: 'Cloud Storage',
      connector_type: 'CLOUD_STORAGE',
      auth_type: 'SECRET_KEY',
      status: 'error',
      last_synced: '2025-03-20T10:15:00Z',
      files: [
        { id: '4', filename: 'user_data.json' }
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
  get: async (url: string) => {
    console.log(`Mock API GET request to: ${url}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (url === '/reports') {
      return { data: mockData.reports as Report[] };
    } else if (url.startsWith('/reports/')) {
      const reportId = url.split('/')[2];
      const report = mockData.reports.find(r => r.id === reportId);
      if (report) {
        return { data: report as Report };
      }
      throw new Error('Report not found');
    } else if (url === '/templates') {
      return { data: mockData.templates as Template[] };
    } else if (url === '/data-sources') {
      return { data: mockData.data_sources as DataSource[] };
    } else if (url === '/questions') {
      return { data: mockData.questions as Question[] };
    }
    
    throw new Error(`Endpoint not found: ${url}`);
  },
  
  post: async (url: string, data: any) => {
    console.log(`Mock API POST request to: ${url}`, data);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (url === '/reports') {
      const newReport: Report = {
        id: String(mockData.reports.length + 1),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockData.reports.push(newReport);
      return { data: newReport };
    } else if (url === '/data-sources') {
      const newDataSource: DataSource = {
        id: String(mockData.data_sources.length + 1),
        name: data.name,
        connector_type: data.connector_type,
        auth_type: data.auth_type,
        status: 'connected',
        last_synced: new Date().toISOString(),
        files: []
      };
      mockData.data_sources.push(newDataSource);
      return { data: newDataSource };
    } else if (url.match(/\/data-sources\/\d+\/sync/)) {
      const dataSourceId = url.split('/')[2];
      const dataSourceIndex = mockData.data_sources.findIndex(ds => ds.id === dataSourceId);
      if (dataSourceIndex !== -1) {
        mockData.data_sources[dataSourceIndex] = {
          ...mockData.data_sources[dataSourceIndex],
          status: 'connected',
          last_synced: new Date().toISOString()
        };
        return { data: mockData.data_sources[dataSourceIndex] };
      }
      throw new Error('Data source not found');
    }
    
    throw new Error(`Endpoint not found: ${url}`);
  },
  
  put: async (url: string, data: any) => {
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
    } else if (url.startsWith('/data-sources/')) {
      const dataSourceId = url.split('/')[2];
      const dataSourceIndex = mockData.data_sources.findIndex(ds => ds.id === dataSourceId);
      if (dataSourceIndex !== -1) {
        mockData.data_sources[dataSourceIndex] = {
          ...mockData.data_sources[dataSourceIndex],
          ...data,
          last_synced: new Date().toISOString()
        };
        return { data: mockData.data_sources[dataSourceIndex] };
      }
      throw new Error('Data source not found');
    }
    
    throw new Error(`Endpoint not found: ${url}`);
  },
  
  delete: async (url: string) => {
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
    } else if (url.startsWith('/data-sources/')) {
      const dataSourceId = url.split('/')[2];
      const dataSourceIndex = mockData.data_sources.findIndex(ds => ds.id === dataSourceId);
      if (dataSourceIndex !== -1) {
        const deletedDataSource = mockData.data_sources[dataSourceIndex];
        mockData.data_sources.splice(dataSourceIndex, 1);
        return { data: deletedDataSource };
      }
      throw new Error('Data source not found');
    }
    
    throw new Error(`Endpoint not found: ${url}`);
  }
};

export default apiClient;
