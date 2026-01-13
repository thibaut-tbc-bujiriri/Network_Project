/**
 * Service de logging pour enregistrer les cycles de surveillance
 * Écrit dans Supabase (table logs) et dans un fichier local
 */
import { supabase } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, 'surveillance.log');

// S'assurer que le dossier logs existe
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export class LogService {
  /**
   * Convertit une valeur en string "N/A" si null/undefined
   */
  static formatValue(value) {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return String(value);
  }

  /**
   * Écrit un log dans le fichier local
   */
  static writeToFile(logEntry) {
    try {
      const timestamp = new Date().toISOString();
      const logLine = `[${timestamp}] ${logEntry.type.toUpperCase()} | ${logEntry.equipment_name} (${logEntry.ip_address}) | Status: ${logEntry.status} | CPU: ${LogService.formatValue(logEntry.cpu)}% | RAM: ${LogService.formatValue(logEntry.ram)}% | Disk: ${LogService.formatValue(logEntry.disk)}%\n`;
      
      fs.appendFileSync(LOG_FILE, logLine, 'utf8');
    } catch (error) {
      console.error('❌ Erreur lors de l\'écriture du log fichier:', error.message);
    }
  }

  /**
   * Enregistre un log de surveillance dans Supabase et dans le fichier
   */
  static async logMonitoringCycle(equipment) {
    try {
      const {
        id,
        name,
        ip_address,
        type, // 'routeur' ou 'serveur'
        status,
        cpu,
        ram_usage,
        disk_usage,
        latency,
        error: errorMessage
      } = equipment;

      // Préparer les métriques (utiliser "N/A" pour les valeurs manquantes)
      const cpuValue = cpu !== null && cpu !== undefined ? cpu : null;
      const ramValue = ram_usage !== null && ram_usage !== undefined ? ram_usage : null;
      const diskValue = disk_usage !== null && disk_usage !== undefined ? disk_usage : null;

      // Déterminer le niveau de log
      let level = 'info';
      if (status === 'offline' || errorMessage) {
        level = 'warning';
      }

      // Message descriptif
      const message = status === 'online' 
        ? `Surveillance ${type}: ${name} (${ip_address}) - Statut: ${status}`
        : `Surveillance ${type}: ${name} (${ip_address}) - Statut: ${status}${errorMessage ? ' - Erreur: ' + errorMessage : ''}`;

      // Métadonnées complètes au format JSON
      const metadata = {
        equipment_name: name,
        ip_address: ip_address,
        status: status,
        type: type,
        cpu: cpuValue,
        ram: ramValue,
        disk: diskValue,
        latency: latency !== null && latency !== undefined ? latency : null,
        timestamp: new Date().toISOString()
      };

      // Si erreur, l'ajouter aux métadonnées
      if (errorMessage) {
        metadata.error = errorMessage;
      }

      // Insérer dans Supabase
      const { data: insertedData, error: supabaseError } = await supabase
        .from('logs')
        .insert({
          level: level,
          message: message,
          source_type: type === 'routeur' ? 'routeur' : 'windows_server',
          source_id: id,
          metadata: metadata
        })
        .select();

      if (supabaseError) {
        console.error(`❌ Erreur lors de l'enregistrement du log Supabase pour ${name}:`, supabaseError.message);
        console.error(`   Code: ${supabaseError.code || 'N/A'}`);
        console.error(`   Détails: ${supabaseError.details || 'N/A'}`);
        console.error(`   Hint: ${supabaseError.hint || 'N/A'}`);
      } else {
        // Log silencieux pour ne pas polluer la console (décommenter pour debug)
        // console.log(`✅ Log enregistré pour ${name} (ID: ${insertedData?.[0]?.id || 'N/A'})`);
      }

      // Écrire dans le fichier local
      const logEntry = {
        type: type,
        equipment_name: name,
        ip_address: ip_address,
        status: status,
        cpu: cpuValue,
        ram: ramValue,
        disk: diskValue
      };

      LogService.writeToFile(logEntry);

    } catch (error) {
      console.error(`❌ Erreur lors de l'enregistrement du log pour ${equipment?.name || 'équipement inconnu'}:`, error.message);
    }
  }

  /**
   * Enregistre les logs pour un routeur
   */
  static async logRouterMonitoring(router, monitoringData) {
    const logEquipment = {
      id: router.id,
      name: router.name || 'Routeur inconnu',
      ip_address: router.ip_address,
      type: 'routeur',
      status: monitoringData.status || 'unknown',
      cpu: monitoringData.cpu || null,
      ram_usage: monitoringData.ram_usage || null,
      disk_usage: null, // Les routeurs n'ont pas de disk
      latency: monitoringData.latency || null,
      error: monitoringData.error || null
    };

    await LogService.logMonitoringCycle(logEquipment);
  }

  /**
   * Enregistre les logs pour un serveur Windows
   */
  static async logWindowsServerMonitoring(server, monitoringData) {
    const logEquipment = {
      id: server.id,
      name: server.name || 'Serveur inconnu',
      ip_address: server.ip_address,
      type: 'serveur',
      status: monitoringData.status || 'unknown',
      cpu: monitoringData.cpu || null,
      ram_usage: monitoringData.ram_usage || null,
      disk_usage: monitoringData.disk_usage || null,
      latency: monitoringData.latency || null,
      error: monitoringData.error || null
    };

    await LogService.logMonitoringCycle(logEquipment);
  }

  /**
   * Nettoie les anciens logs du fichier (garde les 10000 dernières lignes)
   */
  static async rotateLogFile() {
    try {
      if (!fs.existsSync(LOG_FILE)) {
        return;
      }

      const fileContent = fs.readFileSync(LOG_FILE, 'utf8');
      const lines = fileContent.split('\n').filter(line => line.trim());

      // Garder les 10000 dernières lignes
      if (lines.length > 10000) {
        const recentLines = lines.slice(-10000);
        fs.writeFileSync(LOG_FILE, recentLines.join('\n') + '\n', 'utf8');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la rotation du fichier log:', error.message);
    }
  }
}

