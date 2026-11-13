/**
 * Light band sweeping across the background grid, and the cover that fades the grid out behind
 * the content (styles: `.plexus-shine`, `.plexus-cover` in globals.css).
 */
export function PlexusShine() {
  return (
    <>
      <div aria-hidden className="plexus-shine">
        <div>
          <div className="plexus-shine-pattern" />
        </div>
      </div>
      <div aria-hidden className="plexus-cover" />
    </>
  );
}
