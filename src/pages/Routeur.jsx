/**
 * Page Routeur - Gestion des routeurs
 */
import { Router, Plus, Search, MoreVertical, Wifi, WifiOff, Loader2, Edit, Trash2, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseClient';
import { checkPermission } from '../utils/permissions';
import { logAudit } from '../utils/audit';

export default function Routeur() {
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    ip_address: '',
    model: '',
    os_version: '',
    location: '',
    status: 'online',
  });

  // Charger les routeurs
  useEffect(() => {
    async function loadDevices() {
      try {
        setIsLoading(true);
        const data = await supabaseService.getRouteurDevices();
        setDevices(data || []);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des routeurs:', err);
        const errorMessage = err?.message || err?.error?.message || 'Impossible de charger les routeurs';
        setError(`Erreur: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
    loadDevices();
  }, []);

  const filteredDevices = devices.filter((device) => {
    const name = device.name || '';
    const ip = device.ip_address || '';
    const model = device.model || '';
    const location = device.location || '';
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      name.toLowerCase().includes(searchLower) ||
      ip.includes(searchTerm) ||
      model.toLowerCase().includes(searchLower) ||
      location.toLowerCase().includes(searchLower)
    );
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatUptime = (uptime) => {
    if (!uptime) return '-';
    // Si uptime est une string PostgreSQL interval, on l'affiche tel quel
    // Sinon on peut le formater
    return uptime;
  };

  const handleChangeNewDevice = (e) => {
    const { name, value } = e.target;
    setNewDevice((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    if (!newDevice.name || !newDevice.ip_address) {
      setCreateError("Le nom et l'adresse IP sont obligatoires");
      return;
    }
    try {
      setIsSubmitting(true);
      setCreateError(null);
      const created = await supabaseService.createRouteurDevice(newDevice);
      setDevices((prev) => [created, ...prev]);
      
      // Enregistrer l'action d'audit
      await logAudit('create', 'routeur_device', created);
      
      setNewDevice({
        name: '',
        ip_address: '',
        model: '',
        os_version: '',
        location: '',
        status: 'online',
      });
      setCreateError(null);
      setSuccessMessage('Routeur ajouté avec succès');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Erreur lors de la création du routeur:', err);
      setCreateError(err?.message || "Impossible de créer le routeur");
      setSuccessMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (device) => {
    // Sauvegarder les anciennes valeurs pour l'audit
    setEditingDevice({ ...device, _oldValues: { ...device } });
    setIsFormOpen(false);
  };

  const handleUpdateDevice = async (e) => {
    e.preventDefault();
    if (!editingDevice.name || !editingDevice.ip_address) {
      setCreateError("Le nom et l'adresse IP sont obligatoires");
      return;
    }
    try {
      setIsSubmitting(true);
      setCreateError(null);
      const updated = await supabaseService.updateRouteurDevice(editingDevice.id, {
        name: editingDevice.name,
        ip_address: editingDevice.ip_address,
        model: editingDevice.model || null,
        os_version: editingDevice.os_version || null,
        location: editingDevice.location || null,
        status: editingDevice.status || 'online',
      });
      setDevices(devices.map((d) => (d.id === updated.id ? updated : d)));
      
      // Enregistrer l'action d'audit
      const oldValues = editingDevice._oldValues || {};
      await logAudit('update', 'routeur_device', updated, oldValues);
      
      setEditingDevice(null);
      setSuccessMessage('Routeur modifié avec succès');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      setCreateError(err?.message || "Impossible de modifier le routeur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce routeur ?')) return;

    try {
      // Récupérer les données du routeur avant suppression pour l'audit
      const deviceToDelete = devices.find((d) => d.id === id);
      
      await supabaseService.deleteRouteurDevice(id);
      setDevices(devices.filter((d) => d.id !== id));
      
      // Enregistrer l'action d'audit
      if (deviceToDelete) {
        await logAudit('delete', 'routeur_device', deviceToDelete);
      }
      
      setSuccessMessage('Routeur supprimé avec succès');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert(err?.message || 'Erreur lors de la suppression du routeur');
    }
  };

  const handleCancelEdit = () => {
    setEditingDevice(null);
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
      {successMessage && !isFormOpen && !editingDevice && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Routeurs</h1>
          <p className="text-gray-600 mt-1">
            Gestion des routeurs
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          <span>{isFormOpen ? 'Fermer le formulaire' : 'Ajouter un routeur'}</span>
        </button>
      </div>

      {/* Search bar with filters */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom, IP, modèle ou localisation..."
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

      {/* Create device form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouveau routeur</h2>
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
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreateDevice}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                name="name"
                value={newDevice.name}
                onChange={handleChangeNewDevice}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Router Principal"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse IP *</label>
              <input
                type="text"
                name="ip_address"
                value={newDevice.ip_address}
                onChange={handleChangeNewDevice}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="192.168.1.1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
              <input
                type="text"
                name="model"
                value={newDevice.model}
                onChange={handleChangeNewDevice}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="RB4011iGS+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version OS</label>
              <input
                type="text"
                name="os_version"
                value={newDevice.os_version}
                onChange={handleChangeNewDevice}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="7.12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
              <input
                type="text"
                name="location"
                value={newDevice.location}
                onChange={handleChangeNewDevice}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Salle serveur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                name="status"
                value={newDevice.status}
                onChange={handleChangeNewDevice}
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

      {/* Edit device form */}
      {editingDevice && (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Modifier le routeur</h2>
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
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleUpdateDevice}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                value={editingDevice.name || ''}
                onChange={(e) => setEditingDevice({ ...editingDevice, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Router Principal"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse IP *</label>
              <input
                type="text"
                value={editingDevice.ip_address || ''}
                onChange={(e) => setEditingDevice({ ...editingDevice, ip_address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="192.168.1.1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
              <input
                type="text"
                value={editingDevice.model || ''}
                onChange={(e) => setEditingDevice({ ...editingDevice, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="RB4011iGS+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version OS</label>
              <input
                type="text"
                value={editingDevice.os_version || ''}
                onChange={(e) => setEditingDevice({ ...editingDevice, os_version: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="7.12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
              <input
                type="text"
                value={editingDevice.location || ''}
                onChange={(e) => setEditingDevice({ ...editingDevice, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Bureau principal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={editingDevice.status || 'online'}
                onChange={(e) => setEditingDevice({ ...editingDevice, status: e.target.value })}
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

      {/* Devices grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map((device) => (
          <div
            key={device.id}
            className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${device.status === 'online' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Router className={device.status === 'online' ? 'text-green-600' : 'text-gray-400'} size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{device.name || 'Sans nom'}</h3>
                  <p className="text-sm text-gray-500">{device.ip_address || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {checkPermission('ROUTEUR_EDIT') && (
                  <button
                    onClick={() => handleEdit(device)}
                    className="text-primary-600 hover:text-primary-900"
                    title="Modifier"
                  >
                    <Edit size={18} />
                  </button>
                )}
                {checkPermission('ROUTEUR_DELETE') && (
                  <button
                    onClick={() => handleDelete(device.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {device.model && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Modèle:</span>
                  <span className="font-medium text-gray-900">{device.model}</span>
                </div>
              )}
              {device.os_version && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium text-gray-900">{device.os_version}</span>
                </div>
              )}
              {device.location && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Localisation:</span>
                  <span className="font-medium text-gray-900">{device.location}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-medium text-gray-900">{formatUptime(device.uptime)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              {device.status === 'online' ? (
                <>
                  <Wifi className="text-green-500" size={16} />
                  <span className="text-sm text-green-600 font-medium">En ligne</span>
                </>
              ) : (
                <>
                  <WifiOff className="text-red-500" size={16} />
                  <span className="text-sm text-red-600 font-medium">Hors ligne</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredDevices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <p className="text-gray-500">Aucun routeur trouvé</p>
        </div>
      )}
    </div>
  );
}


