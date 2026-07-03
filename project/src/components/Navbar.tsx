import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from '../router';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, History, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hoverSignOut, setHoverSignOut] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1e1e2e',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 16,
            color: '#fff',
            flexShrink: 0,
          }}>R</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '-0.3px' }}>ResuMatch</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NavLink to="/dashboard" active={isActive('/dashboard')}>
            <LayoutDashboard size={15} />
            Dashboard
          </NavLink>
          <NavLink to="/history" active={isActive('/history')}>
            <History size={15} />
            History
          </NavLink>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#fff',
                  flexShrink: 0,
                }}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: 14, color: '#9ca3af' }}>
                  {user.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                onMouseEnter={() => setHoverSignOut(true)}
                onMouseLeave={() => setHoverSignOut(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #1e1e2e',
                  backgroundColor: hoverSignOut ? '#1e1e2e' : 'transparent',
                  color: '#9ca3af',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 8,
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: 500,
        color: active ? '#fff' : hover ? '#d1d5db' : '#6b7280',
        backgroundColor: active ? '#1e1e2e' : hover ? '#111118' : 'transparent',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </Link>
  );
}
