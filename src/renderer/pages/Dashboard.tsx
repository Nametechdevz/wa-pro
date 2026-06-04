import React, { useState } from 'react';
import { FaPaperPlane, FaContacts, FaCog, FaSignOutAlt } from 'react-icons/fa';
import SendMessages from '../components/SendMessages';
import ContactsManager from '../components/ContactsManager';
import Settings from '../components/Settings';
import './Dashboard.css';

type Tab = 'send' | 'contacts' | 'settings';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('send');

  const renderContent = () => {
    switch (activeTab) {
      case 'send':
        return <SendMessages />;
      case 'contacts':
        return <ContactsManager />;
      case 'settings':
        return <Settings />;
      default:
        return <SendMessages />;
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <nav className="nav">
          <button
            className={`nav-btn ${activeTab === 'send' ? 'active' : ''}`}
            onClick={() => setActiveTab('send')}
          >
            <FaPaperPlane />
            <span>Enviar Mensajes</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <FaContacts />
            <span>Contactos</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog />
            <span>Configuración</span>
          </button>
        </nav>
        <button className="logout-btn" onClick={onLogout}>
          <FaSignOutAlt />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      <main className="content">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
