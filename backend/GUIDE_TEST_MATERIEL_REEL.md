# 🧪 Guide de Test avec Matériel Réel

## 📋 Prérequis

### Matériel
- ✅ Routeur Orange HomeBox (allumé et connecté au réseau)
- ✅ Windows Server 2012 virtualisé (allumé, WinRM activé)
- ✅ Backend Node.js démarré et fonctionnel
- ✅ Supabase configuré avec les tables créées
- ✅ Frontend React accessible

### Configuration Backend
- ✅ Variables d'environnement configurées (`.env`)
- ✅ Supabase URL et clés configurées
- ✅ Scheduler démarré

---

## 🔧 ÉTAPE 1 : Préparation de la Base de Données

### 1.1 Ajouter un Routeur Orange HomeBox dans Supabase

```sql
-- Insérer le routeur Orange HomeBox
INSERT INTO routeur_devices (name, ip_address, model, status)
VALUES (
    'Orange HomeBox',
    '192.168.1.1',  -- ⚠️ REMPLACER par l'IP réelle de votre routeur
    'Orange HomeBox',
    'offline'
);
```

**⚠️ IMPORTANT :**
- **PAS de username/password** pour Orange HomeBox (surveillance ping uniquement)
- Remplacer `192.168.1.1` par l'adresse IP réelle de votre routeur

### 1.2 Ajouter le Windows Server 2012 dans Supabase

```sql
-- Insérer le serveur Windows
INSERT INTO windows_servers (name, hostname, ip_address, os_version, status, username, password_encrypted)
VALUES (
    'Windows Server 2012',
    'WIN-SERVER-01',  -- ⚠️ REMPLACER par le hostname réel
    '192.168.1.100',  -- ⚠️ REMPLACER par l'IP réelle
    'Windows Server 2012',
    'offline',
    'Administrator',  -- ⚠️ REMPLACER par le username réel
    NULL  -- Le mot de passe sera chiffré par le frontend
);
```

**⚠️ IMPORTANT :**
- Remplacer `192.168.1.100` par l'IP réelle du serveur
- Remplacer `Administrator` par le username réel
- Le mot de passe sera ajouté via le frontend (il sera chiffré automatiquement)

---

## 🔧 ÉTAPE 2 : Configuration WinRM sur Windows Server 2012

### 2.1 Activer WinRM (si pas déjà fait)

Sur le serveur Windows Server 2012, exécuter en PowerShell **en tant qu'Administrateur** :

```powershell
# Activer WinRM
Enable-PSRemoting -Force

# Configurer WinRM pour accepter les connexions HTTP (port 5985)
winrm quickconfig -force

# Autoriser les connexions depuis le réseau
winrm set winrm/config/service/auth '@{Basic="true"}'
winrm set winrm/config/service '@{AllowUnencrypted="true"}'

# Vérifier que WinRM écoute sur le port 5985
winrm enumerate winrm/config/listener
```

**⚠️ SÉCURITÉ :** En production, utilisez HTTPS (port 5986) avec certificats.

### 2.2 Vérifier le Firewall

```powershell
# Autoriser WinRM dans le firewall
netsh advfirewall firewall add rule name="WinRM HTTP" dir=in action=allow protocol=TCP localport=5985
```

### 2.3 Tester WinRM depuis le Backend

Depuis votre machine backend, tester la connexion :

```powershell
# Tester WinRM (remplacer par l'IP réelle)
Test-WSMan -ComputerName 192.168.1.100 -Port 5985
```

---

## 🧪 ÉTAPE 3 : Tests de Surveillance

### 3.1 Démarrer le Backend

```bash
cd backend
npm start
```

Vous devriez voir :
```
✅ Scheduler de surveillance démarré (toutes les 60 secondes)
[2024-01-XX XX:XX:XX] 🔍 Début de la surveillance...
  📡 Surveillance de 1 routeur(s)...
    🟢 Orange HomeBox (192.168.1.1): online [15ms] (Ping uniquement)
  🖥️  Surveillance de 1 serveur(s) Windows...
    🟢 Windows Server 2012 (192.168.1.100): online [8ms] (CPU: 12%, RAM: 45%, Disk: 67%)
[2024-01-XX XX:XX:XX] ✅ Surveillance terminée en 2.34s
```

### 3.2 Test 1 : Routeur Orange HomeBox - ONLINE

**Action :**
1. Vérifier que le routeur est allumé
2. Attendre 60 secondes (cycle de surveillance)
3. Vérifier dans Supabase :

