import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as loginApi } from '../services/api';
import { Shield, Key, User as UserIcon, AlertCircle, Lock } from 'lucide-react';

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
      setError('Veuillez remplir tous les champs');
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
      setError(err.message || 'Identifiants ou privilèges incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div className="glass-card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <Lock size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={styles.title}>Portail Rédaction & Administration</h2>
          <p style={styles.subtitle}>Accès sécurisé réservé aux journalistes, éditeurs et administrateurs accrédités</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <UserIcon size={14} /> Identifiant Agent
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Votre nom d'utilisateur"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Key size={14} /> Mot de passe sécurisé
              </span>
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: '700' }}
            disabled={loading}
          >
            {loading ? 'Authentification...' : 'Connexion Espace Rédaction'}
          </button>
        </form>

        <div style={styles.securityNotice}>
          <Shield size={14} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
          <span>Plateforme interne LIFE CHANNEL. Tout accès non autorisé est prohibé. Les comptes sont attribués exclusivement par la direction de publication.</span>
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
    padding: '40px 24px',
    flex: 1,
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    padding: '40px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconContainer: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'rgba(0, 124, 255, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '15px',
    border: '1px solid var(--border-color)',
  },
  title: {
    fontSize: '24px',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: 'var(--error)',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  securityNotice: {
    marginTop: '32px',
    padding: '14px 16px',
    background: 'rgba(245, 158, 11, 0.05)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    borderRadius: '10px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  }
};

export default Login;
