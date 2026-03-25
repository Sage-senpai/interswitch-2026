/**
 * Generate all icon/favicon files for Purse web app.
 * Uses sharp to create SVG-based icons at all required sizes.
 *
 * Run: node scripts/generate-icons.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC = path.join(__dirname, '..', 'public');
const ASSETS = path.join(__dirname, '..', 'assets', 'images');

// Purse brand colors
const PRIMARY_DARK = '#7E57C2'; // Deep purple (dark theme primary)
const PRIMARY_LIGHT = '#EC407A'; // Pink (light theme primary)
const GOLD = '#FFD700';
const BG_DARK = '#0A0A0F';
const BG_LIGHT = '#FFF8FA';

// ── SVG Icon: Wallet with "P" monogram ──────────────────────
function createIconSVG(size, bg = BG_DARK, accent = PRIMARY_DARK, gold = GOLD) {
  const s = size;
  const pad = Math.round(s * 0.15);
  const r = Math.round(s * 0.22); // corner radius
  const walletW = s - pad * 2;
  const walletH = Math.round(walletW * 0.72);
  const walletX = pad;
  const walletY = Math.round((s - walletH) / 2) + Math.round(s * 0.02);
  const flapH = Math.round(walletH * 0.32);
  const clasp = Math.round(s * 0.08);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${bg === BG_DARK ? '#4A148C' : '#AD1457'};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="wallet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.95" />
      <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:0.85" />
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${s}" height="${s}" rx="${r}" fill="url(#bg)" />
  <!-- Decorative circle -->
  <circle cx="${s * 0.82}" cy="${s * 0.18}" r="${s * 0.2}" fill="rgba(255,255,255,0.08)" />
  <circle cx="${s * 0.15}" cy="${s * 0.85}" r="${s * 0.12}" fill="rgba(255,255,255,0.05)" />
  <!-- Wallet body -->
  <rect x="${walletX}" y="${walletY}" width="${walletW}" height="${walletH}" rx="${Math.round(r * 0.5)}" fill="url(#wallet)" />
  <!-- Wallet flap -->
  <path d="M${walletX} ${walletY + flapH} Q${walletX} ${walletY} ${walletX + Math.round(r * 0.5)} ${walletY} L${walletX + walletW - Math.round(r * 0.5)} ${walletY} Q${walletX + walletW} ${walletY} ${walletX + walletW} ${walletY + flapH}" fill="rgba(255,255,255,0.3)" />
  <!-- Clasp -->
  <circle cx="${walletX + walletW - Math.round(s * 0.12)}" cy="${walletY + Math.round(walletH * 0.52)}" r="${clasp}" fill="${gold}" />
  <!-- P letter -->
  <text x="${s * 0.38}" y="${walletY + walletH * 0.75}" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="${Math.round(walletH * 0.55)}" fill="${accent}" opacity="0.6">P</text>
</svg>`;
}

// ── SVG for OG image (1200x630) ─────────────────────────────
function createOGSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="ogbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7E57C2" />
      <stop offset="100%" style="stop-color:#4A148C" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#ogbg)" />
  <!-- Pattern dots -->
  ${Array.from({ length: 30 }, (_, i) => {
    const x = (i % 10) * 120 + 60;
    const y = Math.floor(i / 10) * 210 + 105;
    return `<circle cx="${x}" cy="${y}" r="3" fill="rgba(255,255,255,0.08)" />`;
  }).join('\n  ')}
  <!-- Decorative circles -->
  <circle cx="1050" cy="100" r="180" fill="rgba(255,255,255,0.05)" />
  <circle cx="150" cy="530" r="120" fill="rgba(255,255,255,0.04)" />
  <!-- Logo icon -->
  <rect x="80" y="200" width="90" height="90" rx="20" fill="rgba(255,255,255,0.15)" />
  <text x="104" y="264" font-family="Arial,sans-serif" font-weight="800" font-size="48" fill="#FFFFFF">P</text>
  <!-- Text -->
  <text x="200" y="252" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="60" fill="#FFFFFF">Purse</text>
  <text x="82" y="340" font-family="Arial,Helvetica,sans-serif" font-weight="600" font-size="28" fill="rgba(255,255,255,0.8)">AI-Powered Financial Literacy &amp; Empowerment</text>
  <text x="82" y="380" font-family="Arial,Helvetica,sans-serif" font-weight="600" font-size="28" fill="rgba(255,255,255,0.8)">for Nigerian Women</text>
  <!-- Badges -->
  <rect x="82" y="430" width="220" height="36" rx="18" fill="rgba(255,255,255,0.12)" />
  <text x="112" y="454" font-family="Arial,sans-serif" font-size="14" fill="rgba(255,255,255,0.8)" font-weight="600">Interswitch Powered</text>
  <rect x="320" y="430" width="220" height="36" rx="18" fill="rgba(255,255,255,0.12)" />
  <text x="350" y="454" font-family="Arial,sans-serif" font-size="14" fill="rgba(255,255,255,0.8)" font-weight="600">Blockchain Verified</text>
  <!-- Bottom bar -->
  <rect x="0" y="590" width="1200" height="40" fill="rgba(0,0,0,0.2)" />
  <text x="82" y="616" font-family="Arial,sans-serif" font-size="13" fill="rgba(255,255,255,0.5)">Enyata x Interswitch Buildathon 2026</text>
  <text x="1000" y="616" font-family="Arial,sans-serif" font-size="13" fill="rgba(255,255,255,0.5)">purse-app.vercel.app</text>
</svg>`;
}

// ── Splash SVG (portrait) ───────────────────────────────────
function createSplashSVG(w = 1284, h = 2778) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="splbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7E57C2" />
      <stop offset="100%" style="stop-color:#4A148C" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#splbg)" />
  <circle cx="${w * 0.8}" cy="${h * 0.15}" r="300" fill="rgba(255,255,255,0.04)" />
  <circle cx="${w * 0.2}" cy="${h * 0.85}" r="200" fill="rgba(255,255,255,0.03)" />
  <!-- Icon -->
  <rect x="${(w - 120) / 2}" y="${h * 0.38}" width="120" height="120" rx="30" fill="rgba(255,255,255,0.15)" />
  <text x="${w / 2}" y="${h * 0.38 + 85}" font-family="Arial,sans-serif" font-weight="800" font-size="64" fill="#FFFFFF" text-anchor="middle">P</text>
  <!-- Title -->
  <text x="${w / 2}" y="${h * 0.48}" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="72" fill="#FFFFFF" text-anchor="middle">Purse</text>
  <text x="${w / 2}" y="${h * 0.51}" font-family="Arial,sans-serif" font-weight="400" font-size="26" fill="rgba(255,255,255,0.65)" text-anchor="middle">Financial empowerment for Nigerian women</text>
</svg>`;
}

async function generate() {
  // Ensure directories exist
  [PUBLIC, ASSETS].forEach(d => fs.mkdirSync(d, { recursive: true }));

  const sizes = [
    // public/ web icons
    { name: 'favicon-16x16.png', size: 16, dir: PUBLIC },
    { name: 'favicon-32x32.png', size: 32, dir: PUBLIC },
    { name: 'apple-touch-icon.png', size: 180, dir: PUBLIC },
    { name: 'android-chrome-192x192.png', size: 192, dir: PUBLIC },
    { name: 'android-chrome-512x512.png', size: 512, dir: PUBLIC },
    // assets/ for app.json
    { name: 'icon.png', size: 1024, dir: ASSETS },
    { name: 'adaptive-icon.png', size: 1024, dir: ASSETS },
    { name: 'favicon.png', size: 48, dir: ASSETS },
  ];

  for (const { name, size, dir } of sizes) {
    const svg = Buffer.from(createIconSVG(size));
    await sharp(svg).png().toFile(path.join(dir, name));
    console.log(`  Created ${name} (${size}x${size})`);
  }

  // favicon.ico (use 32x32 PNG as ICO — browsers accept PNG favicons)
  const ico32 = Buffer.from(createIconSVG(32));
  await sharp(ico32).png().toFile(path.join(PUBLIC, 'favicon.ico'));
  console.log('  Created favicon.ico');

  // OG image
  const ogSvg = Buffer.from(createOGSVG());
  await sharp(ogSvg).png().toFile(path.join(PUBLIC, 'og-image.png'));
  console.log('  Created og-image.png (1200x630)');

  // Splash screen
  const splashSvg = Buffer.from(createSplashSVG());
  await sharp(splashSvg).png().toFile(path.join(ASSETS, 'splash.png'));
  console.log('  Created splash.png (1284x2778)');

  console.log('\nAll icons generated successfully!');
}

generate().catch(console.error);
