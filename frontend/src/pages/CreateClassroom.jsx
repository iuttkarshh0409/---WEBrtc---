import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateClassroom() {
  const [teacherName, setTeacherName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mocking teacher ID for MVP
      const res = await fetch('http://localhost:8000/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: Math.floor(Math.random() * 1000) })
      });
      const data = await res.json();
      // Navigate to room as teacher
      navigate(`/room/${data.room_id}?role=teacher&name=${encodeURIComponent(teacherName)}`);
    } catch (error) {
      console.error('Failed to create room', error);
      alert('Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
      <div className="card bg-dark text-light border-secondary p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="mb-4 text-center">Create Classroom</h2>
        <form onSubmit={handleCreate}>
          <div className="mb-3">
            <label className="form-label">Teacher Name</label>
            <input 
              type="text" 
              className="form-control bg-secondary text-light border-0" 
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
            {loading ? 'Creating...' : 'Create & Join Room'}
          </button>
        </form>
      </div>
    </div>
  );
}
