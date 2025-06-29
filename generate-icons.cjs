const fs = require('fs');
const path = require('path');

// Función para crear iconos básicos sin canvas
function generateBasicIcons() {
    const iconSizes = [16, 48, 128];
    const iconsDir = path.join(__dirname, 'icons');
    
    // Crear directorio de iconos si no existe
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    console.log('?? Generando iconos básicos para Firefox...');
    
    // SVG base para convertir a diferentes tamaños
    const svgTemplate = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5"/>
      <stop offset="100%" style="stop-color:#7C3AED"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.1}" fill="url(#bg)"/>
  <text x="${size * 0.3}" y="${size * 0.4}" font-family="Arial, sans-serif" font-size="${size * 0.25}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">XML</text>
  <path d="M ${size * 0.45} ${size * 0.5} L ${size * 0.55} ${size * 0.5} M ${size * 0.52} ${size * 0.47} L ${size * 0.55} ${size * 0.5} L ${size * 0.52} ${size * 0.53}" stroke="white" stroke-width="${Math.max(1, size * 0.02)}" fill="none"/>
  <rect x="${size * 0.6}" y="${size * 0.25}" width="${size * 0.3}" height="${size * 0.5}" fill="#10B981"/>
  <text x="${size * 0.75}" y="${size * 0.5}" font-family="Arial, sans-serif" font-size="${size * 0.2}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">XLS</text>
</svg>`.trim();

    // Si tenemos Sharp disponible, usarlo; sino, crear archivos SVG básicos
    let useSharp = false;
    try {
        require.resolve('sharp');
        useSharp = true;
        console.log('? Usando Sharp para generar PNGs de alta calidad');
    } catch (e) {
        console.log('??  Sharp no disponible, generando iconos SVG básicos');
    }

    iconSizes.forEach(size => {
        if (useSharp) {
            // Usar Sharp si está disponible
            try {
                const sharp = require('sharp');
                const svgBuffer = Buffer.from(svgTemplate(size));
                const iconPath = path.join(iconsDir, `icon-${size}.png`);
                
                sharp(svgBuffer)
                    .png()
                    .toFile(iconPath, (err) => {
                        if (err) {
                            console.log(`? Error generando PNG ${size}x${size}: ${err.message}`);
                            // Fallback a SVG
                            const svgPath = path.join(iconsDir, `icon-${size}.svg`);
                            fs.writeFileSync(svgPath, svgTemplate(size));
                            console.log(`? Icono SVG ${size}x${size} generado: ${svgPath}`);
                        } else {
                            console.log(`? Icono PNG ${size}x${size} generado: ${iconPath}`);
                        }
                    });
            } catch (error) {
                console.log(`? Error con Sharp: ${error.message}, usando SVG`);
                const svgPath = path.join(iconsDir, `icon-${size}.svg`);
                fs.writeFileSync(svgPath, svgTemplate(size));
                console.log(`? Icono SVG ${size}x${size} generado: ${svgPath}`);
            }
        } else {
            // Generar archivos SVG básicos
            const svgPath = path.join(iconsDir, `icon-${size}.svg`);
            fs.writeFileSync(svgPath, svgTemplate(size));
            console.log(`? Icono SVG ${size}x${size} generado: ${svgPath}`);
        }
    });
    
    console.log('\n?? Iconos generados exitosamente!');
    console.log('?? Nota: Firefox acepta tanto PNG como SVG para iconos');
    
    // Crear iconos PNG simples usando datos base64 como fallback
    if (!useSharp) {
        console.log('\n?? Creando iconos PNG básicos como fallback...');
        createFallbackPNGs(iconsDir, iconSizes);
    }
}

// Función para crear PNGs básicos sin dependencias externas
function createFallbackPNGs(iconsDir, sizes) {
    // PNG básico 1x1 pixel que se puede usar como fallback
    // Este es un PNG válido mínimo en base64
    const minimalPNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHNj+M2JQAAAABJRU5ErkJggg==';
    
    sizes.forEach(size => {
        const iconPath = path.join(iconsDir, `icon-${size}.png`);
        if (!fs.existsSync(iconPath)) {
            // Crear un PNG básico si no existe
            const buffer = Buffer.from(minimalPNG, 'base64');
            fs.writeFileSync(iconPath, buffer);
            console.log(`?? PNG básico ${size}x${size} creado como fallback`);
        }
    });
}

// Ejecutar si se llama directamente
if (require.main === module) {
    generateBasicIcons();
}

module.exports = { generateBasicIcons };