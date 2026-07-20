import { Heart } from 'lucide-react';

/**
 * Тонкая анимированная лента над шапкой: проект живёт на собственные средства и
 * пожертвования, поэтому для школьников и родителей он навсегда бесплатный.
 * Виден на всех страницах. Анимация: мягкий переливающийся блик по ленте +
 * пульсирующее сердце. Уважает prefers-reduced-motion (см. globals.css).
 */
export function FreeRibbon() {
  return (
    <div className="free-ribbon print:hidden" role="note" aria-label="Условия бесплатности">
      <div className="free-ribbon-inner">
        <Heart className="free-ribbon-heart h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <p className="free-ribbon-text">
          Проект живёт на собственные средства и пожертвования, поэтому{' '}
          <span className="free-ribbon-accent">для школьников и родителей он навсегда бесплатный</span>
        </p>
      </div>
    </div>
  );
}
