const sharp = require("sharp");
const path = require("path");

const ASSETS = path.join(__dirname, "..", "assets");

// Lumina logo: soft gradient circle with sparkle/dewdrop
async function generateIcon(size, filename, options = {}) {
  const { padding = 0.2, isAndroidForeground = false } = options;
  const innerSize = Math.round(size * (1 - padding * 2));
  const offset = Math.round(size * padding);

  // Main circle radius
  const r = Math.round(innerSize * 0.42);
  const cx = Math.round(size / 2);
  const cy = Math.round(size / 2);

  // Sparkle/dewdrop paths - centered
  const sparkleSize = r * 0.5;
  const sx = cx;
  const sy = cy - r * 0.05;

  const svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Main gradient -->
    <radialGradient id="bg" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FFF5EE"/>
      <stop offset="50%" stop-color="#F4E1D2"/>
      <stop offset="100%" stop-color="#E8C9B8"/>
    </radialGradient>
    <!-- Inner glow -->
    <radialGradient id="glow" cx="45%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <!-- Sparkle gradient -->
    <linearGradient id="sparkle" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2D2D2D"/>
      <stop offset="100%" stop-color="#4A4A4A"/>
    </linearGradient>
  </defs>

  ${!isAndroidForeground ? `
  <!-- Background rounded square -->
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#bg)"/>
  ` : ""}

  <!-- Main circle -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#bg)" ${isAndroidForeground ? '' : 'opacity="0"'}/>

  <!-- Inner glow -->
  <circle cx="${cx}" cy="${cy}" r="${r * 0.9}" fill="url(#glow)"/>

  <!-- Sparkle/Star icon -->
  <!-- Main 4-point star -->
  <path d="
    M ${sx} ${sy - sparkleSize}
    C ${sx + sparkleSize * 0.15} ${sy - sparkleSize * 0.15} ${sx + sparkleSize * 0.15} ${sy - sparkleSize * 0.15} ${sx + sparkleSize} ${sy}
    C ${sx + sparkleSize * 0.15} ${sy + sparkleSize * 0.15} ${sx + sparkleSize * 0.15} ${sy + sparkleSize * 0.15} ${sx} ${sy + sparkleSize}
    C ${sx - sparkleSize * 0.15} ${sy + sparkleSize * 0.15} ${sx - sparkleSize * 0.15} ${sy + sparkleSize * 0.15} ${sx - sparkleSize} ${sy}
    C ${sx - sparkleSize * 0.15} ${sy - sparkleSize * 0.15} ${sx - sparkleSize * 0.15} ${sy - sparkleSize * 0.15} ${sx} ${sy - sparkleSize}
    Z
  " fill="url(#sparkle)"/>

  <!-- Small accent sparkle -->
  <path d="
    M ${sx + r * 0.45} ${sy - r * 0.55}
    C ${sx + r * 0.48} ${sy - r * 0.48} ${sx + r * 0.48} ${sy - r * 0.48} ${sx + r * 0.58} ${sy - r * 0.45}
    C ${sx + r * 0.48} ${sy - r * 0.42} ${sx + r * 0.48} ${sy - r * 0.42} ${sx + r * 0.45} ${sy - r * 0.35}
    C ${sx + r * 0.42} ${sy - r * 0.42} ${sx + r * 0.42} ${sy - r * 0.42} ${sx + r * 0.32} ${sy - r * 0.45}
    C ${sx + r * 0.42} ${sy - r * 0.48} ${sx + r * 0.42} ${sy - r * 0.48} ${sx + r * 0.45} ${sy - r * 0.55}
    Z
  " fill="#2D2D2D" opacity="0.6"/>

  <!-- Tiny dot sparkle -->
  <circle cx="${sx - r * 0.35}" cy="${sy + r * 0.5}" r="${r * 0.04}" fill="#2D2D2D" opacity="0.4"/>
  <circle cx="${sx + r * 0.55}" cy="${sy + r * 0.3}" r="${r * 0.03}" fill="#2D2D2D" opacity="0.3"/>

  <!-- "L" letterform hint (subtle) -->
  <text x="${cx}" y="${cy + r * 0.75}" text-anchor="middle" font-family="Georgia, serif" font-size="${r * 0.35}" fill="#2D2D2D" opacity="0.7" font-weight="bold">LUMINA</text>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(ASSETS, filename));
  console.log(`Generated: ${filename} (${size}x${size})`);
}

