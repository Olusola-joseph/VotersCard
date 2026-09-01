import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabaseClient';
import type { PVCDistribution, DashboardStats, LGA } from '../types';
import { BarChart3, Users, MapPin, TrendingUp, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lgas, setLgas] = useState<LGA[]>([]);
  const [recentDistributions, setRecentDistributions] = useState<PVCDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch LGA data
      const { data: lgaData } = await supabase
        .from('lga_reference')
        .select('*')
        .order('lga_name');

      if (lgaData) setLgas(lgaData);

      // Fetch recent distributions
      const { data: distData } = await supabase
        .from('pvc_distributions')
        .select(`
          *,
          profiles(full_name)
        `)
        .eq('status', 'issued')
        .order('issued_at', { ascending: false })
        .limit(10);

      if (distData) setRecentDistributions(distData);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: totalCount } = await supabase
        .from('pvc_distributions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'issued');

      const { count: todayCount } = await supabase
        .from('pvc_distributions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'issued')
        .gte('issued_at', today.toISOString());

      const { count: officerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'officer')
        .eq('is_active', true);

      setStats({
        totalLGAs: lgaData?.length || 0,
        totalWards: 0,
        totalPollingUnits: 0,
        totalRegisteredVoters: 0,
        totalPVCCollected: totalCount || 0,
        totalPVCPending: 0,
        overallCollectionPercentage: 0,
        lgasCompleted: 0,
        lgasInProgress: 0,
        lgasPending: 0,
        todayIssued: todayCount || 0,
        totalOfficers: officerCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.full_name || 'Admin'}
        </h1>
        <p className="text-gray-600 mt-2">
          State-wide PVC Distribution Overview - All 20 LGAs
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total LGAs"
          value={stats?.totalLGAs || 0}
          icon={MapPin}
          color="bg-blue-500"
        />
        <StatCard
          title="PVCs Issued Today"
          value={stats?.todayIssued || 0}
          icon={Calendar}
          color="bg-green-500"
        />
        <StatCard
          title="Total PVCs Issued"
          value={stats?.totalPVCCollected || 0}
          icon={CheckCircle}
          color="bg-purple-500"
        />
        <StatCard
          title="Active Officers"
          value={stats?.totalOfficers || 0}
          icon={Users}
          color="bg-orange-500"
        />
      </div>

      {/* LGA List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-green-600" />
            Local Government Areas
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {lgas.map((lga) => (
              <div
                key={lga.code}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors cursor-pointer border border-gray-200"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{lga.name}</h3>
                  <p className="text-sm text-gray-500">Code: {lga.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {lga.total_wards || 0} Wards
                  </p>
                  <p className="text-xs text-gray-500">
                    {lga.total_pus || 0} PUs
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Distributions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Recent Distributions
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentDistributions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No distributions yet</p>
            ) : (
              recentDistributions.map((dist) => (
                <div
                  key={dist.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900">{dist.full_name}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {dist.scan_method?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    VIN: {dist.vin}
                  </p>
                  <p className="text-xs text-gray-500">
                    {dist.delimitation_full} • {new Date(dist.issued_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
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

export default AdminDashboard;
