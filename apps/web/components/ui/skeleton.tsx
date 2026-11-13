import { cn } from 'cn';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="skeleton" className={cn('animate-pulse bg-surface', className)} {...props} />
  );
}

/**
 * A loading card on the orange page (`.card-skeleton` in globals.css): a faint frame, a passing
 * shine and two bars where the title and the date go. Pass the real card's class (`tour-card`,
 * `event-card`, `shop-card`) so it takes that card's size and shape.
 */
function CardSkeleton({ className }: { className?: string }) {
  return (
    <li aria-hidden className={cn('card-skeleton', className)}>
      <span className="card-skeleton-lines">
        <span />
        <span />
      </span>
    </li>
  );
}

/** Several loading cards: `count` of them inside the real list's `<ul>` class. */
function CardSkeletons({
  count,
  listClassName,
  cardClassName,
}: {
  count: number;
  listClassName: string;
  cardClassName: string;
}) {
  return (
    <ul className={listClassName} aria-busy>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} className={cardClassName} />
      ))}
    </ul>
  );
}

export { CardSkeleton, CardSkeletons, Skeleton };
