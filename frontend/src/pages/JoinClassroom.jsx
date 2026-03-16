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
    try {
      // Mock student ID for demo
      const user_id = Math.floor(Math.random() * 1000);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
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
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
      <div className="card bg-dark text-light border-secondary p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="mb-4 text-center">Join Classroom</h2>
        <form onSubmit={handleJoin}>
          <div className="mb-3">
            <label className="form-label">Student Name</label>
            <input 
              type="text" 
              className="form-control bg-secondary text-light border-0" 
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Room ID</label>
            <input 
              type="text" 
              className="form-control bg-secondary text-light border-0" 
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-outline-light w-100 mt-3" disabled={loading}>
            {loading ? 'Joining...' : 'Join Classroom'}
          </button>
        </form>
      </div>
    </div>
  );
}
