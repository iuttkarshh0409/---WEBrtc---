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
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 px-3" style={{ backgroundColor: '#CFFFDC', fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-white p-4 rounded-4 border-0 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="mb-4 text-center fw-bold text-dark d-flex align-items-center justify-content-center gap-2">
          <i className="bi bi-plus-circle-fill text-success"></i> Create Classroom
        </h3>
        
        <form onSubmit={handleCreate}>
          <div className="mb-3">
            <label className="form-label small text-secondary fw-bold">Classroom Title</label>
            <input 
              type="text" 
              className="form-control bg-light border-0 p-2 text-dark" 
              style={{ borderRadius: '10px' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Physics 101"
              required 
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label small text-secondary fw-bold">Teacher Name</label>
            <input 
              type="text" 
              className="form-control bg-light border-0 p-2 text-dark" 
              style={{ borderRadius: '10px' }}
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="e.g., Prof. ABC"
              required 
            />
          </div>

          <button type="submit" className="btn btn-success w-100 rounded-pill mt-3 fw-bold py-2 shadow-sm" style={{ backgroundColor: '#10B981', border: 'none' }} disabled={loading}>
            {loading ? (
               <div className="d-flex align-items-center justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm"></span> Creating...
               </div>
            ) : 'Create & Join Room'}
          </button>
        </form>

        <div className="text-center mt-3">
           <a href="/dashboard" className="text-secondary small text-decoration-none hover-success" style={{ transition: 'all 0.2s' }}><i className="bi bi-arrow-left"></i> Back to Dashboard</a>
        </div>
      </div>

      <style>{`
         .hover-success:hover { color: #10B981 !important; }
      `}</style>
    </div>
  );
}
