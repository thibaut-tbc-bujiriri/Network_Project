# 🔗 Configuration Frontend → Backend (Vercel + Render)

Guide complet pour connecter votre frontend React/Vite (Vercel) à votre backend Node.js (Render).

---

## 📋 Prérequis

- ✅ Backend déployé sur Render : `https://network-project-yqtq.onrender.com`
- ✅ Frontend déployé sur Vercel
- ✅ Backend répond correctement sur `/health`

---

## 🔧 ÉTAPE 1 : Configuration CORS Backend

Le backend est déjà configuré pour autoriser le CORS. Vérifiez que dans votre `.env` backend (sur Render), vous avez :

```env
FRONTEND_URL=https://votre-frontend.vercel.app
NODE_ENV=production
```

**Note :** En développement, le CORS autorise toutes les origines (`*`). En production, il faut définir `FRONTEND_URL`.

---

## 🔧 ÉTAPE 2 : Configuration Variable d'Environnement Vercel

### 2.1 Ajouter la Variable dans Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Cliquez sur **"Add New"**
5. Ajoutez la variable :
   - **Key :** `VITE_API_URL`
   - **Value :** `https://network-project-yqtq.onrender.com`
   - **Environments :** Cochez **Production**, **Preview**, et **Development**
6. Cliquez sur **"Save"**

### 2.2 Redéployer l'Application

⚠️ **IMPORTANT :** Après avoir ajouté la variable, vous **DEVEZ redéployer** :

1. Allez dans **Deployments**
2. Cliquez sur les 3 points (⋯) du dernier déploiement
3. Sélectionnez **"Redeploy"**
4. Confirmez le redéploiement

**Pourquoi ?** Les variables d'environnement `VITE_*` sont injectées au moment du build. Un redéploiement est nécessaire.

---

## 🔧 ÉTAPE 3 : Configuration Locale (Développement)

Pour tester en local, créez un fichier `.env.local` à la racine du projet frontend :

```env
VITE_API_URL=https://network-project-yqtq.onrender.com
```

**Note :** Le fichier `.env.local` est déjà dans `.gitignore`, il ne sera pas commité.

---

## 🧪 ÉTAPE 4 : Tester la Connexion

### 4.1 Test dans le Navigateur

1. Ouvrez votre application frontend (Vercel ou local)
2. Allez sur le Dashboard
3. Vérifiez que le composant **"Status Backend"** s'affiche en haut
4. Le statut devrait être **"Backend en ligne"** (vert) si tout fonctionne

### 4.2 Test dans la Console du Navigateur

Ouvrez la console (F12) et vérifiez :

✅ **Pas d'erreur CORS :**
```
Access to fetch at 'https://network-project-yqtq.onrender.com/health' from origin 'https://votre-frontend.vercel.app' has been blocked by CORS policy
```

✅ **Requête réussie :**
```
GET https://network-project-yqtq.onrender.com/health 200 OK
```

### 4.3 Test Manuel avec fetch

Dans la console du navigateur :

```javascript
fetch('https://network-project-yqtq.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

Vous devriez voir :
```json
{
  "status": "ok",
  "service": "Network Manager Backend",
  "timestamp": "2024-01-13T...",
  "uptime": 1234.56
}
```

### 4.4 Vérifier les Logs Backend (Render)

1. Allez sur [Render Dashboard](https://dashboard.render.com)
2. Sélectionnez votre service backend
3. Allez dans **Logs**
4. Vous devriez voir des requêtes entrantes :
```
[2024-01-13T...] GET /health - Origin: https://votre-frontend.vercel.app
```

---

## 📁 Fichiers Créés/Modifiés

### Frontend

- ✅ `src/services/backendApi.js` - Service API avec fetch
- ✅ `src/components/StatusBackend.jsx` - Composant de statut
- ✅ `src/pages/Dashboard.jsx` - Intégration du composant StatusBackend

### Backend

- ✅ `backend/src/index.js` - Configuration CORS améliorée + Routes API
- ✅ `backend/src/services/supabaseService.js` - Expose supabase pour les routes

---

## 🔍 Routes API Disponibles

### GET `/health`
Vérifie l'état du backend.

**Réponse :**
```json
{
  "status": "ok",
  "service": "Network Manager Backend",
  "timestamp": "2024-01-13T00:00:00.000Z",
  "uptime": 1234.56
}
```

### GET `/api/logs`
Récupère les logs de surveillance.

**Paramètres (query) :**
- `limit` : Nombre de logs (défaut: 100)
- `level` : Filtrer par niveau (info, warning, error)
- `source_type` : Filtrer par type (routeur, windows_server)

**Exemple :**
```javascript
const logs = await getLogs({ limit: 50, level: 'warning' });
```

### GET `/api/routers`
Récupère la liste des routeurs.

**Réponse :**
```json
[
  {
    "id": "uuid",
    "name": "Orange HomeBox",
    "ip_address": "192.168.1.1",
    "status": "online",
    ...
  }
]
```

### GET `/api/windows-servers`
Récupère la liste des serveurs Windows.

### GET `/api/dashboard/stats`
Récupère les statistiques du dashboard.

**Réponse :**
```json
{
  "routeurCount": 2,
  "windowsCount": 1,
  "activeDevicesCount": 1,
  "activeServersCount": 1,
  "totalDevices": 3,
  "totalActive": 2
}
```

### POST `/api/monitor/trigger`
Déclenche une surveillance manuelle.

---

## 🐛 Dépannage

### Problème : Erreur CORS

**Symptôme :**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solutions :**
1. Vérifiez que `FRONTEND_URL` est défini dans Render (backend)
2. Vérifiez que l'URL correspond exactement (pas de slash final)
3. Redéployez le backend après modification

### Problème : Variable d'environnement non trouvée

**Symptôme :**
```
VITE_API_URL is undefined
```

**Solutions :**
1. Vérifiez que la variable est bien ajoutée dans Vercel
2. **Redéployez** l'application (les variables sont injectées au build)
3. Vérifiez le nom : `VITE_API_URL` (pas `VITE_API_BASE_URL`)

### Problème : Backend ne répond pas

**Symptôme :**
```
Failed to fetch
Network error
```

**Solutions :**
1. Vérifiez que le backend est en ligne : `https://network-project-yqtq.onrender.com/health`
2. Vérifiez les logs Render pour voir les erreurs
3. Vérifiez que le backend n'est pas en "sleep" (Render free tier)

### Problème : Backend en "sleep" (Render Free Tier)

**Symptôme :**
Première requête prend 30-60 secondes.

**Solution :**
- Attendez la première requête (le backend se réveille)
- Ou passez au plan payant de Render

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

## 🎉 Résultat Attendu

Une fois configuré, vous devriez voir :

1. **Dans le Dashboard :**
   - Composant "Status Backend" en haut
   - Statut "Backend en ligne" (vert)
   - Uptime affiché

2. **Dans la Console Navigateur :**
   - Aucune erreur CORS
   - Requêtes réussies vers le backend

3. **Dans les Logs Render :**
   - Requêtes entrantes visibles
   - Origin correctement identifié

---

## 📚 Utilisation dans d'Autres Composants

Exemple d'utilisation du service API :

```javascript
import { getHealth, getLogs, getRouters } from '../services/backendApi';

// Dans un composant
const [health, setHealth] = useState(null);

useEffect(() => {
  getHealth()
    .then(setHealth)
    .catch(console.error);
}, []);
```

---

**🎊 Votre frontend est maintenant connecté au backend !**

