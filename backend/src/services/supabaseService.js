/**
 * Service Supabase pour interagir avec la base de données
 */
import { supabase } from '../config/supabase.js';

export class SupabaseService {
  /**
   * Récupère tous les routeurs à surveiller
   */
  async getAllRouters() {
    try {
      const { data, error } = await supabase
        .from('routeur_devices')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des routeurs:', error);
      return [];
    }
  }

  /**
   * Récupère tous les serveurs Windows à surveiller
   */
  async getAllWindowsServers() {
    try {
      const { data, error } = await supabase
        .from('windows_servers')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des serveurs Windows:', error);
      return [];
    }
  }

  /**
   * Met à jour le statut d'un routeur
   */
  async updateRouterStatus(routerId, monitoringData) {
    try {
      const updateData = {
        status: monitoringData.status,
        last_check: monitoringData.lastCheck || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Ajouter les métriques si disponibles (ne pas écraser avec null)
      if (monitoringData.cpu !== undefined && monitoringData.cpu !== null) updateData.cpu_usage = monitoringData.cpu;
      if (monitoringData.ram_usage !== undefined && monitoringData.ram_usage !== null) updateData.ram_usage = monitoringData.ram_usage;
      if (monitoringData.ram_total !== undefined && monitoringData.ram_total !== null) updateData.ram_total = monitoringData.ram_total;
      if (monitoringData.ram_used !== undefined && monitoringData.ram_used !== null) updateData.ram_used = monitoringData.ram_used;
      if (monitoringData.uptime !== undefined && monitoringData.uptime !== null) updateData.uptime = monitoringData.uptime;
      
      // Ajouter la latence si disponible
      if (monitoringData.latency !== undefined && monitoringData.latency !== null) {
        // La latence peut être stockée dans un champ séparé si nécessaire
        // Pour l'instant, on la garde juste dans les logs
      }

      const { data, error } = await supabase
        .from('routeur_devices')
        .update(updateData)
        .eq('id', routerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour du routeur ${routerId}:`, error);
      throw error;
    }
  }

  /**
   * Met à jour le statut d'un serveur Windows
   */
  async updateWindowsServerStatus(serverId, monitoringData) {
    try {
      const updateData = {
        status: monitoringData.status,
        last_check: monitoringData.lastCheck || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Ajouter les métriques si disponibles (ne pas écraser avec null)
      if (monitoringData.cpu !== undefined && monitoringData.cpu !== null) updateData.cpu_usage = monitoringData.cpu;
      if (monitoringData.ram_usage !== undefined && monitoringData.ram_usage !== null) updateData.ram_usage = monitoringData.ram_usage;
      if (monitoringData.ram_total !== undefined && monitoringData.ram_total !== null) updateData.ram_total = monitoringData.ram_total;
      if (monitoringData.ram_used !== undefined && monitoringData.ram_used !== null) updateData.ram_used = monitoringData.ram_used;
      if (monitoringData.disk_usage !== undefined && monitoringData.disk_usage !== null) updateData.disk_usage = monitoringData.disk_usage;
      if (monitoringData.disk_total !== undefined && monitoringData.disk_total !== null) updateData.disk_total = monitoringData.disk_total;
      if (monitoringData.disk_used !== undefined && monitoringData.disk_used !== null) updateData.disk_used = monitoringData.disk_used;
      if (monitoringData.uptime !== undefined && monitoringData.uptime !== null) updateData.uptime = monitoringData.uptime;

      const { data, error } = await supabase
        .from('windows_servers')
        .update(updateData)
        .eq('id', serverId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour du serveur ${serverId}:`, error);
      throw error;
    }
  }
}

