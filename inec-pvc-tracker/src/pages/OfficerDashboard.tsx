import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabaseClient';
import type { PVCDistribution, OfficerStats } from '../types';
import { ClipboardCheck, Calendar, TrendingUp, User, CheckCircle, Clock, MapPin } from 'lucide-react';

const OfficerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<OfficerStats | null>(null);
  const [assignedLGA, setAssignedLGA] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficerData();
  }, []);

  const fetchOfficerData = async () => {
    try {
      if (!user) return;

      // Get assigned LGA name
      if (user.assigned_lga_code) {
        const { data: lgaData } = await supabase
          .from('lga_reference')
          .select('lga_name')
          .eq('lga_code', user.assigned_lga_code)
          .single();
        
        if (lgaData && typeof lgaData === 'object' && 'lga_name' in lgaData) {
          setAssignedLGA((lgaData as any).lga_name as string);
        }
      }

      // Fetch officer's distributions
      const { data: distData } = await supabase
        .from('pvc_distributions')
        .select('*')
        .eq('issued_by', user.id)
        .eq('status', 'issued')
        .order('issued_at', { ascending: false });

      if (distData && Array.isArray(distData)) {
        const typedDists = distData as unknown as PVCDistribution[];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalIssued = typedDists.length;
        const todayIssued = typedDists.filter(
          (d) => new Date(d.issued_at) >= today
        ).length;
        
        const dualScans = typedDists.filter((d) => d.scan_method === 'dual_scan').length;
        const manualEntries = typedDists.filter((d) => d.scan_method === 'manual').length;

        setStats({
          totalIssued,
          todayIssued,
          dualScans,
          manualEntries,
          recentDistributions: typedDists.slice(0, 10),
        });
      }
    } catch (error) {
      console.error('Error fetching officer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.full_name || 'Officer'}
        </h1>
        <div className="flex items-center gap-2 mt-3">
          <MapPin className="w-5 h-5" />
          <p className="text-green-100">
            Assigned to: {assignedLGA || 'All LGAs'} • Field Officer
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Issued"
          value={stats?.totalIssued || 0}
          icon={ClipboardCheck}
          color="bg-blue-500"
        />
        <StatCard
          title="Issued Today"
          value={stats?.todayIssued || 0}
          icon={Calendar}
          color="bg-green-500"
        />
        <StatCard
          title="Dual Scans"
          value={stats?.dualScans || 0}
          icon={CheckCircle}
          color="bg-purple-500"
        />
        <StatCard
          title="Manual Entries"
          value={stats?.manualEntries || 0}
          icon={Clock}
          color="bg-orange-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          Your Recent Distributions
        </h2>
        {(!stats || stats.recentDistributions.length === 0) ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No distributions yet</p>
            <p className="text-gray-400 text-sm mt-2">Start issuing PVCs to see your activity here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voter Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VIN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delimitation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentDistributions.map((dist) => (
                  <tr key={dist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dist.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {dist.vin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {dist.delimitation_full}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        dist.scan_method === 'dual_scan' 
                          ? 'bg-green-100 text-green-800' 
                          : dist.scan_method === 'manual'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {dist.scan_method?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(dist.issued_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
      </div>
      <div className={`${color} p-4 rounded-full`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  </div>
);

export default OfficerDashboard;
