import React, { useState, useEffect } from 'react';
import { FaSave, FaCheck, FaEnvelope, FaUsers, FaHistory } from 'react-icons/fa';
import './Settings.css';

interface SettingsState {
  autoRetry: boolean;
  retryAttempts: number;
  delayBetweenMessages: number;
  maxConcurrentMessages: number;
  enableNotifications: boolean;
  theme: 'light' | 'dark';
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    autoRetry: true,
    retryAttempts: 3,
    delayBetweenMessages: 2000,
    maxConcurrentMessages: 5,
    enableNotifications: true,
    theme: 'light',
  });

  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ sent: 0, failed: 0, pending: 0 });
  const [totalContacts, setTotalContacts] = useState(0);

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('wa-sender-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  };

  const loadStats = async () => {
    try {
      const messageStats = await window.electron.ipc.invoke('messages:get-stats');
      if (messageStats.success) {
        const statsMap = messageStats.data.reduce((acc: any, item: any) => {
          acc[item.status] = item.count;
          return acc;
        }, {});
        setStats({
          sent: statsMap.sent || 0,
          failed: statsMap.failed || 0,
          pending: statsMap.pending || 0,
        });
      }

      const contacts = await window.electron.ipc.invoke('contacts:get-all');
      if (contacts.success) {
        setTotalContacts(contacts.data.length);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleChange = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('wa-sender-settings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div className="settings">
      <h2>Configuración</h2>

      <div className="settings-grid">
        <div className="settings-card">
          <h3>⚙️ Envío de Mensajes</h3>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.autoRetry}
                onChange={(e) => handleChange('autoRetry', e.target.checked)}
              />
              <span>Reintentar automáticamente en caso de fallo</span>
            </label>
          </div>

          <div className="setting-item">
            <label>Número de reintentos:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.retryAttempts}
              onChange={(e) => handleChange('retryAttempts', parseInt(e.target.value))}
              className="input-number"
            />
          </div>

          <div className="setting-item">
            <label>Retraso entre mensajes (ms):</label>
            <input
              type="number"
              min="500"
              max="30000"
              step="500"
              value={settings.delayBetweenMessages}
              onChange={(e) => handleChange('delayBetweenMessages', parseInt(e.target.value))}
              className="input-number"
            />
            <small>{(settings.delayBetweenMessages / 1000).toFixed(1)} segundos</small>
          </div>

          <div className="setting-item">
            <label>Máximo de mensajes concurrentes:</label>
            <input
              type="number"
              min="1"
              max="20"
              value={settings.maxConcurrentMessages}
              onChange={(e) => handleChange('maxConcurrentMessages', parseInt(e.target.value))}
              className="input-number"
            />
          </div>
        </div>

        <div className="settings-card">
          <h3>🎨 Interfaz y Notificaciones</h3>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => handleChange('enableNotifications', e.target.checked)}
              />
              <span>Habilitar notificaciones del sistema</span>
            </label>
          </div>

          <div className="setting-item">
            <label>Tema:</label>
            <select
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value as 'light' | 'dark')}
              className="input-select"
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>

          <div className="setting-item info-box">
            <div className="info-item-row">
              <span className="label">Versión:</span>
              <span className="value">1.0.0</span>
            </div>
          </div>
        </div>

        <div className="settings-card stats-card">
          <h3>📊 Estadísticas</h3>

          <div className="stats-grid">
            <div className="stat-item sent">
              <div className="stat-icon">
                <FaEnvelope />
              </div>
              <div className="stat-content">
                <p className="stat-label">Enviados</p>
                <p className="stat-number">{stats.sent}</p>
              </div>
            </div>

            <div className="stat-item failed">
              <div className="stat-icon">
                <FaHistory />
              </div>
              <div className="stat-content">
                <p className="stat-label">Fallidos</p>
                <p className="stat-number">{stats.failed}</p>
              </div>
            </div>

            <div className="stat-item contacts">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <p className="stat-label">Contactos</p>
                <p className="stat-number">{totalContacts}</p>
              </div>
            </div>
          </div>

          <div className="stat-total">
            <p>Total procesado: <strong>{stats.sent + stats.failed}</strong></p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="saved-alert">
          <FaCheck />
          <span>Configuración guardada correctamente</span>
        </div>
      )}

      <div className="settings-actions">
        <button onClick={handleSave} className="btn-save">
          <FaSave />
          Guardar Configuración
        </button>
        <button onClick={loadStats} className="btn-refresh">
          Actualizar Estadísticas
        </button>
      </div>
    </div>
  );
};

export default Settings;
