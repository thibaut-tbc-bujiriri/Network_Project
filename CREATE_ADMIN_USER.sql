-- =====================================================
-- SCRIPT DE CRÉATION D'UN UTILISATEUR ADMINISTRATEUR
-- Network Manager - Application de Gestion Réseau
-- =====================================================
-- 
-- Ce script crée un utilisateur administrateur par défaut
-- IMPORTANT : Modifiez l'email et le nom avant d'exécuter !
-- =====================================================

-- =====================================================
-- ⭐ VERSION RAPIDE - COPIER-COLLER CETTE COMMANDE
-- =====================================================
-- Remplacez 'admin@example.com' et 'Administrateur Principal' par vos valeurs

INSERT INTO app_users (email, full_name, role_id, is_active, password)
VALUES (
    'admin@example.com',  -- ⚠️ REMPLACEZ PAR VOTRE EMAIL
    'Administrateur Principal',  -- ⚠️ REMPLACEZ PAR VOTRE NOM
    (SELECT id FROM roles WHERE name = 'Administrateur'),
    TRUE,
    NULL  -- Le mot de passe sera défini via l'application
)
ON CONFLICT (email) DO UPDATE
SET 
    full_name = EXCLUDED.full_name,
    role_id = EXCLUDED.role_id,
    is_active = TRUE,
    updated_at = NOW();

-- ⚠️ IMPORTANT : Après avoir créé l'utilisateur, connectez-vous à l'application
-- et définissez un mot de passe via l'interface de gestion des utilisateurs

-- =====================================================
-- OPTION 1 : CRÉATION AVEC VÉRIFICATIONS (RECOMMANDÉ)
-- =====================================================

DO $$
DECLARE
    admin_role_id UUID;
    admin_email VARCHAR(255) := 'admin@example.com';  -- ⚠️ MODIFIEZ CET EMAIL
    admin_name VARCHAR(255) := 'Administrateur Principal';  -- ⚠️ MODIFIEZ CE NOM
BEGIN
    -- Vérifier que le rôle Administrateur existe
    SELECT id INTO admin_role_id 
    FROM roles 
    WHERE name = 'Administrateur';
    
    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Le rôle Administrateur n''existe pas. Veuillez d''abord exécuter DATABASE_SCHEMA.sql';
    END IF;
    
    -- Créer l'utilisateur admin (sans mot de passe - à définir via l'application)
    INSERT INTO app_users (email, full_name, role_id, is_active, password)
    VALUES (
        admin_email,
        admin_name,
        admin_role_id,
        TRUE,
        NULL  -- Le mot de passe sera défini via l'interface de l'application
    )
    ON CONFLICT (email) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        role_id = EXCLUDED.role_id,
        is_active = TRUE,
        updated_at = NOW();
    
    RAISE NOTICE '✅ Utilisateur admin créé avec succès !';
    RAISE NOTICE '📧 Email: %', admin_email;
    RAISE NOTICE '👤 Nom: %', admin_name;
    RAISE NOTICE '⚠️ IMPORTANT: Connectez-vous à l''application et définissez un mot de passe !';
END $$;

-- =====================================================
-- OPTION 2 : CRÉATION AVEC MOT DE PASSE HASHÉ (AVANCÉ)
-- =====================================================
-- Décommentez cette section si vous voulez définir un mot de passe directement
-- Format du hash: sha256$salt$hash

/*
DO $$
DECLARE
    admin_role_id UUID;
    admin_email VARCHAR(255) := 'admin@example.com';  -- ⚠️ MODIFIEZ
    admin_name VARCHAR(255) := 'Administrateur Principal';  -- ⚠️ MODIFIEZ
    admin_password_hash TEXT := 'sha256$salt$hash';  -- ⚠️ REMPLACEZ PAR LE HASH RÉEL
BEGIN
    -- Récupérer l'ID du rôle Administrateur
    SELECT id INTO admin_role_id 
    FROM roles 
    WHERE name = 'Administrateur';
    
    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Le rôle Administrateur n''existe pas';
    END IF;
    
    -- Créer l'utilisateur avec mot de passe hashé
    INSERT INTO app_users (email, full_name, role_id, is_active, password)
    VALUES (
        admin_email,
        admin_name,
        admin_role_id,
        TRUE,
        admin_password_hash
    )
    ON CONFLICT (email) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        role_id = EXCLUDED.role_id,
        is_active = TRUE,
        password = EXCLUDED.password,
        updated_at = NOW();
    
    RAISE NOTICE '✅ Utilisateur admin créé avec mot de passe hashé !';
END $$;
*/

-- =====================================================
-- OPTION 3 : CRÉATION RAPIDE (UNE SEULE COMMANDE)
-- =====================================================
-- Remplacez 'admin@example.com' et 'Administrateur Principal' par vos valeurs

INSERT INTO app_users (email, full_name, role_id, is_active, password)
VALUES (
    'admin@example.com',  -- ⚠️ MODIFIEZ CET EMAIL
    'Administrateur Principal',  -- ⚠️ MODIFIEZ CE NOM
    (SELECT id FROM roles WHERE name = 'Administrateur'),
    TRUE,
    NULL  -- Mot de passe à définir via l'application
)
ON CONFLICT (email) DO UPDATE
SET 
    full_name = EXCLUDED.full_name,
    role_id = EXCLUDED.role_id,
    is_active = TRUE,
    updated_at = NOW();

-- =====================================================
-- VÉRIFICATION : AFFICHER L'UTILISATEUR CRÉÉ
-- =====================================================

-- Afficher les informations de l'utilisateur admin créé
SELECT 
    au.id,
    au.email,
    au.full_name,
    r.name AS role_name,
    au.is_active,
    CASE 
        WHEN au.password IS NULL THEN '❌ Non défini'
        WHEN au.password LIKE 'sha256$%' THEN '✅ Hashé'
        ELSE '⚠️ En clair (à hasher)'
    END AS password_status,
    au.created_at
FROM app_users au
LEFT JOIN roles r ON au.role_id = r.id
WHERE au.email = 'admin@example.com'  -- ⚠️ MODIFIEZ CET EMAIL
OR r.name = 'Administrateur';

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

/*
⚠️ SÉCURITÉ :

1. NE JAMAIS stocker les mots de passe en clair dans la base de données
2. Le mot de passe doit être hashé côté application avec SHA-256
3. Format du hash: sha256$salt$hash (généré par l'application)

📝 PROCÉDURE RECOMMANDÉE :

1. Exécutez ce script pour créer l'utilisateur admin (sans mot de passe)
2. Connectez-vous à l'application avec l'email admin@example.com
3. Allez dans "Gestion des utilisateurs"
4. Modifiez votre profil et définissez un mot de passe
5. Le mot de passe sera automatiquement hashé par l'application

🔐 Pour hasher un mot de passe manuellement (si nécessaire) :

L'application utilise le format suivant:
- Format: sha256$salt$hash
- Salt: Chaîne aléatoire unique
- Hash: SHA-256(password + salt)

Vous pouvez utiliser cette fonction dans l'application Node.js/Python pour générer le hash.
*/

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

