import QRCode from 'qrcode';
import { BrowserWindow } from 'electron';
import { v4 as uuidv4 } from 'uuid';

interface WhatsAppSession {
  id: string;
  qrCode: string;
  status: 'qr' | 'loading' | 'ready' | 'disconnected';
  phoneNumber?: string;
}

export class WhatsAppService {
  private session: WhatsAppSession | null = null;
  private mainWindow: BrowserWindow | null = null;
  private messageQueue: Map<string, any> = new Map();

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  async generateQR(): Promise<string> {
    try {
      const qrData = uuidv4();
      const qrCode = await QRCode.toDataURL(qrData);

      this.session = {
        id: uuidv4(),
        qrCode,
        status: 'qr',
      };

      return qrCode;
    } catch (error) {
      console.error('Error generating QR:', error);
      throw error;
    }
  }

  async simulateQRScan(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.session) {
          this.session.status = 'loading';
          this.mainWindow?.webContents.send('whatsapp:status-changed', {
            status: 'loading',
            message: 'Conectando...',
          });
        }

        setTimeout(() => {
          if (this.session) {
            this.session.status = 'ready';
            this.session.phoneNumber = '+573105280601';
            this.mainWindow?.webContents.send('whatsapp:status-changed', {
              status: 'ready',
              message: 'Conectado exitosamente',
              phoneNumber: this.session.phoneNumber,
            });
          }
          resolve();
        }, 3000);
      }, 2000);
    });
  }

  getSession(): WhatsAppSession | null {
    return this.session;
  }

  isConnected(): boolean {
    return this.session?.status === 'ready';
  }

  async sendMessage(
    phoneNumber: string,
    message: string,
    mediaPath?: string
  ): Promise<{ success: boolean; messageId: string; error?: string }> {
    try {
      if (!this.isConnected()) {
        throw new Error('WhatsApp no está conectado');
      }

      const messageId = uuidv4();

      // Simulación realista de envío
      return new Promise((resolve) => {
        const delay = Math.random() * 3000 + 1000; // 1-4 segundos

        setTimeout(() => {
          // 95% de éxito
          const success = Math.random() > 0.05;

          if (success) {
            this.messageQueue.set(messageId, {
              phoneNumber,
              message,
              status: 'sent',
              timestamp: new Date(),
            });

            resolve({
              success: true,
              messageId,
            });
          } else {
            resolve({
              success: false,
              messageId,
              error: 'Número de teléfono no válido o contacto no disponible',
            });
          }
        }, delay);
      });
    } catch (error: any) {
      return {
        success: false,
        messageId: uuidv4(),
        error: error.message,
      };
    }
  }

  async sendBulkMessages(
    recipients: Array<{ phone: string; name: string }>,
    message: string,
    options: {
      delayBetweenMessages?: number;
      maxConcurrent?: number;
      onProgress?: (current: number, total: number) => void;
    } = {}
  ): Promise<{
    successful: number;
    failed: number;
    results: Array<{ phone: string; name: string; success: boolean; error?: string }>;
  }> {
    const {
      delayBetweenMessages = 2000,
      maxConcurrent = 5,
      onProgress,
    } = options;

    const results: Array<{ phone: string; name: string; success: boolean; error?: string }> = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i += maxConcurrent) {
      const batch = recipients.slice(i, i + maxConcurrent);

      const batchPromises = batch.map(async (recipient) => {
        const result = await this.sendMessage(recipient.phone, message);

        if (result.success) {
          successful++;
          results.push({
            phone: recipient.phone,
            name: recipient.name,
            success: true,
          });
        } else {
          failed++;
          results.push({
            phone: recipient.phone,
            name: recipient.name,
            success: false,
            error: result.error,
          });
        }

        onProgress?.(results.length, recipients.length);
      });

      await Promise.all(batchPromises);

      if (i + maxConcurrent < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenMessages));
      }
    }

    return { successful, failed, results };
  }

  disconnect(): void {
    if (this.session) {
      this.session.status = 'disconnected';
      this.session = null;
      this.messageQueue.clear();
      this.mainWindow?.webContents.send('whatsapp:status-changed', {
        status: 'disconnected',
        message: 'Desconectado',
      });
    }
  }
}
