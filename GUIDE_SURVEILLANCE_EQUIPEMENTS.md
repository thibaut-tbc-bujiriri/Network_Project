# 🖥️ Guide d'Implémentation : Surveillance des Équipements Physiques

Ce guide vous explique comment implémenter la surveillance en temps réel des équipements physiques (routeurs/switches et serveurs Windows) dans votre application Network Manager.

---

## 📋 Vue d'Ensemble de l'Architecture

Pour surveiller des équipements physiques, vous avez besoin de **3 composants principaux** :

```
┌─────────────────────────────────────────────────────────┐
│  Frontend React (Votre application actuelle)            │
│  - Affiche les données                                   │
│  - Interface utilisateur                                 │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS/REST
┌────────────────────▼────────────────────────────────────┐
│  Backend API (À CRÉER - Node.js/Python)                 │
│  - Collecte les données des équipements                 │
│  - Stocke dans Supabase                                  │
│  - Gère l'authentification                               │
└─────┬──────────────────────┬────────────────────────────┘
      │                      │
┌─────▼─────────┐    ┌───────▼──────────────┐
│ Agent/Script  │    │  Agent/Script        │
│ Routeur/Switch│    │  Windows Server      │
└─────┬─────────┘    └───────┬──────────────┘
      │                      │
┌─────▼─────────┐    ┌───────▼──────────────┐
│ Routeur/Switch│    │  Windows Server      │
│   Physique    │    │     Physique         │
└───────────────┘    └──────────────────────┘
```

---

## 🏗️ Option 1 : Architecture Simple (Recommandée pour commencer)

### Architecture : Backend Node.js + Scripts de Surveillance

Cette architecture utilise un **backend Node.js** qui exécute des scripts pour interroger les équipements directement.

---

## 📝 Étape 1 : Créer le Backend API (Node.js + Express)

### 1.1 Initialiser le projet backend

Créez un nouveau dossier `backend` dans votre projet ou dans un repository séparé :

```bash
mkdir network-manager-backend
cd network-manager-backend
npm init -y
```

### 1.2 Installer les dépendances

```bash
npm install express cors dotenv node-cron
npm install @supabase/supabase-js
npm install ping winrm net-snmp ssh2
npm install --save-dev nodemon
```

### 1.3 Structure des dossiers

```
backend/
├── src/
│   ├── index.js                 # Point d'entrée
│   ├── routes/
│   │   ├── devices.js          # Routes pour les équipements
│   │   └── monitoring.js       # Routes pour la surveillance
│   ├── services/
│   │   ├── routerMonitor.js    # Service de surveillance routeur
│   │   ├── windowsMonitor.js   # Service de surveillance Windows
│   │   └── supabaseService.js  # Service Supabase
│   ├── utils/
│   │   └── logger.js           # Utilitaire de logging
│   └── config/
│       └── supabase.js         # Configuration Supabase
├── .env
├── .gitignore
└── package.json
```

---

## 📝 Étape 2 : Configuration du Backend

### 2.1 Fichier `package.json`

```json
{
  "name": "network-manager-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "node-cron": "^3.0.3",
    "@supabase/supabase-js": "^2.39.0",
    "ping": "^0.4.4",
    "winrm": "^0.5.0",
    "net-snmp": "^3.9.0",
    "ssh2": "^1.14.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### 2.2 Fichier `.env`

```env
# Port du serveur
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key

# Configuration CORS
FRONTEND_URL=https://votre-app.vercel.app

# Configuration Surveillance (optionnel)
MONITORING_INTERVAL=60000  # 1 minute en millisecondes
```

### 2.3 Fichier `src/config/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables d\'environnement Supabase manquantes');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

---

## 📝 Étape 3 : Service de Surveillance pour Routeurs/Switches

### 3.1 Fichier `src/services/routerMonitor.js`

