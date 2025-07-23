import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const DebugAdmin = () => {
  const [status, setStatus] = useState({
    users: null,
    news: null,
    campaigns: null,
    dao: null,
  });
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint, method) => {
    try {
      let result;
      switch (endpoint) {
        case 'users':
          result = await adminService.getAllUsers({ page: 1, limit: 5 });
          break;
        case 'news':
          result = await adminService.getAllNews({ page: 1, limit: 5 });
          break;
        case 'campaigns':
          result = await adminService.getAllCampaigns({ page: 1, limit: 5 });
          break;
        case 'dao':
          result = await adminService.getAllDaoApplications({ page: 1, limit: 5 });
          break;
        default:
          throw new Error('Unknown endpoint');
      }

      setStatus(prev => ({
        ...prev,
        [endpoint]: { success: true, data: result }
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        [endpoint]: { success: false, error: error.message }
      }));
    }
  };

  const testAllAPIs = async () => {
    setLoading(true);
    await Promise.all([
      testAPI('users'),
      testAPI('news'),
      testAPI('campaigns'),
      testAPI('dao')
    ]);
    setLoading(false);
  };

  useEffect(() => {
    testAllAPIs();
  }, []);

  const getStatusIcon = (status) => {
    if (!status) return '⏳';
    return status.success ? '✅' : '❌';
  };

  const getStatusText = (status) => {
    if (!status) return 'Testing...';
    if (status.success) {
      return `Success (${status.data?.pagination?.total || status.data?.length || 0} items)`;
    }
    return `Failed: ${status.error}`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin API Debug</h1>
        <p className="text-gray-600">Testing all admin API endpoints</p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">API Status</h2>
          <button
            onClick={testAllAPIs}
            disabled={loading}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Retest All'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 rounded border">
            <div>
              <h3 className="font-medium">Users API</h3>
              <p className="text-sm text-gray-600">GET /admin/users</p>
            </div>
            <div className="text-right">
              <div className="text-2xl">{getStatusIcon(status.users)}</div>
              <div className="text-sm">{getStatusText(status.users)}</div>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 rounded border">
            <div>
              <h3 className="font-medium">News API</h3>
              <p className="text-sm text-gray-600">GET /admin/news</p>
            </div>
            <div className="text-right">
              <div className="text-2xl">{getStatusIcon(status.news)}</div>
              <div className="text-sm">{getStatusText(status.news)}</div>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 rounded border">
            <div>
              <h3 className="font-medium">Campaigns API</h3>
              <p className="text-sm text-gray-600">GET /admin/campaigns</p>
            </div>
            <div className="text-right">
              <div className="text-2xl">{getStatusIcon(status.campaigns)}</div>
              <div className="text-sm">{getStatusText(status.campaigns)}</div>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 rounded border">
            <div>
              <h3 className="font-medium">DAO Applications API</h3>
              <p className="text-sm text-gray-600">GET /dao/applications</p>
            </div>
            <div className="text-right">
              <div className="text-2xl">{getStatusIcon(status.dao)}</div>
              <div className="text-sm">{getStatusText(status.dao)}</div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="p-4 mt-6 bg-gray-50 rounded">
          <h3 className="mb-2 font-medium">Debug Information</h3>
          <pre className="overflow-auto text-xs">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DebugAdmin; 