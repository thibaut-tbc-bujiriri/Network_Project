/**
 * App - Composant principal avec configuration React Router
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Routeur from './pages/Routeur';
import WindowsServer from './pages/WindowsServer';
import Users from './pages/Users';
import Logs from './pages/Logs';
import Audit from './pages/Audit';
import PasswordMigration from './pages/PasswordMigration';

// Vérifier les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Composant d'erreur si les variables d'environnement sont manquantes
function EnvError() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration Manquante</h1>
        </div>
        <div className="space-y-4">
          <p className="text-gray-700">
            Les variables d'environnement Supabase ne sont pas configurées. L'application ne peut pas fonctionner sans ces variables.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="font-semibold text-yellow-900 mb-2">Variables manquantes :</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
              {!supabaseUrl && <li><code className="bg-yellow-100 px-2 py-1 rounded">VITE_SUPABASE_URL</code></li>}
              {!supabaseAnonKey && <li><code className="bg-yellow-100 px-2 py-1 rounded">VITE_SUPABASE_ANON_KEY</code></li>}
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">Comment corriger :</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Allez dans votre projet Vercel → <strong>Settings</strong> → <strong>Environment Variables</strong></li>
              <li>Ajoutez les variables suivantes :
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li><code>VITE_SUPABASE_URL</code> = votre URL Supabase</li>
                  <li><code>VITE_SUPABASE_ANON_KEY</code> = votre clé anon Supabase</li>
                </ul>
              </li>
              <li>Redéployez l'application</li>
            </ol>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Pour plus d'informations, consultez le fichier <code className="bg-gray-100 px-2 py-1 rounded">VERCEL_DEPLOYMENT.md</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour protéger les routes (vérification d'authentification)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

// Composant pour rediriger si déjà connecté
function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/app/dashboard" replace /> : children;
}

function App() {
  // Afficher l'erreur si les variables d'environnement sont manquantes
  if (!supabaseUrl || !supabaseAnonKey) {
    return <EnvError />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique - Landing Page */}
        <Route
          path="/"
          element={<Landing />}
        />

        {/* Route publique - Login */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Routes protégées avec Layout */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="routeur" element={<Routeur />} />
          <Route path="windows-server" element={<WindowsServer />} />
          <Route path="users" element={<Users />} />
          <Route path="logs" element={<Logs />} />
          <Route path="audit" element={<Audit />} />
          <Route path="password-migration" element={<PasswordMigration />} />
        </Route>

        {/* Route 404 - Redirection vers landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