```javascript
import ping from 'ping';
import { createConnection } from 'ssh2';

/**
 * Surveille un routeur via SSH (ex: MikroTik, Cisco)
 */
export class RouterMonitor {
  /**
   * Vérifie si un routeur est en ligne (ping)
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
      console.error(`Erreur ping pour ${ipAddress}:`, error);
      return { online: false, latency: null, packetLoss: 100 };
    }
  }

  /**
   * Récupère les métriques d'un routeur MikroTik via SSH
   */
  async getMikroTikMetrics(ipAddress, username, password) {
    return new Promise((resolve, reject) => {
      const conn = new createConnection({
        host: ipAddress,
        username: username,
        password: password,
        port: 22,
        readyTimeout: 5000
      });

      const metrics = {
        cpu: null,
        memory: null,
        uptime: null,
        interfaces: []
      };

      conn.on('ready', () => {
        // Récupérer les ressources système
        conn.exec('/system resource print', (err, stream) => {
          if (err) {
            conn.end();
            reject(err);
            return;
          }

          let output = '';
          stream.on('close', () => {
            // Parser la sortie pour extraire CPU, RAM, etc.
            const cpuMatch = output.match(/cpu-load:\s*(\d+)%/i);
            const memoryMatch = output.match(/free-memory:\s*(\d+)/i);
            const totalMemoryMatch = output.match(/total-memory:\s*(\d+)/i);
            const uptimeMatch = output.match(/uptime:\s*([^\n]+)/i);

            if (cpuMatch) metrics.cpu = parseInt(cpuMatch[1]);
            if (memoryMatch && totalMemoryMatch) {
              const free = parseInt(memoryMatch[1]);
              const total = parseInt(totalMemoryMatch[1]);
              metrics.memory = {
                used: total - free,
                total: total,
                percentage: Math.round(((total - free) / total) * 100)
              };
            }
            if (uptimeMatch) metrics.uptime = uptimeMatch[1].trim();

            conn.end();
            
            // Récupérer les interfaces réseau
            this.getInterfaces(conn, ipAddress, username, password)
              .then(interfaces => {
                metrics.interfaces = interfaces;
                resolve(metrics);
              })
              .catch(() => resolve(metrics)); // Retourner même sans interfaces
          });

          stream.on('data', (data) => {
            output += data.toString();
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
   * Récupère les interfaces réseau
   */
  async getInterfaces(conn, ipAddress, username, password) {
    // Implémentation pour récupérer les interfaces
    // Cela dépend du type de routeur
    return [];
  }

  /**
   * Surveille un routeur (méthode principale)
   */
  async monitorRouter(routerConfig) {
    try {
      // 1. Vérifier la connectivité
      const connectivity = await this.checkConnectivity(routerConfig.ip_address);
      
      if (!connectivity.online) {
        return {
          status: 'offline',
          lastCheck: new Date().toISOString(),
          latency: null
        };
      }

      // 2. Récupérer les métriques (si credentials disponibles)
      let metrics = {};
      if (routerConfig.username && routerConfig.password) {
        try {
          metrics = await this.getMikroTikMetrics(
            routerConfig.ip_address,
            routerConfig.username,
            routerConfig.password
          );
        } catch (error) {
          console.error(`Erreur lors de la récupération des métriques:`, error);
          // Continuer avec seulement le ping si les métriques échouent
        }
      }

      // 3. Retourner les données complètes
      return {
        status: 'online',
        lastCheck: new Date().toISOString(),
        latency: connectivity.latency,
        cpu: metrics.cpu || null,
        ram_usage: metrics.memory?.percentage || null,
        ram_total: metrics.memory?.total || null,
        ram_used: metrics.memory?.used || null,
        uptime: metrics.uptime || null,
        packetLoss: connectivity.packetLoss || 0
      };
    } catch (error) {
      console.error(`Erreur lors de la surveillance du routeur ${routerConfig.ip_address}:`, error);
      return {
        status: 'error',
        lastCheck: new Date().toISOString(),
        error: error.message
      };
    }
  }
}
```

### 3.2 Surveillance via SNMP (pour les switches Cisco, etc.)

```javascript
import * as snmp from 'net-snmp';

export class SNMPMonitor {
  /**
   * Récupère les métriques via SNMP
   */
  async getSNMPMetrics(ipAddress, community = 'public') {
    return new Promise((resolve, reject) => {
      const session = snmp.createSession(ipAddress, community);

      // OIDs SNMP standards
      const oids = [
        '1.3.6.1.2.1.1.3.0',  // sysUpTime
        '1.3.6.1.2.1.25.3.3.1.2',  // CPU usage (HOST-RESOURCES-MIB)
        '1.3.6.1.2.1.25.2.3.1.5',  // Memory size
        '1.3.6.1.2.1.25.2.3.1.6',  // Memory used
      ];

      session.get(oids, (error, varbinds) => {
        session.close();

        if (error) {
          reject(error);
          return;
        }

        const metrics = {
          uptime: varbinds[0].value,
          cpu: varbinds[1]?.value || null,
          memory: {
            total: varbinds[2]?.value || null,
            used: varbinds[3]?.value || null
          }
        };

        resolve(metrics);
      });
    });
  }

  async monitorDevice(ipAddress, community) {
    try {
      const metrics = await this.getSNMPMetrics(ipAddress, community);
      return {
        status: 'online',
        lastCheck: new Date().toISOString(),
        uptime: metrics.uptime,
        cpu: metrics.cpu,
        ram_total: metrics.memory.total,
        ram_used: metrics.memory.used,
        ram_usage: metrics.memory.total 
          ? Math.round((metrics.memory.used / metrics.memory.total) * 100)
          : null
      };
    } catch (error) {
      return {
        status: 'error',
        lastCheck: new Date().toISOString(),
        error: error.message
      };
    }
  }
}
```

