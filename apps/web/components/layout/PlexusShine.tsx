/** Light band sweeping across the background grid (styles: `.plexus-shine` in globals.css). */
export function PlexusShine() {
  return (
    <div aria-hidden className="plexus-shine">
      <div>
        <div className="plexus-shine-pattern" />
      </div>
    </div>
  );
}
