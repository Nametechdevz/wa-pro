import React, { useState } from 'react';
import { FaFileUpload, FaCheck, FaExclamation } from 'react-icons/fa';
import './SendMessages.css';

interface SendFormData {
  recipients: string;
  messageType: 'text' | 'media';
  message: string;
  mediaFile?: File;
  useGroups: boolean;
  selectedGroups: string[];
}

const SendMessages: React.FC = () => {
  const [formData, setFormData] = useState<SendFormData>({
    recipients: '',
    messageType: 'text',
    message: '',
    useGroups: false,
    selectedGroups: [],
  });

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        mediaFile: file,
      }));
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      // TODO: Implementar lógica de envío real
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResult({ success: 10, failed: 1 });
      setTimeout(() => setResult(null), 5000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="send-messages">
      <h2>Enviar Mensajes</h2>

      <div className="form-grid">
        <div className="form-section">
          <h3>Destinatarios</h3>
          <div className="recipient-options">
            <label className="radio-option">
              <input
                type="radio"
                name="useGroups"
                checked={!formData.useGroups}
                onChange={() => setFormData(prev => ({ ...prev, useGroups: false }))}
              />
              <span>Contactos individuales</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="useGroups"
                checked={formData.useGroups}
                onChange={() => setFormData(prev => ({ ...prev, useGroups: true }))}
              />
              <span>Enviar a grupos</span>
            </label>
          </div>

          {!formData.useGroups && (
            <div className="input-group">
              <label>Números de teléfono (uno por línea o separados por comas)</label>
              <textarea
                name="recipients"
                placeholder="Ejemplo:&#10;573105280601&#10;573203814730&#10;+57 310-528-0601"
                value={formData.recipients}
                onChange={handleInputChange}
                rows={6}
                className="input-textarea"
              />
              <small>Formato: 573105280601 o +573105280601</small>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Mensaje</h3>
          <div className="input-group">
            <label>Tipo de mensaje</label>
            <select
              name="messageType"
              value={formData.messageType}
              onChange={handleInputChange}
              className="input-select"
            >
              <option value="text">Texto</option>
              <option value="media">Imagen/Video</option>
            </select>
          </div>

          <div className="input-group">
            <label>Contenido del mensaje</label>
            <textarea
              name="message"
              placeholder="Escribe tu mensaje aquí..."
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="input-textarea"
            />
          </div>

          {formData.messageType === 'media' && (
            <div className="input-group">
              <label>Archivo de imagen o video</label>
              <div className="file-input-wrapper">
                <FaFileUpload />
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                {formData.mediaFile && (
                  <span className="file-name">{formData.mediaFile.name}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className={`result-alert ${result.failed === 0 ? 'success' : 'partial'}`}>
          <div className="alert-content">
            {result.failed === 0 ? (
              <>
                <FaCheck className="alert-icon" />
                <p>✓ Todos los mensajes se enviaron correctamente</p>
              </>
            ) : (
              <>
                <FaExclamation className="alert-icon" />
                <p>{result.success} enviados, {result.failed} fallidos</p>
              </>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={sending || !formData.message.trim()}
        className="btn-send"
      >
        {sending ? 'Enviando...' : 'Enviar Mensajes'}
      </button>
    </div>
  );
};

export default SendMessages;
