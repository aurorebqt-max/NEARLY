import { useKeyboardViewport } from '../adapters/useKeyboardViewport';
import { useEffect, useRef } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Icon, type IconName } from '../design-system/components/Icon';
import { DemoContext } from '../features/demo/demoContext';
import { useStore } from '../state/store';
import { blocked } from '../services/social';
import { ageAt } from '../domain/compatibility';
import { routes } from './routes';

const navigation: { to: string; label: string; icon: IconName }[] = [
  { to: routes.home, label: 'Accueil', icon: 'home' },
  { to: routes.encounters, label: 'Rencontres', icon: 'spark' },
  { to: routes.hearts, label: 'Cœurs', icon: 'heart' },
  { to: '/messages', label: 'Messages', icon: 'message' },
  { to: routes.profile, label: 'Profil', icon: 'person' },
];
export function PhoneShell() {
  useKeyboardViewport();
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const { state, update, error } = useStore();
  const hearts = state.hearts.filter(h => h.to === state.active && !blocked(state, h.from, h.to)).map(h => ({ id: h.id, unread: !h.read, sender: { ...state.profiles.find(p => p.id === h.from)!, age: ageAt(state.profiles.find(p => p.id === h.from)!.birthDate) } }));
  const unread = hearts.filter(h => h.unread).length;
  const added = state.hearts.some(h => h.id === 'heart-example');
  function addExample() {
    update(s => { if (s.active === 'sacha' || blocked(s, 'sacha', s.active)) return; const existing = s.hearts.find(h => h.from === 'sacha' && h.to === s.active); if (existing) { existing.id = 'heart-example'; existing.read = false; } else s.hearts.push({ id: 'heart-example', from: 'sacha', to: s.active, read: false }); });
  }
  useEffect(() => {
    main.current?.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [pathname]);
  if (!state.profiles.find(p => p.id === state.active)!.onboarded && !['/profil', '/connexion', '/questionnaire'].includes(pathname) && !pathname.startsWith('/confiance/')) return <Navigate to="/profil" replace />;
  return <DemoContext.Provider value={{ hearts, unread, added, addExample }}>
    <div className="phone-stage">
      <div className="phone-frame">
        <button className="skip-link" onClick={() => main.current?.focus()}>Aller au contenu</button>
        <header className="phone-header">
          <Link className="wordmark" to={routes.welcome} aria-label="Nearly, bienvenue">nearly<span>♡</span></Link>
          <span className="demo-badge">DÉMO FICTIVE</span>
        </header>
        <main className="phone-content" ref={main} tabIndex={-1}><>{error && <p role="alert">{error}</p>}<Outlet /></></main>
        <nav className="phone-nav" aria-label="Navigation principale">
          {navigation.map(item => <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
            <span className="nav-icon"><Icon name={item.icon} />{item.icon === 'heart' && <span className="nav-count" aria-hidden="true">{unread}</span>}</span>
            <span>{item.label}</span>
          </NavLink>)}
        </nav>
      </div>
    </div>
  </DemoContext.Provider>;
}
