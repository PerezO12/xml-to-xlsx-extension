# NFe XML to Excel Browser Extension

Una extensión de navegador para convertir archivos XML de NFe (Nota Fiscal Eletrônica) a archivos Excel (.xlsx) usando perfiles de mapeo personalizables.

## Características

- **🚀 Parser XML de alto rendimiento**: Utiliza `fast-xml-parser` para procesamiento eficiente
- **🎯 Perfiles de mapeo personalizables**: Define cómo mapear campos XML a columnas de Excel
- **⚡ Procesamiento en paralelo**: Procesa múltiples archivos XML simultáneamente
- **🎨 Interfaz intuitiva**: UI moderna con React y Tailwind CSS con gradientes y animaciones
- **📁 Drag & Drop**: Arrastra archivos XML directamente al área de carga
- **🤖 Mapeo automático**: Si no hay perfil activo, mapea automáticamente todos los campos disponibles
- **📥 Descarga automática**: Genera y descarga archivos Excel automáticamente
- **💾 Almacenamiento local**: Guarda perfiles usando `chrome.storage.local`
- **🔍 Analizador XML en tiempo real**: Visualiza campos disponibles antes de crear mapeos

## Tecnologías utilizadas

- **React 18**: Para la interfaz de usuario
- **fast-xml-parser**: Parser XML optimizado para rendimiento
- **SheetJS (xlsx)**: Generación de archivos Excel
- **FileSaver.js**: Descarga automática de archivos
- **Tailwind CSS**: Estilos y diseño responsivo
- **Vite**: Bundling y desarrollo
- **Chrome Extension API**: Funcionalidades de extensión

## Instalación

### 1. Clonar o descargar el proyecto

```bash
git clone [URL_DEL_REPOSITORIO]
cd my-xml-to-xlsx-ext
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Construir la extensión

```bash
npm run build
```

Este comando creará la carpeta `dist/` con todos los archivos necesarios para la extensión.

### 4. Cargar en Chrome

1. Abre Chrome y ve a `chrome://extensions/`
2. Activa el "Modo de desarrollador" (Developer mode) en la esquina superior derecha
3. Haz clic en "Cargar extensión sin empaquetar" (Load unpacked)
4. Selecciona la carpeta `dist/` que se generó en el paso 3
5. La extensión aparecerá en tu lista de extensiones y en la barra de herramientas

## Uso

### Configuración inicial

1. **Abrir página de opciones**:
   - Haz clic derecho en el icono de la extensión → "Opciones"
   - O haz clic en "Configurar" desde el popup

2. **Crear un perfil de mapeo**:
   - Haz clic en "Crear Nuevo Perfil"
   - Ingresa un nombre y descripción para el perfil
   - Pega un XML de NFe de ejemplo en el área de texto
   - Haz clic en "Analizar XML" para ver los campos disponibles

3. **Configurar mapeos**:
   - Haz clic en "Agregar Campo" para cada campo que quieras extraer
   - Define la ruta XML (ej: `nfeProc.NFe.infNFe.emit.xNome`)
   - Selecciona la columna de Excel (A, B, C, etc.)
   - Asigna un alias descriptivo para la columna
   - Guarda el perfil

4. **Activar perfil**:
   - Haz clic en "Activar" en el perfil que quieras usar por defecto

### Conversión de archivos

1. **Abrir popup**: Haz clic en el icono de la extensión
2. **Cargar archivos XML**: 
   - **Opción 1**: Arrastra archivos XML directamente al área de carga
   - **Opción 2**: Haz clic en "📎 Seleccionar archivos" y elige uno o más archivos .xml
3. **Procesamiento inteligente**:
   - Si tienes un perfil activo, usará ese mapeo
   - Si no hay perfil, creará automáticamente mapeos para todos los campos disponibles
4. **Convertir**: Haz clic en "🚀 Convertir a Excel"
5. **Descargar**: El archivo `nfe-mapeado.xlsx` se descargará automáticamente