---

## 📝 Étape 4 : Service de Surveillance pour Serveurs Windows

### 4.1 Fichier `src/services/windowsMonitor.js`

```javascript
import ping from 'ping';
import { WinRM } from 'winrm';

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
        latency: result.time ? parseFloat(result.time) : null
      };
    } catch (error) {
      return { online: false, latency: null };
    }
  }

  /**
   * Récupère les métriques Windows via WinRM
   */
  async getWindowsMetrics(ipAddress, username, password) {
    try {
      const winrm = new WinRM({
        host: ipAddress,
        username: username,
        password: password,
        port: 5985, // Ou 5986 pour HTTPS
        protocol: 'http' // Ou 'https'
      });

      // Commandes PowerShell pour récupérer les métriques
      const commands = [
        // CPU
        'Get-CimInstance Win32_Processor | Measure-Object -property LoadPercentage -Average | Select-Object -ExpandProperty Average',
        // RAM
        '$mem = Get-CimInstance Win32_OperatingSystem; [math]::Round((($mem.TotalVisibleMemorySize - $mem.FreePhysicalMemory) / $mem.TotalVisibleMemorySize) * 100, 2)',
        // RAM Total (GB)
        '(Get-CimInstance Win32_OperatingSystem).TotalVisibleMemorySize / 1MB',
        // RAM Utilisée (GB)
        '((Get-CimInstance Win32_OperatingSystem).TotalVisibleMemorySize - (Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory) / 1MB',
        // Uptime
        '(Get-CimInstance Win32_OperatingSystem).LastBootUpTime',
        // Disque
        'Get-CimInstance Win32_LogicalDisk -Filter "DeviceID=\'C:\'" | Select-Object @{Name="UsedGB";Expression={[math]::Round($_.UsedSpace/1GB,2)}}, @{Name="TotalGB";Expression={[math]::Round($_.Size/1GB,2)}}, @{Name="PercentFree";Expression={[math]::Round(($_.FreeSpace/$_.Size)*100,2)}}'
      ];

      const results = await Promise.all(
        commands.map(cmd => winrm.run(cmd))
      );

      // Parser les résultats
      const cpu = parseFloat(results[0].stdout.trim()) || 0;
      const ramUsage = parseFloat(results[1].stdout.trim()) || 0;
      const ramTotal = parseFloat(results[2].stdout.trim()) || 0;
      const ramUsed = parseFloat(results[3].stdout.trim()) || 0;
      const uptime = results[4].stdout.trim();
      const diskInfo = results[5].stdout;

      // Parser les informations disque
      const diskUsedMatch = diskInfo.match(/UsedGB\s+:\s*([\d.]+)/);
      const diskTotalMatch = diskInfo.match(/TotalGB\s+:\s*([\d.]+)/);
      const diskPercentMatch = diskInfo.match(/PercentFree\s+:\s*([\d.]+)/);

      return {
        cpu: Math.round(cpu),
        ram_usage: Math.round(ramUsage),
        ram_total: Math.round(ramTotal),
        ram_used: Math.round(ramUsed),
        disk_used: diskUsedMatch ? parseFloat(diskUsedMatch[1]) : null,
        disk_total: diskTotalMatch ? parseFloat(diskTotalMatch[1]) : null,
        disk_usage: diskPercentMatch ? Math.round(100 - parseFloat(diskPercentMatch[1])) : null,
        uptime: uptime
      };
    } catch (error) {
      console.error(`Erreur WinRM pour ${ipAddress}:`, error);
      throw error;
    }
  }

  /**
   * Surveille un serveur Windows
   */
  async monitorWindowsServer(serverConfig) {
    try {
      // 1. Vérifier la connectivité
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
      if (serverConfig.username && serverConfig.password) {
        try {
          metrics = await this.getWindowsMetrics(
            serverConfig.ip_address,
            serverConfig.username,
            serverConfig.password
          );
        } catch (error) {
          console.error(`Erreur lors de la récupération des métriques Windows:`, error);
          // Continuer avec seulement le ping
        }
      }

      // 3. Retourner les données
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
        uptime: metrics.uptime || null
      };
    } catch (error) {
      console.error(`Erreur lors de la surveillance du serveur ${serverConfig.ip_address}:`, error);
      return {
        status: 'error',
        lastCheck: new Date().toISOString(),
        error: error.message
      };
    }
  }
}
```

