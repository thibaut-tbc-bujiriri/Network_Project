# 📝 Documentation du Système de Logging

## 🎯 Fonctionnalité

Le backend enregistre automatiquement **chaque cycle de surveillance** (toutes les 60 secondes) dans :
1. **Supabase** : Table `logs` (pour le frontend)
2. **Fichier local** : `logs/surveillance.log` (backup hors-base)

---

## 📊 Structure des Logs

### Dans Supabase (table `logs`)

Chaque log contient :
- **`level`** : `'info'` (surveillance normale) ou `'warning'` (offline/erreur)
- **`message`** : Message descriptif (ex: "Surveillance routeur: Orange HomeBox (192.168.1.1) - Statut: online")
- **`source_type`** : `'routeur'` ou `'windows_server'`
- **`source_id`** : UUID de l'équipement
- **`metadata`** (JSONB) : Toutes les métriques :
  ```json
  {
    "equipment_name": "Orange HomeBox",
    "ip_address": "192.168.1.1",
    "status": "online",
    "type": "routeur",
    "cpu": 12,
    "ram": 45,
    "disk": null,
    "latency": 15,
    "timestamp": "2024-01-13T00:00:00.000Z"
  }
  ```
- **`created_at`** : Timestamp automatique

### Dans le Fichier Local (`logs/surveillance.log`)

Format texte lisible :
```
[2024-01-13T00:00:00.000Z] ROUTEUR | Orange HomeBox (192.168.1.1) | Status: online | CPU: 12% | RAM: 45% | Disk: N/A%
[2024-01-13T00:01:00.000Z] SERVEUR | Windows Server 2012 (192.168.1.100) | Status: online | CPU: 10% | RAM: 50% | Disk: 65%
```

---

## 🔄 Cycle de Surveillance

1. **Toutes les 60 secondes**, le scheduler :
   - Surveille tous les équipements (routeurs + serveurs Windows)
   - Met à jour le statut dans `routeur_devices` / `windows_servers`
   - **Enregistre un log** pour chaque équipement dans `logs` (Supabase + fichier)

2. **Pour chaque équipement** :
   - Si **online** : log avec métriques (CPU, RAM, Disk si disponible)
   - Si **offline** : log avec status "offline"
   - Si **erreur** : log avec level "warning" et message d'erreur

3. **Valeurs manquantes** :
   - Si une métrique n'est pas disponible → `null` dans Supabase, `"N/A"` dans le fichier
   - Exemple : Routeur Orange (ping uniquement) → CPU: `null`, RAM: `null`

---

## 📁 Fichiers

### `backend/src/services/logService.js`
Service principal de logging avec méthodes :
- `logMonitoringCycle()` : Enregistre un log complet
- `logRouterMonitoring()` : Enregistre un log pour un routeur
- `logWindowsServerMonitoring()` : Enregistre un log pour un serveur Windows
- `writeToFile()` : Écrit dans le fichier local
- `rotateLogFile()` : Nettoie les anciens logs (garde 10000 lignes)

### `backend/logs/surveillance.log`
Fichier de logs local (créé automatiquement, ignoré par Git)

---

## 🔍 Exemple de Requête Supabase

Pour récupérer les logs dans le frontend :

```javascript
const { data, error } = await supabase
  .from('logs')
  .select('*')
  .eq('source_type', 'routeur')
  .order('created_at', { ascending: false })
  .limit(100);
```

Pour filtrer par équipement :

```javascript
const { data, error } = await supabase
  .from('logs')
  .select('*')
  .eq('source_id', 'uuid-de-l-equipement')
  .order('created_at', { ascending: false });
```

Pour accéder aux métriques dans `metadata` :

```javascript
data.forEach(log => {
  const metrics = log.metadata;
  console.log(metrics.equipment_name); // "Orange HomeBox"
  console.log(metrics.cpu);            // 12
  console.log(metrics.status);         // "online"
});
```

---

## 📋 Format des Métriques

### Routeur
```json
{
  "equipment_name": "Orange HomeBox",
  "ip_address": "192.168.1.1",
  "status": "online",
  "type": "routeur",
  "cpu": null,        // Pas disponible pour routeurs simples
  "ram": null,        // Pas disponible pour routeurs simples
  "disk": null,
  "latency": 15,      // En ms
  "timestamp": "2024-01-13T00:00:00.000Z"
}
```

### Serveur Windows
```json
{
  "equipment_name": "Windows Server 2012",
  "ip_address": "192.168.1.100",
  "status": "online",
  "type": "serveur",
  "cpu": 12,          // %
  "ram": 45,          // %
  "disk": 65,         // %
  "latency": 8,       // En ms
  "timestamp": "2024-01-13T00:00:00.000Z"
}
```

---

## 🛠️ Configuration

### Rotation des Logs Fichier

Le fichier `logs/surveillance.log` est automatiquement nettoyé tous les 100 cycles (~100 minutes) pour garder les **10000 dernières lignes**.

### Désactiver le Logging Fichier

Si vous voulez désactiver l'écriture dans le fichier, commentez l'appel à `LogService.writeToFile()` dans `logService.js`.

---

## ✅ Vérification

### Vérifier les Logs dans Supabase

1. Allez dans Supabase Dashboard
2. Table Editor → `logs`
3. Vérifiez que des lignes sont ajoutées toutes les 60 secondes

### Vérifier les Logs Fichier

```bash
# Afficher les dernières lignes
tail -n 50 backend/logs/surveillance.log

# Suivre en temps réel
tail -f backend/logs/surveillance.log
```

### Tester Manuellement

```javascript
import { LogService } from './src/services/logService.js';

await LogService.logRouterMonitoring(
  { id: 'xxx', name: 'Test', ip_address: '192.168.1.1' },
  { status: 'online', cpu: 10, ram_usage: 50, latency: 5 }
);
```

---

## 🔒 Sécurité

- ✅ Les credentials sont chiffrés (utilisant `ENCRYPTION_KEY`)
- ✅ Le fichier `logs/surveillance.log` est ignoré par Git
- ✅ Aucune information sensible n'est loggée (pas de passwords)
- ✅ Les logs Supabase utilisent Row Level Security (RLS)

---

## 📚 Intégration Frontend

Le frontend peut lire les logs depuis Supabase comme avant. La seule différence est que les métriques détaillées sont maintenant dans `metadata` (JSONB) au lieu de colonnes séparées.

**Avant** (si vous aviez des colonnes séparées) :
```javascript
log.equipment_name
log.cpu
```

**Maintenant** :
```javascript
log.metadata.equipment_name
log.metadata.cpu
```

Ou adaptez votre requête Supabase pour extraire les champs :
```javascript
const { data } = await supabase
  .from('logs')
  .select('*, metadata->equipment_name, metadata->cpu, metadata->status')
  .order('created_at', { ascending: false });
```

---

## 🎉 Résultat

Chaque cycle de surveillance enregistre automatiquement :
- ✅ Un log dans Supabase (table `logs`)
- ✅ Un log dans le fichier local (`logs/surveillance.log`)
- ✅ Toutes les métriques disponibles (CPU, RAM, Disk, Latency)
- ✅ Historique complet (pas de suppression)

Le frontend peut continuer à lire depuis `logs` comme avant ! 🚀

