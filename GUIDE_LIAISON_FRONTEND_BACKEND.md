# 🔗 Guide Complet : Liaison Frontend → Backend

Guide étape par étape pour connecter votre frontend React/Vite (Vercel) à votre backend Node.js (Render).

---

## ✅ Fichiers Créés

### Frontend
- ✅ `src/services/backendApi.js` - Service API avec fetch
- ✅ `src/components/StatusBackend.jsx` - Composant de statut du backend
- ✅ `src/pages/Dashboard.jsx` - Intégration du composant (modifié)

### Backend
- ✅ `backend/src/index.js` - Routes API ajoutées + CORS amélioré (modifié)
- ✅ `backend/src/services/supabaseService.js` - Expose supabase (modifié)

---

## 🚀 ÉTAPE 1 : Configuration Vercel

### 1.1 Ajouter la Variable d'Environnement

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. **Settings** → **Environment Variables**
4. Cliquez sur **"Add New"**
5. Remplissez :
   - **Key :** `VITE_API_URL`
   - **Value :** `https://network-project-yqtq.onrender.com`
   - **Environments :** Cochez **Production**, **Preview**, et **Development**
6. Cliquez sur **"Save"**

### 1.2 Redéployer l'Application

⚠️ **IMPORTANT :** Après avoir ajouté la variable, vous **DEVEZ redéployer** :

1. Allez dans **Deployments**
2. Cliquez sur les 3 points (⋯) du dernier déploiement
3. Sélectionnez **"Redeploy"**
4. Confirmez

**Pourquoi ?** Les variables `VITE_*` sont injectées au moment du build.

---

## 🚀 ÉTAPE 2 : Configuration Backend (Render)

### 2.1 Variables d'Environnement Backend

Dans Render, ajoutez/modifiez dans **Environment** :

```env
FRONTEND_URL=https://votre-frontend.vercel.app
NODE_ENV=production
```

**Note :** Si `FRONTEND_URL` n'est pas défini, le CORS autorise toutes les origines (`*`) en développement.

### 2.2 Redéployer le Backend

Après modification, redéployez le backend sur Render.

---

## 🧪 ÉTAPE 3 : Tester la Connexion

### 3.1 Test Visuel

1. Ouvrez votre application frontend (Vercel)
2. Allez sur le **Dashboard**
3. Vérifiez que le composant **"Status Backend"** s'affiche en haut
4. Le statut devrait être **"Backend en ligne"** (vert) ✅

### 3.2 Test Console Navigateur

Ouvrez la console (F12) et vérifiez :

✅ **Pas d'erreur CORS :**
```
❌ Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

✅ **Requête réussie :**
```
✅ GET https://network-project-yqtq.onrender.com/health 200 OK
```

### 3.3 Test Manuel avec fetch

Dans la console du navigateur :

```javascript
fetch('https://network-project-yqtq.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Résultat attendu :**
```json
{
  "status": "ok",
  "service": "Network Manager Backend",
  "timestamp": "2024-01-13T...",
  "uptime": 1234.56
}
```

### 3.4 Vérifier les Logs Backend

1. Allez sur [Render Dashboard](https://dashboard.render.com)
2. Sélectionnez votre service backend
3. Allez dans **Logs**
4. Vous devriez voir :
```
[2024-01-13T...] GET /health - Origin: https://votre-frontend.vercel.app
```

---

## 📋 Routes API Disponibles

### GET `/health`
Vérifie l'état du backend.

**Utilisation :**
```javascript
import { getHealth } from '../services/backendApi';
const health = await getHealth();
```

### GET `/api/logs`
Récupère les logs de surveillance.

**Utilisation :**
```javascript
import { getLogs } from '../services/backendApi';
const logs = await getLogs({ limit: 50, level: 'warning' });
```

### GET `/api/routers`
Récupère la liste des routeurs.

**Utilisation :**
```javascript
import { getRouters } from '../services/backendApi';
const routers = await getRouters();
```

### GET `/api/windows-servers`
Récupère la liste des serveurs Windows.

**Utilisation :**
```javascript
import { getWindowsServers } from '../services/backendApi';
const servers = await getWindowsServers();
```

### GET `/api/dashboard/stats`
Récupère les statistiques du dashboard.

**Utilisation :**
```javascript
import { getDashboardStats } from '../services/backendApi';
const stats = await getDashboardStats();
```

### POST `/api/monitor/trigger`
Déclenche une surveillance manuelle.

**Utilisation :**
```javascript
import { triggerMonitoring } from '../services/backendApi';
await triggerMonitoring();
```

---

## 🐛 Dépannage

### Erreur CORS

**Symptôme :**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solutions :**
1. Vérifiez que `FRONTEND_URL` est défini dans Render
2. Vérifiez que l'URL correspond exactement (pas de slash final)
3. Redéployez le backend

### Variable d'environnement non trouvée

**Symptôme :**
```
VITE_API_URL is undefined
```

**Solutions :**
1. Vérifiez que la variable est bien ajoutée dans Vercel
2. **Redéployez** l'application (les variables sont injectées au build)
3. Vérifiez le nom : `VITE_API_URL` (pas `VITE_API_BASE_URL`)

### Backend ne répond pas

**Symptôme :**
```
Failed to fetch
Network error
```

**Solutions :**
1. Vérifiez que le backend est en ligne : `https://network-project-yqtq.onrender.com/health`
2. Vérifiez les logs Render
3. Vérifiez que le backend n'est pas en "sleep" (Render free tier)

---

## ✅ Checklist de Validation

- [ ] Variable `VITE_API_URL` ajoutée dans Vercel
- [ ] Application redéployée sur Vercel
- [ ] Composant StatusBackend visible sur le Dashboard
- [ ] Statut "Backend en ligne" affiché (vert)
- [ ] Aucune erreur CORS dans la console
- [ ] Requêtes visibles dans les logs Render
- [ ] Test manuel avec fetch fonctionne

---

## 🎉 Résultat Final

Une fois configuré, vous devriez voir :

1. **Dans le Dashboard :**
   - Composant "Status Backend" en haut
   - Statut "Backend en ligne" (vert) ✅
   - Uptime affiché

2. **Dans la Console Navigateur :**
   - Aucune erreur CORS ✅
   - Requêtes réussies vers le backend ✅

3. **Dans les Logs Render :**
   - Requêtes entrantes visibles ✅
   - Origin correctement identifié ✅

---

**🎊 Votre frontend est maintenant connecté au backend !**

