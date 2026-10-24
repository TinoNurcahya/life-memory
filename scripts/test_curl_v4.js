const fs = require('fs');
const sharp = require('sharp');

// Create authentic page curl SVG component
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
  <defs>
    <!-- Deep drop shadow cast by the curl onto the exposed background below -->
    <filter id="page-curl-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
      <feOffset dx="3" dy="5" />
      <feComponentTransfer><feFuncA type="linear" slope="0.55" /></feComponentTransfer>
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Crease shadow on the paper along the fold -->
    <filter id="page-crease-shadow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3" />
      <feComponentTransfer><feFuncA type="linear" slope="0.28" /></feComponentTransfer>
    </filter>

    <!-- Conical/cylindrical gradient for the 3D rolled paper corner -->
    <linearGradient id="page-curl-surface" x1="25%" y1="25%" x2="92%" y2="92%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="20%" stop-color="#fdfbf8" />
      <stop offset="42%" stop-color="#f3eee5" />
      <stop offset="65%" stop-color="#e5dcce" />
      <stop offset="82%" stop-color="#cbbea9" />
      <stop offset="93%" stop-color="#93846f" />
      <stop offset="100%" stop-color="#554939" />
    </linearGradient>

    <!-- Highlight along the arched ridge of the roll -->
    <linearGradient id="page-curl-ridge" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.75)" />
      <stop offset="45%" stop-color="rgba(255,255,255,0.22)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.06)" />
    </linearGradient>

    <!-- Soft ambient shadow at apex -->
    <radialGradient id="page-curl-apex" cx="38%" cy="38%" r="30%">
      <stop offset="0%" stop-color="rgba(45,35,25,0.25)" />
      <stop offset="50%" stop-color="rgba(45,35,25,0.08)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </radialGradient>
  </defs>

  <!-- Background scene simulation (dark) -->
  <rect width="100" height="100" fill="#0b1720" />

  <!-- Base paper with diagonal clip cut (fold from 100,25 to 25,100) -->
  <path d="M 0 0 L 100 0 L 100 25 L 25 100 L 0 100 Z" fill="#f4ede3" />

  <!-- Soft shadow on paper along the fold -->
  <path d="M 100 25 C 85 55, 55 85, 25 100 C 45 75, 75 45, 100 25 Z" fill="#1c1610" filter="url(#page-crease-shadow)" />

  <!-- Drop shadow cast onto the exposed background behind the curl -->
  <path d="M 25 100 C 55 88, 88 55, 100 25 C 96 66, 66 96, 25 100 Z" fill="#000000" filter="url(#page-curl-shadow)" />

  <!-- The 3D Curled Paper Flap Surface -->
  <!-- 
    Apex point at (38, 38)
    Top curve: from (38, 38) to (100, 25) via C 58 38, 82 28
    Outer fold belly: from (100, 25) to (25, 100) via C 98 58, 58 98
    Bottom curve: from (25, 100) to (38, 38) via C 28 82, 38 58
  -->
  <path d="M 38 38 
           C 58 38, 82 28, 100 25 
           C 98 58, 58 98, 25 100 
           C 28 82, 38 58, 38 38 Z" 
        fill="url(#page-curl-surface)" />

  <!-- Apex soft shadow -->
  <path d="M 38 38 
           C 58 38, 82 28, 100 25 
           C 98 58, 58 98, 25 100 
           C 28 82, 38 58, 38 38 Z" 
        fill="url(#page-curl-apex)" />

  <!-- Highlight on ridge -->
  <path d="M 38 38 
           C 58 38, 82 28, 100 25 
           C 98 58, 58 98, 25 100 
           C 28 82, 38 58, 38 38 Z" 
        fill="url(#page-curl-ridge)" />

  <!-- Outer rim edge highlight -->
  <path d="M 100 25 C 98 58, 58 98, 25 100" 
        stroke="rgba(255,255,255,0.4)" stroke-width="0.8" fill="none" />
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile('C:/Users/user/.gemini/antigravity-ide/brain/f0b6309f-7ea9-4be3-add9-1ff827544923/scratch/test_curl_v4.png')
  .then(() => console.log('Generated test_curl_v4.png'));
