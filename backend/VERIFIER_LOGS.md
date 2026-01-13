# 🔍 Vérifier que les Logs Fonctionnent

## ✅ Le système de logging fonctionne !

Les tests ont confirmé que le système fonctionne. Si vous ne voyez pas de logs, voici comment vérifier :

---

## 1️⃣ Vérifier que le Backend est en Cours d'Exécution

Le backend doit être démarré pour enregistrer les logs :

```powershell
cd backend
npm start
```

Vous devriez voir :
```
✅ Client Supabase configuré
✅ Scheduler de surveillance démarré (toutes les 60 secondes)
```

---

## 2️⃣ Vérifier qu'il y a des Équipements à Surveiller

Les logs ne sont enregistrés que s'il y a des équipements à surveiller.

### Vérifier dans Supabase :

```sql
-- Vérifier les routeurs
SELECT id, name, ip_address, status 
FROM routeur_devices;

-- Vérifier les serveurs Windows
SELECT id, name, ip_address, status 
FROM windows_servers;
```

**Si aucune ligne n'est retournée**, ajoutez des équipements dans Supabase ou via le frontend.

---

## 3️⃣ Vérifier les Logs dans Supabase

### Dans Supabase Dashboard :

1. Allez dans **Table Editor** → `logs`
2. Cliquez sur **Refresh** (🔄)
3. Vous devriez voir des lignes s'ajouter toutes les 60 secondes

### Ou avec une requête SQL :

```sql
-- Voir les 10 derniers logs
SELECT 
  created_at,
  level,
  message,
  source_type,
  metadata->>'equipment_name' as equipment_name,
  metadata->>'status' as status,
  metadata->>'cpu' as cpu,
  metadata->>'ram' as ram
FROM logs
ORDER BY created_at DESC
LIMIT 10;
```

---

## 4️⃣ Vérifier le Fichier Log Local

Le fichier `backend/logs/surveillance.log` est créé automatiquement.

### Windows PowerShell :

```powershell
# Voir les dernières lignes
Get-Content backend\logs\surveillance.log -Tail 20

# Suivre en temps réel
Get-Content backend\logs\surveillance.log -Wait -Tail 10
```

### Si le fichier n'existe pas :

C'est normal au début. Il sera créé au premier cycle de surveillance.

---

## 5️⃣ Tester Manuellement

Exécutez le script de test :

```powershell
cd backend
node TEST_LOGGING.js
```

Ce script va :
- ✅ Tester la connexion Supabase
- ✅ Tester l'écriture dans Supabase
- ✅ Tester l'écriture dans le fichier
- ✅ Afficher les logs récents

---

## 6️⃣ Vérifier les Logs dans la Console

Le backend affiche maintenant des messages de confirmation (désactivés par défaut pour ne pas polluer).

Pour activer les messages de debug, dans `backend/src/services/logService.js`, décommentez la ligne :

```javascript
// console.log(`✅ Log enregistré pour ${name} (ID: ${insertedData?.[0]?.id || 'N/A'})`);
```

---

## 🐛 Dépannage

### Problème : Aucun log dans Supabase

**Causes possibles :**
1. ❌ Backend non démarré → Démarrer avec `npm start`
2. ❌ Aucun équipement à surveiller → Ajouter des équipements
3. ❌ Erreur Supabase → Vérifier les logs de la console
4. ❌ RLS (Row Level Security) bloque l'insertion → Vérifier les politiques RLS

**Solution :**
```sql
-- Vérifier les politiques RLS pour logs
SELECT * FROM pg_policies WHERE tablename = 'logs';

-- Si nécessaire, créer une politique d'insertion
CREATE POLICY "Allow public insert on logs" ON logs
FOR INSERT WITH CHECK (true);
```

### Problème : Fichier log non créé

**Causes possibles :**
1. ❌ Permissions insuffisantes → Vérifier les permissions du dossier
2. ❌ Chemin incorrect → Vérifier que le dossier `backend/logs/` existe

**Solution :**
```powershell
# Créer le dossier manuellement
New-Item -ItemType Directory -Path backend\logs -Force
```

---

## ✅ Checklist de Vérification

- [ ] Backend démarré (`npm start`)
- [ ] Au moins un routeur ou serveur Windows dans Supabase
- [ ] Scheduler fonctionne (logs toutes les 60 secondes dans la console)
- [ ] Logs visibles dans Supabase (Table Editor → `logs`)
- [ ] Fichier `backend/logs/surveillance.log` existe et contient des lignes

---

## 📊 Format des Logs

### Dans Supabase :

```json
{
  "id": "uuid",
  "level": "info",
  "message": "Surveillance routeur: Orange HomeBox (192.168.1.1) - Statut: online",
  "source_type": "routeur",
  "source_id": "uuid-equipement",
  "metadata": {
    "equipment_name": "Orange HomeBox",
    "ip_address": "192.168.1.1",
    "status": "online",
    "type": "routeur",
    "cpu": null,
    "ram": null,
    "disk": null,
    "latency": 15,
    "timestamp": "2024-01-13T00:00:00.000Z"
  },
  "created_at": "2024-01-13T00:00:00.000Z"
}
```

### Dans le Fichier :

```
[2024-01-13T00:00:00.000Z] ROUTEUR | Orange HomeBox (192.168.1.1) | Status: online | CPU: N/A% | RAM: N/A% | Disk: N/A%
```

---

## 🎉 Résultat Attendu

Si tout fonctionne, vous devriez voir :
- ✅ Des logs dans Supabase toutes les 60 secondes (un par équipement)
- ✅ Un fichier `logs/surveillance.log` qui grandit
- ✅ Les logs visibles dans le frontend (menu Logs)

---

**Si les logs n'apparaissent toujours pas après avoir vérifié tout ça, exécutez `node TEST_LOGGING.js` et partagez le résultat !**

