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
