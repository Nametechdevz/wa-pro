import React, { useState } from 'react';
import { FaPlus, FaTrash, FaFileUpload } from 'react-icons/fa';
import './ContactsManager.css';

interface Contact {
  id: string;
  name: string;
  phone: string;
  group: string;
}

const ContactsManager: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Juan', phone: '573105280601', group: 'Clientes' },
    { id: '2', name: 'María', phone: '573203814730', group: 'Clientes' },
  ]);

  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [filterGroup, setFilterGroup] = useState('');

  const addContact = () => {
    if (newContact.name.trim() && newContact.phone.trim()) {
      const contact: Contact = {
        id: Date.now().toString(),
        name: newContact.name,
        phone: newContact.phone,
        group: 'General',
      };
      setContacts([...contacts, contact]);
      setNewContact({ name: '', phone: '' });
    }
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // TODO: Implementar parseo de CSV/Excel
        console.log('Importar archivo:', file.name);
      };
      reader.readAsText(file);
    }
  };

  const groups = Array.from(new Set(contacts.map(c => c.group)));
  const filteredContacts = filterGroup
    ? contacts.filter(c => c.group === filterGroup)
    : contacts;

  return (
    <div className="contacts-manager">
      <h2>Gestionar Contactos</h2>

      <div className="contacts-header">
        <div className="import-section">
          <label className="import-btn">
            <FaFileUpload />
            Importar CSV/Excel
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImportCSV}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div className="filter-section">
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los grupos</option>
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      </div>

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
          <button onClick={addContact} className="btn-add">
            <FaPlus />
            Agregar
          </button>
        </div>
      </div>

      <div className="contacts-list">
        <h3>Contactos ({filteredContacts.length})</h3>
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
                <td>{contact.group}</td>
                <td className="actions">
                  <button
                    onClick={() => deleteContact(contact.id)}
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
    </div>
  );
};

export default ContactsManager;
