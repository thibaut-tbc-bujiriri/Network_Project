# 🖥️ Network Manager Backend - Surveillance des Équipements Physiques

Backend Node.js pour surveiller automatiquement les équipements physiques (routeurs/switches et serveurs Windows) et mettre à jour Supabase.

---

## 📁 Structure du Projet

```
backend/
├── src/
│   ├── index.js                      # Point d'entrée principal
│   ├── config/
│   │   └── supabase.js               # Configuration Supabase
│   ├── services/
│   │   ├── routerMonitor.js          # Surveillance routeurs/switches
│   │   ├── windowsMonitor.js         # Surveillance serveurs Windows
│   │   ├── supabaseService.js        # Service Supabase
│   │   └── monitoringScheduler.js    # Scheduler automatique
│   └── utils/
│       └── encryption.js             # Chiffrement des credentials
├── .env                              # Variables d'environnement (à créer)
├── .env.example                      # Exemple de configuration
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Installation

### 1. Installer les dépendances

```bash
cd backend
npm install
```

### 2. Configurer les variables d'environnement

Copiez `.env.example` vers `.env` et remplissez les valeurs :

```bash
cp .env.example .env
```

Modifiez `.env` avec vos valeurs :

```env
PORT=3000
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
ENCRYPTION_KEY=votre-clé-de-32-caractères
```

**⚠️ IMPORTANT :**
- `SUPABASE_SERVICE_ROLE_KEY` : Utilisez la **service_role** key (pas l'anon key) depuis Supabase → Settings → API
- `ENCRYPTION_KEY` : Générez une clé de 32 caractères :
  ```bash
  openssl rand -hex 16
  ```

### 3. Tester le backend

```bash
npm run dev
```

Vous devriez voir :
```
🚀 Network Manager Backend
📡 Port: 3000
✅ Scheduler de surveillance démarré (toutes les 60 secondes)
```

---

## 📊 Fonctionnalités

### ✅ Surveillance Automatique

- **Toutes les 60 secondes** : Ping de tous les équipements
- **Routeurs/Switches** : 
  - Ping (connectivité)
  - SSH (MikroTik - CPU, RAM, Uptime)
  - SNMP (Cisco/autres - CPU, RAM, Uptime)
- **Serveurs Windows** :
  - Ping (connectivité)
  - WinRM (CPU, RAM, Disque, Uptime)

### ✅ Mise à Jour Automatique

- Met à jour le statut (`online`/`offline`) dans Supabase
- Met à jour les métriques (CPU, RAM, disque, uptime)
- Met à jour `last_check` pour savoir quand la dernière vérification a eu lieu

### ✅ Sécurité

- Chiffrement AES-256-GCM des credentials
- Credentials stockés de manière sécurisée dans Supabase

---

## 🔧 Utilisation

### Mode Développement (avec rechargement automatique)

```bash
npm run dev
```

### Mode Production

```bash
npm start
```

### Endpoints API

- `GET /health` : Vérifier l'état du backend
- `POST /api/monitor/trigger` : Déclencher une surveillance manuelle

---

## 🔐 Configuration des Credentials des Équipements

### Pour les Routeurs

Dans Supabase, ajoutez les colonnes suivantes à la table `routeur_devices` :

```sql
ALTER TABLE routeur_devices 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS password_encrypted TEXT,
ADD COLUMN IF NOT EXISTS snmp_community TEXT DEFAULT 'public';
```

Ensuite, via l'interface frontend ou directement dans Supabase, ajoutez les credentials (ils seront automatiquement chiffrés si vous utilisez l'API frontend).

### Pour les Serveurs Windows

Dans Supabase, ajoutez les colonnes suivantes à la table `windows_servers` :

```sql
ALTER TABLE windows_servers 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS password_encrypted TEXT;
```

---

## 📈 Comment ça fonctionne avec le Frontend

```
┌─────────────────────────────────────┐
│  Frontend React (Votre app)        │
│  - Lit depuis Supabase              │
│  - Affiche les données              │
│  - ✅ AUCUNE MODIFICATION NÉCESSAIRE│
└──────────────┬──────────────────────┘
               │
               │ Lit les données (mises à jour)
               │
