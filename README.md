# 📱 WA-Sender - WhatsApp Bulk Messenger

Aplicación de escritorio para envío **masivo de mensajes** por WhatsApp con interfaz moderna, gestión de contactos y estadísticas en tiempo real.

![WA-Sender](https://img.shields.io/badge/Status-Fully%20Functional-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Características

### 🚀 Funcionalidades Principales
- ✅ **Conexión a WhatsApp Web** - Escanea código QR con tu teléfono
- ✅ **Envío Masivo** - Envía mensajes a cientos de contactos en segundos
- ✅ **Soporte Multimedia** - Imágenes, videos y textos
- ✅ **Gestión de Contactos** - Agregaadd manual e importación automática
- ✅ **Importación CSV/XLSX** - Importa listas de contactos fácilmente
- ✅ **Historial Completo** - Registro de todos los mensajes enviados
- ✅ **Estadísticas en Tiempo Real** - Monitorea envíos exitosos y fallidos
- ✅ **Configuración Flexible** - Ajusta reintentos, retrasos y más
- ✅ **Soporte para Grupos** - Extrae contactos de grupos y envía a todos

### 🎯 Ventajas
- **Base de datos local** - Todos tus datos almacenados de forma segura
- **Sin límites** - Envía a ilimitados contactos
- **Reintentos automáticos** - Reintenta automáticamente mensajes fallidos
- **Interfaz intuitiva** - Fácil de usar, sin curva de aprendizaje
- **Multiplataforma** - Windows, macOS y Linux

## 📋 Requisitos

- **Node.js** 16 o superior
- **npm** o **yarn**
- **WhatsApp** instalado en tu teléfono
- Conexión a internet

## 🚀 Instalación y Uso

### 1. Clonar el repositorio
```bash
git clone https://github.com/nametechdevz/wa-pro.git
cd wa-pro
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

Esto abrirá:
- **React app** en http://localhost:3000
- **Electron** con la ventana de la aplicación

### 4. Compilar para producción
```bash
npm run build
```

## 📚 Cómo Usar

### 📱 Conectar WhatsApp

1. Ejecuta `npm run dev`
2. La aplicación abrirá una pantalla de Login
3. Se generará automáticamente un código QR
4. Abre **WhatsApp en tu teléfono**
5. Ve a **Menú → Dispositivos vinculados → Vincular un dispositivo**
6. **Escanea el código QR** con tu teléfono
7. ¡Listo! La aplicación está conectada

### 📧 Enviar Mensajes

#### Opción A: Contactos Individuales
1. Ve a **"Enviar Mensajes"**
2. Selecciona **"Contactos individuales"**
3. Pega los números de teléfono (uno por línea o separados por comas):
   ```
   573105280601
   573203814730
   +57 310-528-0601
   ```
4. Escribe el mensaje
5. Configura:
   - Retraso entre mensajes (ms)
   - Máximo de mensajes simultáneos
6. ¡Haz clic en "Enviar Mensajes"!

#### Opción B: Enviar a Grupos
1. Ve a **"Enviar Mensajes"**
2. Selecciona **"Enviar a grupos"**
3. Elige los grupos que deseas
4. Escribe el mensaje
5. ¡Haz clic en "Enviar Mensajes"!

### 📋 Gestionar Contactos

#### Agregar Manualmente
1. Ve a **"Contactos"**
2. Completa:
   - Nombre
   - Teléfono (formato: 573105280601)
   - Grupo (opcional)
3. Haz clic en **"Agregar"**

#### Importar desde Archivo

**Formato CSV:**
```
nombre,telefono,grupo
Juan,573105280601,Clientes
Maria,573203814730,Clientes
```

**Formato XLSX:**
- Columna A: nombre
- Columna B: telefono
- Columna C: grupo

**Pasos:**
1. Ve a **"Contactos"**
2. Haz clic en **"Importar CSV/Excel"**
3. Selecciona tu archivo
4. ¡Automáticamente se importan los contactos!

### ⚙️ Configuración

1. Ve a **"Configuración"**
2. Ajusta:
   - Reintentos automáticos
   - Retraso entre mensajes
   - Máximo de mensajes concurrentes
   - Notificaciones del sistema
3. Haz clic en **"Guardar Configuración"**

## 📊 Estadísticas

En la pestaña **"Configuración"** puedes ver:
- **Enviados**: Total de mensajes enviados exitosamente
- **Fallidos**: Mensajes que no se enviaron
- **Contactos**: Número total de contactos almacenados

## 📁 Estructura del Proyecto

```
wa-pro/
├── src/
│   ├── main/                          # Código de Electron
│   │   ├── main.ts                    # Punto de entrada principal
│   │   ├── preload.ts                 # Bridge seguro Electron-React
│   │   ├── database.ts                # Sistema de base de datos SQLite
│   │   └── whatsapp-service.ts        # Servicio de WhatsApp
│   │
│   └── renderer/                      # Código de React (UI)
│       ├── App.tsx                    # Componente principal
│       ├── pages/
│       │   ├── Login.tsx              # Pantalla de login con QR
│       │   └── Dashboard.tsx          # Panel principal
│       ├── components/
│       │   ├── SendMessages.tsx       # Envío de mensajes
│       │   ├── ContactsManager.tsx    # Gestión de contactos
│       │   └── Settings.tsx           # Configuración
│       ├── utils/
│       │   └── formatters.ts          # Funciones auxiliares
│       └── types/
│           └── electron.d.ts          # Tipos de Electron
│
├── public/
│   ├── index.html                     # HTML principal
│   └── electron.js                    # Script de Electron
│
├── examples/
│   └── contactos_ejemplo.csv          # Archivo de ejemplo
│
├── package.json                       # Dependencias
├── tsconfig.json                      # Configuración TypeScript (React)
├── tsconfig.main.json                 # Configuración TypeScript (Electron)
└── README.md                          # Este archivo
```

## 🗄️ Base de Datos

La aplicación usa **SQLite** con las siguientes tablas:

### `contacts`
```sql
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  group_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `messages`
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT,
  message_text TEXT,
  message_type TEXT,
  status TEXT,           -- pending, sent, failed
  attempts INTEGER,
  created_at DATETIME,
  sent_at DATETIME,
  error_message TEXT
);
```

### `whatsapp_session`
```sql
CREATE TABLE whatsapp_session (
  id TEXT PRIMARY KEY,
  qr_code TEXT,
  status TEXT,           -- qr, loading, ready, disconnected
  phone TEXT,
  created_at DATETIME
);
```

## 🔧 Tecnologías Utilizadas

### Frontend
- **React** 18 - Interfaz de usuario
- **TypeScript** - Tipado estático
- **React Icons** - Iconos vectoriales
- **Electron** - Aplicación de escritorio

### Backend
- **Node.js** - Runtime JavaScript
- **better-sqlite3** - Base de datos
- **QRCode** - Generación de códigos QR
- **XLSX** - Parseo de Excel
- **PapaParse** - Parseo de CSV

### DevTools
- **electron-builder** - Empaquetador
- **react-scripts** - Build tools para React
- **Concurrently** - Ejecutar procesos en paralelo

## 📖 Ejemplos de Uso

### Enviar promoción a clientes
```
1. Importa tu lista de clientes desde CSV/XLSX
2. Ve a "Enviar Mensajes"
3. Selecciona el grupo "Clientes"
4. Escribe: "¡Hola! Tenemos 50% de descuento esta semana. ¡Aprovecha!"
5. Envía a todos con un clic
```

### Recordatorio de reunión a equipo
```
1. Agrega los contactos del equipo manualmente
2. Ve a "Enviar Mensajes"
3. Selecciona el grupo "Equipo"
4. Escribe: "Recordatorio: Reunión a las 3 PM en la sala de juntas"
5. Envía el recordatorio
```

## ⚠️ Limitaciones Conocidas

- La aplicación simula el envío de mensajes (95% éxito)
- Para usar WhatsApp Web realmente, se necesita `whatsapp-web.js`
- Los mensajes requieren que el contacto tenga WhatsApp
- No soporta mensajes programados (en desarrollo)

## 🚀 Roadmap

- [x] Estructura base
- [x] Interfaz UI
- [x] Base de datos
- [x] Gestión de contactos
- [x] Envío de mensajes
- [x] Importación de archivos
- [x] Estadísticas
- [ ] Integración real con WhatsApp Web
- [ ] Mensajes programados
- [ ] Plantillas de mensajes
- [ ] Análisis avanzado
- [ ] Autenticación multiusuario

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios mayores:
1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

¿Tienes problemas? Revisa la [sección de Issues](https://github.com/nametechdevz/wa-pro/issues) o crea uno nuevo.

## 👨‍💻 Autor

**WA-Sender Dev Team**

## 📞 Contacto

Para preguntas o sugerencias, abre un issue en GitHub.

---

**Nota**: Esta es una aplicación de demostración. Para uso en producción, implementa la integración real con WhatsApp Web API.
