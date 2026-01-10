/**
 * Sidebar - Navigation latérale responsive
 */
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Router,
  Server,
  Users,
  FileText,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { checkPermission } from '../../utils/permissions';

const menuItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'DASHBOARD_VIEW' },
  { path: '/app/routeur', label: 'Routeurs', icon: Router, permission: 'ROUTEUR_VIEW' },
  { path: '/app/windows-server', label: 'Windows Server', icon: Server, permission: 'WINDOWS_VIEW' },
  { path: '/app/users', label: 'Utilisateurs', icon: Users, permission: 'USERS_VIEW' },
  { path: '/app/logs', label: 'Logs', icon: FileText, permission: 'LOGS_VIEW' },
  { path: '/app/audit', label: 'Audit', icon: Shield, permission: 'USERS_VIEW', adminOnly: true },
  { path: '/app/password-migration', label: 'Migration MDP', icon: Shield, permission: 'USERS_VIEW', adminOnly: true },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-primary-600 text-white"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Header */}
          <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-primary-600">
            <h1 className="text-xl font-bold text-white">Network Manager</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                // Vérifier les permissions
                if (item.permission && !checkPermission(item.permission)) {
                  return null;
                }
                // Vérifier si c'est admin only
                if (item.adminOnly && !checkPermission('USERS_DELETE')) {
                  return null;
                }
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`
                      }
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Version 1.0.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

