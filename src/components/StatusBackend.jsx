/**
 * Composant pour afficher le statut de connexion au backend
 */
import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { getHealth } from '../services/backendApi';

export default function StatusBackend() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [healthData, setHealthData] = useState(null);
  const [error, setError] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  const checkBackendStatus = async () => {
    try {
      setStatus('checking');
      setError(null);
      const data = await getHealth();
      setHealthData(data);
      setStatus('online');
      setLastCheck(new Date());
    } catch (err) {
      console.error('Erreur de connexion au backend:', err);
      setError(err.message);
      setStatus('offline');
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    // Vérifier immédiatement au montage
    checkBackendStatus();

    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkBackendStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'online':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Vérification...';
      case 'online':
        return 'Backend en ligne';
      case 'offline':
        return 'Backend hors ligne';
      default:
        return 'Inconnu';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'online':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'offline':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className="font-semibold">{getStatusText()}</p>
            {healthData && status === 'online' && (
              <p className="text-sm opacity-75">
                {healthData.service} • Uptime: {Math.floor(healthData.uptime / 60)} min
              </p>
            )}
            {error && status === 'offline' && (
              <p className="text-sm opacity-75">{error}</p>
            )}
            {lastCheck && (
              <p className="text-xs opacity-60 mt-1">
                Dernière vérification: {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={checkBackendStatus}
          disabled={status === 'checking'}
          className="p-2 rounded-lg hover:bg-white/50 transition-colors disabled:opacity-50"
          title="Actualiser le statut"
        >
          <RefreshCw className={`w-4 h-4 ${status === 'checking' ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}

