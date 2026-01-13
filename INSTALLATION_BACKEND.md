# 📋 Guide d'Installation du Backend - Surveillance des Équipements

Ce guide vous explique étape par étape comment installer et configurer le backend pour surveiller vos équipements physiques.

---

## ✅ Prérequis

- ✅ Node.js 18+ installé
- ✅ Projet Supabase configuré
- ✅ Tables `routeur_devices` et `windows_servers` créées dans Supabase
- ✅ Accès réseau aux équipements à surveiller

---

## 📦 Étape 1 : Installation

### 1.1 Naviguer dans le dossier backend

```bash
cd backend
```

### 1.2 Installer les dépendances

```bash
npm install
```

Cela installera toutes les dépendances nécessaires :
- `express` : Serveur HTTP
- `node-cron` : Scheduler pour la surveillance automatique
- `@supabase/supabase-js` : Client Supabase
- `ping` : Pour vérifier la connectivité
- `ssh2` : Pour SSH (MikroTik, Cisco)
- `net-snmp` : Pour SNMP (Cisco, HP, etc.)
- `winrm` : Pour WinRM (Windows Server)

---

## ⚙️ Étape 2 : Configuration

### 2.1 Créer le fichier `.env`

```bash
cp .env.example .env
```

### 2.2 Configurer les variables d'environnement

Ouvrez `.env` et configurez :

```env
# Port du serveur
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key

# Clé de chiffrement (générer avec: openssl rand -hex 16)
ENCRYPTION_KEY=votre-clé-de-32-caractères-hex
```

**🔑 Comment obtenir les clés Supabase :**

