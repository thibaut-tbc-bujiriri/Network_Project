# 🚀 Démarrage Rapide - Backend de Surveillance

Guide rapide pour démarrer le backend et commencer à surveiller vos équipements.

---

## ⚡ Installation Express (5 minutes)

### 1. Installer les dépendances

```bash
cd backend
npm install
```

### 2. Configurer l'environnement

Créez un fichier `.env` dans le dossier `backend/` :

```env
PORT=3000
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Où trouver les valeurs :**
- `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` : Supabase → Project Settings → API
- `ENCRYPTION_KEY` : Générez avec `openssl rand -hex 16`

### 3. Ajouter les colonnes dans Supabase

Exécutez le script `DATABASE_ADD_MONITORING_COLUMNS.sql` dans Supabase SQL Editor.

### 4. Démarrer le backend

```bash
npm run dev
```

**✅ C'est tout !** Le backend surveille maintenant automatiquement tous vos équipements toutes les 60 secondes.

---

## 🔍 Vérification

### Vérifier que ça fonctionne

1. **Logs du backend** : Vous devriez voir :
   ```
   ✅ Scheduler de surveillance démarré (toutes les 60 secondes)
   [2024-01-10 14:30:00] 🔍 Début de la surveillance...
   ```

2. **Dans Supabase** : Allez dans Table Editor → `routeur_devices` → Vérifiez que `last_check` est mis à jour

3. **Dans le frontend** : Rafraîchissez la page, les données devraient être à jour

---

## 📊 Ajouter un Équipement à Surveiller

### Via le Frontend (Recommandé)

1. Connectez-vous à votre application
2. Allez dans "Routeurs" ou "Serveurs Windows"
3. Cliquez sur "Ajouter"
4. Remplissez :
   - **Nom** : Ex. "Router Principal"
   - **Adresse IP** : Ex. "192.168.1.1"
   - **Username** (optionnel) : Pour SSH/SNMP/WinRM
   - **Password** (optionnel) : Pour SSH/SNMP/WinRM (sera chiffré automatiquement)
5. Cliquez sur "Créer"

Le backend surveillera automatiquement cet équipement dans la prochaine minute.

---

## 🎯 Fonctionnement Automatique

### Ce qui se passe automatiquement :

1. **Toutes les 60 secondes** :
   - Le backend ping tous les routeurs
   - Le backend ping tous les serveurs Windows
   - Met à jour `status` (online/offline) dans Supabase
   - Met à jour `last_check` dans Supabase

2. **Si credentials configurés** :
   - Récupère CPU, RAM, Disk via SSH/SNMP/WinRM
   - Met à jour les métriques dans Supabase

3. **Le frontend** :
   - Continue de lire depuis Supabase
   - Affiche automatiquement les nouvelles données
   - ✅ **AUCUNE MODIFICATION NÉCESSAIRE**

---

## 🐛 Problèmes Courants

### Le backend ne démarre pas

```bash
# Vérifier Node.js version (besoin 18+)
node --version

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Aucun équipement surveillé

**Cause** : Aucun équipement dans Supabase

**Solution** : Ajoutez des équipements via le frontend ou directement dans Supabase

### Erreur "Variables d'environnement manquantes"

**Solution** : Vérifiez que `.env` existe et contient toutes les variables

### Les métriques ne sont pas récupérées (juste le ping fonctionne)

**Cause** : Pas de credentials configurés

**Solution** : C'est normal ! Le ping fonctionne toujours. Pour CPU/RAM, ajoutez les credentials (username/password) dans Supabase.

---

## 📈 Exemple de Logs

```
═══════════════════════════════════════════════════════
🚀 Network Manager Backend
═══════════════════════════════════════════════════════
📡 Port: 3000
✅ Client Supabase configuré
✅ Scheduler de surveillance démarré (toutes les 60 secondes)

[2024-01-10 14:30:00] 🔍 Début de la surveillance...
  📡 Surveillance de 2 routeur(s)...
    🟢 Router Principal (192.168.1.1): online (CPU: 45%, RAM: 60%)
    🔴 Router Backup (192.168.1.2): offline
  🖥️  Surveillance de 1 serveur(s) Windows...
    🟢 DC-01 (192.168.1.10): online (CPU: 25%, RAM: 50%, Disk: 65%)
[2024-01-10 14:30:05] ✅ Surveillance terminée en 5.23s
```

---

## 🎉 Prêt !

Votre backend est maintenant opérationnel et surveille automatiquement vos équipements !

**Le frontend continuera de fonctionner exactement comme avant** - il lit simplement les données mises à jour automatiquement par le backend.

---

Pour plus de détails, consultez :
- `INSTALLATION_BACKEND.md` : Guide complet d'installation
- `README.md` : Documentation complète du backend