async function generateSplashIcon(size, filename) {
  const cx = size / 2;
  const cy = size / 2;
  const sparkleSize = size * 0.18;
  const sx = cx;
  const sy = cy;

  const svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sparkle" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2D2D2D"/>
      <stop offset="100%" stop-color="#4A4A4A"/>
    </linearGradient>
  </defs>
  <!-- Sparkle -->
  <path d="
    M ${sx} ${sy - sparkleSize}
    C ${sx + sparkleSize * 0.15} ${sy - sparkleSize * 0.15} ${sx + sparkleSize * 0.15} ${sy - sparkleSize * 0.15} ${sx + sparkleSize} ${sy}
    C ${sx + sparkleSize * 0.15} ${sy + sparkleSize * 0.15} ${sx + sparkleSize * 0.15} ${sy + sparkleSize * 0.15} ${sx} ${sy + sparkleSize}
    C ${sx - sparkleSize * 0.15} ${sy + sparkleSize * 0.15} ${sx - sparkleSize * 0.15} ${sy + sparkleSize * 0.15} ${sx - sparkleSize} ${sy}
    C ${sx - sparkleSize * 0.15} ${sy - sparkleSize * 0.15} ${sx - sparkleSize * 0.15} ${sy - sparkleSize * 0.15} ${sx} ${sy - sparkleSize}
    Z
  " fill="url(#sparkle)"/>
  <!-- Small accent -->
  <path d="
    M ${sx + sparkleSize * 0.9} ${sy - sparkleSize * 1.1}
    C ${sx + sparkleSize * 0.95} ${sy - sparkleSize * 0.95} ${sx + sparkleSize * 0.95} ${sy - sparkleSize * 0.95} ${sx + sparkleSize * 1.15} ${sy - sparkleSize * 0.9}
    C ${sx + sparkleSize * 0.95} ${sy - sparkleSize * 0.85} ${sx + sparkleSize * 0.95} ${sy - sparkleSize * 0.85} ${sx + sparkleSize * 0.9} ${sy - sparkleSize * 0.7}
    C ${sx + sparkleSize * 0.85} ${sy - sparkleSize * 0.85} ${sx + sparkleSize * 0.85} ${sy - sparkleSize * 0.85} ${sx + sparkleSize * 0.65} ${sy - sparkleSize * 0.9}
    C ${sx + sparkleSize * 0.85} ${sy - sparkleSize * 0.95} ${sx + sparkleSize * 0.85} ${sy - sparkleSize * 0.95} ${sx + sparkleSize * 0.9} ${sy - sparkleSize * 1.1}
    Z
  " fill="#2D2D2D" opacity="0.6"/>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(ASSETS, filename));
  console.log(`Generated: ${filename} (${size}x${size})`);
}

async function generateAndroidBackground(size, filename) {
  const svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FFF5EE"/>
      <stop offset="50%" stop-color="#F4E1D2"/>
      <stop offset="100%" stop-color="#E8C9B8"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(ASSETS, filename));
  console.log(`Generated: ${filename} (${size}x${size})`);
}

async function main() {
  // App icon (iOS) - 1024x1024
  await generateIcon(1024, "icon.png");

  // Splash icon
  await generateSplashIcon(200, "splash-icon.png");

  // Android adaptive icon
  await generateIcon(1024, "android-icon-foreground.png", { isAndroidForeground: true, padding: 0.3 });
  await generateAndroidBackground(1024, "android-icon-background.png");
  await generateIcon(1024, "android-icon-monochrome.png", { padding: 0.3 });

  // Favicon
  await generateIcon(48, "favicon.png", { padding: 0.1 });

  console.log("\nAll icons generated successfully!");
}

main().catch(console.error);
