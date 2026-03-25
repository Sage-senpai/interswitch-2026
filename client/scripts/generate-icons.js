/**
 * Generate Purse app icons — geometric dashed purse/handbag design.
 * Run: node scripts/generate-icons.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC = path.join(__dirname, '..', 'public');
const ASSETS = path.join(__dirname, '..', 'assets', 'images');

// ── The Purse Icon: geometric dashed handbag ─────────────────
function createPurseIcon(s) {
  // Scale factor for different sizes
  const f = s / 512;
  const sw = Math.max(1, Math.round(8 * f));       // stroke width
  const swThin = Math.max(1, Math.round(4 * f));
  const dash = `${Math.round(12 * f)},${Math.round(6 * f)}`;
  const dashFine = `${Math.round(8 * f)},${Math.round(5 * f)}`;
  const r = Math.round(s * 0.18);  // bg corner radius

  // Purse body proportions (centered)
  const cx = s / 2;
  const bodyW = s * 0.58;
  const bodyH = s * 0.42;
  const bodyX = cx - bodyW / 2;
  const bodyY = s * 0.42;
  const bodyR = s * 0.06;       // purse corner radius
  const flapY = bodyY - s * 0.02;

  // Handle proportions
  const handleW = s * 0.28;
  const handleH = s * 0.18;
  const handleX = cx - handleW / 2;
  const handleY = bodyY - handleH + s * 0.02;

  // Clasp
  const claspR = s * 0.035;
  const claspY = bodyY + s * 0.04;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${s}" y2="${s}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#9C27B0"/>
      <stop offset="50%" stop-color="#7E57C2"/>
      <stop offset="100%" stop-color="#4A148C"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#FFA000"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.25)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${s}" height="${s}" rx="${r}" fill="url(#bg)"/>

  <!-- Subtle geometric pattern in background -->
  <line x1="${s * 0.1}" y1="${s * 0.1}" x2="${s * 0.3}" y2="${s * 0.1}" stroke="rgba(255,255,255,0.06)" stroke-width="${swThin}" stroke-dasharray="${dashFine}"/>
  <line x1="${s * 0.7}" y1="${s * 0.9}" x2="${s * 0.9}" y2="${s * 0.9}" stroke="rgba(255,255,255,0.06)" stroke-width="${swThin}" stroke-dasharray="${dashFine}"/>
  <line x1="${s * 0.85}" y1="${s * 0.08}" x2="${s * 0.85}" y2="${s * 0.25}" stroke="rgba(255,255,255,0.04)" stroke-width="${swThin}" stroke-dasharray="${dashFine}"/>
  <line x1="${s * 0.15}" y1="${s * 0.75}" x2="${s * 0.15}" y2="${s * 0.92}" stroke="rgba(255,255,255,0.04)" stroke-width="${swThin}" stroke-dasharray="${dashFine}"/>

  <!-- Diamond accents -->
  <rect x="${s * 0.06}" y="${s * 0.06}" width="${s * 0.05}" height="${s * 0.05}" transform="rotate(45 ${s * 0.085} ${s * 0.085})" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="${Math.max(1, Math.round(2 * f))}"/>
  <rect x="${s * 0.89}" y="${s * 0.89}" width="${s * 0.05}" height="${s * 0.05}" transform="rotate(45 ${s * 0.915} ${s * 0.915})" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="${Math.max(1, Math.round(2 * f))}"/>

  <!-- ═══ PURSE HANDLE (dashed arch) ═══ -->
  <path
    d="M${handleX} ${handleY + handleH}
       Q${handleX} ${handleY} ${cx} ${handleY}
       Q${handleX + handleW} ${handleY} ${handleX + handleW} ${handleY + handleH}"
    fill="none"
    stroke="rgba(255,255,255,0.9)"
    stroke-width="${sw}"
    stroke-dasharray="${dash}"
    stroke-linecap="round"
  />

  <!-- ═══ PURSE BODY (dashed rectangle with rounded bottom) ═══ -->
  <path
    d="M${bodyX + bodyR} ${bodyY}
       L${bodyX + bodyW - bodyR} ${bodyY}
       Q${bodyX + bodyW} ${bodyY} ${bodyX + bodyW} ${bodyY + bodyR}
       L${bodyX + bodyW} ${bodyY + bodyH - bodyR}
       Q${bodyX + bodyW} ${bodyY + bodyH} ${bodyX + bodyW - bodyR} ${bodyY + bodyH}
       L${bodyX + bodyR} ${bodyY + bodyH}
       Q${bodyX} ${bodyY + bodyH} ${bodyX} ${bodyY + bodyH - bodyR}
       L${bodyX} ${bodyY + bodyR}
       Q${bodyX} ${bodyY} ${bodyX + bodyR} ${bodyY}
       Z"
    fill="rgba(255,255,255,0.08)"
    stroke="rgba(255,255,255,0.9)"
    stroke-width="${sw}"
    stroke-dasharray="${dash}"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <!-- Flap line (dashed) -->
  <path
    d="M${bodyX} ${flapY + bodyH * 0.28}
       Q${cx} ${flapY + bodyH * 0.18} ${bodyX + bodyW} ${flapY + bodyH * 0.28}"
    fill="none"
    stroke="rgba(255,255,255,0.5)"
    stroke-width="${swThin}"
    stroke-dasharray="${dashFine}"
    stroke-linecap="round"
  />

  <!-- Inner stitch line (dashed) -->
  <path
    d="M${bodyX + bodyW * 0.12} ${bodyY + bodyH * 0.42}
       L${bodyX + bodyW * 0.88} ${bodyY + bodyH * 0.42}"
    fill="none"
    stroke="rgba(255,255,255,0.25)"
    stroke-width="${Math.max(1, Math.round(2 * f))}"
    stroke-dasharray="${Math.round(4 * f)},${Math.round(4 * f)}"
    stroke-linecap="round"
  />

  <!-- ═══ CLASP (gold circle with dash ring) ═══ -->
  <circle cx="${cx}" cy="${claspY}" r="${claspR * 1.6}" fill="none" stroke="url(#gold)" stroke-width="${Math.max(1, Math.round(3 * f))}" stroke-dasharray="${Math.round(5 * f)},${Math.round(3 * f)}"/>
  <circle cx="${cx}" cy="${claspY}" r="${claspR}" fill="url(#gold)"/>

  <!-- Shine overlay on body -->
  <path
    d="M${bodyX + bodyR} ${bodyY}
       L${bodyX + bodyW * 0.4} ${bodyY}
       L${bodyX + bodyW * 0.25} ${bodyY + bodyH * 0.5}
       L${bodyX} ${bodyY + bodyH * 0.5}
       L${bodyX} ${bodyY + bodyR}
       Q${bodyX} ${bodyY} ${bodyX + bodyR} ${bodyY}
       Z"
    fill="url(#shine)"
  />

  <!-- Side stitching -->
  <line x1="${bodyX + bodyW * 0.08}" y1="${bodyY + bodyH * 0.15}" x2="${bodyX + bodyW * 0.08}" y2="${bodyY + bodyH * 0.85}" stroke="rgba(255,255,255,0.15)" stroke-width="${Math.max(1, Math.round(2 * f))}" stroke-dasharray="${Math.round(3 * f)},${Math.round(5 * f)}"/>
  <line x1="${bodyX + bodyW * 0.92}" y1="${bodyY + bodyH * 0.15}" x2="${bodyX + bodyW * 0.92}" y2="${bodyY + bodyH * 0.85}" stroke="rgba(255,255,255,0.15)" stroke-width="${Math.max(1, Math.round(2 * f))}" stroke-dasharray="${Math.round(3 * f)},${Math.round(5 * f)}"/>

</svg>`;
}

// ── OG Image ─────────────────────────────────────────────────
function createOGSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="ogbg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#9C27B0"/>
      <stop offset="50%" stop-color="#7E57C2"/>
      <stop offset="100%" stop-color="#4A148C"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#ogbg)"/>

  <!-- Geometric dashes background -->
  ${Array.from({ length: 15 }, (_, i) => {
    const y = 42 * i + 21;
    return `<line x1="0" y1="${y}" x2="1200" y2="${y}" stroke="rgba(255,255,255,0.03)" stroke-width="1" stroke-dasharray="12,18"/>`;
  }).join('\n  ')}
  ${Array.from({ length: 8 }, (_, i) => {
    const x = 150 * i + 75;
    return `<line x1="${x}" y1="0" x2="${x}" y2="630" stroke="rgba(255,255,255,0.02)" stroke-width="1" stroke-dasharray="8,14"/>`;
  }).join('\n  ')}

  <!-- Mini purse icon -->
  <g transform="translate(82, 180)">
    <rect width="100" height="100" rx="22" fill="rgba(255,255,255,0.1)"/>
    <!-- Mini purse inside -->
    <path d="M35 55 Q35 38 50 38 Q65 38 65 55" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="3" stroke-dasharray="6,3" stroke-linecap="round"/>
    <rect x="28" y="52" width="44" height="30" rx="5" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="3" stroke-dasharray="6,3" stroke-linecap="round"/>
    <circle cx="50" cy="56" r="3" fill="#FFD700"/>
  </g>

  <!-- Text -->
  <text x="210" y="230" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="64" fill="#FFFFFF" letter-spacing="-1">Purse</text>
  <text x="84" y="330" font-family="Arial,Helvetica,sans-serif" font-weight="600" font-size="28" fill="rgba(255,255,255,0.8)">AI-Powered Financial Literacy &amp; Empowerment</text>
  <text x="84" y="370" font-family="Arial,Helvetica,sans-serif" font-weight="600" font-size="28" fill="rgba(255,255,255,0.8)">for Nigerian Women</text>

  <!-- Badges -->
  <rect x="84" y="420" width="230" height="40" rx="20" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
  <circle cx="108" cy="440" r="4" fill="#FFD700"/>
  <text x="120" y="446" font-family="Arial,sans-serif" font-size="14" fill="rgba(255,255,255,0.8)" font-weight="600">Interswitch Powered</text>

  <rect x="332" y="420" width="230" height="40" rx="20" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
  <circle cx="356" cy="440" r="4" fill="#66BB6A"/>
  <text x="368" y="446" font-family="Arial,sans-serif" font-size="14" fill="rgba(255,255,255,0.8)" font-weight="600">Blockchain Verified</text>

  <!-- Bottom -->
  <rect x="0" y="588" width="1200" height="42" fill="rgba(0,0,0,0.2)"/>
  <text x="84" y="615" font-family="Arial,sans-serif" font-size="13" fill="rgba(255,255,255,0.45)">Enyata x Interswitch Buildathon 2026</text>
  <text x="980" y="615" font-family="Arial,sans-serif" font-size="13" fill="rgba(255,255,255,0.45)">purse-app-zeta.vercel.app</text>
</svg>`;
}

// ── Splash Screen ────────────────────────────────────────────
function createSplashSVG(w = 1284, h = 2778) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="splbg" x1="0" y1="0" x2="${w}" y2="${h}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#9C27B0"/>
      <stop offset="50%" stop-color="#7E57C2"/>
      <stop offset="100%" stop-color="#4A148C"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#splbg)"/>

  <!-- Geometric grid -->
  ${Array.from({ length: 20 }, (_, i) => `<line x1="0" y1="${139 * i}" x2="${w}" y2="${139 * i}" stroke="rgba(255,255,255,0.02)" stroke-width="1" stroke-dasharray="10,20"/>`).join('\n  ')}

  <!-- Purse icon (centered) -->
  <g transform="translate(${(w - 160) / 2}, ${h * 0.35})">
    <!-- Handle -->
    <path d="M45 70 Q45 25 80 25 Q115 25 115 70" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="6" stroke-dasharray="10,5" stroke-linecap="round"/>
    <!-- Body -->
    <rect x="20" y="65" width="120" height="85" rx="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.85)" stroke-width="6" stroke-dasharray="10,5" stroke-linecap="round"/>
    <!-- Flap -->
    <path d="M20 88 Q80 78 140 88" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-dasharray="6,4"/>
    <!-- Clasp -->
    <circle cx="80" cy="72" r="8" fill="#FFD700"/>
    <circle cx="80" cy="72" r="13" fill="none" stroke="#FFD700" stroke-width="2" stroke-dasharray="4,3"/>
  </g>

  <!-- Title -->
  <text x="${w / 2}" y="${h * 0.48}" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="80" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">Purse</text>
  <text x="${w / 2}" y="${h * 0.51}" font-family="Arial,sans-serif" font-weight="400" font-size="28" fill="rgba(255,255,255,0.6)" text-anchor="middle">Financial empowerment for Nigerian women</text>
</svg>`;
}

async function generate() {
  [PUBLIC, ASSETS, path.join(__dirname)].forEach(d => fs.mkdirSync(d, { recursive: true }));

  const sizes = [
    { name: 'favicon-16x16.png', size: 16, dir: PUBLIC },
    { name: 'favicon-32x32.png', size: 32, dir: PUBLIC },
    { name: 'apple-touch-icon.png', size: 180, dir: PUBLIC },
    { name: 'android-chrome-192x192.png', size: 192, dir: PUBLIC },
    { name: 'android-chrome-512x512.png', size: 512, dir: PUBLIC },
    { name: 'icon.png', size: 1024, dir: ASSETS },
    { name: 'adaptive-icon.png', size: 1024, dir: ASSETS },
    { name: 'favicon.png', size: 48, dir: ASSETS },
  ];

  for (const { name, size, dir } of sizes) {
    const svg = Buffer.from(createPurseIcon(size));
    await sharp(svg).png().toFile(path.join(dir, name));
    console.log(`  ${name} (${size}x${size})`);
  }

  // favicon.ico from 32px
  const ico = Buffer.from(createPurseIcon(32));
  await sharp(ico).png().toFile(path.join(PUBLIC, 'favicon.ico'));
  console.log('  favicon.ico');

  // OG image
  const og = Buffer.from(createOGSVG());
  await sharp(og).png().toFile(path.join(PUBLIC, 'og-image.png'));
  console.log('  og-image.png (1200x630)');

  // Splash
  const splash = Buffer.from(createSplashSVG());
  await sharp(splash).png().toFile(path.join(ASSETS, 'splash.png'));
  console.log('  splash.png (1284x2778)');

  console.log('\n  All icons generated!');
}

generate().catch(console.error);
