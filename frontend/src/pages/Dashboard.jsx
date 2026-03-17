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

  return (
    <div className="min-vh-100 bg-light text-dark px-4 px-md-5 py-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
         <div>
            <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-layout-text-window-reverse text-success"></i> Classroom Hub
            </h4>
            <p className="text-secondary small mb-0">Welcome back! You have {rooms.filter(r => r.is_active).length} active live sessions.</p>
         </div>
         <div className="d-flex gap-2">
            <Link to="/create" className="btn btn-success rounded-pill px-3 py-2 fs-6 fw-bold d-flex align-items-center gap-2" style={{ backgroundColor: '#10B981', border: 'none', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.1)' }}>
               <i className="bi bi-plus-lg"></i> Create Session
            </Link>
         </div>
      </div>

      {/* Pill Filters */}
      <div className="d-flex gap-2 mb-4">
         <button className="btn btn-sm btn-success rounded-pill px-3 fw-bold" style={{ backgroundColor: '#10B981', border: 'none' }}>All Classes</button>
         <button className="btn btn-sm btn-outline-secondary rounded-pill px-3">Live Now</button>
         <button className="btn btn-sm btn-outline-secondary rounded-pill px-3">Scheduled</button>
      </div>

      {/* Main Grid Feed */}
      {loading ? (
         <div className="text-center text-secondary py-5">Loading live classrooms...</div>
      ) : rooms.filter(r => r.title && r.teacher_name).length === 0 ? (
         <div className="text-center text-secondary py-5 bg-white rounded-4 border border-light">No active classrooms on air. Create one to start!</div>
      ) : (
         <div className="row g-4">
            {rooms.filter(r => r.title && r.teacher_name).map((r, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4">
                 <div className="card border-0 rounded-4 bg-white p-4 h-100 shadow-sm" style={{ transition: 'all 0.2s' }}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                       <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                          <span className="bg-success rounded-circle blink" style={{ width: '6px', height: '6px' }}></span> LIVE
                       </span>
                       <span className="text-secondary small d-flex align-items-center gap-1"><i className="bi bi-people-fill"></i> {Math.floor(Math.random() * 20 + 5)} Students</span>
                    </div>

                    <h5 className="fw-bold mb-2 text-dark text-truncate" title={r.title}>{r.title}</h5>
                    <p className="text-secondary small mb-3">Prof. {r.teacher_name}</p>

                    <div className="mt-auto pt-3 border-top border-light d-flex justify-content-between align-items-center">
                       <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2" style={{ fontSize: '0.65rem' }}>SCIENCE</span>
                       <button 
                         onClick={() => { setSelectedRoom(r); setShowModal(true); setJoinName(''); setJoinRole('student'); }} 
                         className="btn btn-sm btn-success rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                         style={{ backgroundColor: '#10B981', border: 'none' }}
                       >
                         Join Stream <i className="bi bi-arrow-right-short fs-5"></i>
                       </button>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      )}

      {/* Join Overlay Modal */}
      {showModal && (
        <div className="modal-backdrop d-flex align-items-center justify-content-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
           <div className="bg-white p-4 rounded-4 border-0 shadow-lg" style={{ width: '90%', maxWidth: '400px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                 <h5 className="m-0 fw-bold text-dark">Join: {selectedRoom?.title}</h5>
                 <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              
              <div className="mb-3 text-start">
                 <label className="form-label small text-secondary fw-bold">Your Name</label>
                 <input type="text" className="form-control bg-light border-0 p-2 text-dark" style={{ borderRadius: '10px' }} value={joinName} onChange={e => setJoinName(e.target.value)} placeholder="Enter name" required />
              </div>
              <div className="mb-4 text-start">
                 <label className="form-label small text-secondary fw-bold">Choose Role</label>
                 <select className="form-select bg-light border-0 p-2 text-dark" style={{ borderRadius: '10px' }} value={joinRole} onChange={e => setJoinRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher (Host)</option>
                 </select>
              </div>

              <div className="d-flex gap-2 mt-4">
                 <button onClick={() => setShowModal(false)} className="btn btn-outline-secondary rounded-pill flex-grow-1">Cancel</button>
                 <button onClick={handleJoinClass} className="btn btn-success rounded-pill flex-grow-1 fw-bold" style={{ backgroundColor: '#10B981', border: 'none' }}>Join</button>
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
