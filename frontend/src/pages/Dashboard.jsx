import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
      <h1 className="mb-4 display-4 text-center">Remote Learning Platform</h1>
      <p className="lead text-center mb-5 text-muted">A real-time video collaboration platform using WebRTC</p>
      
      <div className="d-flex gap-3">
        <Link to="/create" className="btn btn-primary btn-lg px-4 py-2">
          Create Classroom (Teacher)
        </Link>
        <Link to="/join" className="btn btn-outline-light btn-lg px-4 py-2">
          Join Classroom (Student)
        </Link>
      </div>
    </div>
  );
}
