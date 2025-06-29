const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function createPackage() {
  const distPath = path.join(__dirname, 'dist');
  const packagePath = path.join(__dirname, 'xml-to-xlsx-firefox.zip');

  // Verificar que existe la carpeta dist
  if (!fs.existsSync(distPath)) {
    console.error('❌ Error: La carpeta dist/ no existe. Ejecuta primero "npm run build:firefox"');
    process.exit(1);
  }

  // Eliminar paquete anterior si existe
  if (fs.existsSync(packagePath)) {
    fs.unlinkSync(packagePath);
    console.log('🗑️  Eliminando paquete anterior...');
  }

  console.log('📦 Creando paquete ZIP para Firefox...');

  // Crear el archivo ZIP
  const output = fs.createWriteStream(packagePath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Máxima compresión
  });

  let fileCount = 0;

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`✅ Paquete creado exitosamente:`);
      console.log(`   📄 Archivo: xml-to-xlsx-firefox.zip`);
      console.log(`   📊 Tamaño: ${sizeInMB} MB`);
      console.log(`   📁 Archivos incluidos: ${fileCount}`);
      console.log('');
      console.log('🦊 Para instalar en Firefox:');
      console.log('   1. Ve a about:debugging');
      console.log('   2. Clic en "Este Firefox"');
      console.log('   3. Clic en "Cargar complemento temporal..."');
      console.log('   4. Selecciona dist/manifest.json');
      console.log('');
      console.log('📤 Para subir a Firefox Add-ons:');
      console.log('   1. Ve a https://addons.mozilla.org/developers/');
      console.log('   2. Sube xml-to-xlsx-firefox.zip');
      resolve();
    });

    output.on('error', reject);
    archive.on('error', reject);

    // Contar archivos mientras se agregan
    archive.on('entry', () => {
      fileCount++;
    });

    archive.pipe(output);

    // Agregar todos los archivos de la carpeta dist
    archive.directory(distPath, false);

    // Finalizar el archivo
    archive.finalize();
  });
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  createPackage().catch(error => {
    console.error('❌ Error al crear paquete:', error);
    process.exit(1);
  });
}

module.exports = createPackage;