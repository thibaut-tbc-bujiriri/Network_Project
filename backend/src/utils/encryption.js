/**
 * Utilitaires de chiffrement pour les credentials
 * ⚠️ IMPORTANT : Ne jamais stocker les mots de passe en clair !
 */
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  console.warn('⚠️ ENCRYPTION_KEY non configurée ou invalide. Les credentials ne seront pas chiffrés.');
}

/**
 * Chiffre un mot de passe
 * @param {string} password - Mot de passe en clair
 * @returns {object} - Objet avec encrypted, iv, authTag
 */
export function encryptPassword(password) {
  if (!ENCRYPTION_KEY) {
    return { encrypted: password, isEncrypted: false }; // Fallback si pas de clé
  }

  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      isEncrypted: true
    };
  } catch (error) {
    console.error('Erreur lors du chiffrement:', error);
    return { encrypted: password, isEncrypted: false };
  }
}

/**
 * Déchiffre un mot de passe
 * @param {object} encryptedData - Objet avec encrypted, iv, authTag
 * @returns {string} - Mot de passe en clair
 */
export function decryptPassword(encryptedData) {
  // Si pas chiffré (valeur en clair ou pas de données)
  if (!encryptedData || encryptedData.isEncrypted === false || typeof encryptedData === 'string') {
    return typeof encryptedData === 'string' ? encryptedData : (encryptedData?.encrypted || '');
  }

  if (!ENCRYPTION_KEY) {
    return encryptedData.encrypted || '';
  }

  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32);
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Erreur lors du déchiffrement:', error);
    return '';
  }
}

/**
 * Formate les credentials pour le stockage dans Supabase
 */
export function formatCredentialsForStorage(username, password) {
  if (!password) {
    return { username, password_encrypted: null };
  }

  const encrypted = encryptPassword(password);
  
  if (encrypted.isEncrypted) {
    return {
      username,
      password_encrypted: JSON.stringify({
        encrypted: encrypted.encrypted,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        isEncrypted: true
      })
    };
  } else {
    // Si chiffrement échoué, ne pas stocker (sécurité)
    console.warn('⚠️ Échec du chiffrement, le mot de passe ne sera pas stocké');
    return { username, password_encrypted: null };
  }
}

/**
 * Récupère les credentials depuis Supabase
 */
export function getCredentialsFromStorage(device) {
  const username = device.username || null;
  let password = null;

  if (device.password_encrypted) {
    try {
      const encryptedData = JSON.parse(device.password_encrypted);
      password = decryptPassword(encryptedData);
    } catch (error) {
      console.error('Erreur lors du déchiffrement des credentials:', error);
    }
  }

  return { username, password };
}

