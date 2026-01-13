/**
 * Page Dashboard - Vue d'ensemble avec statistiques
 */
import { Activity, Server, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabaseService } from '../services/supabaseClient';
import StatusBackend from '../components/StatusBackend';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les statistiques et les logs récents
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const [statsData, logsData] = await Promise.all([
          supabaseService.getDashboardStats(),
          supabaseService.getLogs({ limit: 5 }),
        ]);
        setStats(statsData);
        setRecentLogs(logsData || []);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement du dashboard:', err);
        const errorMessage = err?.message || err?.error?.message || 'Impossible de charger les données du dashboard';
        setError(`Erreur: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Données mockées pour les graphiques (à remplacer par de vraies données si nécessaire)
  const monthlyData = [
    { name: 'Jan', value: 65 },
    { name: 'Fév', value: 78 },
    { name: 'Mar', value: 90 },
    { name: 'Avr', value: 85 },
    { name: 'Mai', value: 92 },
    { name: 'Juin', value: 88 },
  ];

  const deviceData = stats ? [
    { name: 'Routeurs', actifs: stats.activeDevicesCount || 0, inactifs: (stats.routeurCount || 0) - (stats.activeDevicesCount || 0) },
    { name: 'Windows Server', actifs: stats.activeServersCount || 0, inactifs: (stats.windowsCount || 0) - (stats.activeServersCount || 0) },
  ] : [];

  // Cartes statistiques
  const statsCards = stats ? [
    {
      title: 'Appareils actifs',
      value: String(stats.activeDevices || 0),
      change: '+12%',
      icon: Activity,
      color: 'bg-green-500',
    },
    {
      title: 'Serveurs',
      value: String(stats.windowsCount || 0),
      change: '+3%',
      icon: Server,
      color: 'bg-blue-500',
    },
    {
      title: 'Utilisateurs',
      value: String(stats.usersCount || 0),
      change: '+8%',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Alertes',
      value: String(stats.errorLogsCount || 0),
      change: '-2',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ] : [];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return date.toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Vue d'ensemble de votre infrastructure réseau
        </p>
      </div>

      {/* Status Backend */}
      <StatusBackend />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {stat.change} ce mois
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Activité mensuelle
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0ea5e9"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            État des appareils
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deviceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="actifs" fill="#10b981" />
              <Bar dataKey="inactifs" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Activité récente
        </h2>
        <div className="space-y-3">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-gray-700">{log.message || 'Aucun message'}</span>
                <span className="text-sm text-gray-500">{formatDate(log.created_at)}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
          )}
        </div>
      </div>
    </div>
  );
}
