import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Edit, Trash2, CheckCircle, XCircle, Key, Lock, Globe } from 'lucide-react';
import apiClient from '../api/client';

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

const DataSourcesPage = () => {
  const navigate = useNavigate();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDataSource, setCurrentDataSource] = useState<DataSource | null>(null);
  const [newDataSource, setNewDataSource] = useState({
    name: '',
    connector_type: 'SQL',
    auth_type: 'API_KEY',
    api_key: '',
    oauth_token: '',
    secret_key: '',
    secret_value: '',
    url: ''
  });

  useEffect(() => {
    fetchDataSources();
  }, []);

  const fetchDataSources = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/data-sources');
      setDataSources(response.data as DataSource[]);
      setError(null);
    } catch (err) {
      console.error('Error fetching data sources:', err);
      setError('Failed to load data sources. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDataSource = async () => {
    try {
      setLoading(true);
      await apiClient.post('/data-sources', newDataSource);
      setShowAddModal(false);
      setNewDataSource({
        name: '',
        connector_type: 'SQL',
        auth_type: 'API_KEY',
        api_key: '',
        oauth_token: '',
        secret_key: '',
        secret_value: '',
        url: ''
      });
      fetchDataSources();
    } catch (err) {
      console.error('Error adding data source:', err);
      setError('Failed to add data source. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDataSource = async () => {
    if (!currentDataSource) return;

    try {
      setLoading(true);
      await apiClient.put(`/data-sources/${currentDataSource.id}`, currentDataSource);
      setShowEditModal(false);
      setCurrentDataSource(null);
      fetchDataSources();
    } catch (err) {
      console.error('Error updating data source:', err);
      setError('Failed to update data source. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDataSource = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this data source?')) return;

    try {
      setLoading(true);
      await apiClient.delete(`/data-sources/${id}`);
      fetchDataSources();
    } catch (err) {
      console.error('Error deleting data source:', err);
      setError('Failed to delete data source. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDataSource = async (id: string) => {
    try {
      setLoading(true);
      await apiClient.post(`/data-sources/${id}/sync`, {});
      fetchDataSources();
    } catch (err) {
      console.error('Error syncing data source:', err);
      setError('Failed to sync data source. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getAuthTypeIcon = (authType: string) => {
    switch (authType) {
      case 'API_KEY':
        return <Key className="h-4 w-4 text-blue-500" />;
      case 'OAUTH':
        return <Globe className="h-4 w-4 text-green-500" />;
      case 'SECRET_KEY':
        return <Lock className="h-4 w-4 text-purple-500" />;
      default:
        return <Key className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </span>
        );
      case 'syncing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Syncing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const renderAuthFields = () => {
    switch (newDataSource.auth_type) {
      case 'API_KEY':
        return (
          <div className="form-group">
            <label htmlFor="api_key" className="form-label">API Key</label>
            <input
              type="password"
              id="api_key"
              className="form-input"
              value={newDataSource.api_key}
              onChange={(e) => setNewDataSource({ ...newDataSource, api_key: e.target.value })}
              placeholder="Enter API key"
            />
          </div>
        );
      case 'OAUTH':
        return (
          <div className="form-group">
            <label htmlFor="oauth_token" className="form-label">OAuth Token</label>
            <input
              type="password"
              id="oauth_token"
              className="form-input"
              value={newDataSource.oauth_token}
              onChange={(e) => setNewDataSource({ ...newDataSource, oauth_token: e.target.value })}
              placeholder="Enter OAuth token"
            />
          </div>
        );
      case 'SECRET_KEY':
        return (
          <>
            <div className="form-group">
              <label htmlFor="secret_key" className="form-label">Secret Key</label>
              <input
                type="text"
                id="secret_key"
                className="form-input"
                value={newDataSource.secret_key}
                onChange={(e) => setNewDataSource({ ...newDataSource, secret_key: e.target.value })}
                placeholder="Enter secret key"
              />
            </div>
            <div className="form-group">
              <label htmlFor="secret_value" className="form-label">Secret Value</label>
              <input
                type="password"
                id="secret_value"
                className="form-input"
                value={newDataSource.secret_value}
                onChange={(e) => setNewDataSource({ ...newDataSource, secret_value: e.target.value })}
                placeholder="Enter secret value"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Data Sources</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Data Source
        </button>
      </div>

      {loading && dataSources.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error}
        </div>
      ) : dataSources.length === 0 ? (
        <div className="text-center py-12 bg-white shadow overflow-hidden sm:rounded-lg">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No data sources available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new data source.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Data Source
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {dataSources.map((dataSource) => (
              <li key={dataSource.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-2">
                      {getAuthTypeIcon(dataSource.auth_type)}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{dataSource.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500 mr-2">
                          {dataSource.connector_type}
                        </span>
                        {getStatusBadge(dataSource.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSyncDataSource(dataSource.id)}
                      className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      title="Sync data source"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentDataSource(dataSource);
                        setShowEditModal(true);
                      }}
                      className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      title="Edit data source"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDataSource(dataSource.id)}
                      className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      title="Delete data source"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {dataSource.files && dataSource.files.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-500">Files</h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {dataSource.files.map((file) => (
                        <span
                          key={file.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {file.filename}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-2 text-sm text-gray-500">
                  Last synced: {new Date(dataSource.last_synced).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add Data Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Add Data Source
                  </h3>
                  <div className="mt-4">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">Name</label>
                      <input
                        type="text"
                        id="name"
                        className="form-input"
                        value={newDataSource.name}
                        onChange={(e) => setNewDataSource({ ...newDataSource, name: e.target.value })}
                        placeholder="Enter data source name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="connector_type" className="form-label">Connector Type</label>
                      <select
                        id="connector_type"
                        className="form-input"
                        value={newDataSource.connector_type}
                        onChange={(e) => setNewDataSource({ ...newDataSource, connector_type: e.target.value })}
                      >
                        <option value="SQL">SQL Database</option>
                        <option value="API">API</option>
                        <option value="FILE">File System</option>
                        <option value="CLOUD_STORAGE">Cloud Storage</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="auth_type" className="form-label">Authentication Type</label>
                      <select
                        id="auth_type"
                        className="form-input"
                        value={newDataSource.auth_type}
                        onChange={(e) => setNewDataSource({ ...newDataSource, auth_type: e.target.value })}
                      >
                        <option value="API_KEY">API Key</option>
                        <option value="OAUTH">OAuth</option>
                        <option value="SECRET_KEY">Secret Key</option>
                      </select>
                    </div>
                    {renderAuthFields()}
                    <div className="form-group">
                      <label htmlFor="url" className="form-label">URL/Connection String</label>
                      <input
                        type="text"
                        id="url"
                        className="form-input"
                        value={newDataSource.url}
                        onChange={(e) => setNewDataSource({ ...newDataSource, url: e.target.value })}
                        placeholder="Enter connection URL"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleAddDataSource}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Data Source Modal */}
      {showEditModal && currentDataSource && (
        <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Edit Data Source
                  </h3>
                  <div className="mt-4">
                    <div className="form-group">
                      <label htmlFor="edit_name" className="form-label">Name</label>
                      <input
                        type="text"
                        id="edit_name"
                        className="form-input"
                        value={currentDataSource.name}
                        onChange={(e) => setCurrentDataSource({ ...currentDataSource, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit_connector_type" className="form-label">Connector Type</label>
                      <select
                        id="edit_connector_type"
                        className="form-input"
                        value={currentDataSource.connector_type}
                        onChange={(e) => setCurrentDataSource({ ...currentDataSource, connector_type: e.target.value })}
                      >
                        <option value="SQL">SQL Database</option>
                        <option value="API">API</option>
                        <option value="FILE">File System</option>
                        <option value="CLOUD_STORAGE">Cloud Storage</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit_auth_type" className="form-label">Authentication Type</label>
                      <select
                        id="edit_auth_type"
                        className="form-input"
                        value={currentDataSource.auth_type}
                        onChange={(e) => setCurrentDataSource({ ...currentDataSource, auth_type: e.target.value })}
                      >
                        <option value="API_KEY">API Key</option>
                        <option value="OAUTH">OAuth</option>
                        <option value="SECRET_KEY">Secret Key</option>
                      </select>
                    </div>
                    {/* Authentication fields would be added here similar to the add modal */}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleEditDataSource}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentDataSource(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSourcesPage;
