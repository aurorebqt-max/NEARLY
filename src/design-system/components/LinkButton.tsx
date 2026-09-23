import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
export function LinkButton({ to, children }: { to: string; children: ReactNode }) { return <Link className="button button--primary" to={to}>{children}<Icon name="arrow" /></Link>; }
