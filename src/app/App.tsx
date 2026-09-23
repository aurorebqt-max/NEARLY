import { useEffect, useRef } from 'react';
import { HashRouter, Link, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Icon } from '../design-system/components/Icon';
import type { IconName } from '../design-system/components/Icon';
import { WelcomePage } from '../features/welcome/WelcomePage';
import { HomePage } from '../features/home/HomePage';
import { FuturePage } from '../features/home/FuturePage';
import { routes } from './routes';
const navigation: { to: string; label: string; icon: IconName }[] = [
  { to: routes.home, label: 'Accueil', icon: 'home' }, { to: routes.encounters, label: 'Rencontres', icon: 'spark' },
  { to: routes.hearts, label: 'Cœurs', icon: 'heart' }, { to: routes.profile, label: 'Profil', icon: 'person' },
];
function Shell() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const welcome = pathname === routes.welcome;
  useEffect(() => { document.title = 'Nearly — Closer than you think.'; window.scrollTo(0, 0); main.current?.focus(); }, [pathname]);
  return <div className={`app-shell ${welcome ? 'app-shell--welcome' : ''}`}>
    <button className="skip-link" type="button" onClick={() => main.current?.focus()}>Aller au contenu</button>
    <header className="topbar"><Link to={routes.welcome} className="wordmark" aria-label="Nearly, bienvenue">nearly<span>♡</span></Link><span className="edition">PREMIER APERÇU</span></header>
    <main id="main" ref={main} tabIndex={-1}><Outlet /></main>
    {!welcome && <nav className="bottom-nav" aria-label="Navigation principale">{navigation.map(item => <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}><Icon name={item.icon} /><span>{item.label}</span></NavLink>)}</nav>}
  </div>;
}
export function App() { return <HashRouter><Routes><Route element={<Shell />}><Route path={routes.welcome} element={<WelcomePage />} /><Route path={routes.home} element={<HomePage />} /><Route path={routes.encounters} element={<FuturePage kind="encounters" />} /><Route path={routes.hearts} element={<FuturePage kind="hearts" />} /><Route path={routes.profile} element={<FuturePage kind="profile" />} /><Route path="*" element={<FuturePage kind="missing" />} /></Route></Routes></HashRouter>; }