1. Allez dans Supabase → **Project Settings** → **API**
2. **SUPABASE_URL** : Copiez "Project URL"
3. **SUPABASE_SERVICE_ROLE_KEY** : ⚠️ Copiez la clé **"service_role"** (pas l'anon key !)

**🔐 Générer la clé de chiffrement :**

```bash
# Linux/Mac
openssl rand -hex 16

# Windows (PowerShell)
[System.Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(16))
```

Cela générera une clé de 32 caractères (ex: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

---

## 🗄️ Étape 3 : Préparer la Base de Données

### 3.1 Ajouter les colonnes pour les credentials

Dans Supabase SQL Editor, exécutez :

```sql
-- Pour routeur_devices
ALTER TABLE routeur_devices 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS password_encrypted TEXT,
ADD COLUMN IF NOT EXISTS snmp_community TEXT DEFAULT 'public';

-- Pour windows_servers
ALTER TABLE windows_servers 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS password_encrypted TEXT;
```

### 3.2 Vérifier que les colonnes de métriques existent

Assurez-vous que ces colonnes existent dans `routeur_devices` :
- `cpu_usage` (DECIMAL)
- `ram_usage` (DECIMAL)
- `ram_total` (BIGINT)
- `ram_used` (BIGINT)
- `uptime` (INTERVAL ou TEXT)
- `last_check` (TIMESTAMP)

Et dans `windows_servers` :
- `cpu_usage` (DECIMAL)
- `ram_usage` (DECIMAL)
- `ram_total` (BIGINT)
- `ram_used` (BIGINT)
- `disk_usage` (DECIMAL)
- `disk_total` (BIGINT)
- `disk_used` (BIGINT)
- `uptime` (INTERVAL ou TEXT)
- `last_check` (TIMESTAMP)

Si elles n'existent pas, le script `DATABASE_SCHEMA.sql` les a déjà créées.

---

## 🧪 Étape 4 : Tester Localement

### 4.1 Démarrer le backend en mode développement

```bash
npm run dev
```

Vous devriez voir :

```
═══════════════════════════════════════════════════════
🚀 Network Manager Backend
═══════════════════════════════════════════════════════
📡 Port: 3000
🌐 Health check: http://localhost:3000/health
📊 Surveillance: Automatique toutes les 60 secondes
═══════════════════════════════════════════════════════

✅ Client Supabase configuré
✅ Scheduler de surveillance démarré (toutes les 60 secondes)

[2024-01-10 14:30:00] 🔍 Début de la surveillance...
```

### 4.2 Vérifier que ça fonctionne

Dans un autre terminal :

```bash
# Vérifier la santé
curl http://localhost:3000/health

# Déclencher une surveillance manuelle
curl -X POST http://localhost:3000/api/monitor/trigger
```

### 4.3 Vérifier dans Supabase

1. Allez dans Supabase → **Table Editor** → `routeur_devices`
2. Vérifiez que les colonnes `status`, `last_check`, `cpu_usage`, etc. sont mises à jour

---

## 🔐 Étape 5 : Configurer les Credentials (Optionnel)

Pour surveiller avec SSH/SNMP/WinRM (pas seulement ping), vous devez ajouter les credentials.

### Option A : Via l'interface frontend (Recommandé)

1. Connectez-vous à votre application frontend
2. Allez dans "Routeurs" ou "Serveurs Windows"
3. Modifiez un équipement
4. Ajoutez les champs :
   - **Username** : Nom d'utilisateur
   - **Password** : Mot de passe (sera automatiquement chiffré)

### Option B : Directement dans Supabase

⚠️ **IMPORTANT** : Les mots de passe doivent être chiffrés ! Utilisez une fonction de chiffrement ou configurez-les via l'interface frontend.

---

## 🚀 Étape 6 : Déploiement en Production

### Option 1 : PM2 (Recommandé pour VPS)

```bash
# Installer PM2 globalement
npm install -g pm2

# Créer le dossier logs
mkdir -p logs

# Démarrer avec PM2
pm2 start ecosystem.config.js

# Sauvegarder la configuration
pm2 save

# Configurer le démarrage automatique
pm2 startup
# Suivez les instructions affichées
```

**Commandes PM2 utiles :**

```bash
pm2 status              # Voir l'état
pm2 logs network-monitor # Voir les logs
pm2 restart network-monitor # Redémarrer
pm2 stop network-monitor    # Arrêter
pm2 monit              # Monitorer en temps réel
```

### Option 2 : Docker

```bash
# Construire l'image
docker build -t network-monitor-backend .

# Créer le fichier .env pour Docker
cp .env.example .env
# Modifiez .env avec vos valeurs

# Lancer avec docker-compose
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

### Option 3 : Systemd (Linux)

Créez le fichier `/etc/systemd/system/network-monitor.service` :

```ini
[Unit]
Description=Network Manager Backend
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/chemin/vers/backend
ExecStart=/usr/bin/node /chemin/vers/backend/src/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/chemin/vers/backend/.env

[Install]
WantedBy=multi-user.target
```

Puis :

```bash
sudo systemctl daemon-reload
sudo systemctl enable network-monitor
sudo systemctl start network-monitor
sudo systemctl status network-monitor
```

---

## ✅ Vérification Finale

### Checklist :

- [ ] Backend démarré sans erreurs
- [ ] Variables d'environnement configurées
- [ ] Connexion à Supabase fonctionne
- [ ] Surveillance automatique active (logs toutes les 60s)
- [ ] Les équipements sont surveillés (ping au minimum)
- [ ] Les données sont mises à jour dans Supabase
- [ ] Le frontend affiche les nouvelles données

---

## 🔍 Dépannage

### Le backend ne démarre pas

**Vérifiez :**
- Node.js 18+ installé : `node --version`
- Dépendances installées : `npm install`
- Fichier `.env` présent et configuré

### Erreur "Variables d'environnement Supabase manquantes"

**Solution :** Vérifiez que `.env` contient `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`

### Aucun équipement surveillé

**Vérifiez :**
- Que des équipements existent dans Supabase (tables `routeur_devices` ou `windows_servers`)
- Que les équipements ont une `ip_address` valide
- Les logs du backend pour voir les erreurs

### Les métriques (CPU, RAM) ne sont pas récupérées

**Causes possibles :**
- Pas de credentials configurés (SSH/SNMP/WinRM ne peut pas fonctionner)
- Ports bloqués (22 pour SSH, 161 pour SNMP, 5985 pour WinRM)
- Credentials incorrects
- Équipement ne supporte pas la méthode (ex: SNMP non activé)

**Solution :** Au minimum, le ping fonctionnera et mettra à jour le statut. Les métriques avancées nécessitent les credentials.

---

## 📊 Monitoring et Logs

### Voir les logs en temps réel

```bash
# PM2
pm2 logs network-monitor --lines 100

# Docker
docker-compose logs -f

# Systemd
journalctl -u network-monitor -f
```

### Logs typiques

```
[2024-01-10 14:30:00] 🔍 Début de la surveillance...
  📡 Surveillance de 2 routeur(s)...
    🟢 Router Principal (192.168.1.1): online (CPU: 45%, RAM: 60%)
    🔴 Router Backup (192.168.1.2): offline
  🖥️  Surveillance de 1 serveur(s) Windows...
    🟢 DC-01 (192.168.1.10): online (CPU: 25%, RAM: 50%, Disk: 65%)
[2024-01-10 14:30:05] ✅ Surveillance terminée en 5.23s
```

---

## 🎯 Prochaines Étapes

1. ✅ **Tester localement** avec un équipement réel
2. ✅ **Vérifier dans Supabase** que les données se mettent à jour
3. ✅ **Vérifier dans le frontend** que les nouvelles données s'affichent
4. ✅ **Déployer en production** (PM2, Docker, ou Systemd)
5. ⏭️ **Configurer les credentials** pour les métriques avancées
6. ⏭️ **Ajouter des alertes** (email, webhook, etc.)

---

**Le backend est maintenant prêt ! Votre frontend React continuera de fonctionner exactement comme avant, mais les données seront maintenant mises à jour automatiquement.** ✅