┌──────────────▼──────────────────────┐
│  Supabase (Base de données)        │
│  - routeur_devices (mis à jour)     │
│  - windows_servers (mis à jour)     │
└──────────────┬──────────────────────┘
               │
               │ Backend met à jour automatiquement
               │
┌──────────────▼──────────────────────┐
│  Backend (Ce projet)                │
│  - Surveille toutes les 60s         │
│  - Met à jour Supabase              │
└───────┬───────────────┬──────────────┘
        │               │
        │               │
┌───────▼──────┐  ┌─────▼──────────────┐
│  Routeurs/   │  │  Windows Servers   │
│  Switches    │  │                    │
└──────────────┘  └────────────────────┘
```

**Le frontend continue de fonctionner exactement comme avant !** Il lit simplement les données depuis Supabase qui sont maintenant mises à jour automatiquement par le backend.

---

## 🐳 Déploiement

### Option 1 : PM2 (Recommandé pour VPS)

```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer le backend
pm2 start src/index.js --name network-monitor

# Sauvegarder la configuration
pm2 save

# Configurer le démarrage automatique
pm2 startup
```

### Option 2 : Docker

**Dockerfile :**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
```

**docker-compose.yml :**

```yaml
version: '3.8'
services:
  network-monitor:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
```

Lancer avec Docker :

```bash
docker-compose up -d
```

### Option 3 : Systemd (Linux)

**`/etc/systemd/system/network-monitor.service` :**

```ini
[Unit]
Description=Network Manager Backend
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/backend
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Activer le service :

```bash
sudo systemctl enable network-monitor
sudo systemctl start network-monitor
```

---

## 🔍 Débogage

### Vérifier les logs

Les logs s'affichent dans la console. Exemple :

```
[2024-01-10 14:30:00] 🔍 Début de la surveillance...
  📡 Surveillance de 2 routeur(s)...
    🟢 Router Principal (192.168.1.1): online (CPU: 45%, RAM: 60%)
    🔴 Router Backup (192.168.1.2): offline
  🖥️  Surveillance de 1 serveur(s) Windows...
    🟢 DC-01 (192.168.1.10): online (CPU: 25%, RAM: 50%, Disk: 65%)
[2024-01-10 14:30:05] ✅ Surveillance terminée en 5.23s
```

### Tester manuellement une surveillance

```bash
curl -X POST http://localhost:3000/api/monitor/trigger
```

### Vérifier la santé du backend

```bash
curl http://localhost:3000/health
```

---

## ⚠️ Dépannage

### Problème : "Variables d'environnement Supabase manquantes"

**Solution :** Vérifiez que `.env` existe et contient `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`.

### Problème : "Permission denied" pour SSH/SNMP

**Solution :** Vérifiez que les credentials sont corrects et que les ports sont ouverts (22 pour SSH, 161 pour SNMP).

### Problème : "Connection timeout" pour WinRM

**Solution :** 
- Vérifiez que WinRM est activé sur le serveur Windows
- Vérifiez les credentials
- Essayez de changer le port (5985 pour HTTP, 5986 pour HTTPS)

### Problème : Les données ne se mettent pas à jour dans Supabase

**Solution :**
- Vérifiez que vous utilisez la **SERVICE_ROLE_KEY** (pas l'anon key)
- Vérifiez les logs du backend pour voir les erreurs
- Vérifiez que les tables existent dans Supabase

---

## 📚 Documentation Complète

Voir `GUIDE_SURVEILLANCE_EQUIPEMENTS.md` pour :
- Architecture détaillée
- Configuration avancée
- Intégration avec différents types d'équipements
- Surveillance SNMP avancée
- Alertes et notifications

---

## 🎯 Prochaines Étapes

1. ✅ Tester localement avec un équipement réel
2. ✅ Vérifier que les données se mettent à jour dans Supabase
3. ✅ Vérifier que le frontend affiche les nouvelles données
4. ✅ Déployer le backend sur un serveur
5. ✅ Configurer PM2 ou Docker pour le démarrage automatique
6. ✅ Ajouter des alertes (email, webhook, etc.)

---

*Backend prêt à l'emploi ! Le frontend n'a besoin d'aucune modification.* ✅

