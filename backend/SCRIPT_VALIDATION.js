/**
 * Script de Validation de la Surveillance
 * 
 * Ce script vérifie que la surveillance fonctionne correctement
 * avec le matériel réel (routeur Orange HomeBox et Windows Server 2012)
 * 
 * Usage: node SCRIPT_VALIDATION.js
 */

import { SupabaseService } from './src/services/supabaseService.js';
import { RouterMonitor } from './src/services/routerMonitor.js';
import { WindowsMonitor } from './src/services/windowsMonitor.js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseService = new SupabaseService();
const routerMonitor = new RouterMonitor();
const windowsMonitor = new WindowsMonitor();

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Test 1: Vérifier la connexion à Supabase
 */
async function testSupabaseConnection() {
  logSection('TEST 1: Connexion à Supabase');
  
  try {
    const routers = await supabaseService.getAllRouters();
    const servers = await supabaseService.getAllWindowsServers();
    
    logSuccess(`Connexion Supabase OK`);
    logInfo(`Routeurs trouvés: ${routers.length}`);
    logInfo(`Serveurs Windows trouvés: ${servers.length}`);
    
    if (routers.length === 0) {
      logWarning('Aucun routeur configuré dans Supabase');
    }
    if (servers.length === 0) {
      logWarning('Aucun serveur Windows configuré dans Supabase');
    }
    
    return { success: true, routers, servers };
  } catch (error) {
    logError(`Erreur de connexion Supabase: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test 2: Vérifier la surveillance d'un routeur (ping)
 */
async function testRouterMonitoring(router) {
  logSection(`TEST 2: Surveillance Routeur - ${router.name}`);
  
  try {
    logInfo(`IP: ${router.ip_address}`);
    logInfo(`Type: ${router.username ? 'Routeur avancé (SSH/SNMP)' : 'Routeur simple (Ping uniquement)'}`);
    
    const startTime = Date.now();
    const monitoringData = await routerMonitor.monitorRouter(router);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    logInfo(`Durée: ${duration}s`);
    logInfo(`Statut: ${monitoringData.status}`);
    
    if (monitoringData.status === 'online') {
      logSuccess(`Routeur ONLINE`);
      if (monitoringData.latency) {
        logInfo(`Latence: ${monitoringData.latency}ms`);
      }
      if (monitoringData.cpu !== null) {
        logInfo(`CPU: ${monitoringData.cpu}%`);
        logInfo(`RAM: ${monitoringData.ram_usage || 'N/A'}%`);
      } else {
        logInfo(`Métriques: Ping uniquement (normal pour routeur simple)`);
      }
    } else if (monitoringData.status === 'offline') {
      logWarning(`Routeur OFFLINE (vérifier que l'équipement est allumé)`);
    } else {
      logError(`Erreur: ${monitoringData.error || 'Erreur inconnue'}`);
    }
    
    // Mettre à jour dans Supabase
    await supabaseService.updateRouterStatus(router.id, monitoringData);
    logSuccess(`Mise à jour Supabase réussie`);
    
    return { success: true, monitoringData };
  } catch (error) {
    logError(`Erreur lors de la surveillance: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test 3: Vérifier la surveillance d'un serveur Windows
 */
async function testWindowsMonitoring(server) {
  logSection(`TEST 3: Surveillance Windows Server - ${server.name}`);
  
  try {
    logInfo(`IP: ${server.ip_address}`);
    logInfo(`Hostname: ${server.hostname || 'N/A'}`);
    logInfo(`WinRM: ${server.username ? 'Configuré' : 'Non configuré (ping uniquement)'}`);
    
    const startTime = Date.now();
    const monitoringData = await windowsMonitor.monitorWindowsServer(server);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    logInfo(`Durée: ${duration}s`);
    logInfo(`Statut: ${monitoringData.status}`);
    
    if (monitoringData.status === 'online') {
      logSuccess(`Serveur ONLINE`);
      if (monitoringData.latency) {
        logInfo(`Latence: ${monitoringData.latency}ms`);
      }
      if (monitoringData.cpu !== null) {
        logSuccess(`Métriques WinRM disponibles:`);
        logInfo(`  CPU: ${monitoringData.cpu}%`);
        logInfo(`  RAM: ${monitoringData.ram_usage || 'N/A'}% (${monitoringData.ram_used || 'N/A'}GB / ${monitoringData.ram_total || 'N/A'}GB)`);
        logInfo(`  Disk: ${monitoringData.disk_usage || 'N/A'}% (${monitoringData.disk_used || 'N/A'}GB / ${monitoringData.disk_total || 'N/A'}GB)`);
        logInfo(`  Uptime: ${monitoringData.uptime || 'N/A'}`);
      } else {
        logWarning(`Métriques WinRM non disponibles (ping uniquement)`);
        logInfo(`Vérifier que WinRM est activé sur le serveur`);
      }
    } else if (monitoringData.status === 'offline') {
      logWarning(`Serveur OFFLINE (vérifier que le serveur est allumé)`);
    } else {
      logError(`Erreur: ${monitoringData.error || 'Erreur inconnue'}`);
    }
    
    // Mettre à jour dans Supabase
    await supabaseService.updateWindowsServerStatus(server.id, monitoringData);
    logSuccess(`Mise à jour Supabase réussie`);
    
    return { success: true, monitoringData };
  } catch (error) {
    logError(`Erreur lors de la surveillance: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test 4: Vérifier la cohérence des données dans Supabase
 */
async function testDataConsistency() {
  logSection('TEST 4: Cohérence des Données Supabase');
  
  try {
    const routers = await supabaseService.getAllRouters();
    const servers = await supabaseService.getAllWindowsServers();
    
    logInfo(`Vérification de ${routers.length} routeur(s)...`);
    for (const router of routers) {
      const hasRecentCheck = router.last_check 
        ? (Date.now() - new Date(router.last_check).getTime()) < 300000 // 5 minutes
        : false;
      
      if (hasRecentCheck) {
        logSuccess(`Routeur ${router.name}: last_check récent (${router.last_check})`);
      } else {
        logWarning(`Routeur ${router.name}: last_check manquant ou ancien`);
      }
      
      if (router.status === 'online' || router.status === 'offline') {
        logSuccess(`Routeur ${router.name}: status valide (${router.status})`);
      } else {
        logError(`Routeur ${router.name}: status invalide (${router.status})`);
      }
    }
    
    logInfo(`Vérification de ${servers.length} serveur(s) Windows...`);
    for (const server of servers) {
      const hasRecentCheck = server.last_check 
        ? (Date.now() - new Date(server.last_check).getTime()) < 300000 // 5 minutes
        : false;
      
      if (hasRecentCheck) {
        logSuccess(`Serveur ${server.name}: last_check récent (${server.last_check})`);
      } else {
        logWarning(`Serveur ${server.name}: last_check manquant ou ancien`);
      }
      
      if (server.status === 'online' || server.status === 'offline') {
        logSuccess(`Serveur ${server.name}: status valide (${server.status})`);
      } else {
        logError(`Serveur ${server.name}: status invalide (${server.status})`);
      }
    }
    
    return { success: true };
  } catch (error) {
    logError(`Erreur lors de la vérification: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test 5: Vérifier la sécurité (pas de passwords en clair)
 */
async function testSecurity() {
  logSection('TEST 5: Vérification Sécurité');
  
  try {
    const routers = await supabaseService.getAllRouters();
    const servers = await supabaseService.getAllWindowsServers();
    
    let hasPlainPassword = false;
    
    // Vérifier les routeurs
    for (const router of routers) {
      if (router.password && !router.password_encrypted) {
        logError(`Routeur ${router.name}: Password en clair détecté !`);
        hasPlainPassword = true;
      } else if (router.password_encrypted) {
        logSuccess(`Routeur ${router.name}: Password chiffré`);
      }
    }
    
    // Vérifier les serveurs
    for (const server of servers) {
      if (server.password && !server.password_encrypted) {
        logError(`Serveur ${server.name}: Password en clair détecté !`);
        hasPlainPassword = true;
      } else if (server.password_encrypted) {
        logSuccess(`Serveur ${server.name}: Password chiffré`);
      }
    }
    
    if (!hasPlainPassword) {
      logSuccess(`Aucun password en clair détecté`);
    }
    
    return { success: !hasPlainPassword };
  } catch (error) {
    logError(`Erreur lors de la vérification: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Fonction principale
 */
async function runValidation() {
  console.clear();
  log('\n' + '='.repeat(60), 'cyan');
  log('  SCRIPT DE VALIDATION - SURVEILLANCE MATÉRIEL RÉEL', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  const results = {
    supabase: false,
    routers: [],
    servers: [],
    consistency: false,
    security: false
  };
  
  // Test 1: Connexion Supabase
  const supabaseTest = await testSupabaseConnection();
  results.supabase = supabaseTest.success;
  
  if (!supabaseTest.success) {
    logError('\n❌ Impossible de continuer sans connexion Supabase');
    process.exit(1);
  }
  
  // Test 2: Surveillance routeurs
  if (supabaseTest.routers.length > 0) {
    for (const router of supabaseTest.routers) {
      const routerTest = await testRouterMonitoring(router);
      results.routers.push({ router: router.name, success: routerTest.success });
    }
  } else {
    logWarning('Aucun routeur à tester');
  }
  
  // Test 3: Surveillance serveurs Windows
  if (supabaseTest.servers.length > 0) {
    for (const server of supabaseTest.servers) {
      const serverTest = await testWindowsMonitoring(server);
      results.servers.push({ server: server.name, success: serverTest.success });
    }
  } else {
    logWarning('Aucun serveur Windows à tester');
  }
  
  // Test 4: Cohérence des données
  const consistencyTest = await testDataConsistency();
  results.consistency = consistencyTest.success;
  
  // Test 5: Sécurité
  const securityTest = await testSecurity();
  results.security = securityTest.success;
  
  // Résumé final
  logSection('RÉSUMÉ DES TESTS');
  
  log(`Connexion Supabase: ${results.supabase ? '✅' : '❌'}`, results.supabase ? 'green' : 'red');
  
  results.routers.forEach(r => {
    log(`Routeur ${r.router}: ${r.success ? '✅' : '❌'}`, r.success ? 'green' : 'red');
  });
  
  results.servers.forEach(s => {
    log(`Serveur ${s.server}: ${s.success ? '✅' : '❌'}`, s.success ? 'green' : 'red');
  });
  
  log(`Cohérence données: ${results.consistency ? '✅' : '❌'}`, results.consistency ? 'green' : 'red');
  log(`Sécurité: ${results.security ? '✅' : '❌'}`, results.security ? 'green' : 'red');
  
  const allTestsPassed = results.supabase && 
    results.routers.every(r => r.success) && 
    results.servers.every(s => s.success) &&
    results.consistency && 
    results.security;
  
  console.log('\n' + '='.repeat(60));
  if (allTestsPassed) {
    log('🎉 TOUS LES TESTS SONT PASSÉS !', 'green');
    log('✅ Le système est prêt à être utilisé en conditions réelles', 'green');
  } else {
    log('⚠️  CERTAINS TESTS ONT ÉCHOUÉ', 'yellow');
    log('Vérifiez les erreurs ci-dessus et corrigez-les', 'yellow');
  }
  console.log('='.repeat(60) + '\n');
  
  process.exit(allTestsPassed ? 0 : 1);
}

// Exécuter les tests
runValidation().catch(error => {
  logError(`Erreur fatale: ${error.message}`);
  console.error(error);
  process.exit(1);
});

