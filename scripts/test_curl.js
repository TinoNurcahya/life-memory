const fs = require('fs');
const sharp = require('sharp');

// Create authentic page curl SVG based on user's exact reference (media_1791967260281.png)
// Normalized coordinates: viewBox 0 0 100 100
// Corner at bottom-right of the note
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
  <defs>
    <!-- Filter for realistic drop shadow onto the dark background -->
    <filter id="curl-drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" />
      <feOffset dx="3" dy="4" />
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.5" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Filter for soft inner shadow on the paper near the fold point -->
    <filter id="page-crease-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3.5" />
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.35" />
      </feComponentTransfer>
    </filter>

    <!-- Conical/cylindrical gradient for the 3D rolled paper corner -->
    <linearGradient id="curl-roll-grad" x1="18%" y1="18%" x2="90%" y2="90%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="15%" stop-color="#fdfbf7" />
      <stop offset="35%" stop-color="#f2ebe0" />
      <stop offset="60%" stop-color="#e3d8c5" />
      <stop offset="82%" stop-color="#c4b59e" />
      <stop offset="93%" stop-color="#8c7e69" />
      <stop offset="100%" stop-color="#4e4334" />
    </linearGradient>

    <!-- Highlight along the apex ridge of the roll -->
    <linearGradient id="curl-highlight-grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.65)" />
      <stop offset="45%" stop-color="rgba(255,255,255,0.2)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.06)" />
    </linearGradient>

    <!-- Radial shadow near the inner fold apex -->
    <radialGradient id="apex-shadow" cx="35%" cy="37%" r="35%">
      <stop offset="0%" stop-color="rgba(40,30,20,0.4)" />
      <stop offset="40%" stop-color="rgba(40,30,20,0.15)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </radialGradient>
  </defs>

  <!-- Dark background to simulate the photo/scene behind the note -->
  <rect width="100" height="100" fill="#0b1720" />

  <!-- Base paper with corner cutout -->
  <path d="M 0 0 L 100 0 L 100 0 C 96 46, 46 96, 0 100 L 0 100 Z" fill="#f4ede3" />

  <!-- Soft shadow on the base paper along the fold curve -->
  <path d="M 100 0 C 92 48, 48 92, 0 100 C 35 70, 70 35, 100 0 Z" fill="#201a14" filter="url(#page-crease-shadow)" />

  <!-- Deep drop shadow cast by the curl onto the exposed background below -->
  <path d="M 0 100 C 46 92, 92 46, 100 0 C 95 50, 50 95, 0 100 Z" fill="#000000" filter="url(#curl-drop-shadow)" />

  <!-- The 3D Curled Paper Corner Flap -->
  <path d="M 35 37 
           C 54 36, 82 23, 100 0 
           C 90 46, 46 90, 0 100 
           C 23 82, 36 54, 35 37 Z" 
        fill="url(#curl-roll-grad)" />

  <!-- Apex radial shadow for authentic depth -->
  <path d="M 35 37 
           C 54 36, 82 23, 100 0 
           C 90 46, 46 90, 0 100 
           C 23 82, 36 54, 35 37 Z" 
        fill="url(#apex-shadow)" />

  <!-- 3D Cylindrical highlight reflection -->
  <path d="M 35 37 
           C 54 36, 82 23, 100 0 
           C 90 46, 46 90, 0 100 
           C 23 82, 36 54, 35 37 Z" 
        fill="url(#curl-highlight-grad)" />

  <!-- Crisp outer edge rim highlight -->
  <path d="M 100 0 C 90 46, 46 90, 0 100" 
        stroke="rgba(255,255,255,0.4)" stroke-width="0.75" fill="none" />
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile('C:/Users/user/.gemini/antigravity-ide/brain/f0b6309f-7ea9-4be3-add9-1ff827544923/scratch/test_curl_v3.png')
  .then(() => console.log('Generated test_curl_v3.png'));
