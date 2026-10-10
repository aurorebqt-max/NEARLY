import { useEffect } from 'react';
/** The visual viewport shrinks with the software keyboard on supported mobile browsers. */
export function useKeyboardViewport() {
  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => document.documentElement.style.setProperty('--keyboard-viewport', `${viewport?.height ?? window.innerHeight}px`);
    update(); viewport?.addEventListener('resize', update);
    return () => { viewport?.removeEventListener('resize', update); document.documentElement.style.removeProperty('--keyboard-viewport'); };
  }, []);
}
