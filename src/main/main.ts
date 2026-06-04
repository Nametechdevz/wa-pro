import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { initializeDatabase, getDatabase, closeDatabase, getContacts, addContact, deleteContact, getContactGroups, getMessages, addMessage, updateMessageStatus, getMessageStats, importContacts } from './database';
import { WhatsAppService } from './whatsapp-service';
import fs from 'fs';
import { parse } from 'papaparse';

let mainWindow: BrowserWindow | null = null;
let whatsappService: WhatsAppService | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  whatsappService = new WhatsAppService(mainWindow);
};

app.on('ready', () => {
  initializeDatabase();
  createWindow();
});

app.on('window-all-closed', () => {
  closeDatabase();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers - WhatsApp
ipcMain.handle('whatsapp:get-qr', async () => {
  try {
    if (!whatsappService) throw new Error('WhatsApp service not initialized');
    const qrCode = await whatsappService.generateQR();
    await whatsappService.simulateQRScan();
    return { success: true, qrCode };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('whatsapp:get-status', async () => {
  if (!whatsappService) return { status: 'disconnected' };
  const session = whatsappService.getSession();
  return {
    status: session?.status || 'disconnected',
    phoneNumber: session?.phoneNumber,
  };
});

ipcMain.handle('whatsapp:disconnect', async () => {
  if (whatsappService) {
    whatsappService.disconnect();
  }
  return { success: true };
});

// IPC Handlers - Contacts
ipcMain.handle('contacts:get-all', () => {
  try {
    return { success: true, data: getContacts() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('contacts:get-by-group', (_, groupName: string) => {
  try {
    return { success: true, data: getContacts(groupName) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('contacts:get-groups', () => {
  try {
    return { success: true, data: getContactGroups() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('contacts:add', (_, name: string, phone: string, groupName: string) => {
  try {
    const contact = addContact(name, phone, groupName);
    return { success: true, data: contact };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('contacts:delete', (_, id: string) => {
  try {
    deleteContact(id);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('contacts:import-csv', async (_, filePath: string) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parseResult = parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    if (parseResult.errors.length > 0) {
      throw new Error('Error al parsear CSV');
    }

    const contacts = parseResult.data.map((row: any) => ({
      name: row.nombre || row.name || 'Sin nombre',
      phone: row.telefono || row.phone || row.number || '',
      group: row.grupo || row.group || 'Importados',
    })).filter((c: any) => c.phone);

    const result = importContacts(contacts);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('contacts:import-xlsx', async (_, filePath: string) => {
  try {
    const XLSX = require('xlsx');
    const workbook = XLSX.readFile(filePath);
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const contacts = data.map((row: any) => ({
      name: row.nombre || row.Nombre || row.name || row.Name || 'Sin nombre',
      phone: row.telefono || row.Telefono || row.phone || row.Phone || row.number || row.Number || '',
      group: row.grupo || row.Grupo || row.group || row.Group || 'Importados',
    })).filter((c: any) => c.phone);

    const result = importContacts(contacts);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// IPC Handlers - Messages
ipcMain.handle('messages:send-bulk', async (_, recipients: Array<{ phone: string; name: string }>, message: string, options: any) => {
  try {
    if (!whatsappService) throw new Error('WhatsApp service not initialized');

    const results = await whatsappService.sendBulkMessages(recipients, message, {
      delayBetweenMessages: options.delayBetweenMessages || 2000,
      maxConcurrent: options.maxConcurrent || 5,
      onProgress: (current, total) => {
        mainWindow?.webContents.send('messages:progress', { current, total });
      },
    });

    // Store in database
    for (const result of results.results) {
      const messageId = addMessage(result.phone, result.name, message);
      updateMessageStatus(
        messageId,
        result.success ? 'sent' : 'failed',
        result.error
      );
    }

    return { success: true, data: results };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('messages:get-history', (_, status?: string, limit = 100, offset = 0) => {
  try {
    const messages = getMessages(status, limit, offset);
    return { success: true, data: messages };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('messages:get-stats', () => {
  try {
    const stats = getMessageStats();
    return { success: true, data: stats };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file:open-dialog', async (_, options: any) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, options);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
