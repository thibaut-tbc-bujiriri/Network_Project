/**
 * Point d'entrée du backend Network Manager
 * Surveille automatiquement les équipements physiques toutes les 60 secondes
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MonitoringScheduler } from './services/monitoringScheduler.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'Network Manager Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Route API pour forcer une surveillance manuelle
app.post('/api/monitor/trigger', async (req, res) => {
  try {
    console.log('📥 Surveillance manuelle déclenchée via API');
    await scheduler.monitorAllDevices();
    res.json({ 
      success: true, 
      message: 'Surveillance déclenchée',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Initialiser et démarrer le scheduler
const scheduler = new MonitoringScheduler();
scheduler.start();

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n⚠️  Arrêt du serveur en cours...');
  scheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Arrêt du serveur en cours...');
  scheduler.stop();
  process.exit(0);
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 Network Manager Backend');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Surveillance: Automatique toutes les 60 secondes`);
  console.log('═══════════════════════════════════════════════════════\n');
});

