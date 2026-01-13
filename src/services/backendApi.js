/**
 * Service API pour communiquer avec le backend Node.js sur Render
 * Utilise fetch pour les appels HTTP
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://network-project-yqtq.onrender.com';

/**
 * Fonction utilitaire pour gérer les erreurs de fetch
 */
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP Error: ${response.status} ${response.statusText}`
    }));
    throw new Error(error.message || `HTTP Error: ${response.status}`);
  }
  return response.json();
}

/**
 * Vérifie l'état de santé du backend
 * @returns {Promise<Object>} Statut du backend
 */
export async function getHealth() {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Erreur lors de la vérification du backend:', error);
    throw error;
  }
}

/**
 * Récupère les logs de surveillance depuis le backend
 * @param {Object} params - Paramètres de filtrage (optionnel)
 * @returns {Promise<Array>} Liste des logs
 */
export async function getLogs(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString 
      ? `${API_URL}/api/logs?${queryString}`
      : `${API_URL}/api/logs`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des logs:', error);
    throw error;
  }
}

/**
 * Récupère la liste des routeurs depuis le backend
 * @returns {Promise<Array>} Liste des routeurs
 */
export async function getRouters() {
  try {
    const response = await fetch(`${API_URL}/api/routers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des routeurs:', error);
    throw error;
  }
}

/**
 * Récupère la liste des serveurs Windows depuis le backend
 * @returns {Promise<Array>} Liste des serveurs Windows
 */
export async function getWindowsServers() {
  try {
    const response = await fetch(`${API_URL}/api/windows-servers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des serveurs Windows:', error);
    throw error;
  }
}

/**
 * Déclenche une surveillance manuelle
 * @returns {Promise<Object>} Résultat de la surveillance
 */
export async function triggerMonitoring() {
  try {
    const response = await fetch(`${API_URL}/api/monitor/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Erreur lors du déclenchement de la surveillance:', error);
    throw error;
  }
}

/**
 * Récupère les statistiques du dashboard depuis le backend
 * @returns {Promise<Object>} Statistiques du dashboard
 */
export async function getDashboardStats() {
  try {
    const response = await fetch(`${API_URL}/api/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
}

// Export de l'URL de l'API pour utilisation dans d'autres composants
export { API_URL };

