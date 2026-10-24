const fs = require('fs');
const sharp = require('sharp');

// Create full note card preview v2 with authentic bulging 3D paper curl
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 480" width="460" height="480">
  <defs>
    <!-- Background scene simulation -->
    <linearGradient id="scene-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18222a" />
      <stop offset="100%" stop-color="#071016" />
    </linearGradient>

    <!-- Drop shadow for the entire note -->
    <filter id="note-shadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="24" stdDeviation="25" flood-color="#000000" flood-opacity="0.45" />
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.25" />
    </filter>

    <!-- Page curl drop shadow onto exposed background -->
    <filter id="curl-drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
      <feOffset dx="4" dy="6" />
      <feComponentTransfer><feFuncA type="linear" slope="0.5" /></feComponentTransfer>
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Soft shadow on the base paper along the crease -->
    <filter id="crease-shadow-filter" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" />
      <feComponentTransfer><feFuncA type="linear" slope="0.35" /></feComponentTransfer>
    </filter>

    <!-- Conical/cylindrical gradient for the 3D rolled paper corner -->
    <linearGradient id="curl-roll-grad" x1="22%" y1="22%" x2="92%" y2="92%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="18%" stop-color="#fdfbf8" />
      <stop offset="38%" stop-color="#f3ede3" />
      <stop offset="62%" stop-color="#e4daca" />
      <stop offset="80%" stop-color="#c6b8a2" />
      <stop offset="92%" stop-color="#8a7c68" />
      <stop offset="100%" stop-color="#4a4032" />
    </linearGradient>

    <!-- Highlight along the arched ridge of the roll -->
    <linearGradient id="curl-highlight-grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.7)" />
      <stop offset="42%" stop-color="rgba(255,255,255,0.25)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.08)" />
    </linearGradient>

    <!-- Apex radial shadow for authentic depth -->
    <radialGradient id="apex-shadow" cx="35%" cy="35%" r="35%">
      <stop offset="0%" stop-color="rgba(35,28,20,0.42)" />
      <stop offset="45%" stop-color="rgba(35,28,20,0.18)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </radialGradient>

    <!-- Clip path cutting out bottom-right corner of the note along the fold curve -->
    <clipPath id="note-cutout">
      <path d="M 30 30 L 430 30 L 430 350 C 426 392, 392 426, 350 430 L 30 430 Z" />
    </clipPath>
  </defs>

  <!-- Background scene -->
  <rect width="460" height="480" fill="url(#scene-bg)" />

  <!-- Base Note with clipped corner and shadow -->
  <g filter="url(#note-shadow)">
    <!-- Base paper -->
    <path d="M 30 30 L 430 30 L 430 350 C 426 392, 392 426, 350 430 L 30 430 Z" fill="#f4ede3" />

    <!-- Ruled notebook lines -->
    <g stroke="rgba(34, 44, 53, 0.055)" stroke-width="1" clip-path="url(#note-cutout)">
      <line x1="30" y1="65" x2="430" y2="65" />
      <line x1="30" y1="97" x2="430" y2="97" />
      <line x1="30" y1="129" x2="430" y2="129" />
      <line x1="30" y1="161" x2="430" y2="161" />
      <line x1="30" y1="193" x2="430" y2="193" />
      <line x1="30" y1="225" x2="430" y2="225" />
      <line x1="30" y1="257" x2="430" y2="257" />
      <line x1="30" y1="289" x2="430" y2="289" />
      <line x1="30" y1="321" x2="430" y2="321" />
      <line x1="30" y1="353" x2="430" y2="353" />
      <line x1="30" y1="385" x2="430" y2="385" />
      <line x1="30" y1="417" x2="430" y2="417" />
    </g>
  </g>

  <!-- Content Simulation -->
  <g font-family="system-ui, -apple-system, sans-serif" font-size="11" letter-spacing="1.5" fill="#575c5f">
    <text x="65" y="80">03 OCT 2026</text>
    <text x="365" y="80">18:10</text>
  </g>
  <g font-family="Georgia, serif" font-size="28" fill="#222c35">
    <text x="65" y="145">“Met Amy at a small</text>
    <text x="65" y="185">café. We talked, shared</text>
    <text x="65" y="225">a slice of cake, and</text>
    <text x="65" y="265">waited for the rain to</text>
    <text x="65" y="305">stop.”</text>
  </g>
  <line x1="65" y1="345" x2="395" y2="345" stroke="rgba(34, 44, 53, 0.18)" stroke-width="1" />
  <text x="65" y="375" font-family="system-ui, -apple-system, sans-serif" font-size="11" letter-spacing="1.5" fill="#575c5f">FROM AN ORIGINAL SAMPLE NOTE</text>
  <text x="390" y="375" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#575c5f">↗</text>

  <!-- The 3D Page Curl at Bottom Right Corner (Positioned at x=330..430, y=330..430) -->
  <g transform="translate(330, 330)">
    <!-- Soft shadow on the paper along the crease -->
    <path d="M 100 20 C 90 60, 60 90, 20 100 C 45 75, 75 45, 100 20 Z" fill="#201a14" filter="url(#crease-shadow-filter)" />

    <!-- Deep drop shadow cast onto the exposed background below -->
    <path d="M 20 100 C 55 92, 92 55, 100 20 C 95 65, 65 95, 20 100 Z" fill="#000000" filter="url(#curl-drop-shadow)" />

    <!-- Curled Flap Surface with organic belly curve -->
    <!-- 
      Peak at (35, 35)
      Top curve: (35, 35) to (100, 20) via C 58 35, 84 25
      Outer belly curve: (100, 20) to (20, 100) via C 98 56, 56 98
      Bottom curve: (20, 100) to (35, 35) via C 25 84, 35 58
    -->
    <path d="M 35 35 
             C 58 35, 84 25, 100 20 
             C 98 58, 58 98, 20 100 
             C 25 84, 35 58, 35 35 Z" 
          fill="url(#curl-roll-grad)" />

    <!-- Apex radial shadow for authentic depth -->
    <path d="M 35 35 
             C 58 35, 84 25, 100 20 
             C 98 58, 58 98, 20 100 
             C 25 84, 35 58, 35 35 Z" 
          fill="url(#apex-shadow)" />

    <!-- 3D Cylindrical highlight reflection -->
    <path d="M 35 35 
             C 58 35, 84 25, 100 20 
             C 98 58, 58 98, 20 100 
             C 25 84, 35 58, 35 35 Z" 
          fill="url(#curl-highlight-grad)" />

    <!-- Crisp outer edge rim highlight -->
    <path d="M 100 20 C 98 58, 58 98, 20 100" 
          stroke="rgba(255,255,255,0.45)" stroke-width="0.8" fill="none" />
  </g>

  <!-- Red Push Pin at Top Center -->
  <g transform="translate(218, 12)">
    <defs>
      <radialGradient id="pin-head" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#ff7b7b" />
        <stop offset="35%" stop-color="#e01b24" />
        <stop offset="75%" stop-color="#990000" />
        <stop offset="100%" stop-color="#4a0000" />
      </radialGradient>
      <filter id="pin-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
        <feOffset dx="0" dy="3.5" />
        <feComponentTransfer><feFuncA type="linear" slope="0.45" /></feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <!-- Pin shadow on paper -->
    <ellipse cx="12" cy="24" rx="8" ry="4" fill="#000000" opacity="0.4" filter="blur(2px)" />
    <!-- Pin waist -->
    <path d="M 7 17 L 17 17 L 15 22 L 9 22 Z" fill="#990000" />
    <ellipse cx="12" cy="22" rx="4" ry="1.5" fill="#e01b24" />
    <!-- Pin head sphere -->
    <circle cx="12" cy="11" r="9" fill="url(#pin-head)" />
    <!-- Specular highlight on pin -->
    <ellipse cx="9.5" cy="8" rx="3" ry="2" fill="#ffffff" opacity="0.8" transform="rotate(-25 9.5 8)" />
  </g>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile('C:/Users/user/.gemini/antigravity-ide/brain/f0b6309f-7ea9-4be3-add9-1ff827544923/scratch/test_full_note_v2.png')
  .then(() => console.log('Generated test_full_note_v2.png'));