```sql
SELECT name, ip_address, status, last_check, cpu_usage, ram_usage
FROM routeur_devices
WHERE name = 'Orange HomeBox';
```

**Résultat attendu :**
- ✅ `status` = `'online'`
- ✅ `last_check` = timestamp récent (il y a moins de 2 minutes)
- ✅ `cpu_usage` = `NULL` (pas de métriques avancées pour Orange HomeBox)
- ✅ `ram_usage` = `NULL`

**Vérification dans les logs backend :**
```
🟢 Orange HomeBox (192.168.1.1): online [15ms] (Ping uniquement)
```

### 3.3 Test 2 : Routeur Orange HomeBox - OFFLINE

**Action :**
1. **Éteindre le routeur** (débrancher l'alimentation)
2. Attendre 60 secondes
3. Vérifier dans Supabase :

```sql
SELECT name, status, last_check
FROM routeur_devices
WHERE name = 'Orange HomeBox';
```

**Résultat attendu :**
- ✅ `status` = `'offline'`
- ✅ `last_check` = timestamp récent

**Vérification dans les logs backend :**
```
🔴 Orange HomeBox (192.168.1.1): offline
```

### 3.4 Test 3 : Windows Server 2012 - ONLINE avec Métriques

**Action :**
1. Vérifier que le serveur est allumé
2. Vérifier que WinRM est actif (port 5985)
3. Attendre 60 secondes
4. Vérifier dans Supabase :

```sql
SELECT name, ip_address, status, last_check, cpu_usage, ram_usage, disk_usage, uptime
FROM windows_servers
WHERE name = 'Windows Server 2012';
```

**Résultat attendu :**
- ✅ `status` = `'online'`
- ✅ `last_check` = timestamp récent
- ✅ `cpu_usage` = valeur entre 0 et 100 (ex: 12.5)
- ✅ `ram_usage` = valeur entre 0 et 100 (ex: 45.2)
- ✅ `disk_usage` = valeur entre 0 et 100 (ex: 67.8)
- ✅ `uptime` = intervalle (ex: "2 days 5:30:00")

**Vérification dans les logs backend :**
```
🟢 Windows Server 2012 (192.168.1.100): online [8ms] (CPU: 12%, RAM: 45%, Disk: 67%)
```

### 3.5 Test 4 : Windows Server 2012 - OFFLINE

**Action :**
1. **Éteindre la VM Windows Server 2012**
2. Attendre 60 secondes
3. Vérifier dans Supabase :

```sql
SELECT name, status, last_check, cpu_usage, ram_usage
FROM windows_servers
WHERE name = 'Windows Server 2012';
```

**Résultat attendu :**
- ✅ `status` = `'offline'`
- ✅ `last_check` = timestamp récent
- ✅ `cpu_usage`, `ram_usage`, etc. = valeurs précédentes (non écrasées)

**Vérification dans les logs backend :**
```
🔴 Windows Server 2012 (192.168.1.100): offline
```

### 3.6 Test 5 : Windows Server 2012 - WinRM Désactivé (Fallback Ping)

**Action :**
1. Désactiver WinRM sur le serveur (ou utiliser de mauvais credentials)
2. Attendre 60 secondes
3. Vérifier dans Supabase :

```sql
SELECT name, status, last_check, cpu_usage
FROM windows_servers
WHERE name = 'Windows Server 2012';
```

**Résultat attendu :**
- ✅ `status` = `'online'` (ping réussi)
- ✅ `cpu_usage` = `NULL` (WinRM échoué, pas de métriques)
- ✅ Le système continue à fonctionner avec juste le ping

**Vérification dans les logs backend :**
```
🟢 Windows Server 2012 (192.168.1.100): online [8ms] (Ping uniquement)
```

---

## 🔍 ÉTAPE 4 : Vérification dans le Frontend React

### 4.1 Vérifier le Dashboard

1. Ouvrir le frontend React
2. Se connecter avec un compte admin
3. Aller sur le Dashboard
4. Vérifier les statistiques :
   - Nombre de routeurs online/offline
   - Nombre de serveurs Windows online/offline

### 4.2 Vérifier la Page Routeurs

1. Aller sur `/app/routeur`
2. Vérifier que le routeur Orange HomeBox apparaît
3. Vérifier le statut (🟢 ou 🔴)
4. Vérifier que `last_check` se met à jour toutes les 60 secondes

### 4.3 Vérifier la Page Windows Servers

1. Aller sur `/app/windows-server`
2. Vérifier que le serveur Windows apparaît
3. Vérifier le statut (🟢 ou 🔴)
4. Vérifier les métriques (CPU, RAM, Disk) si WinRM fonctionne
5. Vérifier que `last_check` se met à jour toutes les 60 secondes

---

## ✅ Checklist de Validation Finale

### Routeur Orange HomeBox
- [ ] Routeur allumé → Status `online` dans Supabase
- [ ] Routeur éteint → Status `offline` dans Supabase
- [ ] `last_check` se met à jour toutes les 60 secondes
- [ ] Latence affichée dans les logs backend
- [ ] Pas de métriques CPU/RAM (normal pour Orange HomeBox)

### Windows Server 2012
- [ ] Serveur allumé + WinRM actif → Status `online` + métriques dans Supabase
- [ ] Serveur éteint → Status `offline` dans Supabase
- [ ] WinRM désactivé → Status `online` (ping seul), pas de métriques
- [ ] `last_check` se met à jour toutes les 60 secondes
- [ ] Métriques CPU, RAM, Disk visibles dans le frontend

### Scheduler
- [ ] Surveillance automatique toutes les 60 secondes
- [ ] Pas de double exécution (protection `isRunning`)
- [ ] Logs clairs et lisibles
- [ ] Gestion d'erreurs robuste (un équipement en erreur n'empêche pas les autres)

