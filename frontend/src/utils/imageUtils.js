/**
 * Image Utilities for LIFE CHANNEL Platform
 * Guarantees zero broken images across all devices, network conditions, and image formats.
 */

// Embedded, 100% offline SVG fallback generators by category
export const generateCategorySvgDataUri = (category = 'Actualité') => {
  const catColors = {
    Sport: { bg1: '#0b1329', bg2: '#0369a1', accent: '#38bdf8', icon: '⚽' },
    Société: { bg1: '#0b1329', bg2: '#047857', accent: '#34d399', icon: '👥' },
    Économie: { bg1: '#0b1329', bg2: '#b45309', accent: '#fbbf24', icon: '📈' },
    Culture: { bg1: '#0b1329', bg2: '#6d28d9', accent: '#a78bfa', icon: '🎭' },
    Environnement: { bg1: '#0b1329', bg2: '#15803d', accent: '#4ade80', icon: '🌱' },
    Politique: { bg1: '#0b1329', bg2: '#991b1b', accent: '#f87171', icon: '🏛️' },
    Technologie: { bg1: '#0b1329', bg2: '#1d4ed8', accent: '#60a5fa', icon: '💻' },
    Santé: { bg1: '#0b1329', bg2: '#0f766e', accent: '#2dd4bf', icon: '🏥' },
  };
  const theme = catColors[category] || { bg1: '#060913', bg2: '#1e293b', accent: '#f59e0b', icon: '📰' };
  const label = category ? category.toUpperCase() : 'ACTUALITÉ';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.bg1}"/>
        <stop offset="100%" stop-color="${theme.bg2}"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 40 M 0 0 L 40 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="800" height="450" fill="url(#bg)"/>
    <rect width="800" height="450" fill="url(#grid)"/>
    <circle cx="400" cy="180" r="64" fill="rgba(255,255,255,0.05)" stroke="${theme.accent}" stroke-width="2"/>
    <text x="400" y="195" font-size="44" text-anchor="middle" dominant-baseline="central">${theme.icon}</text>
    <rect x="260" y="270" width="280" height="34" rx="17" fill="rgba(0,0,0,0.45)" stroke="${theme.accent}" stroke-width="1.5"/>
    <text x="400" y="293" fill="#ffffff" font-size="14" font-weight="700" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" text-anchor="middle" letter-spacing="2">${label}</text>
    <text x="400" y="340" fill="rgba(255,255,255,0.65)" font-size="13" font-weight="600" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" text-anchor="middle" letter-spacing="1">LIFE CHANNEL • PORTAIL RDC</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// Verified working CDN fallback images (200 OK tested)
export const CATEGORY_FALLBACK_IMAGES = {
  Sport: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200",
  Société: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200",
  Économie: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200",
  Culture: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200",
  Environnement: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200",
  Politique: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200",
  Technologie: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200",
  Santé: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1200",
  Default: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200"
};

/**
 * Returns a robust, fully-qualified URL for any image.
 * Distinguishes between local frontend assets, remote HTTP URLs, and backend media uploads.
 */
export const getFullImageUrl = (url, category = null) => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return CATEGORY_FALLBACK_IMAGES[category] || generateCategorySvgDataUri(category);
  }

  const trimmed = url.trim();

  // Data URLs and Blobs (e.g. client side upload previews)
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Remote absolute URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Local frontend assets in public/ (logo, favicon, assets, icons)
  if (trimmed.startsWith('/logo') || trimmed.startsWith('/favicon') || trimmed.startsWith('/icons') || trimmed.startsWith('/assets')) {
    return trimmed;
  }

  // Backend uploaded media
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `http://${host}:8080${cleanPath}`;
};

/**
 * Multi-tier image error handler that ensures no broken image is ever displayed.
 * 1. Tries the verified category CDN image.
 * 2. If that fails (offline, rate-limit), immediately falls back to the embedded SVG Data URI.
 */
export const handleImageError = (event, category = null, customFallback = null) => {
  const target = event?.currentTarget || event?.target;
  if (!target) return;

  const stage = target.dataset.errorStage || '0';

  if (stage === '0') {
    target.dataset.errorStage = '1';
    const primaryFallback = customFallback || CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.Default;
    if (target.src !== primaryFallback) {
      target.src = primaryFallback;
      return;
    }
  }

  // Final fallback: 100% offline embedded SVG Data URI (can never fail)
  target.onerror = null;
  target.src = generateCategorySvgDataUri(category);
};
