# ?? Guía de Archivos del Repositorio

## ? Archivos que DEBEN estar en Git

### ?? Configuración del proyecto
- `package.json` - Dependencias y scripts del proyecto
- `package-lock.json` - Versiones exactas de dependencias (recomendado)
- `manifest.json` - Configuración de la extensión de Firefox
- `tsconfig.json` - Configuración de TypeScript
- `tsconfig.node.json` - Configuración TypeScript para Node.js
- `vite.config.js` - Configuración de Vite (build tool)
- `tailwind.config.js` - Configuración de Tailwind CSS
- `postcss.config.js` - Configuración de PostCSS

### ?? Archivos HTML y CSS
- `popup.html` - Interfaz del popup (aunque ya no se use)
- `carga.html` - Interfaz principal de la aplicación
- `popup.css` - Estilos del popup

### ?? Código fuente
- `src/` - Todo el directorio de código fuente
  - `src/main.tsx` - Punto de entrada principal
  - `src/carga.tsx` - Punto de entrada para página completa
  - `src/background.js` - Script de fondo de la extensión
  - `src/pages/` - Componentes de página
  - `src/components/` - Componentes React
  - `src/utils/` - Utilidades y helpers
  - `src/assets/` - Assets estáticos

### ?? Iconos (si son estáticos)
- `icons/` - Iconos de la extensión
  - `icons/icon-16.png`
  - `icons/icon-48.png` 
  - `icons/icon-128.png`

### ??? Scripts de build y herramientas
- `generate-icons.cjs` - Generador de iconos
- `prepare-package.cjs` - Empaquetador para Firefox
- `validate-extension.cjs` - Validador de extensión

### ?? Documentación
- `README.md` - Documentación principal
- `PACKAGING_GUIDE.md` - Guía de empaquetado
- `TESTING_NEW_BEHAVIOR.md` - Guía de testing
- `FIREFOX_INSTALLATION.md` - Guía de instalación en Firefox
- `LICENSE` - Licencia del proyecto (si existe)

### ?? Control de versiones
- `.gitignore` - Archivos a ignorar en Git
- `.gitattributes` - Configuración de Git (si existe)

## ? Archivos que NO deben estar en Git

### ?? Dependencias
- `node_modules/` - Dependencias de npm (se instalan con `npm install`)

### ??? Build outputs
- `dist/` - Archivos compilados (se generan con `npm run build`)
- `build/` - Outputs alternativos de build
- `out/` - Outputs de otras herramientas

### ?? Archivos generados
- `xml-to-xlsx-firefox.zip` - Paquete final (se genera con scripts)
- `*.zip`, `*.tar.gz`, `*.rar` - Otros paquetes comprimidos

### ??? Archivos temporales
- `.cache/` - Caché de herramientas
- `.vite/` - Caché de Vite
- `*.tmp`, `*.temp` - Archivos temporales

### ?? Logs y debugging
- `*.log` - Archivos de log
- `npm-debug.log*` - Logs de npm
- `coverage/` - Reportes de cobertura de tests

### ?? Configuración local del desarrollador
- `.vscode/` - Configuración específica de VS Code del desarrollador
- `.env` - Variables de entorno locales
- `local.config.js` - Configuraciones locales

### ?? Archivos sensibles
- `*.pem`, `*.key` - Claves privadas
- `.env` - Variables de entorno con datos sensibles

## ?? Comandos útiles para Git

### Verificar estado
```bash
git status                    # Ver archivos modificados
git diff                      # Ver cambios específicos
git log --oneline -10         # Ver últimos 10 commits
```

### Agregar archivos
```bash
git add .                     # Agregar todos los archivos
git add src/                  # Agregar solo la carpeta src
git add manifest.json         # Agregar archivo específico
```

### Commits
```bash
git commit -m "Descripción del cambio"
git commit -am "Agregar y commit en un comando"
```

### Verificar .gitignore
```bash
git check-ignore -v archivo.ext   # Verificar si un archivo está ignorado
git ls-files --ignored --exclude-standard  # Ver todos los archivos ignorados
```

## ?? Tamaños aproximados esperados

### ? Archivos fuente (deben estar en Git)
- Total del repositorio: ~1-5 MB
- `src/` completo: ~200-500 KB
- `package.json`: ~2-5 KB
- `manifest.json`: ~1-2 KB
- Documentación: ~50-200 KB

### ? Archivos generados (NO en Git)
- `node_modules/`: 50-200 MB
- `dist/`: 500 KB - 2 MB
- `xml-to-xlsx-firefox.zip`: 200-500 KB

## ?? Repositorio limpio

Un repositorio bien configurado debe:
- ? Permitir `git clone` + `npm install` + `npm run build` para funcionar
- ? No incluir archivos que se pueden regenerar
- ? Mantener solo archivos esenciales para el desarrollo
- ? Tener documentación clara y actualizada