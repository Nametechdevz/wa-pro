import React, { useState } from 'react';
import { FaSave, FaCheck } from 'react-icons/fa';
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

  const handleChange = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: Implementar guardado en base de datos
      await new Promise(resolve => setTimeout(resolve, 500));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error al guardar configuración:', error);
    }
  };

  return (
    <div className="settings">
      <h2>Configuración</h2>

      <div className="settings-grid">
        <div className="settings-card">
          <h3>Envío de Mensajes</h3>

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
          <h3>Interfaz y Notificaciones</h3>

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
        </div>

        <div className="settings-card info-card">
          <h3>Información de la Aplicación</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="label">Versión:</span>
              <span className="value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="label">Estado:</span>
              <span className="value status">Conectado</span>
            </div>
            <div className="info-item">
              <span className="label">Contactos:</span>
              <span className="value">25</span>
            </div>
            <div className="info-item">
              <span className="label">Grupos:</span>
              <span className="value">5</span>
            </div>
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
      </div>
    </div>
  );
};

export default Settings;
