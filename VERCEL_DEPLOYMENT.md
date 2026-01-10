# Guide de Déploiement sur Vercel

Ce guide vous explique comment déployer l'application Network Manager sur Vercel et résoudre les problèmes courants.

---

## 🚀 Déploiement Rapide

### Étape 1 : Préparer le Projet

1. **Vérifier que le fichier `vercel.json` existe** (déjà créé ✅)
2. **Vérifier que le build fonctionne localement** :
   ```bash
   npm run build
   ```
   Si le build échoue, corrigez les erreurs avant de déployer.

### Étape 2 : Connecter le Projet à Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez votre compte GitHub/GitLab/Bitbucket
3. Cliquez sur **"New Project"**
4. Importez votre repository
5. Vercel détectera automatiquement que c'est un projet Vite

### Étape 3 : Configurer les Variables d'Environnement

**⚠️ CRUCIAL : Sans ces variables, l'application affichera un écran blanc !**

Dans les paramètres du projet Vercel :

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez les variables suivantes :

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-key
```

**Comment obtenir ces valeurs :**
- Allez dans votre projet Supabase
- **Project Settings** → **API**
- Copiez **Project URL** → `VITE_SUPABASE_URL`
- Copiez **anon public** key → `VITE_SUPABASE_ANON_KEY`

3. Sélectionnez **Production**, **Preview**, et **Development**
4. Cliquez sur **Save**

### Étape 4 : Configurer le Build

Vercel devrait détecter automatiquement :
- **Framework Preset** : Vite
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`

Si ce n'est pas le cas, vérifiez que le fichier `vercel.json` est présent.

### Étape 5 : Déployer

1. Cliquez sur **Deploy**
2. Attendez que le build se termine
3. Votre application sera disponible sur `votre-projet.vercel.app`

---

## 🔧 Résolution des Problèmes

### Problème : Écran Blanc

**Causes possibles :**

1. **Variables d'environnement manquantes** ✅ Solution la plus courante
   - Vérifiez que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont configurées dans Vercel
   - Redéployez après avoir ajouté les variables

2. **Erreurs JavaScript dans la console**
   - Ouvrez les DevTools (F12) → Console
   - Vérifiez les erreurs et corrigez-les

3. **Problème de routing**
   - Le fichier `vercel.json` devrait résoudre cela avec les rewrites

**Solution complète :**

```bash
# 1. Vérifier les variables d'environnement dans Vercel
# 2. Vérifier la console du navigateur pour les erreurs
# 3. Vérifier les logs de build dans Vercel
```

### Problème : Erreur "Cannot find module"

**Solution :**
```bash
# Nettoyer et réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problème : Build échoue sur Vercel

**Vérifications :**
1. Vérifiez les logs de build dans Vercel Dashboard
2. Vérifiez que toutes les dépendances sont dans `package.json`
3. Vérifiez que Node.js version est compatible (Vercel utilise Node 18+ par défaut)

**Solution :**
Créez un fichier `.nvmrc` pour spécifier la version Node :
```bash
echo "18" > .nvmrc
```

### Problème : Routes ne fonctionnent pas (404)

**Solution :**
Le fichier `vercel.json` devrait résoudre cela. Vérifiez qu'il contient :
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 📋 Checklist de Déploiement

Avant de déployer, vérifiez :

- [ ] Le build fonctionne localement (`npm run build`)
- [ ] Le fichier `vercel.json` existe
- [ ] Les variables d'environnement sont configurées dans Vercel :
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Le projet est connecté à un repository Git
- [ ] Tous les fichiers sont commités et poussés

Après le déploiement :

- [ ] L'application se charge sans écran blanc
- [ ] La console du navigateur ne montre pas d'erreurs
- [ ] Les routes fonctionnent (essayez `/login`, `/app/dashboard`)
- [ ] La connexion à Supabase fonctionne

---

## 🔍 Vérification Post-Déploiement

### 1. Vérifier la Console du Navigateur

1. Ouvrez votre application déployée
2. Appuyez sur `F12` pour ouvrir les DevTools
3. Allez dans l'onglet **Console**
4. Vérifiez qu'il n'y a pas d'erreurs rouges

**Erreurs courantes :**
- `VITE_SUPABASE_URL is not defined` → Variables d'environnement manquantes
- `Failed to fetch` → Problème de connexion à Supabase
- `Cannot read property` → Erreur JavaScript dans le code

### 2. Vérifier les Logs Vercel

1. Allez dans votre projet Vercel
2. Cliquez sur le dernier déploiement
3. Vérifiez les **Build Logs** pour des erreurs

### 3. Tester les Routes

Testez ces URLs :
- `https://votre-projet.vercel.app/` → Landing page
- `https://votre-projet.vercel.app/login` → Page de connexion
- `https://votre-projet.vercel.app/app/dashboard` → Dashboard (redirige vers login si non connecté)

---

## 🛠️ Configuration Avancée

### Ajouter un Domaine Personnalisé

1. Dans Vercel Dashboard → **Settings** → **Domains**
2. Ajoutez votre domaine
3. Suivez les instructions pour configurer les DNS

### Variables d'Environnement par Environnement

Vous pouvez avoir des variables différentes pour :
- **Production** : Variables de production
- **Preview** : Variables de staging/test
- **Development** : Variables de développement

### Optimisation du Build

Le fichier `vercel.json` inclut déjà :
- Cache des assets statiques
- Configuration du routing SPA

---

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Vite + Vercel](https://vercel.com/docs/frameworks/vite)
- [Variables d'environnement Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ⚡ Déploiement Rapide via CLI

Si vous préférez utiliser la CLI :

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Déployer en production
vercel --prod
```

---

*Dernière mise à jour : 2024*

