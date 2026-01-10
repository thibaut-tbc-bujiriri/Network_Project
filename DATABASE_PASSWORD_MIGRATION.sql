-- Script SQL pour hasher les mots de passe existants
-- ⚠️ ATTENTION: Ce script doit être exécuté depuis l'application, pas directement dans Supabase
-- car le hashage doit se faire côté application avec le même algorithme

-- Ce script SQL ne peut pas hasher les mots de passe directement
-- Utilisez plutôt le script JavaScript ci-dessous ou l'interface de l'application

-- Pour hasher les mots de passe existants :
-- 1. Connectez-vous en tant qu'administrateur
-- 2. Modifiez chaque utilisateur et changez son mot de passe
-- 3. Le nouveau mot de passe sera automatiquement hashé

-- OU utilisez cette fonction Edge Function dans Supabase (recommandé) :

/*
-- Créer une Edge Function dans Supabase pour hasher les mots de passe
-- Fichier: supabase/functions/hash-passwords/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Récupérer tous les utilisateurs avec mots de passe non hashés
  const { data: users, error } = await supabase
    .from('app_users')
    .select('id, password')
    .not('password', 'like', 'sha256$%')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  // Note: Le hashage doit être fait côté application avec le même algorithme
  // Cette fonction ne peut pas hasher directement
  
  return new Response(
    JSON.stringify({ 
      message: 'Utilisez l\'interface de l\'application pour hasher les mots de passe',
      users_count: users?.length || 0
    }),
    { headers: { 'Content-Type': 'application/json' }, status: 200 }
  )
})
*/

-- Alternative: Script de migration manuelle
-- Pour chaque utilisateur, exécutez dans l'application :
-- 1. Connectez-vous avec l'utilisateur
-- 2. Modifiez son mot de passe (même mot de passe)
-- 3. Le mot de passe sera automatiquement hashé

-- Vérifier les mots de passe hashés :
SELECT 
  id,
  email,
  full_name,
  CASE 
    WHEN password LIKE 'sha256$%' THEN 'Hashé'
    ELSE 'Non hashé'
  END as password_status,
  LENGTH(password) as password_length
FROM app_users
ORDER BY created_at;


