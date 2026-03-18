import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-vh-100 text-dark d-flex flex-column" style={{ backgroundColor: '#CFFFDC', fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <header className="d-flex justify-content-between align-items-center px-4 px-md-5 py-3 border-bottom border-light">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-camera-video-fill text-success fs-4"></i>
          <span className="fw-bold fs-5" style={{ color: '#047857' }}>EduConnect Live</span>
        </div>
        <nav className="d-none d-md-flex gap-4 align-items-center">
          <Link to="/dashboard" className="text-secondary text-decoration-none small fw-medium hover-success" style={{ transition: 'color 0.2s' }}>Dashboard</Link>
          <a href="#features" className="text-secondary text-decoration-none small fw-medium">Features</a>
          <a href="#pricing" className="text-secondary text-decoration-none small fw-medium">Pricing</a>
          <Link to="/dashboard" className="btn btn-sm btn-success rounded-pill px-3 fw-medium" style={{ backgroundColor: '#10B981', border: 'none' }}>Get Started</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center px-3 py-5">
        <h1 className="display-3 fw-bolder text-dark mb-3" style={{ letterSpacing: '-0.03em' }}>
          Connect. Learn. Collaborate.
        </h1>
        <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '600px', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Real-time video collaboration for remote classrooms. Low-latency streaming, screen sharing, and AI-powered insights for every session.
        </p>

        <div className="d-flex gap-3 mb-5">
          <Link to="/dashboard" className="btn btn-lg btn-success rounded-pill px-4 py-2 fs-6 fw-bold shadow-sm" style={{ backgroundColor: '#10B981', border: 'none' }}>
            Browse Classes
          </Link>
          <Link to="/join" className="btn btn-lg btn-outline-secondary rounded-pill px-4 py-2 fs-6 fw-bold">
            Join with Code
          </Link>
        </div>

        {/* Features Sub-Boxes Grid */}
        <div id="features" className="container mt-5">
          <div className="row g-4 justify-content-center">
            {/* Box 1 */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="p-4 rounded-4 border border-light h-100 bg-white shadow-sm d-flex flex-column align-items-center text-center">
                 <div className="rounded-circle bg-success bg-opacity-10 p-3 mb-3">
                   <i className="bi bi-display text-success fs-4"></i>
                 </div>
                 <h6 className="fw-bold mb-2">HD Live Class</h6>
                 <p className="text-secondary small m-0">Crystal clear video and audio with sub-second latency.</p>
              </div>
            </div>

            {/* Box 2 */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="p-4 rounded-4 border border-light h-100 bg-white shadow-sm d-flex flex-column align-items-center text-center">
                 <div className="rounded-circle bg-success bg-opacity-10 p-3 mb-3">
                   <i className="bi bi-grid-fill text-success fs-4"></i>
                 </div>
                 <h6 className="fw-bold mb-2">Multi-Session</h6>
                 <p className="text-secondary small m-0">Manage multiple classrooms and teachers simultaneously.</p>
              </div>
            </div>

            {/* Box 3 */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="p-4 rounded-4 border border-light h-100 bg-white shadow-sm d-flex flex-column align-items-center text-center">
                 <div className="rounded-circle bg-success bg-opacity-10 p-3 mb-3">
                   <i className="bi bi-chat-text-fill text-success fs-4"></i>
                 </div>
                 <h6 className="fw-bold mb-2">Smart Chat</h6>
                 <p className="text-secondary small m-0">Persistent chat with AI summarization for every lesson.</p>
              </div>
            </div>

            {/* Box 4 */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="p-4 rounded-4 border border-light h-100 bg-white shadow-sm d-flex flex-column align-items-center text-center">
                 <div className="rounded-circle bg-success bg-opacity-10 p-3 mb-3">
                   <i className="bi bi-shield-lock-fill text-success fs-4"></i>
                 </div>
                 <h6 className="fw-bold mb-2">Secure WebRTC</h6>
                 <p className="text-secondary small m-0">End-to-end encrypted peer-to-peer communication.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .hover-success:hover { color: #10B981 !important; transform: translateY(-1px); }
      `}</style>
    </div>
  );
}
