const fs = require('fs');
const path = require('path');

// Simple script to create a basic icon file
// In a real project, you'd use a proper icon creation tool

const iconSvg = `
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#007bff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0056b3;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="256" height="256" rx="32" fill="url(#bg)"/>
  
  <!-- Cloud icon -->
  <path d="M80 120c-22 0-40 18-40 40s18 40 40 40h96c22 0 40-18 40-40s-18-40-40-40c-4-22-22-40-48-40s-44 18-48 40z" 
        fill="white" 
        opacity="0.9"/>
  
  <!-- Explorer icon -->
  <rect x="60" y="80" width="40" height="30" rx="4" fill="white" opacity="0.8"/>
  <rect x="70" y="90" width="20" height="2" fill="#007bff"/>
  <rect x="70" y="95" width="15" height="2" fill="#007bff"/>
  <rect x="70" y="100" width="18" height="2" fill="#007bff"/>
  
  <rect x="120" y="80" width="40" height="30" rx="4" fill="white" opacity="0.8"/>
  <rect x="130" y="90" width="20" height="2" fill="#28a745"/>
  <rect x="130" y="95" width="15" height="2" fill="#28a745"/>
  <rect x="130" y="100" width="18" height="2" fill="#28a745"/>
  
  <!-- Arrow -->
  <path d="M100 140 L120 140 L120 130 L140 150 L120 170 L120 160 L100 160 Z" fill="white"/>
  
  <!-- Text -->
  <text x="128" y="200" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">
    RoseGlass
  </text>
</svg>
`;

// Create the assets directory
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Write the SVG icon
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), iconSvg);

console.log('✅ Created basic icon files');
console.log('📁 Assets directory: assets/');
console.log('🎨 For production, replace with proper .ico files');
