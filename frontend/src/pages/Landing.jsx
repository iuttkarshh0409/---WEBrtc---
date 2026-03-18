import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#0B0D11', color: '#94A3B8', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* Navbar */}
      <header className="d-flex justify-content-between align-items-center px-4 px-md-5 py-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', backgroundColor: '#0E1117' }}>
         <div className="d-flex align-items-center gap-2">
            <i className="bi bi-shield-lock-fill fs-5" style={{ color: '#06B6D4' }}></i>
            <span className="fw-bold text-white" style={{ fontSize: '0.9rem', letterSpacing: '0.3px', fontFamily: "'IBM Plex Mono', monospace" }}>V-CLASS [CMD]</span>
         </div>
         <Link to="/dashboard" className="btn btn-sm px-3 text-white d-flex align-items-center gap-1" style={{ border: '1px solid #1E293B', borderRadius: '4px', backgroundColor: '#111827', fontSize: '0.8rem' }}>
            Launch Console <i className="bi bi-arrow-right-short"></i>
         </Link>
      </header>

      {/* Hero Body */}
      <main className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center px-3" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <span className="badge mb-3 px-3 py-1" style={{ backgroundColor: 'rgba(6, 182, 212, 0.06)', color: '#22D3EE', border: '1px solid rgba(6, 182, 212, 0.15)', borderRadius: '2px', fontSize: '0.7rem', fontFamily: "'IBM Plex Mono', monospace" }}>SYSTEM_ONLINE // V 1.0</span>
        
        <h1 className="fw-bold mb-3 text-white tracking-tight" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>
           Structured Execution Integrity for Virtual Workspaces.
        </h1>
        <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '540px', fontSize: '0.95rem', lineHeight: '1.5' }}>
           Real-time analytic classroom operations utilizing WebRTC signaling frames, strict telemetry heartbeats, and live violation trackers node.
        </p>

        <div className="d-flex gap-3 mb-5">
          <Link to="/dashboard" className="btn text-white px-4 py-2 fw-medium" style={{ backgroundColor: '#0891B2', border: '1px solid #06B6D4', borderRadius: '4px', fontSize: '0.85rem' }}>
            Console Dashboard
          </Link>
          <Link to="/join" className="btn btn-outline-secondary px-4 py-2 fw-medium" style={{ borderRadius: '4px', border: '1px solid #1E293B', color: '#94A3B8', fontSize: '0.85rem' }}>
            Join with Code
          </Link>
        </div>

        {/* Console stats/spec buckets grid */}
        <div className="row g-3 w-100">
           <div className="col-12 col-md-4">
              <div className="p-3 text-start" style={{ backgroundColor: '#0E1117', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '4px' }}>
                 <div className="text-white fw-bold mb-1" style={{ fontSize: '0.85rem', fontFamily: "'IBM Plex Mono', monospace" }}>01 // TELEMETRY</div>
                 <p className="text-secondary m-0" style={{ fontSize: '0.75rem' }}>Active student interval heartbeats aggregated over signal frame limits.</p>
              </div>
           </div>
           <div className="col-12 col-md-4">
              <div className="p-3 text-start" style={{ backgroundColor: '#0E1117', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '4px' }}>
                 <div className="text-white fw-bold mb-1" style={{ fontSize: '0.85rem', fontFamily: "'IBM Plex Mono', monospace" }}>02 // COMPLIANCE</div>
                 <p className="text-secondary m-0" style={{ fontSize: '0.75rem' }}>Real-time window tab focus tracking and screen restriction frames rules execution.</p>
              </div>
           </div>
           <div className="col-12 col-md-4">
              <div className="p-3 text-start" style={{ backgroundColor: '#0E1117', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '4px' }}>
                 <div className="text-white fw-bold mb-1" style={{ fontSize: '0.85rem', fontFamily: "'IBM Plex Mono', monospace" }}>03 // WEBRTC</div>
                 <p className="text-secondary m-0" style={{ fontSize: '0.75rem' }}>P2P mesh grid topology broadcasting frames reliably triggers node latency structure.</p>
              </div>
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.03)', fontSize: '0.70rem', fontFamily: "'IBM Plex Mono', monospace", color: '#64748B' }}>
         CONFIDENTIAL_RESOURCE // AUDIT TRAILS CONTINUOUS
      </footer>
    </div>
  );
}
