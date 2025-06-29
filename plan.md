Plan para la extensión "nfe-xml-to-xlsx-extension"
1. Descripción general
Una extensión de navegador (Chrome/Edge) que permite convertir fácilmente archivos XML de facturas
electrónicas (NFe, CFDI, etc.) a formatos de hoja de cálculo (XLSX, CSV, JSON) para su análisis, validación
y migración de sistemas.
2. Tecnologías y dependencias
Vite: empaquetador y servidor de desarrollo (scripts: dev , build , preview ).
React 18 + React DOM: interfaz de usuario moderna.
fast-xml-parser: parseo rápido y configurable de XML.
xlsx: generación de archivos Excel (soporta streaming).
file-saver: descarga de archivos desde el navegador.
Tailwind CSS + PostCSS + Autoprefixer: estilos utilitarios y compatibilidad.
@iconify-json/mdi: iconos Material Design.
Sharp (dev dependency): manipulación de imágenes para assets (favicons).
Vite plugin React: integración React en Vite.
Extras posibles: soporte JSON Schema para validación de plantillas de mapeo,
IndexedDB para guardar configuraciones, paquetes para CLI (en Node) si se decide
ofertar herramienta standalone.
3. Estructura de carpetas sugerida
nfe-xml-to-xlsx-extension/
├── public/
│ ├── manifest.json
│ ├── icons/ # iconos en varios tamaños
│ └── popup.html # contenedor de la UI
├── src/
│ ├── background/ # scripts de background si necesarios (p. ej.
listeners)
│ │ └── index.ts
│ ├── content/ # content scripts opcionales
│ │ └── index.ts
│ ├── popup/
│ │ ├── App.tsx
│ │ ├── index.tsx
│ │ └── popup.css
│ ├── utils/
│ │ ├── xmlParser.ts # abstrae fast-xml-parser configs
│ │ ├── excelWriter.ts # wrappers de xlsx
│ │ └── storage.ts # gestión de IndexedDB/localStorage
│ └── styles/
│ └── tailwind.css
├── tests/
│ └── parser.test.ts # casos de prueba para distintos layouts
•
•
•
•
•
•
•
•
•
1
├── vite.config.ts
├── package.json
└── tailwind.config.js
4. Manifest ( public/manifest.json )
{
"manifest_version": 3,
"name": "nfe-xml-to-xlsx-extension",
"version": "1.0.0",
"description": "Convert NFe and other e-invoices XML to Excel/CSV/JSON
locally",
"permissions": ["downloads", "storage"],
"action": {
"default_popup": "popup.html",
"default_icon": {
"16": "icons/icon16.png",
"48": "icons/icon48.png",
"128": "icons/icon128.png"
}
}
}
5. Flujo de desarrollo
Configuración inicial: clonar repo, instalar dependencias ( npm install ).
Dev: npm run dev para iniciar servidor Vite y cargar extensión en modo "unpacked".
UI básica: implementar drag-&-drop en App.tsx , leer archivos y enviarlos a xmlParser.ts .
Parseo: configurar fast-xml-parser con opciones de namspaces y versiones, extraer nodos
comunes.
Generación: usar xlsx para crear workbook, worksheets por factura o consolidado.
Descarga: invocar file-saver para guardar .xlsx o .zip (múltiples hojas).
Persistencia: guardar plantillas/mapeos en storage.ts .
Pruebas: crear test con XML de NFe v4.00, CFDI v4.0, Facturae etc.; asegurar columnas.
Build: npm run build genera bundle optimizado; empaquetar assets en public .
Publicación: publicar en Chrome Web Store; definir estrategia de versiones.
6. Consejos y puntos críticos
Memoria: usar streaming de xlsx para lotes grandes.
Seguridad: procesamiento totalmente local, sin endpoints externos.
UX: progressive disclosure para modos básico y avanzado.
Mantenimiento: tests automatizados y plantilla de mapeo JSON validado.
Internacionalización: considerar múltiples idiomas (plantillas de traducción).
Próximos pasos: revisar y ajustar la estructura, definir primer MVP centrado en NFe + CFDI, y comenzar
la implementación de la UI drag-&-drop y el módulo de parseo XML.