/**
 * Universal URL resolver for LIFE CHANNEL
 * Seamlessly handles Development (Vite on :5173 + Gateway on :8080)
 * and Production (Nginx on :80/:443 with reverse proxy, direct IP, or custom domain).
 */

export const getBaseServerUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:8080';
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }

  // En production (port standard 80, 443 ou vide) -> Nginx gère le reverse-proxy vers la gateway
  if (!window.location.port || window.location.port === '80' || window.location.port === '443') {
    return window.location.origin;
  }

  // En développement local (ex: Vite sur :5173) -> pointer vers le port 8080
  return `${window.location.protocol}//${window.location.hostname}:8080`;
};

export const getApiUrl = () => {
  return `${getBaseServerUrl()}/api`;
};

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBaseServerUrl()}${cleanPath}`;
};
