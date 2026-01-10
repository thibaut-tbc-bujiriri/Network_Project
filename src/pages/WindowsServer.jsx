/**
 * Page Windows Server - Gestion des serveurs Windows
 */
import { Server, Plus, Search, MoreVertical, CheckCircle, XCircle, Loader2, Edit, Trash2, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseClient';
import { checkPermission } from '../utils/permissions';
import { logAudit } from '../utils/audit';

export default function WindowsServer() {
  const [servers, setServers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editingServer, setEditingServer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newServer, setNewServer] = useState({
    name: '',
    hostname: '',
    ip_address: '',
    os_version: '',
    domain_name: '',
    status: 'online',
  });

  // Charger les serveurs Windows
  useEffect(() => {
    async function loadServers() {
      try {
        setIsLoading(true);
        const data = await supabaseService.getWindowsServers();
        setServers(data || []);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des serveurs Windows:', err);
        const errorMessage = err?.message || err?.error?.message || 'Impossible de charger les serveurs Windows';
        setError(`Erreur: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
    loadServers();
  }, []);

  const filteredServers = servers.filter((server) => {
    const name = server.name || '';
    const hostname = server.hostname || '';
    const ip = server.ip_address || '';
    const os = server.os_version || '';
    const domain = server.domain_name || '';
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      name.toLowerCase().includes(searchLower) ||
      hostname?.toLowerCase().includes(searchLower) ||
      ip.includes(searchTerm) ||
      os.toLowerCase().includes(searchLower) ||
      domain.toLowerCase().includes(searchLower)
    );
    const matchesStatus = filterStatus === 'all' || server.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatUptime = (uptime) => {
    if (!uptime) return '-';
    return uptime;
  };

  const handleChangeNewServer = (e) => {
    const { name, value } = e.target;
    setNewServer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateServer = async (e) => {
    e.preventDefault();
    if (!newServer.name || !newServer.ip_address) {
      setCreateError('Le nom et l’adresse IP sont obligatoires');
      return;
    }
    try {
      setIsSubmitting(true);
      setCreateError(null);
      const created = await supabaseService.createWindowsServer(newServer);
      setServers((prev) => [created, ...prev]);
      
      // Enregistrer l'action d'audit
      await logAudit('create', 'windows_server', created);
      
      setNewServer({
        name: '',
        hostname: '',
        ip_address: '',
        os_version: '',
        domain_name: '',
        status: 'online',
      });
      setCreateError(null);
      setSuccessMessage('Serveur ajouté avec succès');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Erreur lors de la création du serveur:', err);
      setCreateError(err?.message || 'Impossible de créer le serveur');
      setSuccessMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (server) => {
    // Sauvegarder les anciennes valeurs pour l'audit
    setEditingServer({ ...server, _oldValues: { ...server } });
    setIsFormOpen(false);
  };

  const handleUpdateServer = async (e) => {
    e.preventDefault();
    if (!editingServer.name || !editingServer.ip_address) {
      setCreateError('Le nom et l\'adresse IP sont obligatoires');
      return;
    }
    try {
      setIsSubmitting(true);
      setCreateError(null);
      const updated = await supabaseService.updateWindowsServer(editingServer.id, {
        name: editingServer.name,
        hostname: editingServer.hostname || null,
        ip_address: editingServer.ip_address,
        os_version: editingServer.os_version || null,
        domain_name: editingServer.domain_name || null,
        status: editingServer.status || 'online',
      });
      setServers(servers.map((s) => (s.id === updated.id ? updated : s)));
      
      // Enregistrer l'action d'audit
      const oldValues = editingServer._oldValues || {};
      await logAudit('update', 'windows_server', updated, oldValues);
      
      setEditingServer(null);
      setSuccessMessage('Serveur modifié avec succès');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      setCreateError(err?.message || 'Impossible de modifier le serveur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce serveur ?')) return;

    try {
      // Récupérer les données du serveur avant suppression pour l'audit
      const serverToDelete = servers.find((s) => s.id === id);
      
      await supabaseService.deleteWindowsServer(id);
      setServers(servers.filter((s) => s.id !== id));
      
      // Enregistrer l'action d'audit
      if (serverToDelete) {
        await logAudit('delete', 'windows_server', serverToDelete);
      }
      
      setSuccessMessage('Serveur supprimé avec succès');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert(err?.message || 'Erreur lors de la suppression du serveur');
    }
  };

  const handleCancelEdit = () => {
    setEditingServer(null);
    setCreateError(null);
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
      {/* Global success message */}
      {successMessage && !isFormOpen && !editingServer && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Windows Server</h1>
          <p className="text-gray-600 mt-1">
            Gestion des serveurs Windows
          </p>
        </div>
        {checkPermission('WINDOWS_CREATE') && (
          <button
            onClick={() => setIsFormOpen((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            <span>{isFormOpen ? 'Fermer le formulaire' : 'Ajouter un serveur'}</span>
          </button>
        )}
      </div>

      {/* Search bar with filters */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom, hostname, IP, OS ou domaine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full md:w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="online">En ligne</option>
              <option value="offline">Hors ligne</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Create server form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouveau serveur Windows</h2>
          {successMessage && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">{successMessage}</p>
            </div>
          )}
          {createError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{createError}</p>
            </div>
          )}
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreateServer}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                name="name"
                value={newServer.name}
                onChange={handleChangeNewServer}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="DC-01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hostname</label>
              <input
                type="text"
                name="hostname"
                value={newServer.hostname}
                onChange={handleChangeNewServer}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="dc01.local"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse IP *</label>
              <input
                type="text"
                name="ip_address"
                value={newServer.ip_address}
                onChange={handleChangeNewServer}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="192.168.1.10"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domaine</label>
              <input
                type="text"
                name="domain_name"
                value={newServer.domain_name}
                onChange={handleChangeNewServer}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="example.local"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OS</label>
              <input
                type="text"
                name="os_version"
                value={newServer.os_version}
                onChange={handleChangeNewServer}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Windows Server 2022"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                name="status"
                value={newServer.status}
                onChange={handleChangeNewServer}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="online">En ligne</option>
                <option value="offline">Hors ligne</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit server form */}
      {editingServer && (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Modifier le serveur Windows</h2>
          {successMessage && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">{successMessage}</p>
            </div>
          )}
          {createError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{createError}</p>
            </div>
          )}
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleUpdateServer}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                value={editingServer.name || ''}
                onChange={(e) => setEditingServer({ ...editingServer, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="DC-01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hostname</label>
              <input
                type="text"
                value={editingServer.hostname || ''}
                onChange={(e) => setEditingServer({ ...editingServer, hostname: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="dc01.example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse IP *</label>
              <input
                type="text"
                value={editingServer.ip_address || ''}
                onChange={(e) => setEditingServer({ ...editingServer, ip_address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="192.168.1.10"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version OS</label>
              <input
                type="text"
                value={editingServer.os_version || ''}
                onChange={(e) => setEditingServer({ ...editingServer, os_version: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Windows Server 2022"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de domaine</label>
              <input
                type="text"
                value={editingServer.domain_name || ''}
                onChange={(e) => setEditingServer({ ...editingServer, domain_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="example.local"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={editingServer.status || 'online'}
                onChange={(e) => setEditingServer({ ...editingServer, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="online">En ligne</option>
                <option value="offline">Hors ligne</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Modification...' : 'Modifier'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Servers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServers.map((server) => (
          <div
            key={server.id}
            className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${server.status === 'online' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Server className={server.status === 'online' ? 'text-blue-600' : 'text-gray-400'} size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{server.name || 'Sans nom'}</h3>
                  <p className="text-sm text-gray-500">{server.ip_address || 'N/A'}</p>
                  {server.hostname && (
                    <p className="text-xs text-gray-400">{server.hostname}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {checkPermission('WINDOWS_EDIT') && (
                  <button
                    onClick={() => handleEdit(server)}
                    className="text-primary-600 hover:text-primary-900"
                    title="Modifier"
                  >
                    <Edit size={18} />
                  </button>
                )}
                {checkPermission('WINDOWS_DELETE') && (
                  <button
                    onClick={() => handleDelete(server.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {server.os_version && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">OS:</span>
                  <span className="font-medium text-gray-900">{server.os_version}</span>
                </div>
              )}
              
              {server.status === 'online' && (
                <>
                  {server.cpu_usage !== null && server.cpu_usage !== undefined && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">CPU:</span>
                        <span className="font-medium text-gray-900">{server.cpu_usage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${server.cpu_usage > 80 ? 'bg-red-500' : server.cpu_usage > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${server.cpu_usage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {server.memory_usage !== null && server.memory_usage !== undefined && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Mémoire:</span>
                        <span className="font-medium text-gray-900">{server.memory_usage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${server.memory_usage > 80 ? 'bg-red-500' : server.memory_usage > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${server.memory_usage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {server.disk_usage !== null && server.disk_usage !== undefined && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Disque:</span>
                        <span className="font-medium text-gray-900">{server.disk_usage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${server.disk_usage > 80 ? 'bg-red-500' : server.disk_usage > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${server.disk_usage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-medium text-gray-900">{formatUptime(server.uptime)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              {server.status === 'online' ? (
                <>
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-sm text-green-600 font-medium">En ligne</span>
                </>
              ) : (
                <>
                  <XCircle className="text-red-500" size={16} />
                  <span className="text-sm text-red-600 font-medium">Hors ligne</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredServers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <p className="text-gray-500">Aucun serveur trouvé</p>
        </div>
      )}
    </div>
  );
}
