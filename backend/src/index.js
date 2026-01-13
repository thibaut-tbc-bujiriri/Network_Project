/**
 * Point d'entrée du backend Network Manager
 * Surveille automatiquement les équipements physiques toutes les 60 secondes
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MonitoringScheduler } from './services/monitoringScheduler.js';
import { SupabaseService } from './services/supabaseService.js';
import { supabase } from './config/supabase.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000',  // Alternative dev port
  process.env.FRONTEND_URL, // URL du frontend en production
].filter(Boolean); // Retire les valeurs null/undefined

// Si FRONTEND_URL n'est pas défini, autoriser toutes les origines en développement
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL
    ? allowedOrigins
    : '*', // En développement, autoriser toutes les origines
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Logging des requêtes entrantes (pour debug)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'N/A'}`);
  next();
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'Network Manager Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Initialiser le service Supabase et le scheduler
const supabaseService = new SupabaseService();
const scheduler = new MonitoringScheduler();

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

// Route API pour récupérer les logs
app.get('/api/logs', async (req, res) => {
  try {
    const { limit = 100, level, source_type } = req.query;
    
    let query = supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (level) {
      query = query.eq('level', level);
    }
    if (source_type) {
      query = query.eq('source_type', source_type);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des logs:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Route API pour récupérer les routeurs
app.get('/api/routers', async (req, res) => {
  try {
    const routers = await supabaseService.getAllRouters();
    res.json(routers);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des routeurs:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Route API pour récupérer les serveurs Windows
app.get('/api/windows-servers', async (req, res) => {
  try {
    const servers = await supabaseService.getAllWindowsServers();
    res.json(servers);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des serveurs Windows:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Route API pour récupérer les statistiques du dashboard
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const routers = await supabaseService.getAllRouters();
    const servers = await supabaseService.getAllWindowsServers();

    const stats = {
      routeurCount: routers.length,
      windowsCount: servers.length,
      activeDevicesCount: routers.filter(r => r.status === 'online').length,
      activeServersCount: servers.filter(s => s.status === 'online').length,
      totalDevices: routers.length + servers.length,
      totalActive: routers.filter(r => r.status === 'online').length + servers.filter(s => s.status === 'online').length
    };

    res.json(stats);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Démarrer le scheduler
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

