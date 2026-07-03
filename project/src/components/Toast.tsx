import { useEffect, useState } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      maxWidth: 380,
      width: 'calc(100vw - 48px)',
    }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10);
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, 4500);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [toast.id, onRemove]);

  const colors = {
    error: { bg: '#1a0808', border: '#ef4444', icon: '#ef4444' },
    success: { bg: '#081a0d', border: '#22c55e', icon: '#22c55e' },
    info: { bg: '#08081a', border: '#6366f1', icon: '#6366f1' },
  };

  const c = colors[toast.type];
  const Icon = toast.type === 'error' ? AlertTriangle : toast.type === 'success' ? CheckCircle : Info;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      padding: '12px 14px',
      borderRadius: 12,
      border: `1px solid ${c.border}`,
      backgroundColor: c.bg,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 0.3s ease',
    }}>
      <Icon size={16} style={{ color: c.icon, flexShrink: 0, marginTop: 1 }} />
      <span style={{ flex: 1, fontSize: 13, lineHeight: 1.5, color: '#e5e7eb' }}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0, flexShrink: 0 }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage['type'] = 'error') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}
