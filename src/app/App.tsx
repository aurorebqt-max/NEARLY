import { useEffect, useRef } from 'react';
import { HashRouter, Link, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { WelcomePage } from '../features/welcome/WelcomePage';
import { HomePage } from '../features/home/HomePage';
import { FuturePage } from '../features/home/FuturePage';
import { PhoneShell } from './PhoneShell';
import { DashboardPage } from '../features/mobile/DashboardPage';
import { EncountersPage } from '../features/mobile/EncountersPage';
import { HeartsPage } from '../features/mobile/HeartsPage';
import { ProfilePage } from '../features/mobile/ProfilePage';
import { routes } from './routes';
import './phone.css';
import './romantic-future.css';

function PresentationShell() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const welcome = pathname === routes.welcome;
  useEffect(() => { window.scrollTo(0, 0); main.current?.focus(); }, [pathname]);
  return <div className={`app-shell ${welcome ? 'app-shell--welcome' : ''}`}>
    <button className="skip-link" onClick={() => main.current?.focus()}>Aller au contenu</button>
    <header className="topbar"><Link to={routes.welcome} className="wordmark" aria-label="Nearly, bienvenue">nearly<span>♡</span></Link><Link className="edition" to={routes.home}>OUVRIR L’APERÇU</Link></header>
    <main ref={main} tabIndex={-1}><Outlet /></main>
  </div>;
}

export function App() {
  return <HashRouter><Routes>
    <Route element={<PresentationShell />}>
      <Route path={routes.welcome} element={<WelcomePage />} />
      <Route path={routes.presentation} element={<HomePage />} />
      <Route path="*" element={<FuturePage kind="missing" />} />
    </Route>
    <Route element={<PhoneShell />}>
      <Route path={routes.home} element={<DashboardPage />} />
      <Route path={routes.encounters} element={<EncountersPage />} />
      <Route path={routes.hearts} element={<HeartsPage />} />
      <Route path={routes.profile} element={<ProfilePage />} />
    </Route>
  </Routes></HashRouter>;
}
