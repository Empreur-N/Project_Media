import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Lock } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div className="container footer-container" style={styles.container}>
        {/* Left Side: Logo & Description */}
        <div className="footer-section footer-left" style={styles.sectionLeft}>
          <div style={styles.logoContainer}>
            <img src="/logo.png" alt="Life Channel Logo" style={styles.logoImage} />
            <span style={styles.logoText}>LIFE <span style={{ color: 'var(--secondary)' }}>CHANNEL</span></span>
          </div>
          <p style={styles.description}>
            Le portail d'information multimédia de référence en République Démocratique du Congo.
          </p>
        </div>

        {/* Center: Social Networks & Reel */}
        <div className="footer-section footer-center" style={styles.sectionCenter}>
          <h4 style={styles.title}>Suivez-nous</h4>
          <div style={styles.socials}>
            {/* Custom SVG Facebook */}
            <a 
              href="https://www.facebook.com/LifechannelG" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.socialLink}
              title="Facebook"
            >
              <svg 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>

            {/* Custom SVG YouTube */}
            <a 
              href="https://youtube.com/@lifechannelsports?si=tpbzF58qwYXlaZl0" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.socialLink}
              title="YouTube"
            >
              <svg 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.95 1.96C5.12 19.5 12 19.5 12 19.5s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
              </svg>
            </a>

            {/* Custom SVG Instagram */}
            <a 
              href="https://www.instagram.com/life_channel243?igsi=OHNrZjFudXFobmFl" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.socialLink}
              title="Instagram"
            >
              <svg 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* Custom SVG TikTok */}
            <a 
              href="https://www.tiktok.com/@lifeuptv?_r=1&_t=ZS-99IzVDOX9O6" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.socialLink}
              title="TikTok"
            >
              <svg 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right Side: Copyright */}
        <div className="footer-section footer-right" style={styles.sectionRight}>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} <strong>LIFE CHANNEL</strong>.
          </p>
          <div style={styles.footerLinksRow}>
            <Link to="/settings" style={styles.footerHelpLink}>Réglages & Préférences</Link>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', opacity: 0.5 }}>•</span>
            <Link to="/faq" style={styles.footerHelpLink}>FAQ & Aide</Link>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', opacity: 0.5 }}>•</span>
            <Link to="/staff" style={styles.staffLink} title="Accès réservé à la rédaction et aux journalistes">
              <Lock size={11} /> Espace Rédaction
            </Link>
          </div>
          <p style={styles.subCopyright}>Diffusion multimédia continue • Standard Africanews</p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#0e0a09',
    background: 'linear-gradient(180deg, rgba(20, 15, 13, 0.95) 0%, rgba(11, 8, 7, 1) 100%)',
    borderTop: '1px solid rgba(192, 192, 192, 0.16)',
    padding: '48px 0 36px',
    marginTop: 'auto',
    width: '100%',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '30px',
  },
  sectionLeft: {
    flex: '1 1 300px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },
  logoImage: {
    height: '42px',
    width: 'auto',
    objectFit: 'contain',
    borderRadius: 0,
    border: 'none',
    filter: 'drop-shadow(0 2px 10px rgba(216, 180, 254, 0.25))',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '0.12em',
    fontFamily: 'var(--font-luxury), Playfair Display, serif',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    maxWidth: '320px',
  },
  sectionCenter: {
    flex: '1 1 250px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: '14px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '16px',
    color: 'var(--text-main)',
  },
  socials: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  socialLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'var(--primary)',
      color: 'white',
      borderColor: 'var(--primary)',
      transform: 'translateY(-2px)',
    }
  },
  reelLinkContainer: {
    marginTop: '6px',
  },
  reelLink: {
    fontSize: '12px',
    color: 'var(--secondary)',
    fontWeight: '600',
    textDecoration: 'underline',
    transition: 'color 0.2s',
    '&:hover': {
      color: 'var(--text-main)',
    }
  },
  sectionRight: {
    flex: '1 1 200px',
    textAlign: 'right',
  },
  copyright: {
    fontSize: '14px',
    color: 'var(--text-main)',
    marginBottom: '8px',
  },
  footerLinksRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10px',
    margin: '4px 0 10px',
    flexWrap: 'wrap',
  },
  footerHelpLink: {
    fontSize: '13px',
    color: 'var(--secondary)',
    textDecoration: 'none',
    fontWeight: '600',
  },
  staffLink: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'color 0.2s ease',
  },
  subCopyright: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  }
};

export default Footer;
