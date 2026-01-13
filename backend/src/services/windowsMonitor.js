/**
 * Service de surveillance pour serveurs Windows
 * Utilise WinRM pour récupérer les métriques système
 */
import ping from 'ping';
import WinRM from 'nodejs-winrm';
import dotenv from 'dotenv';
import { getCredentialsFromStorage } from '../utils/encryption.js';

dotenv.config();

export class WindowsMonitor {
  /**
   * Vérifie la connectivité (ping)
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
      return { online: false, latency: null, packetLoss: 100 };
    }
  }

  /**
   * Récupère les métriques Windows via WinRM
   */
  async getMetricsViaWinRM(ipAddress, username, password) {
    try {
      const winrmPort = process.env.WINRM_PORT ? parseInt(process.env.WINRM_PORT) : 5985;
      const winrmProtocol = process.env.WINRM_PROTOCOL || 'http';
      const winrm = new WinRM({
        host: ipAddress,
        username: username,
        password: password,
        port: winrmPort,
        protocol: winrmProtocol,
        timeout: 10000 // 10 secondes de timeout pour Windows Server 2012
      });

      // Script PowerShell compatible Windows Server 2012
      // Utilise WMI (Get-WmiObject) au lieu de CIM pour compatibilité
      const psScript = `
try {
  # CPU - Compatible Windows Server 2012 (WMI au lieu de CIM)
  $cpu = Get-WmiObject Win32_Processor | Measure-Object -property LoadPercentage -Average | Select-Object -ExpandProperty Average
  if (-not $cpu) { $cpu = 0 }
  
  # RAM - Compatible Windows Server 2012
  $os = Get-WmiObject Win32_OperatingSystem
  $memTotalMB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
  $memFreeMB = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
  $memUsedMB = $memTotalMB - $memFreeMB
  $memUsedPercent = [math]::Round(($memUsedMB / $memTotalMB) * 100, 2)
  
  # Uptime - Compatible Windows Server 2012
  $bootTime = [System.Management.ManagementDateTimeConverter]::ToDateTime($os.LastBootUpTime)
  $uptime = (Get-Date) - $bootTime
  $uptimeSeconds = $uptime.TotalSeconds
  
  # Disk - Compatible Windows Server 2012
  $disk = Get-WmiObject Win32_LogicalDisk -Filter "DeviceID='C:'"
  if ($disk) {
    $diskUsed = [math]::Round($disk.UsedSpace / 1GB, 2)
    $diskTotal = [math]::Round($disk.Size / 1GB, 2)
    $diskPercent = [math]::Round(($disk.UsedSpace / $disk.Size) * 100, 2)
  } else {
    $diskUsed = 0
    $diskTotal = 0
    $diskPercent = 0
  }
  
  Write-Output "CPU=$cpu"
  Write-Output "RAM_USAGE=$memUsedPercent"
  Write-Output "RAM_TOTAL=$memTotalMB"
  Write-Output "RAM_USED=$memUsedMB"
  Write-Output "UPTIME=$uptimeSeconds"
  Write-Output "DISK_USED=$diskUsed"
  Write-Output "DISK_TOTAL=$diskTotal"
  Write-Output "DISK_PERCENT=$diskPercent"
} catch {
  Write-Error "Erreur PowerShell: $_"
  exit 1
}
      `;

      const result = await winrm.run(psScript);

      if (result.error) {
        throw new Error(`WinRM Error: ${result.error}`);
      }
      
      if (result.exitCode !== 0) {
        throw new Error(`PowerShell script failed with exit code ${result.exitCode}`);
      }

      // Parser la sortie
      const output = result.stdout;
      const metrics = {};

      const cpuMatch = output.match(/CPU=([\d.]+)/);
      const ramUsageMatch = output.match(/RAM_USAGE=([\d.]+)/);
      const ramTotalMatch = output.match(/RAM_TOTAL=([\d.]+)/);
      const ramUsedMatch = output.match(/RAM_USED=([\d.]+)/);
      const uptimeMatch = output.match(/UPTIME=([\d.]+)/);
      const diskUsedMatch = output.match(/DISK_USED=([\d.]+)/);
      const diskTotalMatch = output.match(/DISK_TOTAL=([\d.]+)/);
      const diskPercentMatch = output.match(/DISK_PERCENT=([\d.]+)/);

      if (cpuMatch) metrics.cpu = Math.round(parseFloat(cpuMatch[1]));
      if (ramUsageMatch) metrics.ram_usage = Math.round(parseFloat(ramUsageMatch[1]));
      if (ramTotalMatch) metrics.ram_total = Math.round(parseFloat(ramTotalMatch[1]));
      if (ramUsedMatch) metrics.ram_used = Math.round(parseFloat(ramUsedMatch[1]));
      if (uptimeMatch) {
        const seconds = parseFloat(uptimeMatch[1]);
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        metrics.uptime = `${days}d ${hours}h ${minutes}m`;
      }
      if (diskUsedMatch) metrics.disk_used = parseFloat(diskUsedMatch[1]);
      if (diskTotalMatch) metrics.disk_total = parseFloat(diskTotalMatch[1]);
      if (diskPercentMatch) metrics.disk_usage = Math.round(parseFloat(diskPercentMatch[1]));

      return metrics;
    } catch (error) {
      console.error(`Erreur WinRM pour ${ipAddress}:`, error.message);
      throw error;
    }
  }

  /**
   * Surveille un serveur Windows (méthode principale)
   */
  async monitorWindowsServer(serverConfig) {
    try {
      // 1. Vérifier la connectivité (ping)
      const connectivity = await this.checkConnectivity(serverConfig.ip_address);
      
      if (!connectivity.online) {
        return {
          status: 'offline',
          lastCheck: new Date().toISOString(),
          latency: null
        };
      }

      // 2. Récupérer les métriques (si credentials disponibles)
      let metrics = {};
      const credentials = getCredentialsFromStorage(serverConfig);
      
      if (credentials.username && credentials.password) {
        try {
          metrics = await this.getMetricsViaWinRM(
            serverConfig.ip_address,
            credentials.username,
            credentials.password
          );
        } catch (winrmError) {
          // WinRM échoué, on continue avec juste le ping
          // C'est OK pour la surveillance basique
          // Les métriques avancées ne seront pas disponibles
        }
      }

      // 3. Retourner les données complètes
      return {
        status: 'online',
        lastCheck: new Date().toISOString(),
        latency: connectivity.latency,
        cpu: metrics.cpu || null,
        ram_usage: metrics.ram_usage || null,
        ram_total: metrics.ram_total || null,
        ram_used: metrics.ram_used || null,
        disk_usage: metrics.disk_usage || null,
        disk_total: metrics.disk_total || null,
        disk_used: metrics.disk_used || null,
        uptime: metrics.uptime || null,
        packetLoss: connectivity.packetLoss || 0
      };
    } catch (error) {
      console.error(`Erreur lors de la surveillance du serveur ${serverConfig.ip_address}:`, error.message);
      return {
        status: 'error',
        lastCheck: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

