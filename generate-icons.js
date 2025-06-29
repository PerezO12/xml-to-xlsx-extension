const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Función para crear un icono
function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#4F46E5');
    gradient.addColorStop(1, '#7C3AED');
    
    // Background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Add subtle shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = size * 0.1;
    ctx.shadowOffsetX = size * 0.05;
    ctx.shadowOffsetY = size * 0.05;
    
    // XML symbol (left side)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.floor(size * 0.25)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('XML', size * 0.3, size * 0.4);
    
    // Arrow
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.max(1, size * 0.02);
    ctx.beginPath();
    ctx.moveTo(size * 0.45, size * 0.5);
    ctx.lineTo(size * 0.55, size * 0.5);
    ctx.moveTo(size * 0.52, size * 0.47);
    ctx.lineTo(size * 0.55, size * 0.5);
    ctx.lineTo(size * 0.52, size * 0.53);
    ctx.stroke();
    
    // XLS symbol (right side)
    ctx.fillStyle = '#10B981';
    ctx.fillRect(size * 0.6, size * 0.25, size * 0.3, size * 0.5);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.floor(size * 0.2)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('XLS', size * 0.75, size * 0.5);
    
    return canvas.toBuffer('image/png');
}

// Función principal
function generateIcons() {
    const iconSizes = [16, 48, 128];
    const iconsDir = path.join(__dirname, 'icons');
    
    // Crear directorio de iconos si no existe
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    console.log('Generando iconos...');
    
    iconSizes.forEach(size => {
        const iconBuffer = createIcon(size);
        const iconPath = path.join(iconsDir, `icon-${size}.png`);
        
        fs.writeFileSync(iconPath, iconBuffer);
        console.log(`✅ Icono ${size}x${size} generado: ${iconPath}`);
    });
    
    console.log('\n🎉 Todos los iconos han sido generados exitosamente!');
    console.log('Los iconos están listos para usar en la extensión.');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    generateIcons();
}

module.exports = { createIcon, generateIcons }; 