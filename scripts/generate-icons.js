// Script untuk generate icon PWA dari SVG
// Jalankan dengan: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// SVG template untuk icon
const iconSVG = `<svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="24" fill="#3B82F6"/>
  <svg x="48" y="48" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2z"/>
    <path d="M13 19a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-2z"/>
    <path d="M19 8a2 2 0 0 0 2-2h3a2 2 0 0 0 2 2v2a2 2 0 0 0-2 2h-3a2 2 0 0 0-2-2V8z"/>
    <path d="M5 16a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-2z"/>
    <path d="M19 16a2 2 0 0 0 2-2h1a2 2 0 0 0 2 2v2a2 2 0 0 0-2 2h-1a2 2 0 0 0-2-2v-2z"/>
    <path d="M5 8a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V8z"/>
    <path d="M12 5v14m-7-7h14"/>
  </svg>
</svg>`;

// Simpan SVG ke file
fs.writeFileSync(path.join(__dirname, '../public/icon.svg'), iconSVG);

console.log('✅ Icon SVG generated successfully!');
console.log('📁 Location: public/icon.svg');
console.log('');
console.log('💡 To generate PNG icons, you can:');
console.log('1. Use online SVG to PNG converters');
console.log('2. Use tools like ImageMagick or Sharp');
console.log('3. Use design tools like Figma or Canva');
console.log('');
console.log('📱 Required sizes:');
console.log('- 192x192px (icon-192x192.png)');
console.log('- 512x512px (icon-512x512.png)');
