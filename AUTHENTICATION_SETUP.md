# Configuration de l'authentification et des permissions

## ✅ Modifications apportées

### 1. Authentification par email + password
- ✅ Ajout de la vérification du mot de passe lors de la connexion
- ✅ Champ password ajouté dans le formulaire de création d'utilisateur
- ✅ Champ password optionnel dans le formulaire d'édition (laisser vide pour ne pas modifier)

### 2. Système de permissions basé sur les rôles

#### Rôles disponibles :
- **Administrateur** : Accès complet à toutes les fonctionnalités
- **Opérateur** : Peut créer/modifier mais ne peut pas supprimer ni gérer les utilisateurs
- **Lecteur** : Accès en lecture seule

#### Permissions par rôle :

**Utilisateurs :**
- **Voir** : Admin, Opérateur, Lecteur
- **Créer** : Admin uniquement
- **Modifier** : Admin uniquement
- **Supprimer** : Admin uniquement

**Routeurs :**
- **Voir** : Admin, Opérateur, Lecteur
- **Créer** : Admin, Opérateur
- **Modifier** : Admin, Opérateur
- **Supprimer** : Admin uniquement

**Serveurs Windows :**
- **Voir** : Admin, Opérateur, Lecteur
- **Créer** : Admin, Opérateur
- **Modifier** : Admin, Opérateur
- **Supprimer** : Admin uniquement

**Logs :**
- **Voir** : Admin, Opérateur, Lecteur
- **Exporter** : Admin, Opérateur

## 📋 Étapes à suivre

### 1. Ajouter la colonne password dans Supabase

Exécutez le script SQL `DATABASE_PASSWORD_SETUP.sql` dans l'éditeur SQL de Supabase :

```sql
ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS password TEXT;
```

### 2. Mettre à jour votre utilisateur admin existant

Dans Supabase, mettez à jour votre utilisateur admin avec un mot de passe :

```sql
UPDATE app_users 
SET password = 'votre_mot_de_passe' 
WHERE email = 'votre_email@example.com';
```

### 3. Créer de nouveaux utilisateurs avec des rôles

Lors de la création d'un utilisateur via l'interface :
1. Remplissez le formulaire avec email et mot de passe
2. Sélectionnez le rôle approprié :
   - **Administrateur** : Accès complet
   - **Opérateur** : Peut créer/modifier mais pas supprimer
   - **Lecteur** : Lecture seule

## 🔐 Sécurité

⚠️ **Important** : Actuellement, les mots de passe sont stockés en clair dans la base de données. Pour la production, il est **fortement recommandé** de :

1. Hasher les mots de passe avec bcrypt ou argon2
2. Utiliser Supabase Auth pour la gestion des authentifications
3. Implémenter des politiques RLS (Row Level Security) dans Supabase

## 🎯 Test de connexion

1. Connectez-vous avec votre compte admin (email + password)
2. Créez un nouvel utilisateur avec le rôle "Lecteur"
3. Déconnectez-vous et reconnectez-vous avec le compte "Lecteur"
4. Vérifiez que les boutons "Ajouter", "Modifier" et "Supprimer" sont masqués
5. Vérifiez que vous pouvez toujours consulter les données

## 📝 Notes

- Les permissions sont vérifiées côté client. Pour une sécurité renforcée, implémentez aussi des vérifications côté serveur.
- Le système de permissions est défini dans `src/utils/permissions.js`
- Les permissions sont vérifiées dans chaque composant via `checkPermission('PERMISSION_NAME')`



