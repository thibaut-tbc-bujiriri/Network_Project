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
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-3xl w-full">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-red-100 rounded-full">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuration Manquante</h1>
            <p className="text-gray-600 mt-1">Variables d'environnement Supabase non configurées</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-800 font-medium">
              ⚠️ L'application ne peut pas fonctionner sans ces variables d'environnement.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
            <h2 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Variables manquantes :
            </h2>
            <ul className="space-y-2">
              {missingVars.map((varName) => (
                <li key={varName} className="flex items-center gap-2">
                  <code className="bg-yellow-100 text-yellow-900 px-3 py-1.5 rounded font-mono text-sm font-semibold">
                    {varName}
                  </code>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <h2 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Comment obtenir vos clés Supabase :
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Connectez-vous à <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">supabase.com</a></li>
              <li>Sélectionnez votre projet (ou créez-en un nouveau)</li>
              <li>Allez dans <strong>Settings</strong> (⚙️) → <strong>API</strong></li>
              <li>Copiez :
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Project URL</strong> → C'est votre <code className="bg-blue-100 px-2 py-0.5 rounded">VITE_SUPABASE_URL</code></li>
                  <li><strong>anon public</strong> key → C'est votre <code className="bg-blue-100 px-2 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code></li>
                </ul>
              </li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-5">
            <h2 className="font-bold text-green-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Étapes pour configurer dans Vercel :
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-green-800">
              <li>Allez dans votre projet Vercel → <strong>Settings</strong> → <strong>Environment Variables</strong></li>
              <li>Cliquez sur <strong>"Add New"</strong></li>
              <li>Ajoutez chaque variable :
                <div className="ml-6 mt-2 space-y-2">
                  <div className="bg-white p-3 rounded border border-green-200">
                    <p className="font-semibold text-green-900 mb-1">Variable 1:</p>
                    <p className="text-xs text-green-700 mb-1">Key: <code className="bg-green-100 px-2 py-0.5 rounded">VITE_SUPABASE_URL</code></p>
                    <p className="text-xs text-green-700">Value: (collez votre Project URL de Supabase)</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-green-200">
                    <p className="font-semibold text-green-900 mb-1">Variable 2:</p>
                    <p className="text-xs text-green-700 mb-1">Key: <code className="bg-green-100 px-2 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code></p>
                    <p className="text-xs text-green-700">Value: (collez votre anon public key de Supabase)</p>
                  </div>
                </div>
              </li>
              <li>Sélectionnez <strong>Production</strong>, <strong>Preview</strong>, et <strong>Development</strong> pour chaque variable</li>
              <li>Cliquez sur <strong>"Save"</strong></li>
              <li><strong>Important :</strong> Allez dans <strong>Deployments</strong> → Cliquez sur les 3 points (⋯) du dernier déploiement → <strong>"Redeploy"</strong></li>
            </ol>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Note :</strong> Après avoir ajouté les variables d'environnement dans Vercel, vous <strong className="text-gray-900">DEVEZ redéployer</strong> l'application pour que les changements prennent effet. Les variables d'environnement ne sont disponibles qu'au moment du build.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
            >
              Ouvrir Supabase Dashboard
            </a>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Actualiser la page
            </button>
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
