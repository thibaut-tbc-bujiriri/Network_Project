# 🔧 Configuration du Fichier .env

## 📋 Étapes de Configuration

### 1. Créer le fichier `.env`

Dans le dossier `backend/`, créez un fichier nommé `.env` (sans extension).

**Windows PowerShell :**
```powershell
cd backend
New-Item -Path .env -ItemType File
```

**Windows CMD :**
```cmd
cd backend
type nul > .env
```

**Linux/Mac :**
```bash
cd backend
touch .env
```

### 2. Remplir les variables d'environnement

Ouvrez le fichier `.env` et copiez le contenu suivant, puis remplacez les valeurs :

```env
PORT=3000
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key-ici
ENCRYPTION_KEY=votre-cle-de-chiffrement-32-caracteres-minimum
```

---

## 🔑 Où Trouver les Valeurs

### SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Copiez :
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (⚠️ **PAS** l'anon key) → `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ IMPORTANT :**
- Utilisez la **SERVICE_ROLE_KEY** (pas l'anon key)
- Cette clé permet un accès complet à la base de données
- **Ne jamais** exposer cette clé côté frontend ou dans le code source

### ENCRYPTION_KEY

Générez une clé de chiffrement de 32 caractères minimum :

**Windows PowerShell :**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Linux/Mac :**
```bash
openssl rand -hex 32
```

**En ligne :**
- https://randomkeygen.com/ (utilisez "CodeIgniter Encryption Keys")

**Exemple de clé :**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

## 📝 Exemple de Fichier .env Complet

```env
# Port du serveur
PORT=3000

# Configuration Supabase
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Clé de chiffrement (32+ caractères)
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Configuration WinRM (optionnel)
WINRM_PORT=5985
WINRM_PROTOCOL=http

# Configuration SSH (optionnel)
SSH_READY_TIMEOUT=5000

# Configuration SNMP (optionnel)
SNMP_TIMEOUT=3000
SNMP_COMMUNITY=public
```

---

## ✅ Vérification

Après avoir créé le fichier `.env`, testez le démarrage :

```bash
npm start
```

Vous devriez voir :
```
✅ Client Supabase configuré
✅ Scheduler de surveillance démarré (toutes les 60 secondes)
```

Si vous voyez une erreur, vérifiez que :
- ✅ Le fichier `.env` est bien dans le dossier `backend/`
- ✅ Les valeurs sont correctes (pas d'espaces avant/après)
- ✅ Vous utilisez la **SERVICE_ROLE_KEY** (pas l'anon key)

---

## 🔒 Sécurité

**⚠️ IMPORTANT :**
- Le fichier `.env` contient des informations sensibles
- **Ne jamais** commiter le fichier `.env` dans Git
- Le fichier `.env` est déjà dans `.gitignore`
- Ne partagez jamais votre `SERVICE_ROLE_KEY` ou `ENCRYPTION_KEY`

---

## 🆘 Dépannage

### Erreur : "Variables d'environnement Supabase manquantes"

**Solution :**
1. Vérifiez que le fichier `.env` existe dans `backend/`
2. Vérifiez que les noms des variables sont corrects :
   - `SUPABASE_URL` (pas `VITE_SUPABASE_URL`)
   - `SUPABASE_SERVICE_ROLE_KEY` (pas `SUPABASE_ANON_KEY`)

### Erreur : "ENCRYPTION_KEY non configurée"

**Solution :**
1. Ajoutez `ENCRYPTION_KEY` dans votre `.env`
2. Utilisez une clé d'au moins 32 caractères
3. Les credentials fonctionneront mais ne seront pas chiffrés (acceptable pour le développement)

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide de démarrage rapide](./DEMARRAGE_RAPIDE.md)
- [Guide de test avec matériel réel](./GUIDE_TEST_MATERIEL_REEL.md)

