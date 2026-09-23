import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { tokens } from './design-system/tokens';
import './design-system/styles.css';
// Web adapter: the same plain TypeScript tokens can be consumed by React Native.
for (const [name, value] of Object.entries(tokens.colors)) document.documentElement.style.setProperty(`--color-${name}`, value);
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
