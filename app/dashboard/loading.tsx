export default function DashboardLoading() {
  return (
    <div className="lm-loading min-h-screen bg-canvas text-foreground" aria-live="polite">
      <div className="lm-loading__grain" aria-hidden="true" />
      <div className="lm-loading__axis" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <main className="lm-loading__content">
        <div className="lm-loading__meta">
          <span>Life Memory</span>
          <span>Archive / 01</span>
        </div>

        <div className="lm-loading__mark" aria-hidden="true">
          <span className="lm-loading__mark-ring" />
          <span className="lm-loading__mark-dot" />
          <span className="lm-loading__mark-index">01</span>
        </div>

        <p className="lm-loading__eyebrow">Opening your archive</p>
        <h1 className="lm-loading__title">The quiet parts are still here.</h1>
        <p className="lm-loading__status">Arranging moments, people, and places</p>

        <div className="lm-loading__progress" role="progressbar" aria-label="Loading archive">
          <span />
        </div>

        <div className="lm-loading__footer">
          <span>Private memory space</span>
          <span className="lm-loading__ellipsis" aria-hidden="true">···</span>
        </div>
      </main>
    </div>
  );
}
