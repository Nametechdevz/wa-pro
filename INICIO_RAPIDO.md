# 🚀 Inicio Rápido - WA-Sender

## Paso 1: Instalar Dependencias (Primera vez)
```bash
npm install
```

## Paso 2: Iniciar la Aplicación
```bash
npm run dev
```

Esto abrirá automáticamente:
- 🌐 React en `http://localhost:3000`
- 🖥️ Electron (tu app de escritorio)

## Paso 3: Conectar WhatsApp

1. Cuando abra la app, verás la pantalla de **Login**
2. Se generará un **código QR** automáticamente
3. En tu teléfono:
   - Abre **WhatsApp**
   - Toca **Menú** (≡) o **Ajustes**
   - Selecciona **Dispositivos vinculados**
   - Toca **Vincular dispositivo**
   - **Escanea el código QR**

4. ¡Listo! La app está conectada

## Paso 4: Agregar Contactos

### Opción A: Agregar Manualmente
1. Ve a **Contactos**
2. Rellena: Nombre, Teléfono, Grupo
3. Haz clic en **Agregar**

### Opción B: Importar CSV
```
nombre,telefono,grupo
Juan,573105280601,Clientes
Maria,573203814730,Clientes
```

1. Ve a **Contactos**
2. Haz clic en **Importar CSV/Excel**
3. Selecciona tu archivo

## Paso 5: Enviar Mensajes

1. Ve a **Enviar Mensajes**
2. Escribe tu mensaje
3. Selecciona contactos o grupo
4. Haz clic en **Enviar Mensajes**

¡Eso es todo! 🎉

---

### ⚙️ Compilar para Producción
```bash
npm run build
```

Se creará la app en `/dist/`

### 📊 Ver Estadísticas
- Ve a **Configuración**
- Verás el historial de envíos

### ❌ Solucionar Problemas

**La app no inicia:**
```bash
# Limpia cache
rm -rf node_modules
npm install
npm run dev
```

**Error en React:**
```bash
BROWSER=none npm run react
```

**Error de base de datos:**
```bash
# La BD se crea automáticamente en tu carpeta de usuario
# Windows: C:\Users\[usuario]\AppData\Roaming\wa-sender
# Mac: ~/Library/Application Support/wa-sender
# Linux: ~/.config/wa-sender
```

---

¿Necesitas ayuda? Revisa el `README.md` completo para más información.
