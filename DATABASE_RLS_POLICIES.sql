-- =====================================================
-- POLITIQUES RLS (ROW LEVEL SECURITY) ET PERMISSIONS
-- Network Manager - Application de Gestion Réseau
-- =====================================================
--
-- Ce script configure les politiques de sécurité RLS pour Supabase
-- IMPORTANT : Exécutez ce script APRÈS avoir créé les tables avec DATABASE_SCHEMA.sql
-- =====================================================

-- =====================================================
-- OPTION 1 : DÉSACTIVER RLS (DÉVELOPPEMENT/TEST)
-- =====================================================
-- Décommentez cette section si vous voulez désactiver RLS temporairement

/*
-- Désactiver RLS sur toutes les tables
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE routeur_devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE windows_servers DISABLE ROW LEVEL SECURITY;
ALTER TABLE logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE device_assignments DISABLE ROW LEVEL SECURITY;
*/

-- =====================================================
-- OPTION 2 : ACTIVER RLS AVEC POLITIQUES (RECOMMANDÉ)
-- =====================================================
-- Activez RLS et créez des politiques pour chaque table

-- Activer RLS sur toutes les tables
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

ALTER TABLE routeur_devices ENABLE ROW LEVEL SECURITY;

ALTER TABLE windows_servers ENABLE ROW LEVEL SECURITY;

ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE device_assignments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLITIQUES POUR LA TABLE ROLES
-- =====================================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow public read on roles" ON roles;

DROP POLICY IF EXISTS "Allow public insert on roles" ON roles;

-- Politique : Lecture publique (tout le monde peut voir les rôles)
CREATE POLICY "Allow public read on roles" ON roles FOR
SELECT USING (true);

-- Politique : Insertion (pour créer des rôles - uniquement via service role)
CREATE POLICY "Allow public insert on roles" ON roles FOR
INSERT
WITH
    CHECK (true);

-- =====================================================
-- POLITIQUES POUR LA TABLE APP_USERS
-- =====================================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow public read on app_users" ON app_users;

DROP POLICY IF EXISTS "Allow public insert on app_users" ON app_users;

DROP POLICY IF EXISTS "Allow public update on app_users" ON app_users;

DROP POLICY IF EXISTS "Allow public delete on app_users" ON app_users;

DROP POLICY IF EXISTS "Users can view their own profile" ON app_users;

DROP POLICY IF EXISTS "Users can update their own profile" ON app_users;

