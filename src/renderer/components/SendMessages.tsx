import React, { useState, useEffect } from 'react';
import { FaFileUpload, FaCheck, FaExclamation, FaSpinner } from 'react-icons/fa';
import './SendMessages.css';

interface SendFormData {
  recipients: string;
  messageType: 'text' | 'media';
  message: string;
  mediaFile?: File;
  useGroups: boolean;
  selectedGroups: string[];
  delayBetweenMessages: number;
  maxConcurrent: number;
}

interface SendResult {
  successful: number;
  failed: number;
  results: Array<{ phone: string; name: string; success: boolean; error?: string }>;
}

const SendMessages: React.FC = () => {
  const [formData, setFormData] = useState<SendFormData>({
    recipients: '',
    messageType: 'text',
    message: '',
    useGroups: false,
    selectedGroups: [],
    delayBetweenMessages: 2000,
    maxConcurrent: 5,
  });

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    loadContacts();
    loadGroups();

    const progressListener = (data: any) => {
      setProgress(data);
    };

    window.electron.ipc.on('messages:progress', progressListener);

    return () => {
      window.electron.ipc.off('messages:progress', progressListener);
    };
  }, []);

  const loadContacts = async () => {
    try {
      const result = await window.electron.ipc.invoke('contacts:get-all');
      if (result.success) {
        setContacts(result.data);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const result = await window.electron.ipc.invoke('contacts:get-groups');
      if (result.success) {
        setGroups(result.data);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'delayBetweenMessages' || name === 'maxConcurrent' ? parseInt(value) : value,
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

  const parseRecipients = (): Array<{ phone: string; name: string }> => {
    const phonesText = formData.recipients
      .split(/[\n,;]+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    return phonesText.map(phone => ({
      phone: phone.replace(/\D/g, ''),
      name: 'Contacto',
    }));
  };

  const getRecipientsToSend = (): Array<{ phone: string; name: string }> => {
    if (formData.useGroups && formData.selectedGroups.length > 0) {
      const filtered = contacts.filter(c =>
        formData.selectedGroups.includes(c.group_name)
      );
      return filtered.map(c => ({ phone: c.phone, name: c.name }));
    }

    if (formData.recipients.trim()) {
      return parseRecipients();
    }

    return [];
  };

  const handleSend = async () => {
    try {
      setError('');
      const recipients = getRecipientsToSend();

      if (recipients.length === 0) {
        setError('Por favor selecciona destinatarios');
        return;
      }

      if (!formData.message.trim()) {
        setError('Por favor ingresa un mensaje');
        return;
      }

      setSending(true);
      setProgress({ current: 0, total: recipients.length });

      const result = await window.electron.ipc.invoke('messages:send-bulk', recipients, formData.message, {
        delayBetweenMessages: formData.delayBetweenMessages,
        maxConcurrent: formData.maxConcurrent,
      });

      if (result.success) {
        setResult(result.data);
        setFormData(prev => ({
          ...prev,
          recipients: '',
          message: '',
          selectedGroups: [],
        }));
        loadContacts();
      } else {
        setError(result.error || 'Error al enviar mensajes');
      }
    } catch (error: any) {
      setError(error.message || 'Error desconocido');
    } finally {
      setSending(false);
    }
  };

  const toggleGroup = (group: string) => {
    setFormData(prev => ({
      ...prev,
      selectedGroups: prev.selectedGroups.includes(group)
        ? prev.selectedGroups.filter(g => g !== group)
        : [...prev.selectedGroups, group],
    }));
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

          {formData.useGroups ? (
            <div className="input-group">
              <label>Selecciona grupos</label>
              <div className="groups-list">
                {groups.length > 0 ? (
                  groups.map(group => (
                    <label key={group} className="group-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.selectedGroups.includes(group)}
                        onChange={() => toggleGroup(group)}
                      />
                      <span>{group}</span>
                    </label>
                  ))
                ) : (
                  <p className="empty-state">No hay grupos disponibles</p>
                )}
              </div>
              <small>
                {contacts.filter(c => formData.selectedGroups.includes(c.group_name)).length} contactos seleccionados
              </small>
            </div>
          ) : (
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
                {formData.mediaFile ? (
                  <span className="file-name">{formData.mediaFile.name}</span>
                ) : (
                  <span className="placeholder">Haz clic para seleccionar archivo</span>
                )}
              </div>
            </div>
          )}

          <div className="settings-row">
            <div className="input-group">
              <label>Retraso entre mensajes (ms)</label>
              <input
                type="number"
                name="delayBetweenMessages"
                min="500"
                max="30000"
                step="500"
                value={formData.delayBetweenMessages}
                onChange={handleInputChange}
                className="input-number"
              />
            </div>

            <div className="input-group">
              <label>Máximo concurrentes</label>
              <input
                type="number"
                name="maxConcurrent"
                min="1"
                max="20"
                value={formData.maxConcurrent}
                onChange={handleInputChange}
                className="input-number"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <FaExclamation />
          <p>{error}</p>
        </div>
      )}

      {sending && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
            />
          </div>
          <p className="progress-text">
            <FaSpinner className="spinner" />
            Enviando... {progress.current} de {progress.total}
          </p>
        </div>
      )}

      {result && !sending && (
        <div className={`result-alert ${result.failed === 0 ? 'success' : 'partial'}`}>
          <div className="alert-content">
            {result.failed === 0 ? (
              <>
                <FaCheck className="alert-icon" />
                <p>✓ Todos los {result.successful} mensajes se enviaron correctamente</p>
              </>
            ) : (
              <>
                <FaExclamation className="alert-icon" />
                <p>{result.successful} enviados, {result.failed} fallidos</p>
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
