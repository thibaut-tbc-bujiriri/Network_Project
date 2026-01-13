-- =====================================================
-- SCRIPT : Ajouter les colonnes pour la surveillance
-- Network Manager Backend
-- =====================================================
--
-- Ce script ajoute les colonnes nécessaires pour stocker :
-- - Les credentials (username, password_encrypted)
-- - Les métriques de surveillance (cpu_usage, ram_usage, etc.)
--
-- IMPORTANT : Exécutez ce script DANS Supabase SQL Editor
-- =====================================================

-- =====================================================
-- COLONNES POUR ROUTEUR_DEVICES
-- =====================================================

-- Ajouter les colonnes de credentials
ALTER TABLE routeur_devices
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS password_encrypted TEXT,
ADD COLUMN IF NOT EXISTS snmp_community TEXT DEFAULT 'public';

-- Vérifier que les colonnes de métriques existent (créées dans DATABASE_SCHEMA.sql)
-- Si elles n'existent pas, les ajouter :

ALTER TABLE routeur_devices
ADD COLUMN IF NOT EXISTS cpu_usage DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS ram_usage DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS ram_total BIGINT,
ADD COLUMN IF NOT EXISTS ram_used BIGINT,
ADD COLUMN IF NOT EXISTS bandwidth_in BIGINT,
ADD COLUMN IF NOT EXISTS bandwidth_out BIGINT,
ADD COLUMN IF NOT EXISTS last_check TIMESTAMP
WITH
    TIME ZONE,
ADD COLUMN IF NOT EXISTS uptime INTERVAL;

-- Commentaires
COMMENT ON COLUMN routeur_devices.username IS 'Nom d''utilisateur SSH/SNMP (optionnel)';

COMMENT ON COLUMN routeur_devices.password_encrypted IS 'Mot de passe chiffré (format JSON avec encrypted, iv, authTag)';

COMMENT ON COLUMN routeur_devices.snmp_community IS 'Communauté SNMP (défaut: public)';

COMMENT ON COLUMN routeur_devices.last_check IS 'Dernière vérification de l''état';

-- =====================================================
-- COLONNES POUR WINDOWS_SERVERS
-- =====================================================

-- Ajouter les colonnes de credentials
ALTER TABLE windows_servers
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS password_encrypted TEXT;

-- Vérifier que les colonnes de métriques existent
ALTER TABLE windows_servers
ADD COLUMN IF NOT EXISTS cpu_usage DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS ram_usage DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS ram_total BIGINT,
ADD COLUMN IF NOT EXISTS ram_used BIGINT,
ADD COLUMN IF NOT EXISTS disk_usage DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS disk_total BIGINT,
ADD COLUMN IF NOT EXISTS disk_used BIGINT,
ADD COLUMN IF NOT EXISTS last_check TIMESTAMP
WITH
    TIME ZONE,
ADD COLUMN IF NOT EXISTS uptime INTERVAL;

-- Commentaires
COMMENT ON COLUMN windows_servers.username IS 'Nom d''utilisateur Windows (optionnel)';

COMMENT ON COLUMN windows_servers.password_encrypted IS 'Mot de passe chiffré (format JSON avec encrypted, iv, authTag)';

COMMENT ON COLUMN windows_servers.last_check IS 'Dernière vérification de l''état';

-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- Vérifier que toutes les colonnes ont été ajoutées
DO $$
BEGIN
    RAISE NOTICE '✅ Vérification des colonnes ajoutées...';
    
    -- Vérifier routeur_devices
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'routeur_devices' 
        AND column_name = 'username'
    ) THEN
        RAISE NOTICE '✅ Colonnes pour routeur_devices: OK';
    ELSE
        RAISE WARNING '⚠️ Colonnes pour routeur_devices: Manquantes';
    END IF;
    
    -- Vérifier windows_servers
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'windows_servers' 
        AND column_name = 'username'
    ) THEN
        RAISE NOTICE '✅ Colonnes pour windows_servers: OK';
    ELSE
        RAISE WARNING '⚠️ Colonnes pour windows_servers: Manquantes';
    END IF;
    
    RAISE NOTICE '✅ Script terminé !';
END $$;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================