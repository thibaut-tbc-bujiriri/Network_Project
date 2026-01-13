/**
 * Service de surveillance pour routeurs et switches
 * Supporte : Ping, SSH (MikroTik), SNMP (Cisco/autres)
 */
import ping from 'ping';
import ssh2 from 'ssh2';
import * as snmp from 'net-snmp';
import dotenv from 'dotenv';
import { getCredentialsFromStorage } from '../utils/encryption.js';

dotenv.config();

export class RouterMonitor {
  /**
   * Vérifie si un équipement est en ligne (ping)
   */
  async checkConnectivity(ipAddress) {
    try {
      const result = await ping.promise.probe(ipAddress, {
        timeout: 3,
        min_reply: 1
      });
      
      return {
        online: result.alive,
        latency: result.time ? parseFloat(result.time) : null,
        packetLoss: result.packetLoss ? parseFloat(result.packetLoss) : 0
      };
    } catch (error) {
      console.error(`Erreur ping pour ${ipAddress}:`, error.message);
      return { online: false, latency: null, packetLoss: 100 };
    }
  }

  /**
   * Récupère les métriques via SSH (MikroTik, Cisco, etc.)
   */
  async getMetricsViaSSH(ipAddress, username, password) {
    return new Promise((resolve, reject) => {
      const sshTimeout = process.env.SSH_READY_TIMEOUT ? parseInt(process.env.SSH_READY_TIMEOUT) : 5000;
      const conn = new ssh2.Client();
      conn.connect({
        host: ipAddress,
        username: username,
        password: password,
        port: 22,
        readyTimeout: sshTimeout
      });

      let output = '';
      let metrics = {};

      conn.on('ready', () => {
        // Commande pour MikroTik RouterOS
        conn.exec('/system resource print', (err, stream) => {
          if (err) {
            conn.end();
            reject(err);
            return;
          }

          stream.on('close', () => {
            try {
              // Parser la sortie MikroTik
              const cpuMatch = output.match(/cpu-load:\s*(\d+)%/i);
              const freeMemMatch = output.match(/free-memory:\s*(\d+)/i);
              const totalMemMatch = output.match(/total-memory:\s*(\d+)/i);
              const uptimeMatch = output.match(/uptime:\s*([^\n]+)/i);

              if (cpuMatch) metrics.cpu = parseInt(cpuMatch[1]);
              if (freeMemMatch && totalMemMatch) {
                const free = parseInt(freeMemMatch[1]);
                const total = parseInt(totalMemMatch[1]);
                metrics.ram_total = total;
                metrics.ram_used = total - free;
                metrics.ram_usage = Math.round(((total - free) / total) * 100);
              }
              if (uptimeMatch) metrics.uptime = uptimeMatch[1].trim();

              conn.end();
              resolve(metrics);
            } catch (parseError) {
              conn.end();
              reject(parseError);
            }
          });

          stream.on('data', (data) => {
            output += data.toString();
          });

          stream.stderr.on('data', (data) => {
            console.error(`SSH stderr pour ${ipAddress}:`, data.toString());
          });
        });
      });

      conn.on('error', (err) => {
        reject(err);
      });

      conn.connect();
    });
  }

