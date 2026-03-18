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
    <div className="min-vh-100 px-4 px-md-5 py-4" style={{ backgroundColor: '#1C1F24', color: '#E2E8F0', fontFamily: "'Public Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
         <div>
            <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#F8FAFC' }}>
              <i className="bi bi-layout-text-window-reverse text-info"></i> SESSION_HUB
            </h4>
            <p className="text-secondary small mb-0 mono-metric">
               {activeRooms.length === 0 ? "NO LIVE SESSIONS DETECTED" : `SYSTEM ONLINE: ${activeRooms.length} ACTIVE STREAM${activeRooms.length > 1 ? 'S' : ''}`}
            </p>
         </div>
         <div className="d-flex gap-2">
            <Link to="/join" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2" style={{ borderRadius: '3px', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8' }}>
               <i className="bi bi-door-open-fill"></i> Manual Join
            </Link>
            <Link to="/create" className="btn btn-sm btn-info text-dark fw-bold d-flex align-items-center gap-2" style={{ borderRadius: '3px', background: '#38BDF8', border: 'none' }}>
               <i className="bi bi-plus-lg"></i> Create Session
            </Link>
         </div>
      </div>

      {/* Analytical Filters */}
      <div className="d-flex gap-1 mb-4">
         <button className="btn btn-sm btn-info text-dark fw-bold px-3 d-flex align-items-center gap-1" style={{ borderRadius: '3px', background: '#38BDF8', border: 'none', fontSize: '0.75rem' }}>ALL_GROUPS</button>
         <button className="btn btn-sm btn-outline-secondary px-3" style={{ borderRadius: '3px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: '#94A3B8' }}>FILTER_LIVE</button>
      </div>

      {/* Main Grid Feed */}
      {loading ? (
         <div className="text-center text-secondary py-5 mono-metric">Resolving metrics...</div>
      ) : activeRooms.length === 0 ? (
         <div className="text-center text-secondary py-5 bg-transparent" style={{ border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>No live sessions detected.</div>
      ) : (
         <div className="row g-3">
            {activeRooms.map((r, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4">
                 <div className="p-3 h-100 d-flex flex-column" style={{ background: '#15181C', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '4px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                       <span className="badge bg-transparent d-flex align-items-center gap-1 p-0" style={{ fontSize: '0.7rem', color: '#14B8A6', fontWeight: 'bold' }}>
                          <span className="bg-teal rounded-circle blink" style={{ width: '6px', height: '6px', backgroundColor: '#14B8A6' }}></span> STATUS // LIVE
                       </span>
                    </div>

                    <h6 className="fw-bold mb-1 text-truncate" style={{ color: '#F8FAFC' }} title={r.title}>{r.title.toUpperCase()}</h6>
                    <p className="text-secondary small mb-3">INSTRUCTOR: {r.teacher_name}</p>

                    <div className="mt-auto pt-2 d-flex justify-content-end align-items-center" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.03)' }}>
                       <button 
                         onClick={() => { setSelectedRoom(r); setShowModal(true); setJoinName(''); setJoinRole('student'); }} 
                         className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                         style={{ borderRadius: '3px', fontSize: '0.8rem', color: '#38BDF8' }}
                       >
                         ACCESS_STREAM <i className="bi bi-chevron-right"></i>
                       </button>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      )}

      {/* Join Overlay Modal */}
      {showModal && (
        <div className="modal-backdrop d-flex align-items-center justify-content-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(5, 5, 5, 0.75)', zIndex: 1100 }}>
           <div className="p-4" style={{ width: '90%', maxWidth: '400px', background: '#15181C', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                 <h6 className="m-0 fw-bold text-light">SESSION_JOIN: {selectedRoom?.title.toUpperCase()}</h6>
                 <button className="btn btn-sm btn-link text-secondary p-0" onClick={() => setShowModal(false)}><i className="bi bi-x-lg"></i></button>
              </div>

              <div className="mb-3 text-start">
                 <label className="form-label small text-secondary fw-bold mb-1">PARTICIPANT_NAME</label>
                 <input 
                   type="text" 
                   className="form-control form-control-sm bg-transparent border-secondary text-light shadow-none" 
                   style={{ borderRadius: '2px' }}
                   value={joinName} 
                   onChange={(e) => setJoinName(e.target.value)} 
                   placeholder="Enter formal identification..."
                 />
              </div>

              <div className="mb-4 text-start">
                 <label className="form-label small text-secondary fw-bold mb-1">ACCESS_ROLE</label>
                 <select 
                   className="form-select form-select-sm bg-transparent border-secondary text-light shadow-none" 
                   style={{ borderRadius: '2px' }}
                   value={joinRole} 
                   onChange={(e) => setJoinRole(e.target.value)}
                 >
                    <option value="student" style={{ background: '#181B20' }}>Student</option>
                    <option value="teacher" style={{ background: '#181B20' }}>Teacher (Host)</option>
                 </select>
              </div>

              <div className="d-flex gap-2">
                 <button onClick={() => setShowModal(false)} className="btn btn-sm btn-outline-secondary w-50" style={{ borderRadius: '3px' }}>ABORT</button>
                 <button onClick={handleJoinClass} className="btn btn-sm btn-info text-dark fw-bold w-50" style={{ borderRadius: '3px', background: '#38BDF8', border: 'none' }}>CONFIRM</button>
              </div>
           </div>
        </div>
      )}
      
      <style>{`
        .blink { animation: blinker 1s linear infinite; }
        @keyframes blinker { 50% { opacity: 0; } }
        .card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important; cursor: pointer; }
      `}</style>
    </div>
  );
}
