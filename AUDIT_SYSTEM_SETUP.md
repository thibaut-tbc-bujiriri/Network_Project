# Système d'Audit - Configuration et Utilisation

## ✅ Système d'audit implémenté

Un système complet d'audit a été créé pour enregistrer toutes les actions effectuées dans l'application.

## 📋 Fonctionnalités

### Actions enregistrées
- **Création** : Toutes les créations (utilisateurs, routeurs, serveurs Windows)
- **Modification** : Toutes les modifications avec les anciennes et nouvelles valeurs
- **Suppression** : Toutes les suppressions avec les données de l'élément supprimé

### Informations enregistrées
- **Utilisateur** : ID, email, nom complet de l'utilisateur qui a effectué l'action
- **Action** : Type d'action (create, update, delete)
- **Entité** : Type d'entité (user, routeur_device, windows_server)
- **Données** : Anciennes et nouvelles valeurs (pour les modifications)
- **Date et heure** : Timestamp précis de l'action
- **Métadonnées** : User agent, IP (si disponible)

## 🔧 Configuration

### 1. Créer la table audit_logs dans Supabase

Exécutez le script SQL `DATABASE_AUDIT_SETUP.sql` dans l'éditeur SQL de Supabase :

```sql
-- Le script crée :
-- - La table audit_logs avec tous les champs nécessaires
-- - Les index pour améliorer les performances
-- - Les politiques RLS (Row Level Security)
```

### 2. Accès à la page Audit

La page Audit est accessible uniquement aux **Administrateurs** :
- Route : `/app/audit`
- Lien dans la sidebar (visible uniquement pour les admins)
- Redirection automatique si l'utilisateur n'est pas admin

## 📊 Interface de consultation

### Page Audit (`/app/audit`)

La page d'audit affiche :
- **Tableau des logs** : Tous les logs d'audit avec :
  - Date et heure
  - Utilisateur qui a effectué l'action
  - Type d'action (Création, Modification, Suppression)
  - Type d'entité (Utilisateur, Routeur, Serveur Windows)
  - Nom de l'entité concernée
  - Détails de l'action

- **Filtres** :
  - Recherche par utilisateur, entité ou action
  - Filtre par type d'action (Création, Modification, Suppression)
  - Filtre par type d'entité (Utilisateurs, Appareils, Serveurs)

- **Statistiques** :
  - Total des actions
  - Nombre de créations
  - Nombre de modifications

## 🔐 Sécurité

### Accès restreint
- **Seuls les administrateurs** peuvent accéder à la page Audit
- Vérification automatique du rôle lors de l'accès
- Redirection vers le dashboard si l'utilisateur n'est pas admin

### Enregistrement automatique
- Toutes les actions sont enregistrées automatiquement
- L'enregistrement ne bloque pas l'application si une erreur survient
- Les erreurs d'audit sont loggées dans la console mais n'interrompent pas les opérations

## 📝 Actions enregistrées

### Utilisateurs
- ✅ Création d'un utilisateur
- ✅ Modification d'un utilisateur (avec anciennes/nouvelles valeurs)
- ✅ Suppression d'un utilisateur

### Routeurs
- ✅ Création d'un routeur
- ✅ Modification d'un routeur (avec anciennes/nouvelles valeurs)
- ✅ Suppression d'un routeur

### Serveurs Windows
- ✅ Création d'un serveur
- ✅ Modification d'un serveur (avec anciennes/nouvelles valeurs)
- ✅ Suppression d'un serveur

## 🎯 Utilisation

### Pour les administrateurs

1. **Accéder à la page Audit** :
   - Cliquez sur "Audit" dans la sidebar (icône Shield)
   - Ou accédez directement à `/app/audit`

2. **Consulter les logs** :
   - Tous les logs sont affichés par ordre chronologique (plus récents en premier)
   - Utilisez les filtres pour rechercher des actions spécifiques

3. **Analyser les actions** :
   - Consultez qui a fait quoi et quand
   - Vérifiez les modifications avec les anciennes et nouvelles valeurs
   - Identifiez les suppressions et créations

## 🔍 Exemples de logs

### Création d'utilisateur
```
Date: 15/01/2024 14:30
Utilisateur: Admin User (admin@example.com)
Action: Création
Entité: Utilisateur
Nom: Jean Dupont
```

### Modification d'appareil
```
Date: 15/01/2024 15:45
Utilisateur: Operator User (operator@example.com)
Action: Modification
Entité: Routeur
Nom: Router Principal
Détails: Modification effectuée (anciennes/nouvelles valeurs stockées)
```

### Suppression de serveur
```
Date: 15/01/2024 16:20
Utilisateur: Admin User (admin@example.com)
Action: Suppression
Entité: Serveur Windows
Nom: DC-01
```

## 📌 Notes importantes

1. **Performance** : Les logs sont limités à 200 entrées par défaut pour optimiser les performances
2. **Stockage** : Les anciennes et nouvelles valeurs sont stockées en JSONB pour faciliter les requêtes
3. **RLS** : Les politiques RLS sont configurées mais peuvent nécessiter des ajustements selon votre configuration Supabase
4. **Production** : En production, considérez l'archivage des anciens logs pour maintenir les performances

## 🚀 Prochaines étapes possibles

- Export des logs en CSV/PDF
- Recherche avancée avec dates
- Graphiques et statistiques sur les actions
- Notifications pour actions critiques
- Archivage automatique des anciens logs

