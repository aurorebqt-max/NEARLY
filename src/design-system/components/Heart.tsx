export function Heart({ compact = false, animated = true }: { compact?: boolean; animated?: boolean }) {
  return <div className={`heart-scene ${compact ? 'heart-scene--compact' : ''} ${animated ? '' : 'heart-scene--still'}`} aria-hidden="true">
    <div className="orbit orbit--one" /><div className="orbit orbit--two" /><div className="orbit orbit--three" />
    <span className="little-star star-one">✧</span><span className="little-star star-two">✧</span>
    <svg className="nearly-heart" viewBox="0 0 200 190" fill="none"><path d="M100 164C88 151 31 115 31 69C31 30 81 22 100 57C119 22 169 30 169 69C169 115 112 151 100 164Z" fill="currentColor"/><path d="M48 68C48 54 59 47 71 49" stroke="var(--color-blush)" strokeWidth="5" strokeLinecap="round"/></svg>
  </div>;
}
