/**
 * Page Audit - Consultation des logs d'audit (Administrateurs uniquement)
 */
import { Shield, Search, Filter, Loader2, User, Router, Server, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseClient';
import { checkPermission, getUserRole } from '../utils/permissions';
import { useNavigate } from 'react-router-dom';

export default function Audit() {
  const navigate = useNavigate();
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');

  // Vérifier que l'utilisateur est administrateur
  useEffect(() => {
    const role = getUserRole();
    if (role !== 'Administrateur') {
      navigate('/app/dashboard');
    }
  }, [navigate]);

  // Charger les logs d'audit
  useEffect(() => {
    async function loadAuditLogs() {
      try {
        setIsLoading(true);
        const filters = {};
        if (filterAction !== 'all') {
          filters.action_type = filterAction;
        }
        if (filterEntity !== 'all') {
          filters.entity_type = filterEntity;
        }
        filters.limit = 200; // Charger plus de logs
        const data = await supabaseService.getAuditLogs(filters);
        setAuditLogs(data || []);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des logs d\'audit:', err);
        const errorMessage = err?.message || err?.error?.message || 'Impossible de charger les logs d\'audit';
        setError(`Erreur: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuditLogs();
  }, [filterAction, filterEntity]);

  const filteredLogs = auditLogs.filter((log) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (log.user_name || '').toLowerCase().includes(searchLower) ||
      (log.user_email || '').toLowerCase().includes(searchLower) ||
      (log.entity_name || '').toLowerCase().includes(searchLower) ||
      (log.action_type || '').toLowerCase().includes(searchLower)
    );
  });

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'create':
        return <Plus className="text-green-600" size={18} />;
      case 'update':
        return <Edit className="text-blue-600" size={18} />;
      case 'delete':
        return <Trash2 className="text-red-600" size={18} />;
      default:
        return <Shield className="text-gray-600" size={18} />;
    }
  };

  const getActionLabel = (actionType) => {
    switch (actionType) {
      case 'create':
        return 'Création';
      case 'update':
        return 'Modification';
      case 'delete':
        return 'Suppression';
      default:
        return actionType;
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'create':
        return 'bg-green-100 text-green-700';
      case 'update':
        return 'bg-blue-100 text-blue-700';
      case 'delete':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEntityIcon = (entityType) => {
    switch (entityType) {
      case 'user':
        return <User className="text-primary-600" size={18} />;
      case 'routeur_device':
        return <Router className="text-primary-600" size={18} />;
      case 'windows_server':
        return <Server className="text-primary-600" size={18} />;
      default:
        return <Shield className="text-gray-600" size={18} />;
    }
  };

  const getEntityLabel = (entityType) => {
    switch (entityType) {
      case 'user':
        return 'Utilisateur';
      case 'routeur_device':
        return 'Routeur';
      case 'windows_server':
        return 'Serveur Windows';
      default:
        return entityType;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!checkPermission('USERS_VIEW')) {
    return null; // Ne rien afficher si pas admin (redirection gérée par useEffect)
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Audit</h1>
          <p className="text-gray-600 mt-1">
            Journal des actions effectuées dans l'application (Administrateurs uniquement)
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par utilisateur, entité ou action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Action filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-48 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
            >
              <option value="all">Toutes les actions</option>
              <option value="create">Création</option>
              <option value="update">Modification</option>
              <option value="delete">Suppression</option>
            </select>
          </div>

          {/* Entity filter */}
          <div className="relative">
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
            >
              <option value="all">Toutes les entités</option>
              <option value="user">Utilisateurs</option>
              <option value="routeur_device">Routeurs</option>
              <option value="windows_server">Serveurs Windows</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit logs table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Détails
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Aucun log d'audit trouvé
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar size={16} className="text-gray-400" />
                        {formatDate(log.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="text-gray-400" size={18} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.user_name || 'Utilisateur inconnu'}
                          </div>
                          <div className="text-sm text-gray-500">{log.user_email || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action_type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action_type)}`}>
                          {getActionLabel(log.action_type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getEntityIcon(log.entity_type)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getEntityLabel(log.entity_type)}
                          </div>
                          <div className="text-sm text-gray-500">{log.entity_name || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {log.action_type === 'update' && log.old_values ? (
                          <span className="text-xs">Modification effectuée</span>
                        ) : log.action_type === 'create' ? (
                          <span className="text-xs text-green-600">Nouvel élément créé</span>
                        ) : log.action_type === 'delete' ? (
                          <span className="text-xs text-red-600">Élément supprimé</span>
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total des actions</p>
              <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
            </div>
            <Shield className="text-primary-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Créations</p>
              <p className="text-2xl font-bold text-green-600">
                {auditLogs.filter((l) => l.action_type === 'create').length}
              </p>
            </div>
            <Plus className="text-green-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Modifications</p>
              <p className="text-2xl font-bold text-blue-600">
                {auditLogs.filter((l) => l.action_type === 'update').length}
              </p>
            </div>
            <Edit className="text-blue-600" size={32} />
          </div>
        </div>
      </div>
    </div>
  );
}

