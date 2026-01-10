/**
 * Page Logs - Consultation des logs système
 */
import { FileText, Search, Filter, Download, AlertCircle, Info, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseClient';
import { checkPermission } from '../utils/permissions';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les logs
  useEffect(() => {
    async function loadLogs() {
      try {
        setIsLoading(true);
        const filters = {};
        if (filterLevel !== 'all') {
          filters.level = filterLevel;
        }
        filters.limit = 100;
        const data = await supabaseService.getLogs(filters);
        setLogs(data || []);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des logs:', err);
        const errorMessage = err?.message || err?.error?.message || 'Impossible de charger les logs';
        setError(`Erreur: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, [filterLevel]);

  // Récupérer les sources uniques pour le menu
  const uniqueSources = [...new Set(logs.map(log => log.source_type).filter(Boolean))];

  const filteredLogs = logs.filter((log) => {
    const message = log.message || '';
    const sourceType = log.source_type || '';
    const details = typeof log.details === 'string' ? log.details : JSON.stringify(log.details || '');
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      message.toLowerCase().includes(searchLower) ||
      sourceType.toLowerCase().includes(searchLower) ||
      details.toLowerCase().includes(searchLower)
    );
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesSource = filterSource === 'all' || log.source_type === filterSource;
    return matchesSearch && matchesLevel && matchesSource;
  });

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return <XCircle className="text-red-500" size={18} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={18} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={18} />;
      default:
        return <Info className="text-blue-500" size={18} />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDetails = (details) => {
    if (!details) return null;
    if (typeof details === 'string') return details;
    if (typeof details === 'object') {
      return JSON.stringify(details, null, 2);
    }
    return String(details);
  };

  const handleExport = () => {
    if (!filteredLogs.length) {
      alert('Aucun log à exporter');
      return;
    }

    const headers = ['id', 'created_at', 'level', 'source_type', 'message', 'details'];
    const rows = filteredLogs.map((log) => [
      log.id,
      log.created_at,
      log.level,
      log.source_type,
      (log.message || '').replace(/"/g, '""'),
      typeof log.details === 'object' ? JSON.stringify(log.details).replace(/"/g, '""') : (log.details || '').replace(/"/g, '""'),
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.map((cell) => `"${cell ?? ''}"`).join(';')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs_export_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs</h1>
          <p className="text-gray-600 mt-1">
            Consultation des logs système et des événements
          </p>
        </div>
        {checkPermission('LOGS_EXPORT') && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download size={20} />
            <span>Exporter les logs</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher dans les logs (message, source, détails)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Level filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-48 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
            >
              <option value="all">Tous les niveaux</option>
              <option value="info">Info</option>
              <option value="success">Succès</option>
              <option value="warning">Avertissement</option>
              <option value="error">Erreur</option>
            </select>
          </div>

          {/* Source filter */}
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full md:w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
            >
              <option value="all">Toutes les sources</option>
              {uniqueSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs list */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${getLevelColor(log.level)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getLevelIcon(log.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">
                        {log.source_type || 'Système'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      log.level === 'error'
                        ? 'bg-red-100 text-red-700'
                        : log.level === 'warning'
                        ? 'bg-yellow-100 text-yellow-700'
                        : log.level === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {log.level?.toUpperCase() || 'INFO'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{log.message || 'Aucun message'}</p>
                  {log.details && (
                    <p className="text-xs text-gray-500 font-mono">
                      {formatDetails(log.details)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-400 mb-2" size={48} />
            <p className="text-gray-500">Aucun log trouvé</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{logs.length}</p>
            </div>
            <FileText className="text-gray-400" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Erreurs</p>
              <p className="text-xl font-bold text-red-600 mt-1">
                {logs.filter(l => l.level === 'error').length}
              </p>
            </div>
            <XCircle className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Avertissements</p>
              <p className="text-xl font-bold text-yellow-600 mt-1">
                {logs.filter(l => l.level === 'warning').length}
              </p>
            </div>
            <AlertCircle className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Info</p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {logs.filter(l => l.level === 'info').length}
              </p>
            </div>
            <Info className="text-blue-500" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
