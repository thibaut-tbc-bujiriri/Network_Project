# 🔧 Guide de Configuration Vercel - Variables d'Environnement

Ce guide vous explique **étape par étape** comment configurer les variables d'environnement Supabase dans Vercel pour résoudre l'erreur "Configuration Manquante".

---

## 📋 Étape 1 : Obtenir vos clés Supabase

### 1.1 Se connecter à Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet (ou créez-en un nouveau si nécessaire)

### 1.2 Accéder aux paramètres API

1. Dans votre projet Supabase, cliquez sur l'icône **⚙️ Settings** (en bas à gauche)
2. Dans le menu latéral, cliquez sur **API**

### 1.3 Copier les valeurs nécessaires

Vous verrez deux sections importantes :

#### **Project URL**
- C'est votre `VITE_SUPABASE_URL`
- Format : `https://xxxxxxxxxxxxx.supabase.co`
- **Copiez cette valeur complète**

#### **API Keys**
- Cherchez la clé **"anon public"**
- C'est votre `VITE_SUPABASE_ANON_KEY`
- C'est une longue chaîne de caractères qui commence généralement par `eyJ...`
- **⚠️ IMPORTANT :** Utilisez la clé **"anon public"**, PAS la clé "service_role" !

---

## 📋 Étape 2 : Configurer les variables dans Vercel

### 2.1 Accéder aux paramètres du projet

