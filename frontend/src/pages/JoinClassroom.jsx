import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function JoinClassroom() {
  const [roomId, setRoomId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    let backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    if (backendUrl.endsWith('/')) backendUrl = backendUrl.slice(0, -1);

    try {
      // Mock student ID for demo
      const user_id = Math.floor(Math.random() * 1000);
      const res = await fetch(`${backendUrl}/join-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId, user_id })
      });
      
      if (!res.ok) {
        throw new Error('Room not found');
      }
      
      navigate(`/room/${roomId}?role=student&name=${encodeURIComponent(studentName)}`);
    } catch (error) {
       console.error('Failed to join room', error);
       alert(`${error.message || 'Failed to connect'}\nBackend Endpoint: ${backendUrl}`);
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 px-3" style={{ backgroundColor: '#0B0D12', color: '#94A3B8', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <div className="p-4" style={{ backgroundColor: '#11141B', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '4px', width: '100%', maxWidth: '400px' }}>
         <h6 className="mb-3 text-start fw-bold text-white d-flex align-items-center gap-2 pb-2 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.04)', fontSize: '0.95rem', fontFamily: "'IBM Plex Mono', monospace" }}>
            <i className="bi bi-door-open-fill" style={{ color: '#06B6D4' }}></i> JOIN_SESSION
         </h6>
         
         <form onSubmit={handleJoin}>
           <div className="mb-3">
             <label className="form-label text-secondary" style={{ fontSize: '0.7rem', fontFamily: "'IBM Plex Mono', monospace" }}>STUDENT_NAME</label>
             <input 
               type="text" 
               className="form-control form-control-sm border-0 border-bottom text-white px-0 bg-transparent shadow-none" 
               style={{ borderRadius: '0', borderColor: '#1E293B', fontSize: '0.85rem' }}
               value={studentName}
               onChange={(e) => setStudentName(e.target.value)}
               placeholder="Enter identifier..."
               required 
             />
           </div>
           
           <div className="mb-3">
             <label className="form-label text-secondary" style={{ fontSize: '0.7rem', fontFamily: "'IBM Plex Mono', monospace" }}>ROOM_ID_HASH</label>
             <input 
               type="text" 
               className="form-control form-control-sm border-0 border-bottom text-white px-0 bg-transparent shadow-none" 
               style={{ borderRadius: '0', borderColor: '#1E293B', fontSize: '0.85rem' }}
               value={roomId}
               onChange={(e) => setRoomId(e.target.value)}
               placeholder="Paste session hash..."
               required 
             />
           </div>

           <button type="submit" className="btn btn-sm w-100 text-white fw-bold d-flex align-items-center justify-content-center gap-1 mt-4" style={{ backgroundColor: '#0891B2', border: '1px solid #06B6D4', borderRadius: '4px', fontSize: '0.85rem' }} disabled={loading}>
             {loading ? (
                <div className="d-flex align-items-center justify-content-center gap-2">
                   <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px' }}></span> CONNECTING_...
                </div>
             ) : 'CONNECT_TO_NODE'}
           </button>
         </form>

         <div className="text-center mt-3 pt-2 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.03)' }}>
            <Link to="/" className="text-secondary small text-decoration-none" style={{ fontSize: '0.75rem', fontFamily: "'IBM Plex Mono', monospace" }}>
               <i className="bi bi-arrow-left"></i> BACK_TO_HOME
            </Link>
         </div>
      </div>
    </div>
  );
}
