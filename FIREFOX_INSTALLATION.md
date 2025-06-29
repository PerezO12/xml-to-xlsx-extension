# Instalación en Firefox

## Instalación Temporal (Desarrollo)

### 1. Construir la extensión

```bash
npm run build:firefox
```

### 2. Cargar en Firefox

1. Abre Firefox y ve a `about:debugging`
2. Haz clic en "Este Firefox" en el panel izquierdo
3. Haz clic en "Cargar complemento temporal..."
4. Selecciona el archivo `manifest.json` de la carpeta `dist/`
5. La extensión aparecerá en tu lista de extensiones

### 3. Usar la extensión

- Haz clic en el icono de la extensión en la barra de herramientas
- Arrastra archivos XML o selecciona archivos/carpetas
- Configura el mapeo de campos si es necesario
- Haz clic en "Convertir a XLSX"

## Instalación Permanente (Distribución)

### 1. Crear paquete para Firefox Add-ons

```bash
npm run publish:firefox
```

Esto generará el archivo `xml-to-xlsx-firefox.zip` listo para subir a Firefox Add-ons.

### 2. Subir a Firefox Add-ons

1. Ve a [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
2. Inicia sesión con tu cuenta de Firefox
3. Haz clic en "Submit a New Add-on"
4. Sube el archivo `xml-to-xlsx-firefox.zip`
5. Completa la información requerida
6. Envía para revisión

## Diferencias con Chrome

### Manifest
- Usa `manifest_version: 2` en lugar de `3`
- Usa `browser_action` en lugar de `action`
- Incluye sección `applications.gecko` con ID único
- No usa `host_permissions` (los permisos van en `permissions`)

### API de Almacenamiento
- Usa `browser.storage.local` (con fallback a `chrome.storage.local`)
- Funciona igual que en Chrome

### Permisos
- Los permisos son los mismos que en Chrome
- Firefox es más estricto con algunos permisos

## Solución de Problemas

### La extensión no aparece
- Verifica que hayas cargado el `manifest.json` correcto
- Asegúrate de estar en `about:debugging` → "Este Firefox"
- Reinicia Firefox si es necesario

### Error de permisos
- Verifica que el `manifest.json` tenga los permisos correctos
- Firefox puede ser más estricto con ciertos permisos

### Error de API
- La extensión usa APIs estándar de WebExtensions
- Compatible con Firefox 57+ y Chrome

## Desarrollo

Para desarrollo local:

```bash
# Instalar dependencias
npm install

# Desarrollo con hot reload
npm run dev

# Construir para Firefox
npm run build:firefox

# Crear paquete
npm run package:firefox
```

## Notas Técnicas

- **Manifest Version**: 2 (Firefox aún no soporta completamente Manifest V3)
- **Target**: ES2018 (compatible con Firefox 57+)
- **API**: WebExtensions estándar con fallback a Chrome API
- **Almacenamiento**: `browser.storage.local` con fallback a `chrome.storage.local` 