### Funciones adicionales

- **Gestión de archivos**: Puedes ver la lista de archivos seleccionados y limpiarla si es necesario
- **Barra de progreso**: Visualiza el progreso del procesamiento en tiempo real
- **Indicadores de estado**: Mensajes informativos con emojis para mejor experiencia de usuario

## Ejemplos de rutas XML para NFe

Aquí tienes algunos ejemplos de rutas XML comunes para facturas NFe:

```javascript
// Información del emisor
"nfeProc.NFe.infNFe.emit.xNome"        // Nombre del emisor
"nfeProc.NFe.infNFe.emit.CNPJ"         // CNPJ del emisor
"nfeProc.NFe.infNFe.emit.enderEmit.xLgr" // Dirección del emisor

// Información del destinatario
"nfeProc.NFe.infNFe.dest.xNome"        // Nombre del destinatario
"nfeProc.NFe.infNFe.dest.CNPJ"         // CNPJ del destinatario

// Información de la factura
"nfeProc.NFe.infNFe.ide.nNF"           // Número de la factura
"nfeProc.NFe.infNFe.ide.dhEmi"         // Fecha de emisión
"nfeProc.NFe.infNFe.total.ICMSTot.vNF" // Valor total de la factura

// Productos (primer producto)
"nfeProc.NFe.infNFe.det[0].prod.xProd" // Descripción del producto
"nfeProc.NFe.infNFe.det[0].prod.vProd" // Valor del producto
"nfeProc.NFe.infNFe.det[0].prod.qCom"  // Cantidad
```

## Estructura del proyecto

```
my-xml-to-xlsx-ext/
├─ src/
│  ├─ background.js           # Service worker
│  ├─ popup/
│  │  ├─ popup.html          # HTML del popup
│  │  └─ popup.jsx           # Componente React del popup
│  ├─ options/
│  │  ├─ options.html        # HTML de la página de opciones
│  │  └─ options.jsx         # Componente React de opciones
│  ├─ icons/                 # Iconos de la extensión
│  └─ manifest.json          # Manifest de la extensión
├─ dist/                     # Archivos compilados (generado por build)
├─ package.json
├─ vite.config.js
├─ tailwind.config.js
├─ postcss.config.js
└─ README.md
```

## Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo de Vite
- `npm run build`: Construye la extensión para producción
- `npm run preview`: Vista previa de la build

## Optimizaciones de rendimiento

- **Procesamiento paralelo**: Los archivos XML se procesan en paralelo usando `Promise.all`
- **Parser eficiente**: `fast-xml-parser` es más rápido que alternativas como `xml2js`
- **Configuración optimizada**: El parser está configurado para mayor velocidad
- **Manejo de memoria**: Los archivos se procesan de forma streaming cuando es posible

## Solución de problemas

### Error: "No hay perfil activo seleccionado"
- Asegúrate de haber creado y activado un perfil en la página de opciones

### Error al parsear XML
- Verifica que los archivos XML estén bien formados
- Comprueba que las rutas XML en el perfil sean correctas

### Campos vacíos en Excel
- Revisa las rutas XML en tu perfil
- Usa la función "Analizar XML" para verificar la estructura del XML

### La extensión no aparece
- Verifica que hayas cargado la carpeta `dist/` y no la carpeta del proyecto
- Asegúrate de que el modo desarrollador esté activado

## Desarrollo

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Realiza tus cambios
4. Ejecuta `npm run build` para verificar que compile correctamente
5. Commit tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
6. Push a la rama: `git push origin feature/nueva-funcionalidad`
7. Crea un Pull Request

## Licencia

MIT License - consulta el archivo LICENSE para más detalles.

## Soporte

Si encuentras algún problema o tienes sugerencias, por favor:
1. Revisa la sección de solución de problemas
2. Crea un issue en GitHub con detalles del problema
3. Incluye ejemplos de archivos XML que causan problemas (sin datos sensibles)
