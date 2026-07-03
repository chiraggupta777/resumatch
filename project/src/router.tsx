import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType>({
  path: '/',
  navigate: () => {},
  params: {},
});

export function Router({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => window.location.pathname || '/');

  useEffect(() => {
    const handler = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navigate = useCallback((to: string) => {
    window.history.pushState(null, '', to);
    setPath(to);
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate, params: {} }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useNavigate() {
  return useContext(RouterContext).navigate;
}

export function usePath() {
  return useContext(RouterContext).path;
}

interface RouteProps {
  path: string;
  element: ReactNode;
}

interface RoutesProps {
  children: ReactNode;
}

export function Routes({ children }: RoutesProps) {
  const { path } = useContext(RouterContext);
  const childArray = Array.isArray(children) ? children : [children];

  for (const child of childArray as any[]) {
    if (!child?.props) continue;
    const routePath: string = child.props.path;
    if (routePath === '*') continue; // handled below
    if (routePath === path) return child.props.element;
    // trailing slash tolerance
    if (routePath === '/' && path === '') return child.props.element;
  }

  // fallback to '*' route
  for (const child of childArray as any[]) {
    if (child?.props?.path === '*') return child.props.element;
  }

  return null;
}

export function Route(_props: RouteProps) {
  return null;
}

export function Navigate({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => { navigate(to); }, []);
  return null;
}

export function Link({
  to, children, style, onMouseEnter, onMouseLeave, className,
}: {
  to: string;
  children: ReactNode;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}) {
  const navigate = useNavigate();
  return (
    <a
      href={to}
      style={style}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => { e.preventDefault(); navigate(to); }}
    >
      {children}
    </a>
  );
}

export function useLocation() {
  const { path } = useContext(RouterContext);
  return { pathname: path };
}
