/**
 * Configuration Supabase pour le backend
 * Utilise la SERVICE_ROLE_KEY pour avoir accès complet à la base de données
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    '❌ Variables d\'environnement Supabase manquantes!\n' +
    '   Ajoutez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans votre fichier .env\n' +
    `   SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}\n` +
    `   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅' : '❌'}`
  );
}

// Vérifier que l'URL est valide
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error(
    `❌ URL Supabase invalide: ${supabaseUrl}\n` +
    '   L\'URL doit commencer par https:// et contenir .supabase.co'
  );
}

// Créer le client Supabase avec la service role key
// Cette clé permet un accès complet (bypass RLS) - ⚠️ Ne jamais exposer côté frontend !
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'network-manager-backend'
    }
  }
});

console.log('✅ Client Supabase configuré');
console.log(`   URL: ${supabaseUrl}`);

