import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, Search, HelpCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div className="glass-card" style={styles.card}>
        <div style={styles.iconWrapper}>
          <AlertCircle size={48} style={{ color: 'var(--secondary)' }} />
        </div>
        
        <img src="/logo.png" alt="Life Channel Logo" style={styles.logo} />
        
        <h1 style={styles.title}>Erreur 404</h1>
        <h2 style={styles.subtitle}>Page Introuvable</h2>
        
        <p style={styles.description}>
          Désolé, la page que vous recherchez n'existe pas, a été déplacée ou est temporairement indisponible.
        </p>

        <div style={styles.divider} />

        <div style={styles.btnGroup}>
          <Link to="/" className="btn btn-primary" style={styles.btn}>
            <Home size={16} /> Accueil
          </Link>
          <Link to="/search" className="btn btn-secondary" style={styles.btn}>
            <Search size={16} /> Rechercher
          </Link>
          <Link to="/aide" className="btn btn-secondary" style={styles.btn}>
            <HelpCircle size={16} style={{ color: 'var(--secondary)' }} /> Centre d'aide
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    padding: '40px 24px',
    flex: 1,
  },
  card: {
    maxWidth: '500px',
    width: '100%',
    padding: '40px 30px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  iconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(245, 158, 11, 0.05)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
    border: '1px solid rgba(245, 158, 11, 0.15)',
  },
  logo: {
    height: '65px',
    width: 'auto',
    maxWidth: '200px',
    objectFit: 'contain',
    marginBottom: '20px',
    filter: 'drop-shadow(0 4px 14px rgba(245, 158, 11, 0.35))',
  },
  title: {
    fontSize: '32px',
    fontWeight: '900',
    color: 'var(--text-main)',
    margin: '0 0 4px',
    letterSpacing: '1px',
  },
  subtitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--secondary)',
    margin: '0 0 16px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  description: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  divider: {
    width: '100%',
    height: '1px',
    background: 'var(--border-color)',
    marginBottom: '30px',
  },
  btnGroup: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: '1 1 120px',
    justifyContent: 'center',
  }
};

export default NotFound;
