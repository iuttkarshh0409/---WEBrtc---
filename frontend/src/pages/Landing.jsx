import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#1C1F24', color: '#E2E8F0', fontFamily: "'Public Sans', system-ui, sans-serif" }}>
      {/* Navbar */}
      <header className="d-flex justify-content-between align-items-center px-4 px-md-5 py-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-camera-video-fill text-info fs-5"></i>
          <span className="fw-bold fs-6 mono-metric" style={{ color: '#F8FAFC', letterSpacing: '0.05em' }}>SESSION_CORE_LIVE</span>
        </div>
        <nav className="d-none d-md-flex gap-3 align-items-center">
          <Link to="/dashboard" className="text-secondary text-decoration-none small fw-bold hover-info" style={{ transition: 'color 0.2s', fontSize: '0.75rem' }}>DASHBOARD</Link>
          <a href="#features" className="text-secondary text-decoration-none small fw-bold" style={{ fontSize: '0.75rem' }}>FEATURES</a>
          <Link to="/dashboard" className="btn btn-sm btn-info text-dark fw-bold px-3" style={{ backgroundColor: '#38BDF8', border: 'none', borderRadius: '3px', fontSize: '0.75rem' }}>INITIALIZE</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center px-3 py-5">
        <h1 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-0.02em', color: '#F8FAFC' }}>
          Connect. Monitor. Collaborate.
        </h1>
        <p className="text-secondary mx-auto mb-4 mono-metric" style={{ maxWidth: '600px', fontSize: '0.9rem', lineHeight: '1.6' }}>
          Real-time analytical streaming for remote environments. Low-latency monitoring, visual dashboards, and encrypted insights for every active stream.
        </p>

        <div className="d-flex gap-2 mb-5">
          <Link to="/dashboard" className="btn btn-sm btn-info text-dark fw-bold px-4 py-2" style={{ backgroundColor: '#38BDF8', border: 'none', borderRadius: '3px' }}>
            Browse Classes
          </Link>
          <Link to="/join" className="btn btn-sm btn-outline-secondary px-4 py-2" style={{ borderRadius: '3px', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8' }}>
            Join with Code
          </Link>
        </div>

        {/* Features Sub-Boxes Grid */}
        <div id="features" className="container mt-4">
          <div className="row g-3 justify-content-center">
            {/* Box 1 */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="p-3 h-100 d-flex flex-column align-items-center text-center" style={{ background: '#15181C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px' }}>
                 <div className="p-2 mb-2">
                   <i className="bi bi-display text-info fs-5"></i>
                 </div>
                 <h6 className="fw-bold mb-1 text-light" style={{ fontSize: '0.85rem' }}>DEDICATED_STREAM</h6>
                 <p className="text-secondary small m-0 mono-metric" style={{ fontSize: '0.7rem' }}>Resilient media pipeline with sub-second thresholds.</p>
              </div>
            </div>

            {/* Box 2 */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="p-3 h-100 d-flex flex-column align-items-center text-center" style={{ background: '#15181C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px' }}>
                 <div className="p-2 mb-2">
                   <i className="bi bi-grid-fill text-info fs-5"></i>
                 </div>
                 <h6 className="fw-bold mb-2 text-light" style={{ fontSize: '0.85rem' }}>MULTI_NODE_GRID</h6>
                 <p className="text-secondary small m-0 mono-metric" style={{ fontSize: '0.7rem' }}>Continuous structure matrix supporting concurrent sessions.</p>
              </div>
            </div>

            {/* Box 3 */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="p-3 h-100 d-flex flex-column align-items-center text-center" style={{ background: '#15181C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px' }}>
                 <div className="p-2 mb-2">
                   <i className="bi bi-chat-text-fill text-info fs-5"></i>
                 </div>
                 <h6 className="fw-bold mb-2 text-light" style={{ fontSize: '0.85rem' }}>SECURE_LOGS</h6>
                 <p className="text-secondary small m-0 mono-metric" style={{ fontSize: '0.7rem' }}>Textual buffers with isolated persistent metrics intervals.</p>
              </div>
            </div>

            {/* Box 4 */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="p-3 h-100 d-flex flex-column align-items-center text-center" style={{ background: '#15181C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px' }}>
                 <div className="p-2 mb-2">
                   <i className="bi bi-shield-lock-fill text-info fs-5"></i>
                 </div>
                 <h6 className="fw-bold mb-2 text-light" style={{ fontSize: '0.85rem' }}>E2E_ENCRYPTION</h6>
                 <p className="text-secondary small m-0 mono-metric" style={{ fontSize: '0.7rem' }}>Peer-locked signaling with full certificate headers validation.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
         .hover-info:hover { color: #38BDF8 !important; }
         .mono-metric { font-family: 'IBM Plex Mono', monospace; }
      `}</style>
    </div>
  );
}
