/**
 * Script de test de connexion Supabase
 * Pour diagnostiquer les problèmes de connexion
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import dns from 'dns';
import { promisify } from 'util';

dotenv.config();

const lookup = promisify(dns.lookup);

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

console.log('🔍 Test de connexion Supabase\n');
console.log(`URL: ${supabaseUrl}`);
console.log(`Service Key: ${supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : '❌ Manquante'}\n`);

// Test 1: Résolution DNS
console.log('1️⃣ Test de résolution DNS...');
try {
  const hostname = supabaseUrl.replace('https://', '').replace('http://', '').split('/')[0];
  const addresses = await lookup(hostname);
  console.log(`✅ DNS résolu: ${addresses.address}`);
} catch (error) {
  console.log(`❌ Erreur DNS: ${error.message}`);
  process.exit(1);
}

// Test 2: Création du client Supabase
console.log('\n2️⃣ Création du client Supabase...');
try {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('✅ Client créé');
} catch (error) {
  console.log(`❌ Erreur création client: ${error.message}`);
  process.exit(1);
}

// Test 3: Test de connexion (requête simple)
console.log('\n3️⃣ Test de connexion à l\'API...');
try {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase.from('routeur_devices').select('count').limit(1);
  
  if (error) {
    console.log(`⚠️  Erreur API: ${error.message}`);
    console.log(`   Code: ${error.code || 'N/A'}`);
    console.log(`   Détails: ${error.details || 'N/A'}`);
  } else {
    console.log('✅ Connexion API réussie');
  }
} catch (error) {
  console.log(`❌ Erreur de connexion: ${error.message}`);
  if (error.cause) {
    console.log(`   Cause: ${error.cause.message || error.cause}`);
  }
}

console.log('\n✅ Tests terminés');

