/**
 * Script de migration pour hasher les mots de passe existants
 * À exécuter une seule fois depuis la console du navigateur (F12)
 * 
 * INSTRUCTIONS:
 * 1. Connectez-vous en tant qu'administrateur
 * 2. Ouvrez la console du navigateur (F12)
 * 3. Copiez-collez ce code dans la console
 * 4. Appuyez sur Entrée
 */

export async function migrateAllPasswords() {
  const { supabaseService } = await import('../services/supabaseClient');
  const { hashPassword, isPasswordHashed } = await import('./password');

  try {
    console.log('🔄 Début de la migration des mots de passe...');
    
    // Récupérer tous les utilisateurs
    const users = await supabaseService.getUsers();
    console.log(`📊 ${users.length} utilisateur(s) trouvé(s)`);

    let migrated = 0;
    let alreadyHashed = 0;
    let errors = 0;

    for (const user of users) {
      if (!user.password) {
        console.warn(`⚠️ Utilisateur ${user.email} n'a pas de mot de passe`);
        continue;
      }

      // Vérifier si déjà hashé
      if (isPasswordHashed(user.password)) {
        console.log(`✅ ${user.email} : déjà hashé`);
        alreadyHashed++;
        continue;
      }

      try {
        // Demander le mot de passe actuel à l'utilisateur
        // Note: En production, il faudrait demander à l'admin de fournir les mots de passe
        // ou forcer une réinitialisation
        console.warn(`⚠️ ${user.email} : mot de passe non hashé`);
        console.warn(`   Pour hasher ce mot de passe, modifiez-le via l'interface`);
        console.warn(`   ou réinitialisez-le pour forcer un nouveau hash`);
        
        // Option: Hasher avec un mot de passe temporaire (non recommandé)
        // const tempPassword = 'TEMPORARY_PASSWORD_' + Date.now();
        // const hashedPassword = await hashPassword(tempPassword);
        // await supabaseService.updateUser(user.id, { password: hashedPassword });
        
        errors++;
      } catch (err) {
        console.error(`❌ Erreur pour ${user.email}:`, err);
        errors++;
      }
    }

    console.log('\n📊 Résumé de la migration:');
    console.log(`   ✅ Déjà hashés: ${alreadyHashed}`);
    console.log(`   🔄 À migrer: ${errors}`);
    console.log(`   ✅ Total: ${users.length}`);
    
    console.log('\n💡 Pour migrer les mots de passe non hashés:');
    console.log('   1. Modifiez chaque utilisateur via l\'interface');
    console.log('   2. Changez son mot de passe (même mot de passe)');
    console.log('   3. Le nouveau mot de passe sera automatiquement hashé');
    
  } catch (err) {
    console.error('❌ Erreur lors de la migration:', err);
  }
}

// Pour exécuter depuis la console :
// import('./utils/migratePasswords.js').then(m => m.migrateAllPasswords());




