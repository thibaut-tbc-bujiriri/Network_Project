/**
 * Utilitaires pour le hashage et la vérification des mots de passe
 * Utilise l'API Web Crypto native du navigateur (pas de dépendance externe)
 */

/**
 * Hash un mot de passe en utilisant l'API Web Crypto
 * @param {string} password - Mot de passe en clair
 * @returns {Promise<string>} - Mot de passe hashé (format: algorithm$salt$hash)
 */
export async function hashPassword(password) {
  if (!password) {
    throw new Error('Le mot de passe ne peut pas être vide');
  }

  try {
    // Générer un salt aléatoire
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Array.from(salt, byte => byte.toString(16).padStart(2, '0')).join('');

    // Convertir le mot de passe en ArrayBuffer
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password + saltHex);

    // Hasher avec SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    // Retourner au format: algorithm$salt$hash
    return `sha256$${saltHex}$${hashHex}`;
  } catch (err) {
    console.error('Erreur lors du hashage du mot de passe:', err);
    throw new Error('Impossible de hasher le mot de passe');
  }
}

/**
 * Vérifie si un mot de passe correspond à un hash
 * @param {string} password - Mot de passe en clair à vérifier
 * @param {string} hashedPassword - Mot de passe hashé stocké
 * @returns {Promise<boolean>} - true si le mot de passe correspond
 */
export async function verifyPassword(password, hashedPassword) {
  if (!password || !hashedPassword) {
    return false;
  }

  try {
    // Parser le hash (format: algorithm$salt$hash)
    const parts = hashedPassword.split('$');
    if (parts.length !== 3) {
      // Si le format n'est pas correct, peut-être que c'est un ancien mot de passe non hashé
      // Pour la migration, on compare directement (à supprimer après migration)
      return password === hashedPassword;
    }

    const [algorithm, saltHex, storedHash] = parts;

    if (algorithm !== 'sha256') {
      console.warn('Algorithme de hash non supporté:', algorithm);
      return false;
    }

    // Reconstruire le hash avec le même salt
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password + saltHex);

    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    // Comparer les hashs de manière sécurisée (comparaison constante)
    return constantTimeEqual(hashHex, storedHash);
  } catch (err) {
    console.error('Erreur lors de la vérification du mot de passe:', err);
    return false;
  }
}

/**
 * Compare deux chaînes de manière constante (protection contre les attaques par timing)
 * @param {string} a - Première chaîne
 * @param {string} b - Deuxième chaîne
 * @returns {boolean} - true si les chaînes sont identiques
 */
function constantTimeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Vérifie si un mot de passe est déjà hashé
 * @param {string} password - Chaîne à vérifier
 * @returns {boolean} - true si c'est un hash (format: algorithm$salt$hash)
 */
export function isPasswordHashed(password) {
  if (!password) return false;
  const parts = password.split('$');
  return parts.length === 3 && parts[0] === 'sha256';
}





