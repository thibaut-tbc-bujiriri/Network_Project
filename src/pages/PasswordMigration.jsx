/**
 * Page de migration des mots de passe
 * Permet à l'administrateur de hasher les mots de passe existants
 * en les modifiant via l'interface
 */
import { Shield, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseClient';
import { checkPermission, getUserRole } from '../utils/permissions';
import { useNavigate } from 'react-router-dom';
import { isPasswordHashed } from '../utils/password';

export default function PasswordMigration() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, hashed: 0, notHashed: 0 });

  // Vérifier que l'utilisateur est administrateur
  useEffect(() => {
    const role = getUserRole();
    if (role !== 'Administrateur') {
      navigate('/app/dashboard');
    }
  }, [navigate]);

  // Charger les utilisateurs
  useEffect(() => {
    async function loadUsers() {
      try {
        setIsLoading(true);
        const data = await supabaseService.getUsers();
        setUsers(data || []);
        
        // Calculer les statistiques
        const hashed = data.filter(u => u.password && isPasswordHashed(u.password)).length;
        const notHashed = data.filter(u => u.password && !isPasswordHashed(u.password)).length;
        
        setStats({
          total: data.length,
          hashed,
          notHashed,
        });
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        setError(err?.message || 'Impossible de charger les utilisateurs');
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  if (!checkPermission('USERS_VIEW')) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Migration des Mots de Passe</h1>
        <p className="text-gray-600 mt-1">
          Hasher les mots de passe existants pour améliorer la sécurité
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Shield className="text-primary-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mots de passe hashés</p>
              <p className="text-2xl font-bold text-green-600">{stats.hashed}</p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">À hasher</p>
              <p className="text-2xl font-bold text-red-600">{stats.notHashed}</p>
            </div>
            <AlertCircle className="text-red-600" size={32} />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">
          Instructions pour hasher les mots de passe
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Allez dans la page "Utilisateurs"</li>
          <li>Pour chaque utilisateur avec un mot de passe non hashé, cliquez sur "Modifier"</li>
          <li>Dans le champ "Mot de passe", entrez le même mot de passe (ou un nouveau)</li>
          <li>Cliquez sur "Modifier" - le mot de passe sera automatiquement hashé</li>
          <li>Rafraîchissez cette page pour voir les statistiques mises à jour</li>
        </ol>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note :</strong> Les mots de passe seront automatiquement hashés lors de la prochaine connexion des utilisateurs. 
            Vous pouvez aussi les hasher manuellement via l'interface de modification.
          </p>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Liste des utilisateurs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut du mot de passe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const isHashed = user.password && isPasswordHashed(user.password);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.full_name || 'Sans nom'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isHashed ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          Hashé ✅
                        </span>
                      ) : user.password ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                          Non hashé ⚠️
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          Aucun mot de passe
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {!isHashed && user.password && (
                        <a
                          href="/app/users"
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          Modifier →
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




