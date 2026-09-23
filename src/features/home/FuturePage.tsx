import { Icon, type IconName } from '../../design-system/components/Icon';
import { LinkButton } from '../../design-system/components/LinkButton';
import { routes } from '../../app/routes';
const content: Record<string, { title: string; text: string; icon: IconName }> = {
  encounters: { title: 'Les chemins se croiseront ici.', text: 'Vos rencontres potentielles auront leur place ici. Cette fonctionnalité est à venir ; aucune personne n’est détectée dans cet aperçu.', icon: 'spark' },
  hearts: { title: 'Un cœur peut tout commencer.', text: 'Vous retrouverez ici les cœurs reçus. L’envoi, la réception et le compteur de cœurs non lus ne sont pas encore disponibles.', icon: 'heart' },
  profile: { title: 'Une place pour être vous.', text: 'Votre profil et vos choix de confidentialité seront réunis ici. La création de compte et les réglages ne sont pas encore disponibles.', icon: 'person' },
  missing: { title: 'Ce chemin reste à découvrir.', text: 'Cette page n’existe pas. Retrouvez le premier aperçu de Nearly depuis l’accueil.', icon: 'spark' },
};
export function FuturePage({ kind }: { kind: keyof typeof content }) { const page = content[kind]; return <section className="page future-page"><span className="future-symbol"><Icon name={page.icon} /></span><span className="eyebrow">{kind === 'missing' ? 'PAGE INTROUVABLE' : 'À VENIR'}</span><h1>{page.title}</h1><p>{page.text}</p><LinkButton to={routes.home}>Revenir à l’accueil</LinkButton></section>; }
