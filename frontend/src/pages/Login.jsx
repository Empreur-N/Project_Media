import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as loginApi, register as registerApi, socialLogin } from '../services/api';
import { loginWithGoogleOAuth, loginWithFacebookOAuth } from '../services/socialAuth';
import { Shield, Key, User as UserIcon, AlertCircle, ArrowRight, UserPlus, Mail, CheckCircle, FileText } from 'lucide-react';

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Register fields (Agents / Journalistes)
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('JOURNALIST');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Status
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Redirection selon le rôle après connexion
  const redirectByRole = (role) => {
    if (role === 'JOURNALIST') {
      navigate('/admin/journalist');
    } else if (role === 'EDITOR') {
      navigate('/admin/editor');
    } else if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'SUPERVISOR') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  // Soumission Connexion Classique
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await loginApi(username, password);
      login(data.token, {
        username: data.username,
        fullName: data.fullName || data.username,
        email: data.email,
        role: data.role
      });
      redirectByRole(data.role);
    } catch (err) {
      setError(err.message || 'Identifiants incorrects. Vérifiez votre saisie ou contactez la direction.');
    } finally {
      setLoading(false);
    }
  };

  // Soumission Inscription Agent / Journaliste
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regUsername || !regEmail || !regPassword) {
      setError('Tous les champs obligatoires doivent être renseignés.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerApi({
        username: regUsername.trim().toLowerCase().replaceAll(' ', '_'),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        role: regRole,
        fullName: regFullName.trim() || regUsername.trim()
      });

      setSuccess('Compte créé avec succès ! Initialisation de votre session...');

      if (res.token) {
        login(res.token, {
          username: res.username || regUsername,
          fullName: res.fullName || regFullName,
          email: res.email || regEmail,
          role: res.role || regRole
        });
        setTimeout(() => {
          redirectByRole(res.role || regRole);
        }, 800);
      } else {
        setTimeout(() => {
          setMode('login');
          setUsername(regUsername);
          setPassword(regPassword);
          setSuccess('Votre compte a été créé. Vous pouvez maintenant vous connecter.');
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte agent. Veuillez vérifier vos informations.');
    } finally {
      setLoading(false);
    }
  };

  // Connexion rapide Google / Facebook
  const handleSocialLogin = async (provider) => {
    setError('');
    setSuccess('');
    setSocialLoading(true);

    try {
      let socialProfile = null;
      if (provider === 'GOOGLE') {
        socialProfile = await loginWithGoogleOAuth();
      } else if (provider === 'FACEBOOK') {
        socialProfile = await loginWithFacebookOAuth();
      }

      if (socialProfile) {
        const res = await socialLogin({
          provider: socialProfile.provider,
          fullName: socialProfile.fullName,
          email: socialProfile.email,
          socialId: socialProfile.socialId
        });

        if (res && res.token) {
          login(res.token, {
            ...res,
            picture: socialProfile.picture
          });
          redirectByRole(res.role);
        }
      }
    } catch (err) {
      if (err.message === 'POPUP_CLOSED_BY_USER' || err.message?.includes('annulée')) {
        return;
      }
      console.error(`Erreur connexion ${provider}:`, err);
      setError(`Connexion ${provider} : ${err.message || "vérifiez l'autorisation dans votre compte"}`);
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div className="glass-card" style={styles.card}>
        
        {/* En-tête avec Logo officiel Life Channel (remplace l'icône du cadenas) */}
        <div style={styles.header}>
          <div style={styles.logoCircleContainer}>
            <img 
              src="/logo.png" 
              alt="Logo Life Channel" 
              style={styles.logoImage}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <span style={styles.preTitle}>PORTAIL OFFICIEL LIFE CHANNEL</span>
          <h2 style={styles.title}>
            {mode === 'login' ? 'Connexion Espace Rédaction' : 'Inscription Nouvel Agent'}
          </h2>
          <p style={styles.subtitle}>
            {mode === 'login' 
              ? 'Accès réservé aux journalistes, éditeurs, membres de la direction et lecteurs accrédités.'
              : 'Formulaire réservé aux journalistes, correspondants et éditeurs de LIFE CHANNEL.'}
          </p>
        </div>

        {/* Sélecteur d'onglets : Connexion / Inscription Agent */}
        <div style={styles.tabBar}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            style={{
              ...styles.tabBtn,
              ...(mode === 'login' ? styles.tabBtnActive : {})
            }}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            style={{
              ...styles.tabBtn,
              ...(mode === 'register' ? styles.tabBtnActive : {})
            }}
          >
            Inscription Agent
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Message de succès */}
        {success && (
          <div style={styles.successAlert}>
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Boutons de connexion rapide Google & Facebook */}
        <div style={{ marginBottom: '22px' }}>
          <div style={styles.socialButtonsContainer}>
            <button
              type="button"
              onClick={() => handleSocialLogin('GOOGLE')}
              disabled={socialLoading || loading}
              style={styles.googleBtn}
              title="Continuer rapidement avec votre compte Google"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continuer avec Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('FACEBOOK')}
              disabled={socialLoading || loading}
              style={styles.facebookBtn}
              title="Continuer rapidement avec votre compte Facebook"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continuer avec Facebook</span>
            </button>
          </div>

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>
              {mode === 'login' ? 'ou connexion classique' : 'ou formulaire avec vos informations'}
            </span>
            <span style={styles.dividerLine} />
          </div>
        </div>

        {/* Formulaire de Connexion */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label" style={styles.formLabel}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <UserIcon size={13} style={{ color: 'var(--primary)' }} /> Identifiant ou E-mail
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: direction1@lifechannelmedia.com ou patrick_m"
                disabled={loading || socialLoading}
                required
                style={styles.input}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '26px' }}>
              <label className="form-label" style={styles.formLabel}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={13} style={{ color: 'var(--primary)' }} /> Mot de passe
                </span>
              </label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={loading || socialLoading}
                required
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              className="btn-pill-lavande"
              style={styles.submitBtn}
              disabled={loading || socialLoading}
            >
              {loading ? (
                <span>Authentification en cours...</span>
              ) : (
                <>
                  <span>SE CONNECTER</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                style={styles.switchModeLink}
              >
                Vous faites partie de la rédaction ? Créer votre compte agent →
              </button>
            </div>
          </form>
        ) : (
          /* Formulaire d'Inscription Agent / Journaliste */
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={styles.formLabel}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <UserIcon size={13} style={{ color: 'var(--primary)' }} /> Nom complet ou Prénom *
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Ex: Patrick Mutombo, Dr. Alain..."
                disabled={loading || socialLoading}
                required
                style={styles.input}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={styles.formLabel}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <UserIcon size={13} style={{ color: 'var(--primary)' }} /> Identifiant public (@) *
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="Ex: patrick_m"
                disabled={loading || socialLoading}
                required
                style={styles.input}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={styles.formLabel}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={13} style={{ color: 'var(--primary)' }} /> Adresse e-mail professionnelle *
                </span>
              </label>
              <input
                type="email"
                className="form-input"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Ex: p.mutombo@lifechannelmedia.com"
                disabled={loading || socialLoading}
                required
                style={styles.input}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={styles.formLabel}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={13} style={{ color: 'var(--primary)' }} /> Rôle / Statut souhaité *
                </span>
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                disabled={loading || socialLoading}
                style={styles.select}
              >
                <option value="JOURNALIST">Journaliste / Reporter (Rédaction d'articles)</option>
                <option value="EDITOR">Éditeur / Secrétaire de Rédaction (Relecture & Validation)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={styles.formLabel}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={13} style={{ color: 'var(--primary)' }} /> Mot de passe *
                </span>
              </label>
              <input
                type="password"
                className="form-input"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="6 caractères minimum"
                disabled={loading || socialLoading}
                required
                style={styles.input}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={styles.formLabel}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={13} style={{ color: 'var(--primary)' }} /> Confirmer le mot de passe *
                </span>
              </label>
              <input
                type="password"
                className="form-input"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                placeholder="Répétez le mot de passe"
                disabled={loading || socialLoading}
                required
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              className="btn-pill-lavande"
              style={styles.submitBtn}
              disabled={loading || socialLoading}
            >
              {loading ? (
                <span>Création du compte en cours...</span>
              ) : (
                <>
                  <span>CRÉER MON COMPTE AGENT</span>
                  <UserPlus size={15} />
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                style={styles.switchModeLink}
              >
                Vous avez déjà un compte ? Se connecter ici →
              </button>
            </div>
          </form>
        )}

        {/* Mention légale de sécurité */}
        <div style={styles.securityNotice}>
          <Shield size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span>Plateforme officielle LIFE CHANNEL RDC. Accès réservé aux membres de la rédaction et aux lecteurs vérifiés.</span>
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
    padding: '48px 20px 80px',
    flex: 1,
    minHeight: '75vh',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    padding: '40px 34px',
    background: 'linear-gradient(180deg, rgba(28, 21, 18, 0.94) 0%, rgba(14, 10, 9, 0.98) 100%)',
    border: '1px solid rgba(192, 192, 192, 0.22)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 35px rgba(216, 180, 254, 0.08)',
    borderRadius: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoCircleContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(107, 79, 56, 0.45) 0%, rgba(216, 180, 254, 0.18) 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '14px',
    border: '1px solid rgba(216, 180, 254, 0.35)',
    boxShadow: '0 4px 18px rgba(0,0,0,0.4)',
    overflow: 'hidden',
    padding: '8px',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
  },
  preTitle: {
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.14em',
    color: 'var(--primary)',
    textTransform: 'uppercase',
    marginBottom: '6px',
  },
  title: {
    fontSize: '23px',
    fontFamily: 'var(--font-serif), Playfair Display, serif',
    fontWeight: '800',
    color: '#F5F3F0',
    margin: '0 0 6px',
    letterSpacing: '0.02em',
  },
  subtitle: {
    fontSize: '12.5px',
    color: 'var(--argente)',
    lineHeight: '1.45',
    margin: 0,
    maxWidth: '380px',
  },
  tabBar: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '4px',
    marginBottom: '20px',
    border: '1px solid rgba(192, 192, 192, 0.14)',
  },
  tabBtn: {
    flex: 1,
    padding: '10px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  tabBtnActive: {
    background: 'linear-gradient(135deg, rgba(107, 79, 56, 0.8) 0%, rgba(216, 180, 254, 0.35) 100%)',
    color: '#ffffff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
  },
  socialButtonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    background: '#ffffff',
    color: '#1f2937',
    fontWeight: '700',
    fontSize: '13.5px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  },
  facebookBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    background: '#1877F2',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '13.5px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 6px rgba(24, 119, 242, 0.3)',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '18px 0 6px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(192, 192, 192, 0.15)',
  },
  dividerText: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  formLabel: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.06em',
    color: 'var(--argente)',
    textTransform: 'uppercase',
    marginBottom: '6px',
  },
  input: {
    background: 'rgba(20, 15, 13, 0.9)',
    border: '1px solid rgba(192, 192, 192, 0.22)',
    color: '#F5F3F0',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '13.5px',
    width: '100%',
  },
  select: {
    background: 'rgba(20, 15, 13, 0.95)',
    border: '1px solid rgba(192, 192, 192, 0.22)',
    color: '#F5F3F0',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '13.5px',
    width: '100%',
    outline: 'none',
    cursor: 'pointer',
  },
  submitBtn: {
    width: '100%',
    padding: '13px 22px',
    fontSize: '12.5px',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  switchModeLink: {
    background: 'none',
    border: 'none',
    color: 'var(--secondary)',
    fontSize: '12px',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontWeight: '600',
    opacity: 0.9,
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    color: '#fca5a5',
    padding: '12px 14px',
    borderRadius: '12px',
    marginBottom: '18px',
    fontSize: '12.5px',
    lineHeight: '1.4',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    color: '#6ee7b7',
    padding: '12px 14px',
    borderRadius: '12px',
    marginBottom: '18px',
    fontSize: '12.5px',
    lineHeight: '1.4',
  },
  securityNotice: {
    marginTop: '26px',
    padding: '12px 14px',
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
