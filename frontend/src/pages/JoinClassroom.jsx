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
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 px-3" style={{ backgroundColor: '#CFFFDC', fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-white p-4 rounded-4 border-0 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="mb-4 text-center fw-bold text-dark d-flex align-items-center justify-content-center gap-2">
          <i className="bi bi-door-open-fill text-success"></i> Join Classroom
        </h3>
        
        <form onSubmit={handleJoin}>
          <div className="mb-3">
            <label className="form-label small text-secondary fw-bold">Student Name</label>
            <input 
              type="text" 
              className="form-control bg-light border-0 p-2 text-dark" 
              style={{ borderRadius: '10px' }}
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter your name"
              required 
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label small text-secondary fw-bold">Room ID</label>
            <input 
              type="text" 
              className="form-control bg-light border-0 p-2 text-dark" 
              style={{ borderRadius: '10px' }}
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Paste Classroom ID"
              required 
            />
          </div>

          <button type="submit" className="btn btn-success w-100 rounded-pill mt-3 fw-bold py-2 shadow-sm" style={{ backgroundColor: '#10B981', border: 'none' }} disabled={loading}>
            {loading ? (
               <div className="d-flex align-items-center justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm"></span> Joining...
               </div>
            ) : 'Join Class'}
          </button>
        </form>

        <div className="text-center mt-3">
           <a href="/" className="text-secondary small text-decoration-none hover-success" style={{ transition: 'all 0.2s' }}><i className="bi bi-arrow-left"></i> Back to Home</a>
        </div>
      </div>

      <style>{`
         .hover-success:hover { color: #10B981 !important; }
      `}</style>
    </div>
  );
}
