const fs = require('fs');
const path = require('path');

function validateExtension() {
  const distPath = path.join(__dirname, 'dist');
  
  console.log('?? Validando extensión para Firefox...\n');
  
  // Archivos requeridos (popup.html ya no es necesario)
  const requiredFiles = [
    'manifest.json',
    'carga.html',
    'carga/carga.js',
    'src/background.js'
  ];

  // Archivos opcionales pero recomendados
  const optionalFiles = [
    'icons/icon-16.png',
    'icons/icon-48.png',
    'icons/icon-128.png',
    'popup.html',
    'popup/popup.js'
  ];

  let allValid = true;

  // Verificar archivos requeridos
  console.log('?? Archivos requeridos:');
  requiredFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const exists = fs.existsSync(filePath);
    console.log(`   ${exists ? '?' : '?'} ${file}`);
    if (!exists) allValid = false;
  });

  console.log('\n?? Archivos opcionales:');
  optionalFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const exists = fs.existsSync(filePath);
    console.log(`   ${exists ? '?' : '?? '} ${file}${file.includes('popup') ? ' (ya no necesario)' : ''}`);
  });

  // Validar manifest.json
  console.log('\n?? Validando manifest.json:');
  const manifestPath = path.join(distPath, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      const manifestChecks = [
        { key: 'manifest_version', value: manifest.manifest_version, expected: 2, type: 'equals' },
        { key: 'name', value: manifest.name, expected: null, type: 'exists' },
        { key: 'version', value: manifest.version, expected: null, type: 'exists' },
        { key: 'browser_action', value: manifest.browser_action, expected: null, type: 'exists' },
        { key: 'permissions', value: manifest.permissions, expected: null, type: 'array' },
        { key: 'applications.gecko.id', value: manifest.applications?.gecko?.id, expected: null, type: 'exists' }
      ];

      manifestChecks.forEach(check => {
        let valid = false;
        let message = '';

        switch (check.type) {
          case 'equals':
            valid = check.value === check.expected;
            message = `${check.key}: ${check.value} ${valid ? '(correcto)' : `(esperado: ${check.expected})`}`;
            break;
          case 'exists':
            valid = check.value !== undefined && check.value !== null;
            message = `${check.key}: ${valid ? 'existe' : 'falta'}`;
            break;
          case 'array':
            valid = Array.isArray(check.value) && check.value.length > 0;
            message = `${check.key}: ${valid ? `${check.value.length} elementos` : 'array vacío o inválido'}`;
            break;
        }

        console.log(`   ${valid ? '?' : '?'} ${message}`);
        if (!valid) allValid = false;
      });

      // Verificar que NO tenga default_popup (comportamiento nuevo)
      const hasPopup = manifest.browser_action?.default_popup;
      if (hasPopup) {
        console.log('   ??  default_popup encontrado - se abrirá popup en lugar de página completa');
      } else {
        console.log('   ? Sin default_popup - se abrirá página completa (correcto)');
      }

    } catch (error) {
      console.log('   ? Error al parsear manifest.json:', error.message);
      allValid = false;
    }
  }

  // Verificar tamaños de archivos
  console.log('\n?? Tamaños de archivos principales:');
  const mainFiles = ['carga/carga.js'];
  mainFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   ?? ${file}: ${sizeKB} KB`);
    }
  });

  // Información sobre el nuevo comportamiento
  console.log('\n?? Nuevo comportamiento:');
  console.log('   ?? Clic en icono ? Abre página completa directamente');
  console.log('   ?? Sin popup ? Sin problemas de cierre automático');
  console.log('   ? Funcionalidad completa ? Todos los métodos de carga disponibles');

  console.log('\n' + '='.repeat(50));
  if (allValid) {
    console.log('? Extensión válida y lista para empaquetar');
    console.log('?? Ejecuta "npm run package:firefox" para crear el ZIP');
  } else {
    console.log('? La extensión tiene problemas que deben solucionarse');
    console.log('?? Ejecuta "npm run build:firefox" para reconstruir');
  }
  console.log('='.repeat(50));

  return allValid;
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  const isValid = validateExtension();
  process.exit(isValid ? 0 : 1);
}

module.exports = validateExtension;