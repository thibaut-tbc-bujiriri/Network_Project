/**
 * Script de test pour diagnostiquer le système de logging
 */
import dotenv from 'dotenv';
import { LogService } from './src/services/logService.js';
import { supabase } from './src/config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_FILE = path.join(__dirname, 'logs', 'surveillance.log');

console.log('🔍 Test du système de logging\n');
console.log('='.repeat(60));

// Test 1: Vérifier la connexion Supabase
console.log('\n1️⃣ Test de connexion Supabase...');
try {
  const { data, error } = await supabase
    .from('logs')
    .select('count')
    .limit(1);
  
  if (error) {
    console.log(`❌ Erreur Supabase: ${error.message}`);
    console.log(`   Code: ${error.code || 'N/A'}`);
    console.log(`   Détails: ${error.details || 'N/A'}`);
  } else {
    console.log('✅ Connexion Supabase OK');
  }
} catch (error) {
  console.log(`❌ Erreur: ${error.message}`);
}

// Test 2: Vérifier le fichier log
console.log('\n2️⃣ Test du fichier log...');
try {
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    console.log('✅ Dossier logs créé');
  } else {
    console.log('✅ Dossier logs existe');
  }
  
  if (fs.existsSync(LOG_FILE)) {
    const stats = fs.statSync(LOG_FILE);
    console.log(`✅ Fichier log existe (${stats.size} bytes)`);
    const content = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    console.log(`   Nombre de lignes: ${lines.length}`);
    if (lines.length > 0) {
      console.log(`   Dernière ligne: ${lines[lines.length - 1].substring(0, 100)}...`);
    }
  } else {
    console.log('⚠️  Fichier log n\'existe pas encore (sera créé au premier log)');
  }
} catch (error) {
  console.log(`❌ Erreur: ${error.message}`);
}

// Test 3: Test d'écriture dans Supabase
console.log('\n3️⃣ Test d\'écriture dans Supabase...');
try {
  const testLog = {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Test Equipment',
    ip_address: '192.168.1.1',
    type: 'routeur',
    status: 'online',
    cpu: 10,
    ram_usage: 50,
    disk_usage: null,
    latency: 5,
    error: null
  };

  const { error: supabaseError } = await supabase
    .from('logs')
    .insert({
      level: 'info',
      message: 'Test de logging - ' + new Date().toISOString(),
      source_type: 'routeur',
      source_id: testLog.id,
      metadata: {
        equipment_name: testLog.name,
        ip_address: testLog.ip_address,
        status: testLog.status,
        type: testLog.type,
        cpu: testLog.cpu,
        ram: testLog.ram_usage,
        disk: testLog.disk_usage,
        latency: testLog.latency,
        timestamp: new Date().toISOString()
      }
    });

  if (supabaseError) {
    console.log(`❌ Erreur insertion: ${supabaseError.message}`);
    console.log(`   Code: ${supabaseError.code || 'N/A'}`);
    console.log(`   Détails: ${supabaseError.details || 'N/A'}`);
    console.log(`   Hint: ${supabaseError.hint || 'N/A'}`);
  } else {
    console.log('✅ Insertion Supabase réussie');
  }
} catch (error) {
  console.log(`❌ Erreur: ${error.message}`);
  if (error.stack) {
    console.log(`   Stack: ${error.stack.split('\n')[1]}`);
  }
}

// Test 4: Test d'écriture fichier
console.log('\n4️⃣ Test d\'écriture fichier...');
try {
  const testEntry = {
    type: 'routeur',
    equipment_name: 'Test Equipment',
    ip_address: '192.168.1.1',
    status: 'online',
    cpu: 10,
    ram: 50,
    disk: null
  };

  LogService.writeToFile(testEntry);
  console.log('✅ Écriture fichier réussie');
  
  // Vérifier que le fichier a été écrit
  if (fs.existsSync(LOG_FILE)) {
    const content = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    console.log(`   Dernière ligne écrite: ${lines[lines.length - 1]}`);
  }
} catch (error) {
  console.log(`❌ Erreur: ${error.message}`);
}

// Test 5: Test complet avec LogService
console.log('\n5️⃣ Test complet avec LogService...');
try {
  const testRouter = {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Test Router',
    ip_address: '192.168.1.2'
  };

  const testMonitoringData = {
    status: 'online',
    cpu: 15,
    ram_usage: 60,
    latency: 8,
    error: null
  };

  await LogService.logRouterMonitoring(testRouter, testMonitoringData);
  console.log('✅ LogService.logRouterMonitoring() exécuté sans erreur');
} catch (error) {
  console.log(`❌ Erreur: ${error.message}`);
  if (error.stack) {
    console.log(`   Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
  }
}

// Test 6: Vérifier les logs récents dans Supabase
console.log('\n6️⃣ Vérification des logs récents dans Supabase...');
try {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.log(`❌ Erreur: ${error.message}`);
  } else {
    console.log(`✅ ${data.length} log(s) récent(s) trouvé(s)`);
    if (data.length > 0) {
      console.log('\n   Derniers logs:');
      data.forEach((log, index) => {
        console.log(`   ${index + 1}. [${log.created_at}] ${log.level} - ${log.message}`);
        if (log.metadata) {
          console.log(`      Equipment: ${log.metadata.equipment_name || 'N/A'} (${log.metadata.ip_address || 'N/A'})`);
        }
      });
    } else {
      console.log('   ⚠️  Aucun log trouvé dans Supabase');
    }
  }
} catch (error) {
  console.log(`❌ Erreur: ${error.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('✅ Tests terminés\n');

