/**
 * Système de permissions basé sur les rôles
 */

// Noms des rôles (doivent correspondre à ceux dans la base de données)
export const ROLES = {
  ADMIN: 'Administrateur',
  OPERATOR: 'Opérateur',
  READER: 'Lecteur',
};

// Permissions par rôle
export const PERMISSIONS = {
  // Gestion des utilisateurs
  USERS_VIEW: [ROLES.ADMIN, ROLES.OPERATOR, ROLES.READER],
  USERS_CREATE: [ROLES.ADMIN],
  USERS_EDIT: [ROLES.ADMIN],
  USERS_DELETE: [ROLES.ADMIN],

  // Gestion des routeurs
  ROUTEUR_VIEW: [ROLES.ADMIN, ROLES.OPERATOR, ROLES.READER],
  ROUTEUR_CREATE: [ROLES.ADMIN, ROLES.OPERATOR],
  ROUTEUR_EDIT: [ROLES.ADMIN, ROLES.OPERATOR],
  ROUTEUR_DELETE: [ROLES.ADMIN],

  // Gestion des serveurs Windows
  WINDOWS_VIEW: [ROLES.ADMIN, ROLES.OPERATOR, ROLES.READER],
  WINDOWS_CREATE: [ROLES.ADMIN, ROLES.OPERATOR],
  WINDOWS_EDIT: [ROLES.ADMIN, ROLES.OPERATOR],
  WINDOWS_DELETE: [ROLES.ADMIN],

  // Consultation des logs
  LOGS_VIEW: [ROLES.ADMIN, ROLES.OPERATOR, ROLES.READER],
  LOGS_EXPORT: [ROLES.ADMIN, ROLES.OPERATOR],

  // Dashboard
  DASHBOARD_VIEW: [ROLES.ADMIN, ROLES.OPERATOR, ROLES.READER],
};

/**
 * Vérifie si un utilisateur a une permission donnée
 * @param {string} roleName - Nom du rôle de l'utilisateur
 * @param {string} permission - Permission à vérifier
 * @returns {boolean}
 */
export function hasPermission(roleName, permission) {
  if (!roleName || !permission) return false;
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(roleName);
}

/**
 * Récupère le rôle de l'utilisateur depuis le localStorage
 * @returns {string|null}
 */
export function getUserRole() {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user.role_name || null;
  } catch (err) {
    console.error('Erreur lors de la récupération du rôle:', err);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur actuel a une permission
 * @param {string} permission - Permission à vérifier
 * @returns {boolean}
 */
export function checkPermission(permission) {
  const roleName = getUserRole();
  return hasPermission(roleName, permission);
}



