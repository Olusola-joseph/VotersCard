/**
 * Dashboard Page - Main overview of PVC distribution across Ogun State
 */

import React from 'react';
import { usePVC } from '../context/PVCContext';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { MapPin, Users, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

const Dashboard: React.FC = () => {
  const { dashboardStats, distributionStatuses } = usePVC();

  // Status distribution data for pie chart
  const statusData = [
    { name: 'Completed', value: dashboardStats.lgasCompleted, color: COLORS[0] },
    { name: 'In Progress', value: dashboardStats.lgasInProgress, color: COLORS[1] },
    { name: 'Pending', value: dashboardStats.lgasPending, color: COLORS[2] },
  ].filter(d => d.value > 0);

  // Collection percentage distribution for bar chart
  const percentageData = React.useMemo(() => {
    const ranges = [
      { range: '0-20%', count: 0, label: '0-20%' },
      { range: '21-50%', count: 0, label: '21-50%' },
      { range: '51-75%', count: 0, label: '51-75%' },
      { range: '76-90%', count: 0, label: '76-90%' },
      { range: '91-100%', count: 0, label: '91-100%' }
    ];

    distributionStatuses.forEach(status => {
      if (status.collectionPercentage <= 20) ranges[0].count++;
      else if (status.collectionPercentage <= 50) ranges[1].count++;
      else if (status.collectionPercentage <= 75) ranges[2].count++;
      else if (status.collectionPercentage <= 90) ranges[3].count++;
      else ranges[4].count++;
    });

    return ranges;
  }, [distributionStatuses]);

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
  }> = ({ icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">INEC Ogun State - PVC Distribution Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time tracking of Permanent Voter Card distribution across all LGAs</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<MapPin className="w-6 h-6" style={{ color: '#3b82f6' }} />}
          title="Total LGAs"
          value={dashboardStats.totalLGAs}
          subtitle={`${dashboardStats.totalWards} Wards`}
          color="#3b82f6"
        />
        <StatCard
          icon={<Users className="w-6 h-6" style={{ color: '#8b5cf6' }} />}
          title="Total Registered Voters"
          value={dashboardStats.totalRegisteredVoters.toLocaleString()}
          subtitle={`${dashboardStats.totalPollingUnits} Polling Units`}
          color="#8b5cf6"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" style={{ color: '#22c55e' }} />}
          title="PVCs Collected"
          value={dashboardStats.totalPVCCollected.toLocaleString()}
          subtitle={`${dashboardStats.overallCollectionPercentage}% collection rate`}
          color="#22c55e"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" style={{ color: '#f59e0b' }} />}
          title="PVCs Pending"
          value={dashboardStats.totalPVCPending.toLocaleString()}
          subtitle="Awaiting collection"
          color="#f59e0b"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* LGA Status Distribution - Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">LGA Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `${value} LGAs`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Collection Percentage Distribution - Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Collection Rate Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={percentageData}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Overall Progress</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Collection Progress</span>
              <span className="text-sm font-medium text-gray-700">{dashboardStats.overallCollectionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${dashboardStats.overallCollectionPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-700">{dashboardStats.lgasCompleted}</p>
              <p className="text-sm text-green-600">LGAs Completed</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-blue-700">{dashboardStats.lgasInProgress}</p>
              <p className="text-sm text-blue-600">LGAs In Progress</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <AlertCircle className="w-8 h-8 mx-auto text-orange-600 mb-2" />
              <p className="text-2xl font-bold text-orange-700">{dashboardStats.lgasPending}</p>
              <p className="text-sm text-orange-600">LGAs Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table Preview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Distribution Activity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delimitation Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collection %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {distributionStatuses.slice(0, 5).map((status, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                    {status.puId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${status.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      ${status.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : ''}
                      ${status.status === 'pending' ? 'bg-orange-100 text-orange-800' : ''}
                      ${status.status === 'delayed' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {status.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {status.collectionPercentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {status.lastUpdated.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
