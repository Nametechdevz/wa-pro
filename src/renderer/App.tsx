import React, { useState } from 'react';
import { FaWhatsapp, FaQrcode, FaContacts, FaPaperPlane, FaCog } from 'react-icons/fa';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';

type Page = 'login' | 'dashboard';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isConnected, setIsConnected] = useState(false);

  const handleLoginSuccess = () => {
    setIsConnected(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsConnected(false);
    setCurrentPage('login');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <FaWhatsapp className="logo-icon" />
            <h1>WA-Sender</h1>
          </div>
          {isConnected && (
            <div className="connection-status">
              <span className="status-badge">Conectado</span>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {currentPage === 'login' ? (
          <Login onSuccess={handleLoginSuccess} />
        ) : (
          <Dashboard onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
};

export default App;