---

## 📝 Étape 5 : Service Supabase pour Mise à Jour

### 5.1 Fichier `src/services/supabaseService.js`

```javascript
import { supabase } from '../config/supabase.js';

export class SupabaseService {
  /**
   * Met à jour le statut d'un routeur
   */
  async updateRouterStatus(routerId, monitoringData) {
    try {
      const { data, error } = await supabase
        .from('routeur_devices')
        .update({
          status: monitoringData.status,
          last_check: monitoringData.lastCheck,
          cpu_usage: monitoringData.cpu,
          ram_usage: monitoringData.ram_usage,
          ram_total: monitoringData.ram_total,
          ram_used: monitoringData.ram_used,
          uptime: monitoringData.uptime,
          updated_at: new Date().toISOString()
        })
        .eq('id', routerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du routeur ${routerId}:`, error);
      throw error;
    }
  }

  /**
   * Met à jour le statut d'un serveur Windows
   */
  async updateWindowsServerStatus(serverId, monitoringData) {
    try {
      const { data, error } = await supabase
        .from('windows_servers')
        .update({
          status: monitoringData.status,
          last_check: monitoringData.lastCheck,
          cpu_usage: monitoringData.cpu,
          ram_usage: monitoringData.ram_usage,
          ram_total: monitoringData.ram_total,
          ram_used: monitoringData.ram_used,
          disk_usage: monitoringData.disk_usage,
          disk_total: monitoringData.disk_total,
          disk_used: monitoringData.disk_used,
          uptime: monitoringData.uptime,
          updated_at: new Date().toISOString()
        })
        .eq('id', serverId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du serveur ${serverId}:`, error);
      throw error;
    }
  }

  /**
   * Récupère tous les routeurs à surveiller
   */
  async getAllRouters() {
    const { data, error } = await supabase
      .from('routeur_devices')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  /**
   * Récupère tous les serveurs Windows à surveiller
   */
  async getAllWindowsServers() {
    const { data, error } = await supabase
      .from('windows_servers')
      .select('*');

    if (error) throw error;
    return data || [];
  }
}
```

---

## 📝 Étape 6 : Scheduler pour Surveillance Automatique

### 6.1 Fichier `src/services/monitoringScheduler.js`

```javascript
import cron from 'node-cron';
import { RouterMonitor } from './routerMonitor.js';
import { WindowsMonitor } from './windowsMonitor.js';
import { SupabaseService } from './supabaseService.js';

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
      console.log('Surveillance déjà en cours, skip...');
      return;
    }

    this.isRunning = true;
    console.log(`[${new Date().toISOString()}] Début de la surveillance...`);

    try {
      // Surveiller tous les routeurs
      await this.monitorAllRouters();

      // Surveiller tous les serveurs Windows
      await this.monitorAllWindowsServers();

      console.log(`[${new Date().toISOString()}] Surveillance terminée.`);
    } catch (error) {
      console.error('Erreur lors de la surveillance:', error);
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
      console.log(`Surveillance de ${routers.length} routeur(s)...`);

      const promises = routers.map(async (router) => {
        try {
          // Récupérer les credentials (à stocker de manière sécurisée)
          // Pour l'instant, on utilise des valeurs par défaut
          const credentials = {
            username: router.username || null,
            password: router.password || null // ⚠️ À chiffrer dans la base de données
          };

          const routerConfig = {
            ...router,
            ...credentials
          };

          const monitoringData = await this.routerMonitor.monitorRouter(routerConfig);
          
          // Mettre à jour dans Supabase
          await this.supabaseService.updateRouterStatus(router.id, monitoringData);
          
          console.log(`✅ Routeur ${router.name} (${router.ip_address}): ${monitoringData.status}`);
        } catch (error) {
          console.error(`❌ Erreur routeur ${router.name}:`, error.message);
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Erreur lors de la surveillance des routeurs:', error);
    }
  }

  /**
   * Surveille tous les serveurs Windows
   */
  async monitorAllWindowsServers() {
    try {
      const servers = await this.supabaseService.getAllWindowsServers();
      console.log(`Surveillance de ${servers.length} serveur(s) Windows...`);

      const promises = servers.map(async (server) => {
        try {
          const credentials = {
            username: server.username || null,
            password: server.password || null // ⚠️ À chiffrer
          };

          const serverConfig = {
            ...server,
            ...credentials
          };

          const monitoringData = await this.windowsMonitor.monitorWindowsServer(serverConfig);
          
          // Mettre à jour dans Supabase
          await this.supabaseService.updateWindowsServerStatus(server.id, monitoringData);
          
          console.log(`✅ Serveur ${server.name} (${server.ip_address}): ${monitoringData.status}`);
        } catch (error) {
          console.error(`❌ Erreur serveur ${server.name}:`, error.message);
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Erreur lors de la surveillance des serveurs Windows:', error);
    }
  }

  /**
   * Démarre le scheduler
   */
  start() {
    // Surveiller toutes les minutes
    cron.schedule('* * * * *', () => {
      this.monitorAllDevices();
    });

    // Surveiller immédiatement au démarrage
    this.monitorAllDevices();

    console.log('✅ Scheduler de surveillance démarré (toutes les minutes)');
  }

  /**
   * Arrête le scheduler
   */
  stop() {
    // Arrêter toutes les tâches cron
    cron.getTasks().forEach(task => task.stop());
    console.log('⏹️ Scheduler arrêté');
  }
}
```

---

## 📝 Étape 7 : Point d'Entrée du Backend

### 7.1 Fichier `src/index.js`

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MonitoringScheduler } from './services/monitoringScheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Network Manager Backend'
  });
});

