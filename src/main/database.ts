import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

const DB_PATH = path.join(app.getPath('userData'), 'wa-sender.db');
let db: Database.Database | null = null;

export const initializeDatabase = () => {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      group_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      recipient_phone TEXT NOT NULL,
      recipient_name TEXT,
      message_text TEXT,
      message_type TEXT,
      status TEXT DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      sent_at DATETIME,
      error_message TEXT,
      FOREIGN KEY (recipient_phone) REFERENCES contacts(phone)
    );

    CREATE TABLE IF NOT EXISTS whatsapp_session (
      id TEXT PRIMARY KEY,
      qr_code TEXT,
      status TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    CREATE INDEX IF NOT EXISTS idx_contacts_group ON contacts(group_name);
  `);

  return db;
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
  }
};

// Contact operations
export const addContact = (name: string, phone: string, groupName = 'General') => {
  const stmt = db!.prepare(`
    INSERT INTO contacts (id, name, phone, group_name)
    VALUES (?, ?, ?, ?)
  `);
  const id = require('uuid').v4();
  try {
    stmt.run(id, name, phone, groupName);
    return { id, name, phone, group_name: groupName };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw new Error(`El número ${phone} ya existe`);
    }
    throw error;
  }
};

export const getContacts = (groupName?: string) => {
  if (groupName) {
    const stmt = db!.prepare(`
      SELECT id, name, phone, group_name FROM contacts WHERE group_name = ? ORDER BY name
    `);
    return stmt.all(groupName) as any[];
  }
  const stmt = db!.prepare(`
    SELECT id, name, phone, group_name FROM contacts ORDER BY name
  `);
  return stmt.all() as any[];
};

export const deleteContact = (id: string) => {
  const stmt = db!.prepare('DELETE FROM contacts WHERE id = ?');
  stmt.run(id);
};

export const getContactGroups = () => {
  const stmt = db!.prepare(`
    SELECT DISTINCT group_name FROM contacts ORDER BY group_name
  `);
  return stmt.all().map((row: any) => row.group_name);
};

// Message operations
export const addMessage = (
  recipientPhone: string,
  recipientName: string,
  messageText: string,
  messageType = 'text'
) => {
  const stmt = db!.prepare(`
    INSERT INTO messages (id, recipient_phone, recipient_name, message_text, message_type)
    VALUES (?, ?, ?, ?, ?)
  `);
  const id = require('uuid').v4();
  stmt.run(id, recipientPhone, recipientName, messageText, messageType);
  return id;
};

export const getMessages = (status?: string, limit = 100, offset = 0) => {
  if (status) {
    const stmt = db!.prepare(`
      SELECT * FROM messages WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
    `);
    return stmt.all(status, limit, offset) as any[];
  }
  const stmt = db!.prepare(`
    SELECT * FROM messages ORDER BY created_at DESC LIMIT ? OFFSET ?
  `);
  return stmt.all(limit, offset) as any[];
};

export const updateMessageStatus = (
  messageId: string,
  status: 'pending' | 'sent' | 'failed',
  errorMessage?: string
) => {
  const stmt = db!.prepare(`
    UPDATE messages SET status = ?, attempts = attempts + 1, sent_at = CURRENT_TIMESTAMP, error_message = ?
    WHERE id = ?
  `);
  stmt.run(status, errorMessage || null, messageId);
};

export const getMessageStats = () => {
  const stmt = db!.prepare(`
    SELECT
      status,
      COUNT(*) as count
    FROM messages
    GROUP BY status
  `);
  return stmt.all() as any[];
};

export const importContacts = (contacts: Array<{ name: string; phone: string; group?: string }>) => {
  const insertStmt = db!.prepare(`
    INSERT OR IGNORE INTO contacts (id, name, phone, group_name)
    VALUES (?, ?, ?, ?)
  `);

  const transaction = db!.transaction((contacts: typeof contacts) => {
    let added = 0;
    let skipped = 0;

    for (const contact of contacts) {
      try {
        insertStmt.run(
          require('uuid').v4(),
          contact.name,
          contact.phone,
          contact.group || 'Importados'
        );
        added++;
      } catch {
        skipped++;
      }
    }

    return { added, skipped };
  });

  return transaction(contacts);
};
