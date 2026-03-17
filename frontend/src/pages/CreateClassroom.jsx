import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateClassroom() {
  const [teacherName, setTeacherName] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    let backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    if (backendUrl.endsWith('/')) backendUrl = backendUrl.slice(0, -1);

    try {
      const res = await fetch(`${backendUrl}/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, teacher_name: teacherName })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to create classroom');
      }
      // Navigate to room as teacher
      if (!data.room_id) {
         throw new Error('Server did not return a valid Room ID');
      }
      navigate(`/room/${data.room_id}?role=teacher&name=${encodeURIComponent(teacherName)}`);
    } catch (error) {
      console.error('Failed to create room', error);
      alert(`Failed to connect to backend at: ${backendUrl}`);
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
            <label className="form-label">Classroom Title</label>
            <input 
              type="text" 
              className="form-control bg-secondary text-light border-0" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Physics 101"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Teacher Name</label>
            <input 
              type="text" 
              className="form-control bg-secondary text-light border-0" 
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="e.g., Prof. ABC"
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
