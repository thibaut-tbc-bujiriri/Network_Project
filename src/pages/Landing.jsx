/**
 * Landing Page - Page d'accueil avant la connexion
 * Présente l'application et guide les nouveaux visiteurs
 */
import { useNavigate } from 'react-router-dom';
import { 
  Router, 
  Server, 
  Users, 
  FileText, 
  Shield, 
  BarChart3, 
  Zap, 
  Lock, 
  CheckCircle,
  ArrowRight,
  Monitor,
  Network,
  Settings
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Router className="text-primary-600" size={32} />,
      title: 'Gestion des Routeurs',
      description: 'Surveillez et gérez tous vos routeurs en temps réel. Visualisez l\'état, les performances et les configurations.',
    },
    {
      icon: <Server className="text-primary-600" size={32} />,
      title: 'Serveurs Windows',
      description: 'Contrôlez vos serveurs Windows Server avec suivi des ressources (CPU, RAM, disque) et gestion centralisée.',
    },
    {
      icon: <Users className="text-primary-600" size={32} />,
      title: 'Gestion des Utilisateurs',
      description: 'Système de rôles et permissions avancé. Administrateurs, opérateurs et lecteurs avec accès différenciés.',
    },
    {
      icon: <FileText className="text-primary-600" size={32} />,
      title: 'Logs Centralisés',
      description: 'Consultez et exportez tous les logs système. Filtrage avancé par niveau, source et période.',
    },
    {
      icon: <BarChart3 className="text-primary-600" size={32} />,
      title: 'Tableaux de Bord',
      description: 'Vue d\'ensemble complète avec statistiques, graphiques et indicateurs de performance en temps réel.',
    },
    {
      icon: <Shield className="text-primary-600" size={32} />,
      title: 'Sécurité Renforcée',
      description: 'Authentification sécurisée, gestion des permissions et audit des actions utilisateurs.',
    },
  ];

  const benefits = [
    {
      icon: <Zap className="text-green-600" size={24} />,
      text: 'Interface intuitive et moderne',
    },
    {
      icon: <Lock className="text-green-600" size={24} />,
      text: 'Sécurité et authentification robuste',
    },
    {
      icon: <Monitor className="text-green-600" size={24} />,
      text: 'Dashboard en temps réel',
    },
    {
      icon: <Network className="text-green-600" size={24} />,
      text: 'Gestion centralisée de votre infrastructure',
    },
    {
      icon: <Settings className="text-green-600" size={24} />,
      text: 'Configuration flexible et personnalisable',
    },
    {
      icon: <CheckCircle className="text-green-600" size={24} />,
      text: 'Support multi-rôles et permissions',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Network className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-gray-900">Network Manager</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Se connecter
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Gérez votre infrastructure réseau
            <span className="text-primary-600"> en toute simplicité</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Solution complète de gestion réseau et serveurs pour administrer vos routeurs, 
            serveurs Windows et utilisateurs depuis une interface unique et intuitive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
            >
              Accéder à l'application
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => {
                const featuresSection = document.getElementById('features');
                featuresSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors font-semibold text-lg"
            >
              En savoir plus
            </button>
          </div>
        </div>

        {/* Hero Image/Illustration */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Router className="text-primary-600" size={32} />
                <h3 className="font-semibold text-gray-900">Routeurs</h3>
              </div>
              <p className="text-sm text-gray-600">Gestion centralisée de vos routeurs</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Server className="text-blue-600" size={32} />
                <h3 className="font-semibold text-gray-900">Windows Server</h3>
              </div>
              <p className="text-sm text-gray-600">Surveillance et contrôle des serveurs</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="text-green-600" size={32} />
                <h3 className="font-semibold text-gray-900">Utilisateurs</h3>
              </div>
              <p className="text-sm text-gray-600">Gestion des accès et permissions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer efficacement votre infrastructure réseau
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Pourquoi choisir Network Manager ?
            </h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Une solution complète et moderne pour votre gestion réseau
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
              >
                <div className="flex items-center gap-3">
                  {benefit.icon}
                  <p className="text-white font-medium">{benefit.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comment ça fonctionne ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              En quelques étapes simples, prenez le contrôle de votre infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connectez-vous</h3>
              <p className="text-gray-600">
                Accédez à votre compte avec vos identifiants sécurisés
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Configurez</h3>
              <p className="text-gray-600">
                Ajoutez vos appareils, serveurs et configurez les utilisateurs
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gérez</h3>
              <p className="text-gray-600">
                Surveillez, contrôlez et optimisez votre infrastructure en temps réel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Rejoignez-nous dès maintenant et simplifiez la gestion de votre infrastructure réseau
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg flex items-center justify-center gap-2 mx-auto"
          >
            Accéder à l'application
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <Network className="text-white" size={20} />
                </div>
                <span className="text-lg font-bold text-white">Network Manager</span>
              </div>
              <p className="text-sm">
                Solution complète de gestion réseau et serveurs pour votre infrastructure.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Fonctionnalités</h4>
              <ul className="space-y-2 text-sm">
                <li>Gestion des Routeurs</li>
                <li>Serveurs Windows</li>
                <li>Utilisateurs & Permissions</li>
                <li>Logs & Monitoring</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Sécurité</h4>
              <ul className="space-y-2 text-sm">
                <li>Authentification sécurisée</li>
                <li>Gestion des rôles</li>
                <li>Audit des actions</li>
                <li>Protection des données</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Network Manager. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}



