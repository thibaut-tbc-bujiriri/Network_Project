# 🔐 Guide rapide pour hasher les mots de passe existants

## ⚠️ Problème
Vos mots de passe existants ne sont pas hashés. Ils sont stockés en clair dans la base de données.

## ✅ Solution rapide

### Option 1 : Migration automatique (Recommandé)
Les mots de passe seront automatiquement hashés lors de la prochaine connexion de chaque utilisateur. **Aucune action requise de votre part.**

### Option 2 : Migration manuelle (Plus rapide)

1. **Accédez à la page "Migration MDP"** dans la sidebar (visible uniquement pour les admins)

2. **Pour chaque utilisateur avec un mot de passe non hashé :**
   - Allez dans "Utilisateurs"
   - Cliquez sur "Modifier" pour l'utilisateur
   - Dans le champ "Mot de passe", entrez le **même mot de passe** (ou un nouveau)
   - Cliquez sur "Modifier"
   - Le mot de passe sera automatiquement hashé ✅

3. **Vérifiez dans Supabase :**
```sql
SELECT 
  email,
  CASE 
    WHEN password LIKE 'sha256$%' THEN 'Hashé ✅'
    ELSE 'Non hashé ⚠️'
  END as status
FROM app_users;
```

### Option 3 : Script de migration (Avancé)

Si vous avez beaucoup d'utilisateurs, vous pouvez créer un script. Mais attention : **vous devez connaître les mots de passe en clair** pour les hasher.

## 🎯 Action immédiate recommandée

1. **Testez avec un nouvel utilisateur :**
   - Créez un nouvel utilisateur avec un mot de passe
   - Vérifiez qu'il est hashé : `SELECT password FROM app_users WHERE email = 'nouvel_email@example.com';`
   - Le mot de passe doit commencer par `sha256$`

2. **Pour les utilisateurs existants :**
   - Soit attendez qu'ils se connectent (migration automatique)
   - Soit modifiez-les manuellement via l'interface

## 📊 Vérification

Exécutez cette requête pour voir l'état :
```sql
SELECT 
  email,
  full_name,
  CASE 
    WHEN password LIKE 'sha256$%' THEN 'Hashé ✅'
    WHEN password IS NULL THEN 'Aucun mot de passe'
    ELSE 'Non hashé ⚠️'
  END as status,
  LENGTH(password) as password_length
FROM app_users
ORDER BY 
  CASE 
    WHEN password LIKE 'sha256$%' THEN 1
    ELSE 0
  END,
  created_at DESC;
```

## 🔒 Sécurité

Une fois tous les mots de passe hashés :
- ✅ Les mots de passe ne seront plus visibles en clair
- ✅ Chaque mot de passe a un salt unique
- ✅ Protection contre les attaques par timing
- ✅ Format : `sha256$[salt]$[hash]`




