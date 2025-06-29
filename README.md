# NFe XML to Excel Firefox Extension

Una extensión de Firefox para convertir archivos XML de NFe (Nota Fiscal Eletrônica) a archivos Excel (.xlsx) usando perfiles de mapeo personalizables.

## 🚀 Actualización v1.2.0 - Redirección Directa

### ✅ Problema Completamente Resuelto

**ANTES**: Popup pequeño → Se cerraba al seleccionar archivos → Redirección a página completa  
**AHORA**: **Clic directo → Página completa inmediata** 🎯

### 🎉 Nuevo Comportamiento

1. **Haz clic en el icono** de la extensión
2. **Se abre directamente** una nueva pestaña con la aplicación completa
3. **Sin popups intermedios** = Sin problemas de cierre
4. **Funcionalidad completa** disponible inmediatamente

### Ventajas del Nuevo Enfoque

✅ **Experiencia Simplificada**: Un solo clic para acceso completo  
✅ **Sin Limitaciones**: Todos los métodos de carga disponibles  
✅ **Más Profesional**: Interfaz de aplicación web completa  
✅ **Sin Interrupciones**: Flujo de trabajo continuo  
✅ **Compatible 100%**: Funciona perfectamente en Firefox  

## Características

- **🚀 Parser XML de alto rendimiento**: Utiliza `fast-xml-parser` para procesamiento eficiente
- **🎯 Perfiles de mapeo personalizables**: Define cómo mapear campos XML a columnas de Excel
- **⚡ Procesamiento en paralelo**: Procesa múltiples archivos XML simultáneamente
- **🎨 Interfaz intuitiva**: UI moderna con React y Tailwind CSS con gradientes y animaciones
- **📁 Drag & Drop**: Arrastra archivos XML directamente al área de carga
- **🗂️ Carga de carpetas**: Selecciona carpetas completas con archivos XML
- **🤖 Mapeo automático**: Si no hay perfil activo, mapea automáticamente todos los campos disponibles
- **📥 Descarga automática**: Genera y descarga archivos Excel automáticamente
- **💾 Almacenamiento persistente**: Guarda configuración usando `browser.storage.local`
- **🔍 Analizador XML en tiempo real**: Visualiza campos disponibles antes de crear mapeos
- **✅ Múltiples hojas**: Opción para generar una hoja por archivo XML
- **✅ Formato de moneda**: Opción para formatear valores monetarios
- **✅ Interfaz moderna**: Diseño limpio y fácil de usar
- **🦊 Optimizado para Firefox**: Funciona como aplicación web completa

## Instalación

### 1. Clonar o descargar el proyectogit clone [URL_DEL_REPOSITORIO]
cd my-xml-to-xlsx-ext
### 2. Instalar dependenciasnpm install
### 3. Construir la extensiónnpm run build:firefox
### 4. Cargar en Firefox

1. Abre Firefox y ve a `about:debugging`
2. Haz clic en "Este Firefox" en el panel izquierdo
3. Haz clic en "Cargar complemento temporal..."
4. Selecciona el archivo `manifest.json` de la carpeta `dist/`
5. La extensión aparecerá en tu lista de extensiones y en la barra de herramientas

## 🎯 Uso Simplificado

### Proceso Completo en 3 Pasos

1. **Haz clic** en el icono de la extensión → Se abre la aplicación completa
2. **Carga archivos**:
   - 📁 **Drag & Drop**: Arrastra archivos XML al área
   - 🗂️ **Seleccionar**: Usa botones para archivos o carpetas
3. **Convierte**: Haz clic en "Convertir a XLSX" → Descarga automática

### Métodos de Carga Disponibles

- **📄 Archivos individuales**: Selecciona uno o más archivos XML
- **📁 Carpetas completas**: Procesa toda una carpeta con archivos XML
- **🎯 Drag & Drop**: Arrastra directamente desde el explorador
- **⚙️ Configuración avanzada**: Personaliza mapeos de campos

## Tecnologías utilizadas

