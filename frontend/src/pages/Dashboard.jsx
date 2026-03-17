import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        let backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        if (backendUrl.endsWith('/')) backendUrl = backendUrl.slice(0, -1);
        
        const res = await fetch(`${backendUrl}/rooms`);
        const data = await res.json();
        if (Array.isArray(data)) setRooms(data);
      } catch (e) {
        console.error("Failed to fetch rooms:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

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

        {/* Active Classrooms Feed */}
        <div className="mt-5 w-100">
          <h5 className="text-secondary mb-3 d-flex align-items-center justify-content-center gap-2">
            <span className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></span>
            Active Classes ({rooms.filter(r => r.title && r.teacher_name).length})
          </h5>

          {loading ? (
             <div className="text-muted small">Loading live classrooms...</div>
          ) : rooms.filter(r => r.title && r.teacher_name).length === 0 ? (
             <div className="text-secondary opacity-50 small">No active classrooms on air. Create one to start!</div>
          ) : (
             <div className="row g-3 mt-1 justify-content-center" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {rooms.filter(r => r.title && r.teacher_name).map((r, i) => (
                  <div key={i} className="col-12 col-md-10">
                     <div className="p-3 rounded-4 d-flex justify-content-between align-items-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="text-start">
                           <h6 className="m-0 fw-bold">{r.title}</h6>
                           <small className="text-secondary">Taught by {r.teacher_name}</small>
                        </div>
                        <Link 
                          to={`/room/${r.room_id}?role=student&name=Student_${Math.random().toString(36).substr(2, 4)}`} 
                          className="btn btn-sm btn-primary rounded-pill px-3"
                        >
                          Join
                        </Link>
                     </div>
                  </div>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