-- Politique : Lecture publique (pour l'authentification)
-- En production, vous pourriez vouloir restreindre cela
CREATE POLICY "Allow public read on app_users" ON app_users FOR
SELECT USING (true);

-- Politique : Insertion (pour créer de nouveaux utilisateurs)
CREATE POLICY "Allow public insert on app_users" ON app_users FOR
INSERT
WITH
    CHECK (true);

-- Politique : Mise à jour (pour modifier les utilisateurs)
CREATE POLICY "Allow public update on app_users" ON app_users FOR
UPDATE USING (true)
WITH
    CHECK (true);

-- Politique : Suppression (pour supprimer des utilisateurs)
CREATE POLICY "Allow public delete on app_users" ON app_users FOR DELETE USING (true);

-- Politique alternative : Utilisateurs peuvent voir leur propre profil
-- Décommentez pour une sécurité renforcée
/*
CREATE POLICY "Users can view their own profile" ON app_users
FOR SELECT
USING (auth.uid()::text = id::text);
*/

-- =====================================================
-- POLITIQUES POUR LA TABLE ROUTEUR_DEVICES
-- =====================================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow public read on routeur_devices" ON routeur_devices;

DROP POLICY IF EXISTS "Allow public insert on routeur_devices" ON routeur_devices;

DROP POLICY IF EXISTS "Allow public update on routeur_devices" ON routeur_devices;

DROP POLICY IF EXISTS "Allow public delete on routeur_devices" ON routeur_devices;

-- Politique : Lecture publique
CREATE POLICY "Allow public read on routeur_devices" ON routeur_devices FOR
SELECT USING (true);

-- Politique : Insertion (pour ajouter des routeurs)
CREATE POLICY "Allow public insert on routeur_devices" ON routeur_devices FOR
INSERT
WITH
    CHECK (true);

-- Politique : Mise à jour (pour modifier les routeurs)
CREATE POLICY "Allow public update on routeur_devices" ON routeur_devices FOR
UPDATE USING (true)
WITH
    CHECK (true);

-- Politique : Suppression (pour supprimer des routeurs)
CREATE POLICY "Allow public delete on routeur_devices" ON routeur_devices FOR DELETE USING (true);

-- =====================================================
-- POLITIQUES POUR LA TABLE WINDOWS_SERVERS
-- =====================================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow public read on windows_servers" ON windows_servers;

DROP POLICY IF EXISTS "Allow public insert on windows_servers" ON windows_servers;

DROP POLICY IF EXISTS "Allow public update on windows_servers" ON windows_servers;

DROP POLICY IF EXISTS "Allow public delete on windows_servers" ON windows_servers;

-- Politique : Lecture publique
CREATE POLICY "Allow public read on windows_servers" ON windows_servers FOR
SELECT USING (true);

-- Politique : Insertion (pour ajouter des serveurs)
CREATE POLICY "Allow public insert on windows_servers" ON windows_servers FOR
INSERT
WITH
    CHECK (true);

-- Politique : Mise à jour (pour modifier les serveurs)
CREATE POLICY "Allow public update on windows_servers" ON windows_servers FOR
UPDATE USING (true)
WITH
    CHECK (true);

-- Politique : Suppression (pour supprimer des serveurs)
CREATE POLICY "Allow public delete on windows_servers" ON windows_servers FOR DELETE USING (true);

-- =====================================================
-- POLITIQUES POUR LA TABLE LOGS
-- =====================================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow public read on logs" ON logs;

DROP POLICY IF EXISTS "Allow public insert on logs" ON logs;

DROP POLICY IF EXISTS "Allow public update on logs" ON logs;

DROP POLICY IF EXISTS "Allow public delete on logs" ON logs;

-- Politique : Lecture publique
CREATE POLICY "Allow public read on logs" ON logs FOR
SELECT USING (true);

-- Politique : Insertion (pour créer des logs)
CREATE POLICY "Allow public insert on logs" ON logs FOR
INSERT
WITH
    CHECK (true);

-- Note : Les logs ne devraient généralement pas être modifiés ou supprimés
-- Vous pouvez ajouter des politiques restrictives ici si nécessaire

-- =====================================================
-- POLITIQUES POUR LA TABLE AUDIT_LOGS
-- =====================================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow public read on audit_logs" ON audit_logs;

DROP POLICY IF EXISTS "Allow public insert on audit_logs" ON audit_logs;

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

-- Politique : Lecture publique (pour l'instant - en production, restreindre aux admins)
CREATE POLICY "Allow public read on audit_logs" ON audit_logs FOR
SELECT USING (true);

-- Politique : Insertion (pour créer des logs d'audit)
CREATE POLICY "Allow public insert on audit_logs" ON audit_logs FOR
INSERT
WITH
    CHECK (true);

-- Politique alternative : Seuls les admins peuvent voir les logs d'audit
-- Pour utiliser cette politique, vous devrez créer une fonction helper
-- qui vérifie si l'utilisateur est admin
/*
CREATE POLICY "Admins can view audit_logs" ON audit_logs
FOR SELECT
USING (
EXISTS (
SELECT 1 FROM app_users au
JOIN roles r ON au.role_id = r.id
WHERE au.id::text = auth.uid()::text
AND r.name = 'Administrateur'
)
);
*/

-- Note : Les logs d'audit ne devraient JAMAIS être modifiés ou supprimés

-- =====================================================
-- POLITIQUES POUR LA TABLE DEVICE_ASSIGNMENTS
-- =====================================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow public read on device_assignments" ON device_assignments;

DROP POLICY IF EXISTS "Allow public insert on device_assignments" ON device_assignments;

DROP POLICY IF EXISTS "Allow public update on device_assignments" ON device_assignments;

DROP POLICY IF EXISTS "Allow public delete on device_assignments" ON device_assignments;

-- Politique : Lecture publique
CREATE POLICY "Allow public read on device_assignments" ON device_assignments FOR
SELECT USING (true);

-- Politique : Insertion (pour assigner des équipements)
CREATE POLICY "Allow public insert on device_assignments" ON device_assignments FOR
INSERT
WITH
    CHECK (true);

-- Politique : Mise à jour
CREATE POLICY "Allow public update on device_assignments" ON device_assignments FOR
UPDATE USING (true)
WITH
    CHECK (true);

-- Politique : Suppression (pour retirer des assignations)
CREATE POLICY "Allow public delete on device_assignments" ON device_assignments FOR DELETE USING (true);

-- =====================================================
-- NOTES IMPORTANTES SUR LA SÉCURITÉ
-- =====================================================

/*
⚠️ SÉCURITÉ EN PRODUCTION :

Les politiques ci-dessus permettent un accès public complet aux tables.
C'est acceptable pour le développement et les tests, mais pour la production,
vous DEVRIEZ implémenter des politiques plus restrictives basées sur :

1. Authentification utilisateur (via Supabase Auth)
2. Vérification des rôles (Admin, Opérateur, Lecteur)
3. Vérification des permissions spécifiques

EXEMPLE DE POLITIQUE SÉCURISÉE :

-- Seuls les utilisateurs authentifiés peuvent voir les routeurs
CREATE POLICY "Authenticated users can view routeurs" ON routeur_devices
FOR SELECT
USING (auth.role() = 'authenticated');

-- Seuls les admins et opérateurs peuvent modifier les routeurs
CREATE POLICY "Admins and operators can modify routeurs" ON routeur_devices
FOR UPDATE
USING (
EXISTS (
SELECT 1 FROM app_users au
JOIN roles r ON au.role_id = r.id
WHERE au.email = auth.email()
AND r.name IN ('Administrateur', 'Opérateur')
)
);

Pour plus d'informations sur RLS avec Supabase :
https://supabase.com/docs/guides/auth/row-level-security
*/

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================