### Sécurité
- [ ] Aucun mot de passe en clair dans les logs
- [ ] Passwords chiffrés dans Supabase (`password_encrypted`)
- [ ] Variables sensibles uniquement dans `.env`

---

## 🚨 Dépannage

### Problème : Routeur toujours `offline`

**Solutions :**
1. Vérifier que l'IP est correcte dans Supabase
2. Tester le ping manuellement : `ping 192.168.1.1`
3. Vérifier que le routeur est sur le même réseau que le backend
4. Vérifier le firewall (ICMP peut être bloqué)

### Problème : Windows Server toujours `offline` même si allumé

**Solutions :**
1. Vérifier que WinRM est activé : `winrm quickconfig`
2. Vérifier le firewall : `netsh advfirewall firewall show rule name="WinRM HTTP"`
3. Tester WinRM manuellement : `Test-WSMan -ComputerName <IP> -Port 5985`
4. Vérifier les credentials dans Supabase

### Problème : Métriques Windows toujours `NULL`

**Solutions :**
1. Vérifier que WinRM fonctionne (voir ci-dessus)
2. Vérifier les credentials (username/password)
3. Vérifier les logs backend pour les erreurs WinRM
4. Tester le script PowerShell manuellement sur le serveur

### Problème : Scheduler ne démarre pas

**Solutions :**
1. Vérifier les variables d'environnement Supabase
2. Vérifier la connexion à Supabase : `npm run test:supabase`
3. Vérifier les logs d'erreur dans la console

---

## 📊 Résultats Attendus

### Scénario 1 : Tout Allumé
```
Routeur Orange HomeBox:    🟢 ONLINE (Ping uniquement)
Windows Server 2012:       🟢 ONLINE (CPU: 12%, RAM: 45%, Disk: 67%)
```

### Scénario 2 : Routeur Éteint
```
Routeur Orange HomeBox:    🔴 OFFLINE
Windows Server 2012:       🟢 ONLINE (CPU: 12%, RAM: 45%, Disk: 67%)
```

### Scénario 3 : Serveur Éteint
```
Routeur Orange HomeBox:    🟢 ONLINE (Ping uniquement)
Windows Server 2012:       🔴 OFFLINE
```

### Scénario 4 : Tout Éteint
```
Routeur Orange HomeBox:    🔴 OFFLINE
Windows Server 2012:       🔴 OFFLINE
```

---

## ✅ Validation Finale

**Le système est considéré comme fonctionnel et prêt à être utilisé en conditions réelles si :**

1. ✅ Tous les tests ci-dessus passent
2. ✅ Le scheduler fonctionne automatiquement toutes les 60 secondes
3. ✅ Les statuts se mettent à jour correctement dans Supabase
4. ✅ Le frontend affiche les données en temps réel
5. ✅ Aucune erreur critique dans les logs backend
6. ✅ La sécurité est respectée (pas de passwords en clair)

**🎉 Félicitations ! Votre système de surveillance est opérationnel !**

