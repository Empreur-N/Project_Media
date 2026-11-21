import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as loginApi } from '../services/api';
import { Shield, Key, User as UserIcon, AlertCircle, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await loginApi(username, password);
      login(data.token, {
        username: data.username,
        email: data.email,
        role: data.role
      });
      
      // Redirection dynamique selon le rôle métier de l'agent
      if (data.role === 'JOURNALIST') {
        navigate('/admin/journalist');
      } else if (data.role === 'EDITOR') {
        navigate('/admin/editor');
      } else if (data.role === 'ADMIN' || data.role === 'SUPER_ADMIN' || data.role === 'SUPERVISOR') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Identifiants ou privilèges incorrects. Vérifiez votre saisie ou contactez la direction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div className="glass-card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <Lock size={22} style={{ color: 'var(--primary)' }} />
          </div>
          <span style={styles.preTitle}>ESPACE RESTREINT ACCRÉDITÉ</span>
          <h2 style={styles.title}>Portail Rédaction & Direction</h2>
          <p style={styles.subtitle}>
            Accès sécurisé réservé aux journalistes, éditeurs et membres de la direction générale.
          </p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={styles.formLabel}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <UserIcon size={13} style={{ color: 'var(--primary)' }} /> Identifiant ou E-mail accrédité
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="directeur1 ou direction1@lifechannelmedia.com"
              disabled={loading}
              required
              style={styles.input}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label" style={styles.formLabel}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Key size={13} style={{ color: 'var(--primary)' }} /> Mot de passe sécurisé
              </span>
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            className="btn-pill-lavande"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <span>Authentification en cours...</span>
            ) : (
              <>
                <span>CONNEXION ESPACE SÉCURISÉ</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div style={styles.securityNotice}>
          <Shield size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span>Plateforme officielle LIFE CHANNEL RDC. Tout accès non autorisé est strictement prohibé. Les accès sont délivrés sous l'autorité exclusive de la direction.</span>
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
    padding: '60px 24px 80px',
    flex: 1,
    minHeight: '75vh',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    padding: '44px 38px',
    background: 'linear-gradient(180deg, rgba(28, 21, 18, 0.92) 0%, rgba(14, 10, 9, 0.98) 100%)',
    border: '1px solid rgba(192, 192, 192, 0.22)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 35px rgba(216, 180, 254, 0.08)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconContainer: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(107, 79, 56, 0.4) 0%, rgba(216, 180, 254, 0.15) 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16px',
    border: '1px solid rgba(216, 180, 254, 0.35)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
  },
  preTitle: {
    fontSize: '10.5px',
    fontWeight: '800',
    letterSpacing: '0.14em',
    color: 'var(--primary)',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  title: {
    fontSize: '25px',
    fontFamily: 'var(--font-serif), Playfair Display, serif',
    fontWeight: '800',
    color: '#F5F3F0',
    margin: '0 0 8px',
    letterSpacing: '0.02em',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--argente)',
    lineHeight: '1.5',
    margin: 0,
  },
  formLabel: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    color: 'var(--argente)',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  input: {
    background: 'rgba(20, 15, 13, 0.9)',
    border: '1px solid rgba(192, 192, 192, 0.22)',
    color: '#F5F3F0',
    borderRadius: '12px',
    padding: '14px 18px',
    fontSize: '14px',
  },
  submitBtn: {
    width: '100%',
    padding: '14px 24px',
    fontSize: '12.5px',
    marginTop: '6px',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    color: '#fca5a5',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '22px',
    fontSize: '13px',
    lineHeight: '1.4',
  },
  securityNotice: {
    marginTop: '32px',
    padding: '14px 16px',
    background: 'rgba(107, 79, 56, 0.16)',
    border: '1px solid rgba(192, 192, 192, 0.18)',
    borderRadius: '12px',
    fontSize: '11px',
    color: 'var(--argente)',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    lineHeight: '1.5',
  },
};

export default Login;
