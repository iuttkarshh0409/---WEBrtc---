import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 px-3" style={{ backgroundColor: '#1C1F24', color: '#E2E8F0', fontFamily: "'Public Sans', system-ui, sans-serif" }}>
      <div className="p-4" style={{ width: '100%', maxWidth: '400px', background: '#15181C', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px' }}>
        <h6 className="mb-4 text-center fw-bold text-light d-flex align-items-center justify-content-center gap-2">
          <i className="bi bi-door-open text-info"></i> SESSION_ACCESS
        </h6>
        
        <form onSubmit={handleJoin}>
          <div className="mb-3 text-start">
            <label className="form-label small text-secondary fw-bold mb-1">PARTICIPANT_NAME</label>
            <input 
              type="text" 
              className="form-control form-control-sm bg-transparent border-secondary text-light shadow-none" 
              style={{ borderRadius: '2px' }}
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter official identifier..."
              required 
            />
          </div>
          
          <div className="mb-4 text-start">
            <label className="form-label small text-secondary fw-bold mb-1">SESSION_ID</label>
            <input 
              type="text" 
              className="form-control form-control-sm bg-transparent border-secondary text-light shadow-none" 
              style={{ borderRadius: '2px' }}
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Paste code structure..."
              required 
            />
          </div>

          <button type="submit" className="btn btn-sm btn-info text-dark w-100 fw-bold py-2" style={{ borderRadius: '3px', background: '#38BDF8', border: 'none' }} disabled={loading}>
            {loading ? 'AUTHORIZING...' : 'JOIN_SESSION'}
          </button>
        </form>

        <div className="text-center mt-3 pt-2" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.03)' }}>
           <a href="/" className="text-secondary small text-decoration-none" style={{ fontSize: '0.8rem' }}><i className="bi bi-chevron-left"></i> RETURN_TO_HOME</a>
        </div>
      </div>

      <style>{`
         .hover-success:hover { color: #10B981 !important; }
      `}</style>
    </div>
  );
}
