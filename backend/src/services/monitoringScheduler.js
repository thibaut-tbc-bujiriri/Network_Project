/**
 * Scheduler de surveillance automatique
 * Surveille tous les équipements toutes les 60 secondes
 */
import cron from 'node-cron';
import { RouterMonitor } from './routerMonitor.js';
import { WindowsMonitor } from './windowsMonitor.js';
import { SupabaseService } from './supabaseService.js';
import { LogService } from './logService.js';

export class MonitoringScheduler {
  constructor() {
    this.routerMonitor = new RouterMonitor();
    this.windowsMonitor = new WindowsMonitor();
    this.supabaseService = new SupabaseService();
    this.isRunning = false;
  }

  /**
   * Surveille tous les équipements
   */
  async monitorAllDevices() {
    if (this.isRunning) {
      console.log('  ⏸️  Surveillance déjà en cours, skip...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    console.log(`\n[${new Date().toLocaleString()}] 🔍 Début de la surveillance...`);

    try {
      // Surveiller routeurs et serveurs en parallèle
      await Promise.all([
        this.monitorAllRouters(),
        this.monitorAllWindowsServers()
      ]);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[${new Date().toLocaleString()}] ✅ Surveillance terminée en ${duration}s\n`);
      
      // Rotation du fichier log si nécessaire (tous les 100 cycles, soit ~100 minutes)
      if (Math.random() < 0.01) {
        await LogService.rotateLogFile();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la surveillance globale:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Surveille tous les routeurs
   */
  async monitorAllRouters() {
    try {
      const routers = await this.supabaseService.getAllRouters();
      
      if (routers.length === 0) {
        console.log('  ℹ️  Aucun routeur à surveiller');
        return;
      }

      console.log(`  📡 Surveillance de ${routers.length} routeur(s)...`);

      const promises = routers.map(async (router) => {
        try {
          const monitoringData = await this.routerMonitor.monitorRouter(router);
          await this.supabaseService.updateRouterStatus(router.id, monitoringData);
          
          // Enregistrer le log de surveillance
          await LogService.logRouterMonitoring(router, monitoringData);
          
          const status = monitoringData.status === 'online' ? '🟢' : '🔴';
          const latency = monitoringData.latency ? ` [${monitoringData.latency}ms]` : '';
          const metrics = monitoringData.cpu !== null 
            ? ` (CPU: ${monitoringData.cpu}%, RAM: ${monitoringData.ram_usage || 'N/A'}%)`
            : ' (Ping uniquement)';
          console.log(`    ${status} ${router.name} (${router.ip_address}): ${monitoringData.status}${latency}${metrics}`);
        } catch (error) {
          console.error(`    ❌ Erreur routeur ${router.name}:`, error.message);
          // Enregistrer l'erreur dans les logs
          await LogService.logRouterMonitoring(router, { 
            status: 'error', 
            error: error.message 
          });
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('❌ Erreur lors de la surveillance des routeurs:', error);
    }
  }

  /**
   * Surveille tous les serveurs Windows
   */
  async monitorAllWindowsServers() {
    try {
      const servers = await this.supabaseService.getAllWindowsServers();
      
      if (servers.length === 0) {
        console.log('  ℹ️  Aucun serveur Windows à surveiller');
        return;
      }

      console.log(`  🖥️  Surveillance de ${servers.length} serveur(s) Windows...`);

      const promises = servers.map(async (server) => {
        try {
          const monitoringData = await this.windowsMonitor.monitorWindowsServer(server);
          await this.supabaseService.updateWindowsServerStatus(server.id, monitoringData);
          
          // Enregistrer le log de surveillance
          await LogService.logWindowsServerMonitoring(server, monitoringData);
          
          const status = monitoringData.status === 'online' ? '🟢' : '🔴';
          const latency = monitoringData.latency ? ` [${monitoringData.latency}ms]` : '';
          const metrics = monitoringData.cpu !== null 
            ? ` (CPU: ${monitoringData.cpu}%, RAM: ${monitoringData.ram_usage || 'N/A'}%, Disk: ${monitoringData.disk_usage || 'N/A'}%)`
            : ' (Ping uniquement)';
          console.log(`    ${status} ${server.name} (${server.ip_address}): ${monitoringData.status}${latency}${metrics}`);
        } catch (error) {
          console.error(`    ❌ Erreur serveur ${server.name}:`, error.message);
          // Enregistrer l'erreur dans les logs
          await LogService.logWindowsServerMonitoring(server, { 
            status: 'error', 
            error: error.message 
          });
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('❌ Erreur lors de la surveillance des serveurs Windows:', error);
    }
  }

  /**
   * Démarre le scheduler
   */
  start() {
    // Surveiller toutes les minutes (cron: * * * * *)
    cron.schedule('* * * * *', () => {
      this.monitorAllDevices();
    });

    // Surveiller immédiatement au démarrage
    this.monitorAllDevices();

    console.log('✅ Scheduler de surveillance démarré (toutes les 60 secondes)');
  }

  /**
   * Arrête le scheduler
   */
  stop() {
    const tasks = cron.getTasks();
    tasks.forEach(task => task.stop());
    console.log('⏹️  Scheduler arrêté');
  }
}

