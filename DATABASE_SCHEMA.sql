-- =====================================================
-- SCRIPT COMPLET DE CRÉATION DE LA BASE DE DONNÉES
-- Network Manager - Application de Gestion Réseau
-- =====================================================
--
-- Ce script crée toutes les tables nécessaires pour l'application :
-- - Roles (rôles utilisateurs)
-- - App Users (utilisateurs de l'application)
-- - Routeur Devices (routeurs)
-- - Windows Servers (serveurs Windows)
-- - Logs (logs système)
-- - Audit Logs (logs d'audit)
-- - Device Assignments (assignations d'équipements)
--
-- IMPORTANT : Exécutez ce script dans l'ordre dans Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. TABLE ROLES
-- =====================================================
-- Stocke les rôles disponibles dans l'application

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Index sur le nom du rôle
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles (name);

-- Commentaires
COMMENT ON
TABLE roles IS 'Table des rôles utilisateurs (Administrateur, Opérateur, Lecteur)';

COMMENT ON COLUMN roles.name IS 'Nom du rôle (ex: Administrateur, Opérateur, Lecteur)';

COMMENT ON COLUMN roles.description IS 'Description du rôle et de ses permissions';

-- =====================================================
-- 2. TABLE APP_USERS
-- =====================================================
-- Stocke les utilisateurs de l'application

CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT, -- Hashé avec SHA-256 dans l'application
    full_name VARCHAR(255),
    role_id UUID REFERENCES roles (id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP
    WITH
        TIME ZONE
);

-- Index sur l'email pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users (email);

CREATE INDEX IF NOT EXISTS idx_app_users_role_id ON app_users (role_id);

CREATE INDEX IF NOT EXISTS idx_app_users_is_active ON app_users (is_active);

-- Commentaires
COMMENT ON
TABLE app_users IS 'Table des utilisateurs de l''application';

COMMENT ON COLUMN app_users.email IS 'Email unique de l''utilisateur (utilisé pour la connexion)';

COMMENT ON COLUMN app_users.password IS 'Mot de passe hashé (format: sha256$salt$hash)';

COMMENT ON COLUMN app_users.role_id IS 'Référence au rôle de l''utilisateur';

COMMENT ON COLUMN app_users.is_active IS 'Indique si le compte est actif ou désactivé';

-- =====================================================
-- 3. TABLE ROUTEUR_DEVICES
-- =====================================================
-- Stocke les informations des routeurs

CREATE TABLE IF NOT EXISTS routeur_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL, -- Support IPv4 et IPv6
    model VARCHAR(255),
    os_version VARCHAR(100),
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'online' CHECK (
        status IN (
            'online',
            'offline',
            'maintenance'
        )
    ),
    uptime INTERVAL,
    cpu_usage DECIMAL(5, 2), -- Pourcentage 0-100
    ram_usage DECIMAL(5, 2), -- Pourcentage 0-100
    ram_total BIGINT, -- En MB
    ram_used BIGINT, -- En MB
    bandwidth_in BIGINT, -- Bande passante entrante (Mbps)
    bandwidth_out BIGINT, -- Bande passante sortante (Mbps)
    last_check TIMESTAMP
    WITH
        TIME ZONE,
        notes TEXT,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_routeur_devices_ip ON routeur_devices (ip_address);

CREATE INDEX IF NOT EXISTS idx_routeur_devices_status ON routeur_devices (status);

CREATE INDEX IF NOT EXISTS idx_routeur_devices_name ON routeur_devices (name);

CREATE INDEX IF NOT EXISTS idx_routeur_devices_last_check ON routeur_devices (last_check);

-- Commentaires
COMMENT ON TABLE routeur_devices IS 'Table des routeurs surveillés';

COMMENT ON COLUMN routeur_devices.ip_address IS 'Adresse IP du routeur (IPv4 ou IPv6)';

COMMENT ON COLUMN routeur_devices.status IS 'Statut: online, offline, maintenance';

COMMENT ON COLUMN routeur_devices.uptime IS 'Temps de fonctionnement depuis le dernier redémarrage';

COMMENT ON COLUMN routeur_devices.cpu_usage IS 'Utilisation CPU en pourcentage (0-100)';

COMMENT ON COLUMN routeur_devices.ram_usage IS 'Utilisation RAM en pourcentage (0-100)';

COMMENT ON COLUMN routeur_devices.last_check IS 'Dernière vérification de l''état du routeur';

-- =====================================================
-- 4. TABLE WINDOWS_SERVERS
-- =====================================================
-- Stocke les informations des serveurs Windows

CREATE TABLE IF NOT EXISTS windows_servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(255) NOT NULL,
    hostname VARCHAR(255),
    ip_address VARCHAR(45) NOT NULL, -- Support IPv4 et IPv6
    os_version VARCHAR(100),
    domain_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'online' CHECK (
        status IN (
            'online',
            'offline',
            'maintenance'
        )
    ),
    uptime INTERVAL,
    cpu_usage DECIMAL(5, 2), -- Pourcentage 0-100
    ram_usage DECIMAL(5, 2), -- Pourcentage 0-100
    ram_total BIGINT, -- En GB
    ram_used BIGINT, -- En GB
    disk_usage DECIMAL(5, 2), -- Pourcentage d'utilisation du disque
    disk_total BIGINT, -- Espace disque total en GB
    disk_used BIGINT, -- Espace disque utilisé en GB
    last_check TIMESTAMP
    WITH
        TIME ZONE,
        notes TEXT,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_windows_servers_ip ON windows_servers (ip_address);

CREATE INDEX IF NOT EXISTS idx_windows_servers_status ON windows_servers (status);

CREATE INDEX IF NOT EXISTS idx_windows_servers_hostname ON windows_servers (hostname);

CREATE INDEX IF NOT EXISTS idx_windows_servers_last_check ON windows_servers (last_check);

-- Commentaires
COMMENT ON
TABLE windows_servers IS 'Table des serveurs Windows surveillés';

COMMENT ON COLUMN windows_servers.hostname IS 'Nom d''hôte du serveur Windows';

COMMENT ON COLUMN windows_servers.domain_name IS 'Nom du domaine Active Directory (si applicable)';

COMMENT ON COLUMN windows_servers.status IS 'Statut: online, offline, maintenance';

COMMENT ON COLUMN windows_servers.last_check IS 'Dernière vérification de l''état du serveur';

-- =====================================================
-- 5. TABLE LOGS
-- =====================================================
-- Stocke les logs système de l'application

CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    level VARCHAR(20) NOT NULL CHECK (
        level IN (
            'info',
            'warning',
            'error',
            'debug',
            'critical'
        )
    ),
    message TEXT NOT NULL,
    source_type VARCHAR(50), -- 'application', 'routeur', 'windows_server', 'system'
    source_id UUID, -- ID de la source (routeur, serveur, etc.)
    metadata JSONB, -- Métadonnées supplémentaires au format JSON
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches et filtrages rapides
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs (level);

CREATE INDEX IF NOT EXISTS idx_logs_source_type ON logs (source_type);

CREATE INDEX IF NOT EXISTS idx_logs_source_id ON logs (source_id);

CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_logs_level_created_at ON logs (level, created_at DESC);

-- Commentaires
COMMENT ON TABLE logs IS 'Table des logs système de l''application';

COMMENT ON COLUMN logs.level IS 'Niveau de log: info, warning, error, debug, critical';

COMMENT ON COLUMN logs.message IS 'Message du log';

COMMENT ON COLUMN logs.source_type IS 'Type de source: application, routeur, windows_server, system';

COMMENT ON COLUMN logs.source_id IS 'ID de la source (routeur ou serveur si applicable)';

COMMENT ON COLUMN logs.metadata IS 'Métadonnées supplémentaires au format JSON';

-- =====================================================
-- 6. TABLE AUDIT_LOGS
-- =====================================================
-- Stocke les logs d'audit (toutes les actions utilisateurs)

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES app_users (id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    action_type VARCHAR(20) NOT NULL CHECK (
        action_type IN (
            'create',
            'update',
            'delete',
            'login',
            'logout'
        )
    ),
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'routeur_device', 'windows_server'
    entity_id UUID,
    entity_name VARCHAR(255),
    old_values JSONB, -- Anciennes valeurs (pour les updates)
    new_values JSONB, -- Nouvelles valeurs
    ip_address VARCHAR(45), -- IP de l'utilisateur
    user_agent TEXT, -- User agent du navigateur
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches et filtrages rapides
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs (action_type);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs (entity_type);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs (entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs (
    user_id,
    action_type,
    created_at DESC
);

-- Commentaires
COMMENT ON
TABLE audit_logs IS 'Table des logs d''audit (toutes les actions utilisateurs)';

COMMENT ON COLUMN audit_logs.action_type IS 'Type d''action: create, update, delete, login, logout';

COMMENT ON COLUMN audit_logs.entity_type IS 'Type d''entité modifiée: user, routeur_device, windows_server';

COMMENT ON COLUMN audit_logs.old_values IS 'Anciennes valeurs (format JSON) - pour les modifications';

COMMENT ON COLUMN audit_logs.new_values IS 'Nouvelles valeurs (format JSON)';

-- =====================================================
-- 7. TABLE DEVICE_ASSIGNMENTS
-- =====================================================
-- Table de liaison pour assigner des équipements aux utilisateurs

CREATE TABLE IF NOT EXISTS device_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES app_users (id) ON DELETE CASCADE NOT NULL,
    device_type VARCHAR(50) NOT NULL CHECK (
        device_type IN (
            'routeur_device',
            'windows_server'
        )
    ),
    device_id UUID NOT NULL, -- ID du routeur ou serveur
    assignment_date TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        notes TEXT,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        -- Contrainte pour éviter les doublons
        UNIQUE (
            user_id,
            device_type,
            device_id
        )
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_device_assignments_user_id ON device_assignments (user_id);

CREATE INDEX IF NOT EXISTS idx_device_assignments_device ON device_assignments (device_type, device_id);

-- Commentaires
COMMENT ON
TABLE device_assignments IS 'Table de liaison pour assigner des équipements aux utilisateurs';

COMMENT ON COLUMN device_assignments.device_type IS 'Type d''équipement: routeur_device ou windows_server';

COMMENT ON COLUMN device_assignments.device_id IS 'ID de l''équipement (routeur ou serveur)';

-- =====================================================
-- 8. FONCTIONS POUR METTRE À JOUR updated_at AUTOMATIQUEMENT
-- =====================================================

-- Fonction générique pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_users_updated_at
    BEFORE UPDATE ON app_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routeur_devices_updated_at
    BEFORE UPDATE ON routeur_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_windows_servers_updated_at
    BEFORE UPDATE ON windows_servers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_assignments_updated_at
    BEFORE UPDATE ON device_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. DONNÉES INITIALES - RÔLES PAR DÉFAUT
-- =====================================================

-- Insérer les rôles par défaut (seulement s'ils n'existent pas)
INSERT INTO
    roles (name, description)
VALUES (
        'Administrateur',
        'Accès complet à toutes les fonctionnalités'
    ),
    (
        'Opérateur',
        'Gestion opérationnelle des appareils et serveurs'
    ),
    (
        'Lecteur',
        'Accès en lecture seule au dashboard et aux logs'
    ) ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 10. CRÉATION D'UN UTILISATEUR ADMIN PAR DÉFAUT (OPTIONNEL)
-- =====================================================
-- Décommentez et modifiez pour créer un utilisateur admin initial

/*
-- Récupérer l'ID du rôle Administrateur
DO $$
DECLARE
admin_role_id UUID;
hashed_password TEXT;
BEGIN
-- Récupérer l'ID du rôle Administrateur
SELECT id INTO admin_role_id FROM roles WHERE name = 'Administrateur';

IF admin_role_id IS NULL THEN
RAISE EXCEPTION 'Le rôle Administrateur n''existe pas';
END IF;

-- IMPORTANT : Le mot de passe doit être hashé côté application
-- Format: sha256$salt$hash
-- Exemple: sha256$abc123$def456...
-- Pour l'instant, on crée l'utilisateur sans mot de passe
-- Vous devrez le définir via l'interface de l'application

INSERT INTO app_users (email, full_name, role_id, is_active)
VALUES (
'admin@example.com',
'Administrateur Principal',
admin_role_id,
TRUE
)
ON CONFLICT (email) DO NOTHING;

RAISE NOTICE 'Utilisateur admin créé. Connectez-vous et définissez un mot de passe.';
END $$;
*/

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================