import { Heart } from '../../design-system/components/Heart';
import { LinkButton } from '../../design-system/components/LinkButton';
import { Icon } from '../../design-system/components/Icon';
import { routes } from '../../app/routes';
export function WelcomePage() { return <section className="welcome">
  <div className="welcome-art"><span className="eyebrow">LES BELLES HISTOIRES COMMENCENT TOUT PRÈS</span><Heart /><p className="signature">Closer than you think.</p></div>
  <div className="welcome-copy"><span className="eyebrow welcome-kicker">UN CROISEMENT. UNE POSSIBILITÉ.</span><h1>Et si tout commençait<br />par un <em>presque ?</em></h1><p className="intro">Des chemins qui se croisent.<br />Un cœur qui ose. Et peut-être, vous deux.</p><LinkButton to={routes.home}>Découvrir Nearly</LinkButton><p className="welcome-note">Un premier aperçu de votre future rencontre.</p><div className="privacy-note"><Icon name="shield" /><span>À votre rythme. Selon vos choix.</span></div></div>
</section>; }
