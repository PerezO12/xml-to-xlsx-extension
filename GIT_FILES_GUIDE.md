# ?? Gu�a de Archivos del Repositorio

## ? Archivos que DEBEN estar en Git

### ?? Configuraci�n del proyecto
- `package.json` - Dependencias y scripts del proyecto
- `package-lock.json` - Versiones exactas de dependencias (recomendado)
- `manifest.json` - Configuraci�n de la extensi�n de Firefox
- `tsconfig.json` - Configuraci�n de TypeScript
- `tsconfig.node.json` - Configuraci�n TypeScript para Node.js
- `vite.config.js` - Configuraci�n de Vite (build tool)
- `tailwind.config.js` - Configuraci�n de Tailwind CSS
- `postcss.config.js` - Configuraci�n de PostCSS

### ?? Archivos HTML y CSS
- `popup.html` - Interfaz del popup (aunque ya no se use)
- `carga.html` - Interfaz principal de la aplicaci�n
- `popup.css` - Estilos del popup

### ?? C�digo fuente
- `src/` - Todo el directorio de c�digo fuente
  - `src/main.tsx` - Punto de entrada principal
  - `src/carga.tsx` - Punto de entrada para p�gina completa
  - `src/background.js` - Script de fondo de la extensi�n
  - `src/pages/` - Componentes de p�gina
  - `src/components/` - Componentes React
  - `src/utils/` - Utilidades y helpers
  - `src/assets/` - Assets est�ticos

### ?? Iconos (si son est�ticos)
- `icons/` - Iconos de la extensi�n
  - `icons/icon-16.png`
  - `icons/icon-48.png` 
  - `icons/icon-128.png`

### ??? Scripts de build y herramientas
- `generate-icons.cjs` - Generador de iconos
- `prepare-package.cjs` - Empaquetador para Firefox
- `validate-extension.cjs` - Validador de extensi�n

### ?? Documentaci�n
- `README.md` - Documentaci�n principal
- `PACKAGING_GUIDE.md` - Gu�a de empaquetado
- `TESTING_NEW_BEHAVIOR.md` - Gu�a de testing
- `FIREFOX_INSTALLATION.md` - Gu�a de instalaci�n en Firefox
- `LICENSE` - Licencia del proyecto (si existe)

### ?? Control de versiones
- `.gitignore` - Archivos a ignorar en Git
- `.gitattributes` - Configuraci�n de Git (si existe)

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
- `.cache/` - Cach� de herramientas
- `.vite/` - Cach� de Vite
- `*.tmp`, `*.temp` - Archivos temporales

### ?? Logs y debugging
- `*.log` - Archivos de log
- `npm-debug.log*` - Logs de npm
- `coverage/` - Reportes de cobertura de tests

### ?? Configuraci�n local del desarrollador
- `.vscode/` - Configuraci�n espec�fica de VS Code del desarrollador
- `.env` - Variables de entorno locales
- `local.config.js` - Configuraciones locales

### ?? Archivos sensibles
- `*.pem`, `*.key` - Claves privadas
- `.env` - Variables de entorno con datos sensibles

## ?? Comandos �tiles para Git

### Verificar estado
```bash
git status                    # Ver archivos modificados
git diff                      # Ver cambios espec�ficos
git log --oneline -10         # Ver �ltimos 10 commits
```

### Agregar archivos
```bash
git add .                     # Agregar todos los archivos
git add src/                  # Agregar solo la carpeta src
git add manifest.json         # Agregar archivo espec�fico
```

### Commits
```bash
git commit -m "Descripci�n del cambio"
git commit -am "Agregar y commit en un comando"
```

### Verificar .gitignore
```bash
git check-ignore -v archivo.ext   # Verificar si un archivo est� ignorado
git ls-files --ignored --exclude-standard  # Ver todos los archivos ignorados
```

## ?? Tama�os aproximados esperados

### ? Archivos fuente (deben estar en Git)
- Total del repositorio: ~1-5 MB
- `src/` completo: ~200-500 KB
- `package.json`: ~2-5 KB
- `manifest.json`: ~1-2 KB
- Documentaci�n: ~50-200 KB

### ? Archivos generados (NO en Git)
- `node_modules/`: 50-200 MB
- `dist/`: 500 KB - 2 MB
- `xml-to-xlsx-firefox.zip`: 200-500 KB

## ?? Repositorio limpio

Un repositorio bien configurado debe:
- ? Permitir `git clone` + `npm install` + `npm run build` para funcionar
- ? No incluir archivos que se pueden regenerar
- ? Mantener solo archivos esenciales para el desarrollo
- ? Tener documentaci�n clara y actualizada