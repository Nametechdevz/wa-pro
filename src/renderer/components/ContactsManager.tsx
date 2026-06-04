import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaFileUpload, FaSpinner } from 'react-icons/fa';
import './ContactsManager.css';

interface Contact {
  id: string;
  name: string;
  phone: string;
  group_name: string;
}

const ContactsManager: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', group: 'General' });
  const [filterGroup, setFilterGroup] = useState('');
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadContacts();
    loadGroups();
  }, []);

  const loadContacts = async () => {
    try {
      const result = await window.electron.ipc.invoke('contacts:get-all');
      if (result.success) {
        setContacts(result.data);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
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

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      setError('Por favor completa nombre y teléfono');
      return;
    }

    try {
      setError('');
      const result = await window.electron.ipc.invoke(
        'contacts:add',
        newContact.name,
        newContact.phone,
        newContact.group
      );

      if (result.success) {
        setNewContact({ name: '', phone: '', group: 'General' });
        loadContacts();
        loadGroups();
        setImportMessage('Contacto agregado correctamente');
        setTimeout(() => setImportMessage(''), 3000);
      } else {
        setError(result.error);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const result = await window.electron.ipc.invoke('contacts:delete', id);
      if (result.success) {
        loadContacts();
        setImportMessage('Contacto eliminado');
        setTimeout(() => setImportMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportMessage('');
    setError('');

    try {
      const filePath = (file as any).path;
      let result;

      if (file.name.endsWith('.csv')) {
        result = await window.electron.ipc.invoke('contacts:import-csv', filePath);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        result = await window.electron.ipc.invoke('contacts:import-xlsx', filePath);
      } else {
        setError('Formato de archivo no soportado. Usa CSV o XLSX');
        setImporting(false);
        return;
      }

      if (result.success) {
        const { added, skipped } = result.data;
        setImportMessage(`Importados: ${added}, Duplicados: ${skipped}`);
        loadContacts();
        loadGroups();
        setTimeout(() => setImportMessage(''), 5000);
      } else {
        setError(result.error);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleOpenFile = async () => {
    try {
      const result = await window.electron.ipc.invoke('file:open-dialog', {
        properties: ['openFile'],
        filters: [
          { name: 'Archivos soportados', extensions: ['csv', 'xlsx', 'xls'] },
          { name: 'CSV', extensions: ['csv'] },
          { name: 'Excel', extensions: ['xlsx', 'xls'] },
        ],
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        const fileName = filePath.split('/').pop() || '';

        setImporting(true);
        setImportMessage('');
        setError('');

        try {
          let importResult;

          if (fileName.endsWith('.csv')) {
            importResult = await window.electron.ipc.invoke('contacts:import-csv', filePath);
          } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            importResult = await window.electron.ipc.invoke('contacts:import-xlsx', filePath);
          }

          if (importResult.success) {
            const { added, skipped } = importResult.data;
            setImportMessage(`Importados: ${added}, Duplicados: ${skipped}`);
            loadContacts();
            loadGroups();
            setTimeout(() => setImportMessage(''), 5000);
          } else {
            setError(importResult.error);
          }
        } finally {
          setImporting(false);
        }
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const filteredContacts = filterGroup
    ? contacts.filter(c => c.group_name === filterGroup)
    : contacts;

  if (loading) {
    return (
      <div className="contacts-manager">
        <div className="loading-state">
          <FaSpinner className="spinner" />
          <p>Cargando contactos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contacts-manager">
      <h2>Gestionar Contactos</h2>

      <div className="contacts-header">
        <div className="import-section">
          <button onClick={handleOpenFile} disabled={importing} className="import-btn">
            {importing ? <FaSpinner className="spinner" /> : <FaFileUpload />}
            {importing ? 'Importando...' : 'Importar CSV/Excel'}
          </button>
        </div>

        <div className="filter-section">
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los grupos ({contacts.length})</option>
            {groups.map(group => {
              const count = contacts.filter(c => c.group_name === group).length;
              return (
                <option key={group} value={group}>
                  {group} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {error && (
        <div className="alert error">
          <p>{error}</p>
        </div>
      )}

      {importMessage && (
        <div className="alert success">
          <p>{importMessage}</p>
        </div>
      )}

      <div className="add-contact-form">
        <h3>Agregar Nuevo Contacto</h3>
        <div className="form-fields">
          <input
            type="text"
            placeholder="Nombre"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            className="input-field"
          />
          <input
            type="tel"
            placeholder="Teléfono (573105280601)"
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            className="input-field"
          />
          <select
            value={newContact.group}
            onChange={(e) => setNewContact({ ...newContact, group: e.target.value })}
            className="input-field"
          >
            <option>General</option>
            {groups.map(group => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          <button onClick={handleAddContact} className="btn-add">
            <FaPlus />
            Agregar
          </button>
        </div>
      </div>

      <div className="contacts-list">
        <h3>Contactos ({filteredContacts.length})</h3>
        {filteredContacts.length > 0 ? (
          <div className="table-wrapper">
            <table className="contacts-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Grupo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map(contact => (
                  <tr key={contact.id}>
                    <td>{contact.name}</td>
                    <td className="phone">{contact.phone}</td>
                    <td>
                      <span className="group-badge">{contact.group_name}</span>
                    </td>
                    <td className="actions">
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="btn-delete"
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-message">
            <p>No hay contactos {filterGroup ? `en ${filterGroup}` : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsManager;
