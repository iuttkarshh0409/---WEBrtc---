import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Join Modal States
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [joinName, setJoinName] = useState('');
  const [joinRole, setJoinRole] = useState('student');

  const navigate = useNavigate();

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

  const handleJoinClass = () => {
    if (!joinName.trim()) return alert("Please enter your name!");
    navigate(`/room/${selectedRoom.room_id}?role=${joinRole}&name=${encodeURIComponent(joinName)}`);
    setShowModal(false);
  };

  const activeRooms = rooms.filter(r => r.title && r.teacher_name && r.is_active);

  return (
    <div className="min-vh-100 px-4 px-md-5 py-4" style={{ backgroundColor: '#0B0D12', color: '#94A3B8', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
         <div>
            <h5 className="fw-bold mb-1 text-white d-flex align-items-center gap-2" style={{ letterSpacing: '0.2px' }}>
              <i className="bi bi-terminal-fill" style={{ color: '#06B6D4' }}></i> CLASSROOM_CONSOLE
            </h5>
            <p className="text-secondary small mb-0" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem' }}>
               {activeRooms.length === 0 ? "STATUS // NO_ACTIVE_CLASSES" : `STATUS // ACTIVE_SESSIONS [${activeRooms.length}]`}
            </p>
         </div>
         <div className="d-flex gap-2">
            <Link to="/join" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" style={{ border: '1px solid #1E293B', borderRadius: '4px', color: '#94A3B8', fontSize: '0.8rem' }}>
               <i className="bi bi-door-open"></i> Join Session
            </Link>
            <Link to="/create" className="btn btn-sm text-white d-flex align-items-center gap-1" style={{ backgroundColor: '#0891B2', border: '1px solid #06B6D4', borderRadius: '4px', fontSize: '0.8rem' }}>
               <i className="bi bi-plus-lg"></i> Create Session
            </Link>
         </div>
      </div>

      {/* Pill Filters */}
      <div className="d-flex gap-2 mb-4">
         <button className="btn btn-sm text-white" style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.75rem', fontFamily: "'IBM Plex Mono', monospace" }}>ALL_CLASSES</button>
         <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.75rem', fontFamily: "'IBM Plex Mono', monospace" }}>LIVE_NOW</button>
      </div>

      {/* Main Grid Feed */}
      {loading ? (
         <div className="text-center text-secondary py-5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>LOADING_DATA...</div>
      ) : activeRooms.length === 0 ? (
         <div className="text-center text-secondary py-5" style={{ backgroundColor: '#0E1117', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '4px', fontFamily: "'IBM Plex Mono', monospace" }}>NO_ACTIVE_CLASSES_FOUND</div>
      ) : (
         <div className="row g-3">
            {activeRooms.map((r, i) => (
              <div key={i} className="col-12 col-md-4">
                 <div className="p-3 d-flex flex-column h-100" style={{ backgroundColor: '#0E1117', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '4px' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                       <span className="badge px-2 py-1" style={{ backgroundColor: 'rgba(6, 182, 212, 0.06)', color: '#22D3EE', border: '1px solid rgba(6, 182, 212, 0.15)', borderRadius: '2px', fontSize: '0.65rem', fontFamily: "'IBM Plex Mono', monospace" }}>
                          LIVE
                       </span>
                    </div>

                    <h6 className="fw-bold mb-1 text-white text-truncate" style={{ fontSize: '0.9rem' }} title={r.title}>{r.title}</h6>
                    <p className="text-secondary small mb-3" style={{ fontSize: '0.75rem' }}>Instructor: Prof. {r.teacher_name}</p>

                    <div className="mt-auto pt-2 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.03)' }}>
                       <button 
                         onClick={() => { setSelectedRoom(r); setShowModal(true); setJoinName(''); setJoinRole('student'); }} 
                         className="btn btn-sm w-100 text-white fw-medium d-flex align-items-center justify-content-center gap-1"
                         style={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: '4px', fontSize: '0.8rem' }}
                       >
                         Initialize Stream <i className="bi bi-arrow-right-short fs-6"></i>
                       </button>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      )}

      {/* Join Overlay Modal */}
      {showModal && (
        <div className="modal-backdrop d-flex align-items-center justify-content-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1100 }}>
           <div className="p-4" style={{ backgroundColor: '#0E1117', border: '1px solid #1E293B', borderRadius: '4px', width: '90%', maxWidth: '400px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.03)' }}>
                 <h6 className="m-0 fw-bold text-white" style={{ fontSize: '0.9rem' }}>JOIN_SESSION // {selectedRoom?.title}</h6>
                 <button onClick={() => setShowModal(false)} className="btn-close btn-close-white small shadow-none" style={{ fontSize: '0.75rem' }}></button>
              </div>

              <div className="mb-3">
                 <label className="form-label text-secondary" style={{ fontSize: '0.7rem', fontFamily: "'IBM Plex Mono', monospace" }}>NAME_IDENTIFIER</label>
                 <input 
                   type="text" 
                   className="form-control form-control-sm border-0 border-bottom text-white px-0 bg-transparent shadow-none" 
                   style={{ borderRadius: '0', borderColor: '#1E293B', fontSize: '0.85rem' }}
                   placeholder="Enter your name..." 
                   value={joinName} 
                   onChange={(e) => setJoinName(e.target.value)} 
                 />
              </div>

              <div className="mb-4">
                 <label className="form-label text-secondary" style={{ fontSize: '0.7rem', fontFamily: "'IBM Plex Mono', monospace" }}>ROLE_ASSIGNMENT</label>
                 <select 
                   className="form-select form-select-sm border-0 border-bottom text-white px-0 bg-transparent shadow-none" 
                   style={{ borderRadius: '0', borderColor: '#1E293B', fontSize: '0.85rem' }}
                   value={joinRole} 
                   onChange={(e) => setJoinRole(e.target.value)}
                 >
                    <option value="student" style={{ backgroundColor: '#0E1117' }}>Student</option>
                    <option value="teacher" style={{ backgroundColor: '#0E1117' }}>Teacher</option>
                 </select>
              </div>

              <button 
                onClick={handleJoinClass} 
                className="btn btn-sm w-100 text-white fw-bold d-flex align-items-center justify-content-center gap-1"
                style={{ backgroundColor: '#0891B2', border: '1px solid #06B6D4', borderRadius: '4px', fontSize: '0.85rem' }}
              >
                CONNECT_TO_NODE <i className="bi bi-arrow-right-short fs-6"></i>
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
