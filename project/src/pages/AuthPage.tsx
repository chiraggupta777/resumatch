import React, { useState } from 'react';
import { Link, useNavigate } from '../router';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

interface Props {
  mode: 'login' | 'signup';
}

function inputStyle(focused: boolean, error: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    border: `1px solid ${error ? '#ef4444' : focused ? '#6366f1' : '#e2e8f0'}`,
    backgroundColor: '#f0efea',
    color: '#1a1a1a',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  };
}

function FormInput({
  label, type, value, onChange, placeholder, error,
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#d1d5db' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={inputStyle(focused, !!error)}
        autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'name'}
      />
      {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

export default function AuthPage({ mode }: Props) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'signup' && !name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body = mode === 'login' ? { email, password } : { name, email, password };
      const res = await api.post(endpoint, body);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
      if (!clientId) {
        setServerError('Missing VITE_GOOGLE_CLIENT_ID in frontend environment');
        setGoogleLoading(false);
        return;
      }

      // Load Google Identity Services script if needed
      if (!(window as any).google) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://accounts.google.com/gsi/client';
          s.async = true;
          s.defer = true;
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('Failed to load Google SDK'));
          document.head.appendChild(s);
        });
      }

      // Initialize handler and prompt; callback receives the ID token in `credential`
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          const idToken = response?.credential;
          if (!idToken) {
            setServerError('Google sign-in failed: no credential returned');
            setGoogleLoading(false);
            return;
          }
          try {
            const res = await api.post('/api/auth/google', { googleToken: idToken });
            login(res.data.token, res.data.user);
            navigate('/dashboard');
          } catch (err: any) {
            setServerError(err.response?.data?.error || err.response?.data?.message || 'Google sign-in failed. Please try again.');
          } finally {
            setGoogleLoading(false);
          }
        }
      });

      // Show the one-tap / credential prompt. The callback above will handle the result.
      (window as any).google.accounts.id.prompt();
    } catch (err: any) {
      setServerError(err.message || 'Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0efea',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 20,
        padding: '36px 32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            backgroundColor: '#6366f1',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 20,
            color: '#fff',
            marginBottom: 16,
          }}>R</div>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Start matching resumes for free'}
          </p>
        </div>

        {/* Google Button */}
        <GoogleButton loading={googleLoading} onClick={handleGoogle} mode={mode} />

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, backgroundColor: '#1e1e2e' }} />
          <span style={{ fontSize: 12, color: '#4b5563', whiteSpace: 'nowrap' }}>or continue with email</span>
          <div style={{ flex: 1, height: 1, backgroundColor: '#1e1e2e' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <FormInput label="Full Name" type="text" value={name} onChange={setName} placeholder="John Doe" error={errors.name} />
          )}
          <FormInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={errors.email} />
          <FormInput label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" error={errors.password} />

          {serverError && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid rgba(239,68,68,0.3)',
              backgroundColor: 'rgba(239,68,68,0.08)',
              fontSize: 13,
              color: '#fca5a5',
            }}>
              {serverError}
            </div>
          )}

          <SubmitButton loading={loading} mode={mode} />
        </form>

        {/* Bottom link */}
        <p style={{ textAlign: 'center', marginTop: 20, marginBottom: 0, fontSize: 14, color: '#64748b' }}>
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>Sign up</Link>
            </>
          ) : (
            <>Already have an account?{' '}
              <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function GoogleButton({ loading, onClick }: { loading: boolean; onClick: () => void; mode: 'login' | 'signup' }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        padding: '11px 16px',
        borderRadius: 10,
        border: '1px solid #e5e7eb',
        backgroundColor: hover ? '#f9fafb' : '#ffffff',
        color: '#111827',
        fontSize: 14,
        fontWeight: 500,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all 0.2s ease',
        boxShadow: hover ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? (
        <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
          <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
          <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
          <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z"/>
        </svg>
      )}
      {loading ? 'Connecting...' : `Continue with Google`}
    </button>
  );
}

function SubmitButton({ loading, mode }: { loading: boolean; mode: 'login' | 'signup' }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        padding: '12px',
        borderRadius: 10,
        border: 'none',
        backgroundColor: loading ? '#4f46e5' : hover ? '#4f46e5' : '#6366f1',
        color: '#fff',
        fontSize: 15,
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'background-color 0.2s ease',
        marginTop: 4,
      }}
    >
      {loading && <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
      {loading ? 'Signing in...' : mode === 'login' ? 'Sign In' : 'Create Account'}
    </button>
  );
}
