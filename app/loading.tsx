export default function Loading() {
  return (
    <main className="shell page-skeleton" aria-label="Loading page">
      <div className="skeleton-nav" />
      <section className="skeleton-hero">
        <div>
          <div className="skeleton-line tiny" />
          <div className="skeleton-line hero-line" />
          <div className="skeleton-line hero-line short" />
          <div className="skeleton-line body-line" />
          <div className="skeleton-actions">
            <div className="skeleton-pill" />
            <div className="skeleton-pill muted" />
          </div>
        </div>
        <div className="skeleton-stage" />
      </section>
      <section className="skeleton-grid">
        <div />
        <div />
        <div />
      </section>
    </main>
  );
}
