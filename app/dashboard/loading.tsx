// Intentionally quiet: the dashboard plays its own entrance once data is ready,
// so the route fallback is a plain canvas to avoid a second, competing loader.
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-canvas" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading your archive</span>
    </div>
  );
}
