/**
 * Utilitaires pour l'enregistrement des actions d'audit
 */
import { supabaseService } from '../services/supabaseClient';

/**
 * Enregistre une action d'audit
 * @param {string} actionType - 'create', 'update', 'delete'
 * @param {string} entityType - 'user', 'routeur_device', 'windows_server'
 * @param {object} entityData - Données de l'entité
 * @param {object} oldData - Anciennes valeurs (pour les updates)
 */
export async function logAudit(actionType, entityType, entityData, oldData = null) {
  try {
    // Récupérer les informations de l'utilisateur connecté
    const userStr = localStorage.getItem('user');
    let user = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (err) {
        console.error('Erreur lors de la lecture des informations utilisateur:', err);
      }
    }

    // Déterminer le nom de l'entité
    let entityName = '';
    if (entityType === 'user') {
      entityName = entityData.full_name || entityData.email || 'Utilisateur';
    } else if (entityType === 'routeur_device') {
      entityName = entityData.name || 'Routeur';
    } else if (entityType === 'windows_server') {
      entityName = entityData.name || 'Serveur Windows';
    }

    // Préparer les données d'audit
    const auditData = {
      user_id: user?.id || null,
      user_email: user?.email || null,
      user_name: user?.full_name || null,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityData.id || null,
      entity_name: entityName,
      old_values: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
      new_values: JSON.parse(JSON.stringify(entityData)),
      ip_address: null, // Peut être récupéré depuis les headers si nécessaire
      user_agent: navigator.userAgent || null,
    };

    // Enregistrer l'audit (ne pas bloquer si ça échoue)
    const result = await supabaseService.createAuditLog(auditData);
    if (result) {
      console.log('✅ Audit enregistré avec succès:', {
        action: actionType,
        entity: entityType,
        entityName: entityName,
      });
    } else {
      console.warn('⚠️ Audit non enregistré (résultat null)');
    }
  } catch (err) {
    // Ne pas bloquer l'application si l'audit échoue
    console.error('❌ Erreur lors de l\'enregistrement de l\'audit:', err);
    console.error('Détails de l\'erreur:', {
      message: err?.message,
      error: err?.error,
      stack: err?.stack,
    });
  }
}

