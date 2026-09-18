import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Portal Container */}
      <div style={styles.toastContainer}>
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            style={{ 
              ...styles.toastCard, 
              ...styles[toast.type] 
            }}
            className="animate-slide-in"
          >
            <div style={styles.iconContainer}>
              {toast.type === 'success' && <CheckCircle size={18} style={{ color: '#10b981' }} />}
              {toast.type === 'error' && <AlertCircle size={18} style={{ color: '#ef4444' }} />}
              {toast.type === 'info' && <Info size={18} style={{ color: '#007cff' }} />}
            </div>
            <div style={styles.message}>{toast.message}</div>
            <button 
              onClick={() => removeToast(toast.id)} 
              style={styles.closeBtn}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const styles = {
  toastContainer: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxWidth: '350px',
    width: 'calc(100% - 40px)',
  },
  toastCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '8px',
    background: '#0d1426',
    border: '1px solid var(--border-color)',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
    color: 'var(--text-main)',
    fontSize: '14px',
    animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    boxSizing: 'border-box',
  },
  success: {
    borderLeft: '4px solid #10b981',
  },
  error: {
    borderLeft: '4px solid #ef4444',
  },
  info: {
    borderLeft: '4px solid #007cff',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '12px',
  },
  message: {
    flex: 1,
    lineHeight: '1.4',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '12px',
    opacity: 0.7,
    transition: 'opacity 0.2s',
  }
};
