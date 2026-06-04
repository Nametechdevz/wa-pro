import React, { useState, useEffect } from 'react';
import { FaQrcode, FaSpinner } from 'react-icons/fa';
import QRCode from 'qrcode.react';
import './Login.css';

interface LoginProps {
  onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Iniciando WhatsApp Web...');

  useEffect(() => {
    const initializeWhatsApp = async () => {
      try {
        setStatus('Generando código QR...');

        // TODO: Implementar conexión real con whatsapp-web.js
        await new Promise(resolve => setTimeout(resolve, 2000));

        setQrCode('https://example.com/qr');
        setLoading(false);
        setStatus('Escanea el código QR con tu teléfono');
      } catch (error) {
        setStatus('Error al inicializar WhatsApp Web');
        setLoading(false);
      }
    };

    initializeWhatsApp();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setQrCode('');
    setStatus('Reiniciando...');
    window.location.reload();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <FaQrcode className="login-icon" />
          <h2>Conectar WhatsApp</h2>
        </div>

        {loading ? (
          <div className="loading-state">
            <FaSpinner className="spinner" />
            <p>{status}</p>
          </div>
        ) : (
          <div className="qr-state">
            <div className="qr-container">
              {qrCode && <QRCode value={qrCode} size={256} level="H" />}
            </div>
            <p className="qr-instructions">
              {status}
            </p>
            <ol className="instructions">
              <li>Abre WhatsApp en tu teléfono</li>
              <li>Toca Menú o Configuración</li>
              <li>Selecciona Dispositivos vinculados</li>
              <li>Toca Vincular un dispositivo</li>
              <li>Escanea este código QR con tu teléfono</li>
            </ol>
            <button onClick={handleRetry} className="retry-btn">
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
