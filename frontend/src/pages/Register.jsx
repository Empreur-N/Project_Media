import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendOtp, registerWithOtp } from '../services/api';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Clock, 
  Send, 
  FileText, 
  Sparkles,
  KeyRound,
  RotateCcw
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  // Form states
  const [step, setStep] = useState(1); // 1: Email & Send OTP, 2: Verification & Details, 3: Success Pending / Complete
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('JOURNALIST'); // 'JOURNALIST' or 'USER'

  // UI status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Étape 1 : Demande du code OTP par e-mail
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Veuillez saisir une adresse e-mail valide.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await sendOtp(email);
      setSuccessMsg(res.message || 'Code de vérification expédié par e-mail !');
      setStep(2);
      setCountdown(60); // 60s cooldown
    } catch (err) {
      setError(err.message || "Échec d'envoi du code OTP. Veuillez vérifier votre adresse e-mail.");
    } finally {
      setLoading(false);
    }
  };

  // Étape 2 : Validation de l'OTP et création du compte
  const handleRegisterWithOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (otpCode.length !== 6) {
      setError('Le code OTP doit comporter exactement 6 chiffres.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        password,
        role,
        otpCode: otpCode.trim()
      };

      const res = await registerWithOtp(payload);

      if (res.active && res.token) {
        // Compte lecteur actif immédiatement
        authLogin({
          token: res.token,
          username: res.username,
          role: res.role
        });
        setSuccessMsg(res.message);
        setTimeout(() => navigate('/'), 2000);
      } else {
        // Compte journaliste / éditeur nécessitant l'approbation de la rédaction
        setIsPendingApproval(true);
        setStep(3);
      }
    } catch (err) {
      setError(err.message || "Échec de l'inscription. Vérifiez votre code OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div className="glass-card" style={styles.card}>
        
        {/* Header Branding */}
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <ShieldCheck size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={styles.title}>Portail d'Accréditation & Inscription</h2>
          <p style={styles.subtitle}>
            Plateforme Média Numérique Sécurisée &bull; <strong>LIFE CHANNEL</strong>
          </p>
        </div>

        {/* Messages d'alerte */}
        {error && (
          <div style={styles.alertError} className="animate-fade-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {successMsg && !isPendingApproval && (
          <div style={styles.alertSuccess} className="animate-fade-in">
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ÉTAPE 1 : Saisie de l'adresse e-mail */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} style={styles.form}>
            <div style={styles.infoBanner}>
              <Mail size={18} style={{ color: 'var(--secondary)' }} />
              <p style={{ margin: 0, fontSize: '13px' }}>
                Pour garantir l'authenticité de nos correspondants et contributeurs, l'inscription requiert la vérification préalable de votre e-mail par un <strong>code unique OTP</strong>.
              </p>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Adresse e-mail professionnelle ou personnelle *</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.inputIcon} />
                <input 
                  type="email"
                  required
                  placeholder="nom.prenom@media.cd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={styles.submitBtn}
              disabled={loading || !email}
            >
              {loading ? 'Génération du code...' : (
                <>
                  <span>Recevoir le code OTP par e-mail</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div style={styles.footerLinks}>
              <span>Déjà un compte accrédité ?</span>
              <Link to="/login" style={styles.link}>Se connecter</Link>
            </div>
          </form>
        )}

        {/* ÉTAPE 2 : Saisie du code OTP et des détails du compte */}
        {step === 2 && (
          <form onSubmit={handleRegisterWithOtp} style={styles.form}>
            <div style={styles.otpNotice}>
              <KeyRound size={20} style={{ color: 'var(--secondary)' }} />
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>Code envoyé à : {email}</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Vérifiez votre boîte de réception ou vos courriers indésirables (Spams). Valide 10 minutes.
                </p>
              </div>
            </div>

            {/* Code OTP */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Code de vérification OTP (6 chiffres) *</label>
              <input 
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                style={styles.otpInput}
                autoFocus
              />
              <div style={styles.resendRow}>
                {countdown > 0 ? (
                  <span style={styles.countdownText}>
                    <Clock size={13} style={{ marginRight: 4 }} />
                    Renvoyer un code dans {countdown}s
                  </span>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleSendOtp} 
                    style={styles.resendBtn}
                    disabled={loading}
                  >
                    <RotateCcw size={13} style={{ marginRight: 4 }} />
                    Renvoyer un nouveau code
                  </button>
                )}
              </div>
            </div>

            {/* Type de profil */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Statut d'inscription demandé *</label>
              <div style={styles.roleSelector}>
                <div 
                  style={{
                    ...styles.roleCard,
                    borderColor: role === 'JOURNALIST' ? 'var(--primary)' : 'var(--border-color)',
                    backgroundColor: role === 'JOURNALIST' ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
                  }}
                  onClick={() => setRole('JOURNALIST')}
                >
                  <FileText size={22} style={{ color: role === 'JOURNALIST' ? 'var(--primary)' : 'var(--text-secondary)' }} />
                  <div>
                    <div style={styles.roleTitle}>Journaliste / Correspondant</div>
                    <div style={styles.roleDesc}>Rédaction d'articles, reportages et propositions de sujets (Approbation requise).</div>
                  </div>
                </div>

                <div 
                  style={{
                    ...styles.roleCard,
                    borderColor: role === 'USER' ? 'var(--primary)' : 'var(--border-color)',
                    backgroundColor: role === 'USER' ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
                  }}
                  onClick={() => setRole('USER')}
                >
                  <User size={22} style={{ color: role === 'USER' ? 'var(--primary)' : 'var(--text-secondary)' }} />
                  <div>
                    <div style={styles.roleTitle}>Membre Lecteur & Auditeur</div>
                    <div style={styles.roleDesc}>Commentaires, alertes personnalisées et favoris (Accès immédiat).</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nom complet */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nom complet / Prénom et Nom *</label>
              <div style={styles.inputWrapper}>
                <User size={18} style={styles.inputIcon} />
                <input 
                  type="text"
                  required
                  placeholder="Ex: Patient Ligodi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Nom d'utilisateur */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nom d'utilisateur (Identifiant de connexion) *</label>
              <div style={styles.inputWrapper}>
                <User size={18} style={styles.inputIcon} />
                <input 
                  type="text"
                  required
                  placeholder="ex: pligodi"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Mots de passe */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Mot de passe *</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirmation *</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={styles.submitBtn}
              disabled={loading || otpCode.length !== 6 || !username || !password}
            >
              {loading ? 'Validation du compte...' : (
                <>
                  <CheckCircle size={18} />
                  <span>Confirmer et créer mon compte</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ÉTAPE 3 : Succès & Attente de validation (pour les journalistes) */}
        {step === 3 && isPendingApproval && (
          <div style={styles.pendingCard} className="animate-fade-in">
            <div style={styles.pendingBadge}>
              <Clock size={40} style={{ color: 'var(--secondary)' }} />
            </div>
            
            <h3 style={styles.pendingTitle}>Adresse e-mail certifiée avec succès !</h3>
            
            <div style={styles.pendingBox}>
              <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: 'var(--text-main)', fontWeight: '600' }}>
                Votre dossier d'accréditation Journaliste a été enregistré.
              </p>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                Conformément à la déontologie éditoriale de <strong>LIFE CHANNEL</strong>, chaque compte habilité à rédiger des articles fait l'objet d'une validation par le Rédacteur en Chef ou la Direction.
              </p>
            </div>

            <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                &bull; Identifiant : <strong>{username}</strong>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                &bull; E-mail vérifié : <strong>{email}</strong>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                &bull; Statut : <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>En attente d'approbation administrative</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/" className="btn btn-primary" style={{ padding: '10px 20px' }}>
                Retour à l'accueil
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '10px 20px' }}>
                Accès Connexion
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    minHeight: '80vh',
  },
  card: {
    maxWidth: '540px',
    width: '100%',
    padding: '36px 30px',
    borderRadius: '16px',
    background: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '26px',
  },
  iconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-main)',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 16px',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    borderRadius: '10px',
    color: 'var(--text-main)',
    marginBottom: '20px',
  },
  otpNotice: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 16px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-secondary)',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: 'var(--text-main)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  otpInput: {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: '2px dashed var(--secondary)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    color: 'var(--secondary)',
    fontSize: '24px',
    fontWeight: 'bold',
    letterSpacing: '8px',
    textAlign: 'center',
    outline: 'none',
  },
  resendRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '6px',
  },
  countdownText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
  },
  resendBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--secondary)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
  roleSelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  roleCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  roleTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '2px',
  },
  roleDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '700',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '6px',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    fontSize: '13px',
    marginBottom: '16px',
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#86efac',
    fontSize: '13px',
    marginBottom: '16px',
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '12px',
  },
  link: {
    color: 'var(--primary)',
    fontWeight: '600',
    textDecoration: 'none',
  },
  pendingCard: {
    textAlign: 'center',
    padding: '10px 0',
  },
  pendingBadge: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    border: '2px solid rgba(245, 158, 11, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  pendingTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-main)',
    marginBottom: '14px',
  },
  pendingBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '20px',
  }
};

export default Register;
