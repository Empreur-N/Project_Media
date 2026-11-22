import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Camera, Upload, Check, User, Sparkles } from 'lucide-react';

const AgentProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  const [fullName, setFullName] = useState(user?.fullName || user?.username || '');
  const [pictureUrl, setPictureUrl] = useState(user?.picture || '');
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen || !user) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("L'image est trop volumineuse (maximum 5 Mo).");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target.result;
      setPictureUrl(result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateUser({
      fullName: fullName.trim() || user.username,
      picture: pictureUrl.trim()
    });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div style={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div 
        style={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        className="glass-card animate-fade-in"
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.iconCircle}>
              <User size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 style={styles.title}>{t('agentProfile')}</h2>
              <p style={styles.subtitle}>Personnalisez votre identité éditoriale et photo d'agent</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Avatar Preview */}
          <div style={styles.avatarSection}>
            <div style={styles.avatarWrapper}>
              {pictureUrl ? (
                <img
                  src={pictureUrl}
                  alt={fullName || user.username}
                  style={styles.avatarImg}
                  onError={() => setPictureUrl('')}
                />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  {(fullName || user.username).slice(0, 2).toUpperCase()}
                </div>
              )}
              <label htmlFor="agent-photo-input" style={styles.uploadBadge} title="Changer la photo">
                <Camera size={14} />
              </label>
              <input
                id="agent-photo-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <div style={styles.userName}>{fullName || user.username}</div>
              <div style={styles.userRoleBadge}>{user.role} • LIFE CHANNEL</div>
            </div>
          </div>

          {/* Form fields */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Nom complet / Signature éditoriale</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Jean-Luc Kalala"
              style={styles.input}
              className="form-control"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Importer une photo depuis l'appareil</label>
            <label htmlFor="agent-photo-file-btn" style={styles.fileBtn} className="btn btn-secondary">
              <Upload size={14} />
              <span>{isUploading ? 'Chargement...' : 'Choisir une image (JPG, PNG)...'}</span>
            </label>
            <input
              id="agent-photo-file-btn"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Ou coller une URL d'image directe</label>
            <input
              type="url"
              value={pictureUrl.startsWith('data:') ? '' : pictureUrl}
              onChange={(e) => setPictureUrl(e.target.value)}
              placeholder="https://mon-domaine.com/photo.jpg"
              style={styles.input}
              className="form-control"
            />
          </div>

          {success && (
            <div style={styles.successAlert}>
              <Check size={16} />
              <span>{t('photoSuccess')}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={onClose} className="btn btn-secondary" style={styles.cancelBtn}>
            Annuler
          </button>
          <button onClick={handleSave} className="btn btn-primary" style={styles.saveBtn}>
            <Sparkles size={14} />
            <span>{t('saveProfile')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
    padding: '16px',
    boxSizing: 'border-box',
  },
  modal: {
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    background: 'linear-gradient(180deg, var(--bg-surface, #140F0D) 0%, var(--bg-main, #0B0807) 100%)',
    border: '1px solid var(--border-color, rgba(192, 192, 192, 0.2))',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(216, 180, 254, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
    borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  iconCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(216, 180, 254, 0.15)',
    border: '1px solid rgba(216, 180, 254, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-main, #F5F3F0)',
    letterSpacing: '0.02em',
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '11px',
    color: 'var(--text-muted, #8E8A85)',
    margin: '3px 0 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted, #8E8A85)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: '20px 24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 0 8px',
  },
  avatarWrapper: {
    position: 'relative',
    width: '84px',
    height: '84px',
    borderRadius: '50%',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4), 0 0 18px rgba(216, 180, 254, 0.25)',
    border: '2px solid rgba(216, 180, 254, 0.5)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6B4F38 0%, #D8B4FE 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '800',
  },
  uploadBadge: {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: '#171311',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
    border: '2px solid var(--bg-surface, #140F0D)',
  },
  userName: {
    fontSize: '15px',
    fontWeight: '800',
    color: 'var(--text-main, #F5F3F0)',
  },
  userRoleBadge: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--primary, #D8B4FE)',
    letterSpacing: '0.06em',
    marginTop: '3px',
    textTransform: 'uppercase',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11.5px',
    fontWeight: '700',
    color: 'var(--text-secondary, #C0C0C0)',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '13px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    boxSizing: 'border-box',
  },
  fileBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 14px',
    fontSize: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px dashed var(--border-color)',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    color: '#10b981',
    fontSize: '12px',
    fontWeight: '700',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '16px 24px',
    borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  cancelBtn: {
    padding: '8px 16px',
    fontSize: '12px',
    borderRadius: '9999px',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 20px',
    fontSize: '12px',
    fontWeight: '800',
    borderRadius: '9999px',
  }
};

export default AgentProfileModal;