// Démarrage du scheduler de surveillance
const scheduler = new MonitoringScheduler();
scheduler.start();

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Backend démarré sur le port ${PORT}`);
  console.log(`📊 Surveillance des équipements activée`);
});
```

---

## 📝 Étape 8 : Stockage Sécurisé des Credentials

### 8.1 Chiffrer les mots de passe dans la base de données

**⚠️ IMPORTANT :** Ne stockez JAMAIS les mots de passe en clair !

Ajoutez des colonnes dans vos tables pour stocker les credentials chiffrés :

```sql
-- Pour routeur_devices
ALTER TABLE routeur_devices 
ADD COLUMN username TEXT,
ADD COLUMN password_encrypted TEXT; -- Mots de passe chiffrés

-- Pour windows_servers
ALTER TABLE windows_servers 
ADD COLUMN username TEXT,
ADD COLUMN password_encrypted TEXT;
```

### 8.2 Utilitaire de chiffrement (exemple avec crypto)

```javascript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 caractères
const ALGORITHM = 'aes-256-gcm';

export function encryptPassword(password) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

export function decryptPassword(encryptedData) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

---

## 📝 Étape 9 : Déploiement du Backend

### Option A : Déployer sur Vercel (avec Serverless Functions)

1. Créer un dossier `api/` dans votre projet
2. Convertir les services en fonctions serverless
3. Utiliser Vercel Cron Jobs pour la surveillance

### Option B : Déployer sur un serveur dédié (Recommandé)

1. Utiliser un VPS (DigitalOcean, AWS, Azure, etc.)
2. Installer Node.js
3. Utiliser PM2 pour gérer le processus :
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name network-monitor
   pm2 save
   pm2 startup
   ```

### Option C : Utiliser Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
```

---

## 🔐 Sécurité et Bonnes Pratiques

### 1. Chiffrement des Credentials
- ⚠️ Ne JAMAIS stocker les mots de passe en clair
- Utiliser AES-256-GCM ou bcrypt pour le chiffrement
- Stocker les clés de chiffrement dans des variables d'environnement

### 2. Authentification API
- Ajouter une authentification JWT pour protéger l'API
- Limiter les taux de requêtes (rate limiting)
- Utiliser HTTPS uniquement

### 3. Gestion des Erreurs
- Logger toutes les erreurs
- Ne pas exposer d'informations sensibles dans les messages d'erreur
- Implémenter des retries avec backoff exponentiel

---

## 🚀 Prochaines Étapes

1. ✅ Créer le backend avec la structure ci-dessus
2. ✅ Tester localement avec un équipement réel
3. ✅ Configurer le stockage sécurisé des credentials
4. ✅ Déployer le backend
5. ✅ Intégrer avec le frontend (les données seront déjà dans Supabase)
6. ✅ Ajouter des alertes (email, webhook, etc.)

---

## 📚 Ressources

- [Node.js Documentation](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [SNMP Documentation](https://www.net-snmp.org/)
- [WinRM Documentation](https://github.com/node-winrm/node-winrm)

---

*Ce guide vous donne la base pour implémenter la surveillance des équipements physiques. Adaptez-le selon vos besoins spécifiques.*

