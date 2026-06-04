import React, { useState, useEffect } from 'react';
import { FaQrcode, FaSpinner, FaCheck } from 'react-icons/fa';
import QRCode from 'qrcode.react';
import './Login.css';

interface LoginProps {
  onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Iniciando WhatsApp Web...');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeWhatsApp = async () => {
      try {
        setStatus('Generando código QR...');
        setError('');

        const result = await window.electron.ipc.invoke('whatsapp:get-qr');

        if (result.success) {
          setQrCode(result.qrCode);
          setStatus('Escanea el código QR con tu teléfono');
          setLoading(false);

          // Wait for connection
          setTimeout(async () => {
            const statusResult = await window.electron.ipc.invoke('whatsapp:get-status');
            if (statusResult.status === 'ready') {
              setIsConnected(true);
              setStatus('¡Conectado exitosamente!');
              setTimeout(() => {
                onSuccess();
              }, 1500);
            }
          }, 5000);
        } else {
          setError(result.error || 'Error desconocido');
          setLoading(false);
        }
      } catch (error: any) {
        setError(error.message || 'Error al inicializar WhatsApp Web');
        setStatus('');
        setLoading(false);
      }
    };

    initializeWhatsApp();
  }, [onSuccess]);

  const handleRetry = () => {
    setLoading(true);
    setQrCode('');
    setStatus('Reiniciando...');
    setError('');
    setIsConnected(false);
    window.location.reload();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <FaQrcode className="login-icon" />
          <h2>Conectar WhatsApp</h2>
        </div>

        {loading && !error ? (
          <div className="loading-state">
            <FaSpinner className="spinner" />
            <p>{status}</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-message">{error}</div>
            <button onClick={handleRetry} className="retry-btn">
              Reintentar
            </button>
          </div>
        ) : isConnected ? (
          <div className="success-state">
            <FaCheck className="success-icon" />
            <p className="success-message">{status}</p>
          </div>
        ) : (
          <div className="qr-state">
            <div className="qr-container">
              {qrCode && <QRCode value={qrCode} size={256} level="H" />}
            </div>
            <p className="qr-instructions">{status}</p>
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
