
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';
import EmotionDetection from './pages/EmotionDetection';
import StressRelief from './pages/StressRelief';
import Support from './pages/Support';
import Dashboard from './pages/Dashboard';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>({ name: 'Alex Johnson', role: 'User' });

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar user={user} />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/scan" element={<EmotionDetection />} />
            <Route path="/relief" element={<StressRelief />} />
            <Route path="/support" element={<Support />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-500 text-sm">
          <p>© 2024 MindCare AI - Your partner in mental wellness.</p>
          <p className="mt-1">In case of emergency, please contact local emergency services immediately.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

const Navbar: React.FC<{ user: User | null }> = ({ user }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fa-chart-line' },
    { name: 'Therapist Chat', path: '/chat', icon: 'fa-comment-medical' },
    { name: 'Emotion Scan', path: '/scan', icon: 'fa-face-smile' },
    { name: 'Stress Relief', path: '/relief', icon: 'fa-leaf' },
    { name: 'Support', path: '/support', icon: 'fa-user-doctor' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-brain"></i>
            </div>
            <span className="font-bold text-xl tracking-tight text-indigo-900">MindCare AI</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                <i className={`fas ${item.icon}`}></i>
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="border-l border-slate-200 pl-4 flex items-center space-x-3">
              <span className="text-sm font-medium text-slate-700">{user?.name}</span>
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                <img src="https://picsum.photos/seed/user123/100/100" alt="Profile" />
              </div>
            </div>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-600">
            <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 p-3 rounded-lg text-base font-medium ${
                location.pathname === item.path ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <i className={`fas ${item.icon} w-6`}></i>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default App;
