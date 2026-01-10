/**
 * Page Users - Gestion des utilisateurs
 */
import { Users as UsersIcon, Plus, Search, Edit, Trash2, Mail, Shield, Loader2, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseClient';
import { checkPermission } from '../utils/permissions';
import { logAudit } from '../utils/audit';
import { hashPassword } from '../utils/password';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    role_id: '',
    is_active: true,
  });

  // Charger les utilisateurs et les rôles
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [usersData, rolesData] = await Promise.all([
          supabaseService.getUsers(),
          supabaseService.getRoles(),
        ]);
        setUsers(usersData || []);
        setRoles(rolesData || []);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        const errorMessage = err?.message || err?.error?.message || 'Impossible de charger les utilisateurs';
        setError(`Erreur: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredUsers = users.filter((user) => {
    const fullName = user.full_name || '';
    const email = user.email || '';
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      fullName.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower)
    );
    const matchesRole = filterRole === 'all' || user.role_id === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.id === roleId);
    return role?.name || 'Non défini';
  };

  const getRoleColor = (roleName) => {
    switch (roleName?.toLowerCase()) {
      case 'administrateur':
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'modérateur':
      case 'moderator':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleChangeNewUser = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.email) {
      setCreateError("L'email est obligatoire");
      return;
    }
    if (!newUser.password) {
      setCreateError("Le mot de passe est obligatoire");
      return;
    }
    try {
      setIsSubmitting(true);
      setCreateError(null);
      
      // Hasher le mot de passe avant de le stocker
      const hashedPassword = await hashPassword(newUser.password);
      
      const payload = {
        full_name: newUser.full_name || null,
        email: newUser.email,
        password: hashedPassword, // Mot de passe hashé
        role_id: newUser.role_id || null,
        is_active: newUser.is_active,
      };
      const created = await supabaseService.createUser(payload);
      setUsers((prev) => [created, ...prev]);
      
      // Enregistrer l'action d'audit
      await logAudit('create', 'user', created);
      
      setNewUser({
        full_name: '',
        email: '',
        password: '',
        role_id: '',
        is_active: true,
      });
      setCreateError(null);
      setSuccessMessage('Utilisateur ajouté avec succès');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Erreur lors de la création utilisateur:', err);
      setCreateError(err?.message || "Impossible de créer l'utilisateur");
      setSuccessMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 30) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user });
    setIsFormOpen(false);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser.email) {
      setCreateError("L'email est obligatoire");
      return;
    }
    try {
      setIsSubmitting(true);
      setCreateError(null);
      const updateData = {
        full_name: editingUser.full_name || null,
        email: editingUser.email,
        role_id: editingUser.role_id || null,
        is_active: editingUser.is_active,
      };
      // Ajouter le password seulement s'il a été modifié (et le hasher)
      if (editingUser.password && editingUser.password.trim() !== '') {
        updateData.password = await hashPassword(editingUser.password);
      }
      const updated = await supabaseService.updateUser(editingUser.id, updateData);
      setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
      
      // Enregistrer l'action d'audit
      const oldValues = editingUser._oldValues || {};
      await logAudit('update', 'user', updated, oldValues);
      
      setEditingUser(null);
      setSuccessMessage('Utilisateur modifié avec succès');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      setCreateError(err?.message || "Impossible de modifier l'utilisateur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      // Récupérer les données de l'utilisateur avant suppression pour l'audit
      const userToDelete = users.find((u) => u.id === id);
      
      await supabaseService.deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      
      // Enregistrer l'action d'audit
      if (userToDelete) {
        await logAudit('delete', 'user', userToDelete);
      }
      
      setSuccessMessage('Utilisateur supprimé avec succès');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert(err?.message || 'Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
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
      {successMessage && !isFormOpen && !editingUser && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-600 mt-1">
            Gestion des utilisateurs du système
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          <span>{isFormOpen ? 'Fermer le formulaire' : 'Ajouter un utilisateur'}</span>
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
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Role filter */}
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full md:w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
            >
              <option value="all">Tous les rôles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
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
              <option value="active">Actifs uniquement</option>
              <option value="inactive">Inactifs uniquement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Create user form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouvel utilisateur</h2>
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
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreateUser}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                name="full_name"
                value={newUser.full_name}
                onChange={handleChangeNewUser}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleChangeNewUser}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="jean.dupont@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe *
              </label>
              <input
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleChangeNewUser}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Mot de passe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle
              </label>
              <select
                name="role_id"
                value={newUser.role_id}
                onChange={handleChangeNewUser}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="">Sélectionner un rôle</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                id="new-user-active"
                type="checkbox"
                name="is_active"
                checked={newUser.is_active}
                onChange={handleChangeNewUser}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <label htmlFor="new-user-active" className="text-sm text-gray-700">
                Utilisateur actif
              </label>
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
                className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit user form */}
      {editingUser && (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Modifier l'utilisateur</h2>
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
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleUpdateUser}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                value={editingUser.full_name || ''}
                onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={editingUser.email || ''}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="jean.dupont@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe (laisser vide pour ne pas modifier)
              </label>
              <input
                type="password"
                value={editingUser.password || ''}
                onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nouveau mot de passe (optionnel)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle
              </label>
              <select
                value={editingUser.role_id || ''}
                onChange={(e) => setEditingUser({ ...editingUser, role_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="">Sélectionner un rôle</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                id="edit-user-active"
                type="checkbox"
                checked={editingUser.is_active}
                onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <label htmlFor="edit-user-active" className="text-sm text-gray-700">
                Utilisateur actif
              </label>
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

      {/* Users table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const roleName = getRoleName(user.role_id);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <UsersIcon className="text-primary-600" size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || 'Sans nom'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail size={14} />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(roleName)}`}>
                        <Shield size={12} className="mr-1" />
                        {roleName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {checkPermission('USERS_EDIT') && (
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {checkPermission('USERS_DELETE') && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
            </div>
            <UsersIcon className="text-primary-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter(u => u.is_active).length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <UsersIcon className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Administrateurs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter(u => {
                  const role = roles.find(r => r.id === u.role_id);
                  return role?.name?.toLowerCase().includes('admin');
                }).length}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