  /**
   * Récupère les métriques via SNMP (Cisco, HP, etc.)
   */
  async getMetricsViaSNMP(ipAddress, community = 'public') {
    return new Promise((resolve, reject) => {
      const snmpTimeout = process.env.SNMP_TIMEOUT ? parseInt(process.env.SNMP_TIMEOUT) : 3000;
      const session = snmp.createSession(ipAddress, community, {
        port: 161,
        retries: 1,
        timeout: snmpTimeout
      });

      // OIDs SNMP standards
      const oids = [
        '1.3.6.1.2.1.1.3.0',  // sysUpTime (en centièmes de seconde)
        '1.3.6.1.2.1.25.3.3.1.2.1',  // CPU usage (si disponible)
        '1.3.6.1.2.1.25.2.3.1.5.1',  // Memory total
        '1.3.6.1.2.1.25.2.3.1.6.1',  // Memory used
      ];

      session.get(oids, (error, varbinds) => {
        session.close();

        if (error) {
          reject(error);
          return;
        }

        try {
          const metrics = {
            uptime: varbinds[0] ? varbinds[0].value / 100 : null, // Convertir en secondes
            cpu: varbinds[1] ? varbinds[1].value : null,
            ram_total: varbinds[2] ? varbinds[2].value : null,
            ram_used: varbinds[3] ? varbinds[3].value : null
          };

          if (metrics.ram_total && metrics.ram_used) {
            metrics.ram_usage = Math.round((metrics.ram_used / metrics.ram_total) * 100);
          }

          resolve(metrics);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  }

  /**
   * Surveille un routeur (méthode principale)
   * 
   * Pour routeurs simples (Orange HomeBox, etc.) : Ping uniquement
   * Pour routeurs avancés (MikroTik, Cisco) : SSH ou SNMP si credentials disponibles
   */
  async monitorRouter(routerConfig) {
    const routerName = routerConfig.name || routerConfig.ip_address;
    
    try {
      // 1. Vérifier la connectivité (ping) - TOUJOURS fait en premier
      const connectivity = await this.checkConnectivity(routerConfig.ip_address);
      
      // Si offline, retourner immédiatement (pas besoin d'essayer SSH/SNMP)
      if (!connectivity.online) {
        return {
          status: 'offline',
          lastCheck: new Date().toISOString(),
          latency: null,
          packetLoss: connectivity.packetLoss || 100
        };
      }

      // 2. Récupérer les métriques avancées (seulement si credentials disponibles)
      // Pour routeurs simples comme Orange HomeBox, on s'arrête au ping
      let metrics = {};
      const credentials = getCredentialsFromStorage(routerConfig);
      
      // Si pas de credentials, on fait juste le ping (routeur simple)
      if (!credentials.username || !credentials.password) {
        // Routeur simple (Orange HomeBox, routeur opérateur, etc.)
        // On retourne juste le statut online avec la latence
        return {
          status: 'online',
          lastCheck: new Date().toISOString(),
          latency: connectivity.latency,
          packetLoss: connectivity.packetLoss || 0,
          // Pas de métriques CPU/RAM pour les routeurs simples
          cpu: null,
          ram_usage: null,
          ram_total: null,
          ram_used: null,
          uptime: null
        };
      }

      // 3. Routeur avancé avec credentials : Essayer SSH puis SNMP
      // Méthode 1 : SSH (prioritaire pour MikroTik)
      if (credentials.username && credentials.password) {
        try {
          metrics = await this.getMetricsViaSSH(
            routerConfig.ip_address,
            credentials.username,
            credentials.password
          );
          // Si SSH réussit, on a les métriques
        } catch {
          // SSH échoué, essayer SNMP en fallback
          try {
            const snmpCommunity = routerConfig.snmp_community || process.env.SNMP_COMMUNITY || 'public';
            metrics = await this.getMetricsViaSNMP(routerConfig.ip_address, snmpCommunity);
          } catch {
            // SNMP aussi échoué, on continue avec juste le ping
            // C'est OK, on retournera juste le statut online
          }
        }
      }

      // 4. Retourner les données complètes
      return {
        status: 'online',
        lastCheck: new Date().toISOString(),
        latency: connectivity.latency,
        cpu: metrics.cpu || null,
        ram_usage: metrics.ram_usage || null,
        ram_total: metrics.ram_total || null,
        ram_used: metrics.ram_used || null,
        uptime: metrics.uptime || null,
        packetLoss: connectivity.packetLoss || 0
      };
    } catch (error) {
      console.error(`❌ Erreur lors de la surveillance du routeur ${routerName}:`, error.message);
      return {
        status: 'error',
        lastCheck: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

