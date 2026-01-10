/**
 * Client Supabase centralisé pour l'application
 * Utilise l'URL et la clé publique (anon/publishable) fournies par Supabase.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquants. ' +
      'Ajoutez-les dans votre fichier d\'environnement (.env.local par exemple).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Service Supabase avec toutes les fonctions d'accès aux données
 */
export const supabaseService = {
  // ========== APP_USERS ==========
  async getUsers() {
    const { data, error } = await supabase
      .from('app_users')
      .select(`
        *,
        roles:role_id (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      const err = new Error(error.message || 'Erreur lors du chargement des utilisateurs');
      err.error = error;
      throw err;
    }
    // Mapper les rôles aux utilisateurs
    if (data) {
      return data.map(user => ({
        ...user,
        role_name: user.roles?.name || null,
      }));
    }
    return [];
  },

  async getUser(id) {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      const err = new Error(error.message || 'Erreur lors de la récupération de l\'utilisateur');
      err.error = error;
      throw err;
    }
    return data;
  },

  // Vérifier si un utilisateur existe par email et password
  async verifyUser(email, password) {
    const { verifyPassword } = await import('../utils/password');
    
    const { data, error } = await supabase
      .from('app_users')
      .select(`
        *,
        roles:role_id (
          id,
          name
        )
      `)
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .single();

    if (error) {
      // Si l'utilisateur n'existe pas ou n'est pas actif
      if (error.code === 'PGRST116') {
        return null; // Aucun utilisateur trouvé
      }
      const err = new Error(error.message || 'Erreur lors de la vérification de l\'utilisateur');
      err.error = error;
      throw err;
    }

    // Vérifier le mot de passe (supporte les mots de passe hashés et non hashés pour la migration)
    if (!data.password) {
      return null; // Pas de mot de passe
    }

    // Vérifier si le mot de passe est hashé ou en clair (pour la migration)
    const { isPasswordHashed } = await import('../utils/password');
    const isHashed = isPasswordHashed(data.password);
    
    let passwordValid = false;
    if (isHashed) {
      // Mot de passe hashé : utiliser la vérification sécurisée
      passwordValid = await verifyPassword(password, data.password);
    } else {
      // Ancien mot de passe en clair : comparer directement (pour la migration)
      // TODO: Après migration complète, supprimer cette partie
      passwordValid = data.password === password;
      
      // Si le mot de passe est correct mais non hashé, le hasher automatiquement
      if (passwordValid) {
        const { hashPassword } = await import('../utils/password');
        const hashedPassword = await hashPassword(password);
        // Mettre à jour le mot de passe hashé en arrière-plan (ne pas bloquer la connexion)
        this.updateUser(data.id, { password: hashedPassword }).catch(err => {
          console.warn('Impossible de mettre à jour le mot de passe hashé:', err);
        });
      }
    }

    if (!passwordValid) {
      return null; // Mot de passe incorrect
    }

    // Ajouter le nom du rôle à l'utilisateur
    if (data.roles) {
      data.role_name = data.roles.name;
    }

    return data;
  },

  async createUser(userData) {
    const { data, error } = await supabase
      .from('app_users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      const err = new Error(error.message || 'Erreur lors de la création de l\'utilisateur');
      err.error = error;
      throw err;
    }
    return data;
  },

  async updateUser(id, userData) {
    const { data, error } = await supabase
      .from('app_users')
      .update({ ...userData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      const err = new Error(error.message || 'Erreur lors de la modification de l\'utilisateur');
      err.error = error;
      throw err;
    }
    return data;
  },

  async deleteUser(id) {
    const { error } = await supabase
      .from('app_users')
      .delete()
      .eq('id', id);

    if (error) {
      const err = new Error(error.message || 'Erreur lors de la suppression de l\'utilisateur');
      err.error = error;
      throw err;
    }
  },

  // ========== ROLES ==========
  async getRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) {
      const err = new Error(error.message || 'Erreur lors du chargement des rôles');
      err.error = error;
      throw err;
    }

    // Si aucun rôle n'existe encore, on crée un jeu de rôles par défaut
    if (!data || data.length === 0) {
      const defaultRoles = [
        { name: 'Administrateur', description: 'Accès complet à la gestion du réseau et des serveurs' },
        { name: 'Opérateur', description: 'Gestion opérationnelle des appareils et serveurs' },
        { name: 'Lecteur', description: 'Accès en lecture seule au dashboard et aux logs' },
      ];

      const { data: inserted, error: insertError } = await supabase
        .from('roles')
        .insert(defaultRoles)
        .select('*')
        .order('name');

      if (insertError) {
        const err = new Error(insertError.message || 'Erreur lors de la création des rôles par défaut');
        err.error = insertError;
        throw err;
      }
      return inserted;
    }

    return data || [];
  },

  // ========== ROUTEUR_DEVICES ==========
  async getRouteurDevices() {
    const { data, error } = await supabase
      .from('routeur_devices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      const err = new Error(error.message || 'Erreur lors du chargement des routeurs');
      err.error = error;
      throw err;
    }
    return data || [];
  },

  async getRouteurDevice(id) {
    const { data, error } = await supabase
      .from('routeur_devices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createRouteurDevice(deviceData) {
    const { data, error } = await supabase
      .from('routeur_devices')
      .insert(deviceData)
      .select()
      .single();

    if (error) {
      const err = new Error(error.message || 'Erreur lors de la création du routeur');
      err.error = error;
      throw err;
    }
    return data;
  },

  async updateRouteurDevice(id, deviceData) {
    const { data, error } = await supabase
      .from('routeur_devices')
      .update({ ...deviceData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      const err = new Error(error.message || 'Erreur lors de la modification du routeur');
      err.error = error;
      throw err;
    }
    return data;
  },

  async deleteRouteurDevice(id) {
    const { error } = await supabase
      .from('routeur_devices')
      .delete()
      .eq('id', id);

    if (error) {
      const err = new Error(error.message || 'Erreur lors de la suppression du routeur');
      err.error = error;
      throw err;
    }
  },

  // ========== WINDOWS_SERVERS ==========
  async getWindowsServers() {
    const { data, error } = await supabase
      .from('windows_servers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      const err = new Error(error.message || 'Erreur lors du chargement des serveurs Windows');
      err.error = error;
      throw err;
    }
    return data || [];
  },

  async getWindowsServer(id) {
    const { data, error } = await supabase
      .from('windows_servers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createWindowsServer(serverData) {
    const { data, error } = await supabase
      .from('windows_servers')
      .insert(serverData)
      .select()
      .single();

    if (error) {
      const err = new Error(error.message || 'Erreur lors de la création du serveur');
      err.error = error;
      throw err;
    }
    return data;
  },

  async updateWindowsServer(id, serverData) {
    const { data, error } = await supabase
      .from('windows_servers')
      .update({ ...serverData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      const err = new Error(error.message || 'Erreur lors de la modification du serveur');
      err.error = error;
      throw err;
    }
    return data;
  },

  async deleteWindowsServer(id) {
    const { error } = await supabase
      .from('windows_servers')
      .delete()
      .eq('id', id);

    if (error) {
      const err = new Error(error.message || 'Erreur lors de la suppression du serveur');
      err.error = error;
      throw err;
    }
  },

  // ========== LOGS ==========
  async getLogs(filters = {}) {
    let query = supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.level) {
      query = query.eq('level', filters.level);
    }

    if (filters.source_type) {
      query = query.eq('source_type', filters.source_type);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      const err = new Error(error.message || 'Erreur lors du chargement des logs');
      err.error = error;
      throw err;
    }
    return data || [];
  },

  async createLog(logData) {
    const { data, error } = await supabase
      .from('logs')
      .insert(logData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ========== AUDIT LOGS ==========
  async createAuditLog(auditData) {
    try {
      console.log('🔍 Tentative d\'enregistrement d\'audit:', {
        action_type: auditData.action_type,
        entity_type: auditData.entity_type,
        entity_name: auditData.entity_name,
        user_email: auditData.user_email,
      });

      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: auditData.user_id || null,
          user_email: auditData.user_email || null,
          user_name: auditData.user_name || null,
          action_type: auditData.action_type, // 'create', 'update', 'delete'
          entity_type: auditData.entity_type, // 'user', 'routeur_device', 'windows_server'
          entity_id: auditData.entity_id || null,
          entity_name: auditData.entity_name || null,
          old_values: auditData.old_values || null,
          new_values: auditData.new_values || null,
          ip_address: auditData.ip_address || null,
          user_agent: auditData.user_agent || null,
        })
        .select()
        .single();

      if (error) {
        // Ne pas bloquer l'application si l'audit échoue
        console.error('❌ Erreur Supabase lors de l\'enregistrement de l\'audit:', error);
        console.error('Code d\'erreur:', error.code);
        console.error('Message d\'erreur:', error.message);
        console.error('Détails:', error.details);
        console.error('Hint:', error.hint);
        return null;
      }

      console.log('✅ Audit enregistré avec succès, ID:', data?.id);
      return data;
    } catch (err) {
      console.error('❌ Exception lors de l\'enregistrement de l\'audit:', err);
      return null;
    }
  },

  async getAuditLogs(filters = {}) {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (filters.action_type) {
      query = query.eq('action_type', filters.action_type);
    }
    if (filters.entity_type) {
      query = query.eq('entity_type', filters.entity_type);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    } else {
      query = query.limit(100); // Limite par défaut
    }

    const { data, error } = await query;

    if (error) {
      const err = new Error(error.message || 'Erreur lors du chargement des logs d\'audit');
      err.error = error;
      throw err;
    }
    return data || [];
  },

  // ========== DASHBOARD STATS ==========
  async getDashboardStats() {
    const [
      { count: usersCount },
      { count: routeurCount },
      { count: windowsCount },
      { count: logsCount },
      { count: activeDevicesCount },
      { count: activeServersCount },
      { count: errorLogsCount },
    ] = await Promise.all([
      supabase.from('app_users').select('*', { count: 'exact', head: true }),
      supabase.from('routeur_devices').select('*', { count: 'exact', head: true }),
      supabase.from('windows_servers').select('*', { count: 'exact', head: true }),
      supabase.from('logs').select('*', { count: 'exact', head: true }),
      supabase.from('routeur_devices').select('*', { count: 'exact', head: true }).eq('status', 'online'),
      supabase.from('windows_servers').select('*', { count: 'exact', head: true }).eq('status', 'online'),
      supabase.from('logs').select('*', { count: 'exact', head: true }).eq('level', 'error'),
    ]);

    return {
      usersCount: usersCount ?? 0,
      routeurCount: routeurCount ?? 0,
      windowsCount: windowsCount ?? 0,
      logsCount: logsCount ?? 0,
      activeDevicesCount: activeDevicesCount ?? 0,
      activeServersCount: activeServersCount ?? 0,
      errorLogsCount: errorLogsCount ?? 0,
      totalDevices: (routeurCount ?? 0) + (windowsCount ?? 0),
      activeDevices: (activeDevicesCount ?? 0) + (activeServersCount ?? 0),
    };
  },

  // ========== DEVICE ASSIGNMENTS ==========
  async getDeviceAssignments() {
    const { data, error } = await supabase
      .from('device_assignments')
      .select(`
        *,
        app_users:user_id (*),
        routeur_devices:device_id (*),
        windows_servers:device_id (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
