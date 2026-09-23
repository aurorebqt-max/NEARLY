import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon, type IconName } from '../design-system/components/Icon';
import { DemoContext } from '../features/demo/demoContext';
import { initialHearts, people } from '../features/demo/fixtures';
import { routes } from './routes';

const navigation: { to: string; label: string; icon: IconName }[] = [
  { to: routes.home, label: 'Accueil', icon: 'home' },
  { to: routes.encounters, label: 'Rencontres', icon: 'spark' },
  { to: routes.hearts, label: 'Cœurs', icon: 'heart' },
  { to: routes.profile, label: 'Profil', icon: 'person' },
];
export function PhoneShell() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const [hearts, setHearts] = useState(initialHearts);
  const unread = hearts.filter(heart => heart.unread).length;
  const added = hearts.some(heart => heart.id === 'heart-example');
  function addExample() {
    setHearts(current => current.some(heart => heart.id === 'heart-example') ? current :
      [...current, { id: 'heart-example', sender: people[2], unread: true }]);
  }
  useEffect(() => {
    main.current?.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [pathname]);
  return <DemoContext.Provider value={{ hearts, unread, added, addExample }}>
    <div className="phone-stage">
      <div className="phone-frame">
        <button className="skip-link" onClick={() => main.current?.focus()}>Aller au contenu</button>
        <header className="phone-header">
          <Link className="wordmark" to={routes.welcome} aria-label="Nearly, bienvenue">nearly<span>♡</span></Link>
          <span className="demo-badge">DÉMO FICTIVE</span>
        </header>
        <main className="phone-content" ref={main} tabIndex={-1}><Outlet /></main>
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