1. Allez sur [https://vercel.com](https://vercel.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet Network Manager

### 2.2 Ouvrir les variables d'environnement

1. Cliquez sur l'onglet **Settings** (Paramètres)
2. Dans le menu latéral, cliquez sur **Environment Variables** (Variables d'environnement)

### 2.3 Ajouter la première variable : VITE_SUPABASE_URL

1. Cliquez sur le bouton **"Add New"** (Ajouter nouveau)
2. Dans le champ **Key** (Clé), entrez exactement :
   ```
   VITE_SUPABASE_URL
   ```
3. Dans le champ **Value** (Valeur), collez votre **Project URL** de Supabase :
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
4. Cochez les 3 cases :
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
5. Cliquez sur **Save** (Enregistrer)

### 2.4 Ajouter la deuxième variable : VITE_SUPABASE_ANON_KEY

1. Cliquez à nouveau sur **"Add New"**
2. Dans le champ **Key**, entrez exactement :
   ```
   VITE_SUPABASE_ANON_KEY
   ```
3. Dans le champ **Value**, collez votre clé **anon public** de Supabase :
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   (La valeur complète de votre clé)
4. Cochez les 3 cases :
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
5. Cliquez sur **Save**

### 2.5 Vérifier les variables ajoutées

Vous devriez maintenant voir dans la liste :

```
✅ VITE_SUPABASE_URL        [Production, Preview, Development]
✅ VITE_SUPABASE_ANON_KEY   [Production, Preview, Development]
```

---

## 📋 Étape 3 : Redéployer l'application

### ⚠️ IMPORTANT : Cette étape est OBLIGATOIRE !

Les variables d'environnement ne sont disponibles qu'au moment du **build**. Si vous les ajoutez sans redéployer, elles ne seront pas prises en compte.

### 3.1 Redéployer via le Dashboard Vercel

1. Allez dans l'onglet **Deployments** (Déploiements)
2. Trouvez le dernier déploiement
3. Cliquez sur les **3 points (⋯)** à droite du déploiement
4. Cliquez sur **"Redeploy"** (Redéployer)
5. Sélectionnez **"Use existing Build Cache"** (optionnel, mais recommandé)
6. Cliquez sur **"Redeploy"**

### 3.2 Redéployer via Git (Alternative)

Si vous préférez, vous pouvez aussi :

1. Faire un petit changement dans votre code (ou juste ajouter un commentaire)
2. Commit et push vers votre repository Git
3. Vercel redéploiera automatiquement avec les nouvelles variables

---

## ✅ Étape 4 : Vérifier que ça fonctionne

### 4.1 Attendre la fin du redéploiement

1. Dans l'onglet **Deployments**, attendez que le statut passe à **✅ Ready**
2. Cela peut prendre 1-3 minutes

### 4.2 Tester l'application

1. Cliquez sur le lien de votre application déployée
2. L'application devrait maintenant charger correctement (plus d'écran de configuration manquante)
3. Vous devriez voir la **Landing Page** ou la page de **Login**

### 4.3 Si ça ne fonctionne toujours pas

1. Ouvrez la console du navigateur (F12 → Console)
2. Vérifiez s'il y a des erreurs
3. Vérifiez que les variables sont bien configurées dans Vercel :
   - Allez dans **Settings** → **Environment Variables**
   - Vérifiez que les deux variables sont présentes
   - Vérifiez que les valeurs sont correctes (sans espaces en début/fin)
4. Vérifiez les logs de build dans Vercel :
   - Allez dans **Deployments** → Cliquez sur le dernier déploiement
   - Consultez les **Build Logs** pour voir s'il y a des erreurs

---

## 🔍 Dépannage

### Problème : Les variables sont ajoutées mais l'erreur persiste

**Solution :**
- ✅ Vérifiez que vous avez **bien redéployé** après avoir ajouté les variables
- ✅ Vérifiez qu'il n'y a pas d'espaces dans les valeurs
- ✅ Vérifiez que vous avez utilisé la clé **"anon public"** et non "service_role"
- ✅ Vérifiez que les noms des variables sont **exactement** : `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

### Problème : Erreur "Invalid API key"

**Solution :**
- Vérifiez que vous avez copié la **clé complète** (elle peut être très longue)
- Assurez-vous qu'il n'y a pas d'espaces ou de retours à la ligne
- Vérifiez que vous utilisez bien la clé **"anon public"** et non une autre clé

### Problème : L'application se charge mais ne peut pas se connecter à Supabase

**Solution :**
- Vérifiez que l'URL Supabase est correcte (doit commencer par `https://` et finir par `.supabase.co`)
- Vérifiez que votre projet Supabase est actif
- Vérifiez les politiques RLS dans Supabase (voir `DATABASE_RLS_POLICIES.sql`)

---

## 📸 Exemple Visuel

### Dans Supabase (Settings → API) :
```
Project URL
https://abcdefghijklmnop.supabase.co  ← Copiez ceci

API Keys
[x] anon public
    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ← Copiez ceci (la clé complète)
```

### Dans Vercel (Settings → Environment Variables) :
```
Key                    Value                                    Environments
VITE_SUPABASE_URL      https://abcdefghijklmnop.supabase.co    ✅ Production ✅ Preview ✅ Development
VITE_SUPABASE_ANON_KEY eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ✅ Production ✅ Preview ✅ Development
```

---

## 🎯 Checklist Finale

Avant de considérer que c'est résolu, vérifiez :

- [ ] Les deux variables sont ajoutées dans Vercel
- [ ] Les deux variables ont les 3 environnements cochés (Production, Preview, Development)
- [ ] Les valeurs sont correctes (URL et clé complètes)
- [ ] Vous avez redéployé l'application après avoir ajouté les variables
- [ ] Le redéploiement est terminé (statut ✅ Ready)
- [ ] L'application se charge sans erreur de configuration
- [ ] Vous pouvez accéder à la page de login

---

## 📚 Ressources

- [Documentation Vercel - Variables d'environnement](https://vercel.com/docs/concepts/projects/environment-variables)
- [Documentation Supabase - API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Vite - Variables d'environnement](https://vite.dev/guide/env-and-mode.html)

---

**Besoin d'aide supplémentaire ?** 
- Vérifiez les logs de build dans Vercel
- Vérifiez la console du navigateur (F12)
- Consultez la documentation Supabase et Vercel

---

*Dernière mise à jour : 2024*

