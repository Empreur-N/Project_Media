import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, Newspaper } from 'lucide-react';

const Register = () => {
  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div className="glass-card" style={styles.card}>
        <div style={styles.iconWrapper}>
          <ShieldCheck size={36} style={{ color: 'var(--secondary)' }} />
        </div>
        
        <h2 style={styles.title}>Consultation Libre & Inscription Fermée</h2>
        <p style={styles.badge}>STANDARD ÉDITORIAL TYPE AFRICANEWS</p>
        
        <div style={styles.contentBox}>
          <p style={styles.paragraph}>
            Conformément à la politique éditoriale et de sécurité de <strong>LIFE CHANNEL</strong>, l'accès à l'ensemble de nos reportages, flux radio 24/7, directs vidéo et podcasts est <strong>100% libre, gratuit et continu sans aucune obligation de créer un compte</strong>.
          </p>
          <p style={styles.paragraph}>
            Pour protéger l'intégrité de notre plateforme contre les tentatives d'intrusion et le spam, les formulaires d'inscription publique sont désactivés. Les comptes d'accès sont strictement réservés et attribués en interne aux journalistes, éditeurs et administrateurs accrédités.
          </p>
        </div>

        <div style={styles.actionButtons}>
          <Link to="/" className="btn btn-primary" style={styles.primaryBtn}>
            <Newspaper size={16} /> Retour aux actualités
          </Link>
          <Link to="/staff" className="btn btn-secondary" style={styles.secondaryBtn}>
            <Lock size={15} /> Espace Rédaction
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
    padding: '60px 24px',
    flex: 1,
    minHeight: '65vh',
  },
  card: {
    maxWidth: '560px',
    width: '100%',
    textAlign: 'center',
    padding: '40px 32px',
  },
  iconWrapper: {
    width: '68px',
    height: '68px',
    borderRadius: '50%',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    marginBottom: '8px',
    color: 'var(--text-main)',
  },
  badge: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '1px',
    color: 'var(--secondary)',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: '4px 10px',
    borderRadius: '20px',
    marginBottom: '24px',
  },
  contentBox: {
    textAlign: 'left',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '28px',
  },
  paragraph: {
    fontSize: '14px',
    lineHeight: '1.65',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
  },
  actionButtons: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    padding: '12px 24px',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  secondaryBtn: {
    padding: '12px 20px',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  }
};

export default Register;
