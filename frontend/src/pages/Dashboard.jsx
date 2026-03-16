import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="landing-container">
      <div className="landing-card">
        <h1 className="landing-title">Remote Learning Platform</h1>
        <p className="landing-subtitle">A real-time video collaboration & screen sharing workspace using WebRTC</p>
        
        <div className="btn-group-custom">
          <Link to="/create" className="btn-premium btn-premium-primary">
            <i className="bi bi-mortarboard-fill fs-5"></i>
            <span>Create Classroom</span>
          </Link>
          <Link to="/join" className="btn-premium btn-premium-outline">
            <i className="bi bi-people-fill fs-5"></i>
            <span>Join Classroom</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
