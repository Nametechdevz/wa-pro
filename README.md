# WA-Sender 📱

Aplicación de escritorio para envío masivo de mensajes por WhatsApp.

## Características

✅ **Conexión a WhatsApp Web** - Conecta mediante escaneo de código QR  
✅ **Envío Masivo** - Envía mensajes a múltiples contactos simultáneamente  
✅ **Soporte Multimedia** - Envía imágenes, videos y textos  
✅ **Gestión de Contactos** - Agrega contactos manualmente o importa desde CSV/Excel  
✅ **Gestión de Grupos** - Extrae contactos de grupos y envía mensajes  
✅ **Historial** - Registro completo de todos los envíos  
✅ **Configuración Flexible** - Ajusta reintentos, retrasos y más  

## Requisitos

- Node.js 16+ 
- npm o yarn
- Windows, macOS o Linux

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/nametechdevz/wa-pro.git
cd wa-pro

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build
```

## Uso

1. **Iniciar la aplicación** - Ejecuta `npm run dev`
2. **Conectar WhatsApp** - Escanea el código QR con tu teléfono
3. **Enviar Mensajes** - Ve a "Enviar Mensajes" y elige tus opciones
4. **Gestionar Contactos** - Agrega contactos manualmente o importa listas

## Estructura del Proyecto

```
wa-pro/
├── src/
│   ├── main/              # Código de Electron (procesos principales)
│   │   ├── main.ts        # Punto de entrada de Electron
│   │   └── preload.ts     # Bridge seguro Electron-React
│   └── renderer/          # Código de React (UI)
│       ├── App.tsx        # Componente principal
│       ├── pages/         # Páginas (Login, Dashboard)
│       └── components/    # Componentes reutilizables
├── public/                # Archivos estáticos
└── package.json           # Dependencias y scripts
```

## Scripts Disponibles

- `npm run dev` - Ejecuta la aplicación en modo desarrollo
- `npm run build` - Compila la aplicación para producción
- `npm start` - Inicia la aplicación con Electron
- `npm test` - Ejecuta las pruebas

## Dependencias Principales

- **Electron** - Framework para aplicaciones de escritorio
- **React** - UI library
- **whatsapp-web.js** - Conexión a WhatsApp Web
- **SQLite3** - Base de datos local
- **XLSX** - Parseo de archivos Excel

## Desarrollo

### Agregar un nuevo componente

1. Crea el archivo en `src/renderer/components/`
2. Importa en el componente padre
3. Agrega estilos CSS en la misma carpeta

### Agregar funcionalidad a Electron

1. Crea handlers en `src/main/main.ts` usando `ipcMain.handle()`
2. Llama desde React usando `window.electron.invoke()`

## Limitaciones Actuales

- La integración con WhatsApp Web aún está en desarrollo
- No hay persistencia de base de datos implementada
- La importación de archivos es un placeholder

## Roadmap

- [ ] Integración completa con whatsapp-web.js
- [ ] Base de datos SQLite para persistencia
- [ ] Importación de CSV/Excel funcional
- [ ] Programación de mensajes
- [ ] Estadísticas y reportes
- [ ] Soporte para plantillas
- [ ] Autenticación multiusuario

## Licencia

MIT

## Contacto

Para reportar bugs o sugerencias, abre un issue en GitHub.
