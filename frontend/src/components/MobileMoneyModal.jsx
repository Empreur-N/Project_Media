import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Smartphone, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { initiateAdPayment, confirmAdPayment } from '../services/api';

const PROVIDERS = [
  { id: 'M_PESA', name: 'M-Pesa (Vodacom)', color: '#e60000', prefix: '081, 082, 083' },
  { id: 'AIRTEL_MONEY', name: 'Airtel Money', color: '#ff0000', prefix: '097, 098, 099' },
  { id: 'ORANGE_MONEY', name: 'Orange Money', color: '#ff6600', prefix: '084, 085, 089' },
];

const MobileMoneyModal = ({ campaign, onClose, onPaymentSuccess }) => {
  const { showToast } = useToast();
  const [provider, setProvider] = useState('M_PESA');
  const [phone, setPhone] = useState('+243');
  const [amount, setAmount] = useState(campaign?.amount || 50);
  const [currency, setCurrency] = useState('USD');
  const [step, setStep] = useState(1); // 1: Choix, 2: Attente validation PIN, 3: Succès
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const handleInitiate = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      showToast("Veuillez saisir un numéro de téléphone valide au format +243...", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await initiateAdPayment({
        adBannerId: campaign.id,
        campaignTitle: campaign.title,
        provider,
        phoneNumber: phone,
        amount: parseFloat(amount),
        currency
      });

      setPaymentData(data);
      setStep(2);
      showToast(data.message || "Requête envoyée sur votre mobile", "info");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!paymentData?.paymentId) return;

    setLoading(true);
    try {
      const data = await confirmAdPayment(paymentData.paymentId);

      setStep(3);
      showToast(data.message || "Paiement validé avec succès !", "success");
      if (onPaymentSuccess) {
        onPaymentSuccess(campaign.id);
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="glass-card animate-fade-in">
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={20} style={{ color: 'var(--secondary)' }} />
            <h3 style={styles.title}>Paiement Mobile Money RDC</h3>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={18} /></button>
        </div>

        {step === 1 && (
          <form onSubmit={handleInitiate} style={styles.body}>
            <div style={styles.campaignSummary}>
              <span style={styles.summaryLabel}>Campagne :</span>
              <strong style={styles.summaryTitle}>{campaign?.title}</strong>
              <div style={styles.summaryAmount}>Montant : {amount} {currency}</div>
            </div>

            <label style={styles.label}>Sélectionnez votre opérateur Mobile Money :</label>
            <div style={styles.providerGrid}>
              {PROVIDERS.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => setProvider(p.id)}
                  style={{
                    ...styles.providerCard,
                    borderColor: provider === p.id ? p.color : 'var(--border-color)',
                    backgroundColor: provider === p.id ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)'
                  }}
                >
                  <div style={{ fontWeight: '700', color: p.color, fontSize: '13px' }}>{p.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Ex: {p.prefix}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={styles.label}>Numéro de téléphone ({provider}) :</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+24381..."
                style={styles.input}
                required
              />
            </div>

            <div style={styles.notice}>
              <ShieldCheck size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
              <span>Passerelle sécurisée de facturation automatique pour les commerces et annonceurs en RDC.</span>
            </div>

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Initier le paiement via Mobile Money"}
            </button>
          </form>
        )}

        {step === 2 && (
          <div style={styles.stepWaiting}>
            <Loader2 size={40} className="animate-spin" style={{ color: 'var(--secondary)', marginBottom: '16px' }} />
            <h4>Validation du PIN sur votre téléphone</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>
              Une notification USSD a été envoyée au <strong>{phone}</strong>. Saisissez votre code PIN secret sur votre mobile pour approuver le débit.
            </p>
            <div style={styles.refBox}>
              <span>Réf Transaction :</span>
              <strong>{paymentData?.reference}</strong>
            </div>

            <button onClick={handleConfirm} style={styles.confirmSimBtn} disabled={loading}>
              {loading ? "Vérification en cours..." : "Simuler la confirmation du code PIN"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={styles.stepSuccess}>
            <CheckCircle size={48} style={{ color: '#22c55e', marginBottom: '16px' }} />
            <h4>Paiement validé avec succès !</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>
              Votre campagne publicitaire <strong>« {campaign?.title} »</strong> est maintenant activée et en ligne sur LIFE CHANNEL.
            </p>
            <button onClick={onClose} style={styles.finishBtn}>Terminer</button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100000,
    padding: '16px',
  },
  modal: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: '#0c1222',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  campaignSummary: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
  },
  summaryLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    display: 'block',
  },
  summaryTitle: {
    fontSize: '14px',
    color: 'var(--text-main)',
  },
  summaryAmount: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--secondary)',
    marginTop: '4px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    display: 'block',
  },
  providerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  providerCard: {
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px 8px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-main)',
    boxSizing: 'border-box',
    fontSize: '14px',
  },
  notice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '12px',
    lineHeight: '1.4',
  },
  submitBtn: {
    width: '100%',
    marginTop: '16px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'var(--primary)',
    color: '#000',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepWaiting: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 0',
  },
  refBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px dashed var(--border-color)',
    borderRadius: '8px',
    padding: '10px 16px',
    margin: '16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
  },
  confirmSimBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#22c55e',
    color: '#ffffff',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
  },
  stepSuccess: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 0',
  },
  finishBtn: {
    width: '100%',
    marginTop: '16px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'var(--secondary)',
    color: '#000',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
  },
};

export default MobileMoneyModal;