- **React 18**: Interfaz de usuario moderna
- **TypeScript**: Tipado fuerte y mejor experiencia de desarrollo
- **fast-xml-parser**: Parser XML optimizado para rendimiento
- **SheetJS (xlsx)**: Generación de archivos Excel
- **FileSaver.js**: Descarga automática de archivos
- **Tailwind CSS**: Estilos y diseño responsivo
- **Vite**: Bundling y desarrollo optimizado
- **Firefox WebExtensions API**: Funcionalidades nativas de extensión
- **Storage API**: Persistencia de configuración

## Scripts disponibles
# Desarrollo
npm run dev                 # Servidor de desarrollo
npm run build:firefox       # Construir para Firefox

# Empaquetado
npm run validate            # Validar extensión
npm run package:firefox     # Crear ZIP para distribución
npm run publish:firefox     # Construir + validar + empaquetar
## Estructura del proyecto
my-xml-to-xlsx-ext/
├─ src/
│  ├─ background.js          # Maneja clic en icono → abre página completa
│  ├─ pages/
│  │  ├─ Popup.tsx          # Componente principal reutilizable
│  │  └─ Carga.tsx          # Página completa (interfaz principal)
│  ├─ components/
│  │  ├─ DragArea.tsx       # Área de carga con drag & drop
│  │  ├─ FileList.tsx       # Lista de archivos seleccionados
│  │  ├─ OptionsPanel.tsx   # Panel de configuración
│  │  └─ ProgressBar.tsx    # Barra de progreso
│  ├─ utils/
│  │  ├─ storage.ts         # Gestión de almacenamiento persistente
│  │  ├─ xmlParser.ts       # Parser XML configurado
│  │  ├─ excelGenerator.ts  # Generador de archivos Excel
│  │  └─ constants.ts       # Constantes y configuración
│  └─ assets/
│     └─ tailwind.css       # Estilos CSS
├─ carga.html               # HTML de la página completa
├─ manifest.json            # Manifest v2 para Firefox (sin popup)
├─ xml-to-xlsx-firefox.zip  # Paquete listo para distribución
└─ package.json             # Dependencias y scripts
## Solución de problemas

### ✅ Problema del popup COMPLETAMENTE RESUELTO
**Antes**: Popup se cerraba al seleccionar archivos  
**Ahora**: No hay popup, se abre directamente la aplicación completa

### La extensión no aparece
- Verifica que hayas cargado `dist/manifest.json`
- Asegúrate de estar en `about:debugging` → "Este Firefox"
- Reinicia Firefox si es necesario

### Error al parsear XML
- Verifica que los archivos XML estén bien formados
- Comprueba que las rutas XML sean correctas

### La extensión no abre la página
- Verifica que el background script esté cargado
- Revisa la consola del navegador (F12) para errores

## Testing

Para probar la extensión:
# Construir y empaquetar
npm run publish:firefox

# Cargar en Firefox
# about:debugging → "Este Firefox" → "Cargar complemento temporal" → dist/manifest.json

# Probar
# Clic en icono → debe abrir página completa directamente
Ver `TESTING_NEW_BEHAVIOR.md` para guía completa de testing.

## Distribución

El archivo `xml-to-xlsx-firefox.zip` está listo para:

- ✅ **Instalación manual**: Compartir con usuarios
- ✅ **Firefox Add-ons**: Subir a [addons.mozilla.org](https://addons.mozilla.org/developers/)
- ✅ **Distribución empresarial**: Implementar en organizaciones

## Changelog

### v1.2.0 - Redirección Directa (Actual)
- ✅ **Eliminación de popup**: Clic directo abre página completa
- ✅ **Sin limitaciones**: Todos los métodos de carga disponibles
- ✅ **Experiencia mejorada**: Flujo de trabajo simplificado
- ✅ **Interfaz profesional**: Aplicación web completa

### v1.1.0 - Solución Firefox Popup
- ✅ Detección automática de contexto popup
- ✅ Redirección inteligente a página completa
- ✅ Sistema de almacenamiento temporal

### v1.0.0 - Versión inicial
- ✅ Conversión XML a XLSX básica
- ✅ Interfaz React moderna

## Licencia

MIT License - consulta el archivo LICENSE para más detalles.

---

**🎉 ¡Extensión completamente optimizada para Firefox! Un solo clic para funcionalidad completa.**
