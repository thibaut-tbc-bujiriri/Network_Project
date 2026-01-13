# 🖥️ Network Manager Backend

Backend Node.js pour surveiller automatiquement les équipements physiques (routeurs/switches et serveurs Windows) et mettre à jour Supabase.

---

## 🚀 Installation

### 1. Installer les dépendances

```bash
cd backend
npm install
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env` dans le dossier `backend/` :

```env
PORT=3000
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
ENCRYPTION_KEY=votre-clé-de-32-caractères
```

**⚠️ IMPORTANT :**
- `SUPABASE_SERVICE_ROLE_KEY` : Utilisez la **service_role** key (pas l'anon key) depuis Supabase → Settings → API
- `ENCRYPTION_KEY` : Générez une clé de 32+ caractères

### 3. Démarrer le backend

```bash
npm start
```

---

## 📊 Fonctionnalités

- ✅ Surveillance automatique toutes les 60 secondes
- ✅ Routeurs/Switches : Ping, SSH (MikroTik), SNMP (Cisco/autres)
- ✅ Serveurs Windows : Ping, WinRM (CPU, RAM, Disque, Uptime)
- ✅ Mise à jour automatique dans Supabase
- ✅ Logs automatiques dans Supabase et fichier local
- ✅ Chiffrement AES-256-GCM des credentials

---

## 🔧 Utilisation

### Mode Production

```bash
npm start
```

### Mode Développement (avec rechargement automatique)

```bash
npm run dev
```

### Endpoints API

- `GET /health` : Vérifier l'état du backend

---

## 📁 Structure

```
backend/
├── src/
│   ├── index.js                      # Point d'entrée
│   ├── config/
│   │   └── supabase.js               # Configuration Supabase
│   ├── services/
│   │   ├── routerMonitor.js          # Surveillance routeurs
│   │   ├── windowsMonitor.js         # Surveillance serveurs Windows
│   │   ├── supabaseService.js        # Service Supabase
│   │   ├── monitoringScheduler.js    # Scheduler automatique
│   │   └── logService.js             # Service de logging
│   └── utils/
│       └── encryption.js             # Chiffrement des credentials
├── logs/
│   └── surveillance.log              # Logs locaux
├── .env                              # Variables d'environnement
├── package.json
└── README.md
```

---

## 🐳 Déploiement avec PM2

```bash
# Installer PM2
npm install -g pm2

# Démarrer
pm2 start src/index.js --name network-monitor

# Sauvegarder
pm2 save

# Démarrage automatique
pm2 startup
```

---

## ⚠️ Dépannage

### Variables d'environnement manquantes

Vérifiez que `.env` existe et contient `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`.

### Les données ne se mettent pas à jour

- Vérifiez que vous utilisez la **SERVICE_ROLE_KEY** (pas l'anon key)
- Vérifiez les logs du backend
- Vérifiez que les tables existent dans Supabase

---

*Backend prêt à l'emploi ! Le frontend n'a besoin d'aucune modification.* ✅
