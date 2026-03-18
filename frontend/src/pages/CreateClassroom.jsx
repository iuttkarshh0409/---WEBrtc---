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
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 px-3" style={{ backgroundColor: '#1C1F24', color: '#E2E8F0', fontFamily: "'Public Sans', system-ui, sans-serif" }}>
      <div className="p-4" style={{ width: '100%', maxWidth: '400px', background: '#15181C', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px' }}>
        <h6 className="mb-4 text-center fw-bold text-light d-flex align-items-center justify-content-center gap-2">
          <i className="bi bi-plus-circle text-info"></i> SESSION_CREATION
        </h6>
        
        <form onSubmit={handleCreate}>
          <div className="mb-3 text-start">
            <label className="form-label small text-secondary fw-bold mb-1">SESSION_TITLE</label>
            <input 
              type="text" 
              className="form-control form-control-sm bg-transparent border-secondary text-light shadow-none" 
              style={{ borderRadius: '2px' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CORE_MODULE_101"
              required 
            />
          </div>
          
          <div className="mb-4 text-start">
            <label className="form-label small text-secondary fw-bold mb-1">INSTRUCTOR_NAME</label>
            <input 
              type="text" 
              className="form-control form-control-sm bg-transparent border-secondary text-light shadow-none" 
              style={{ borderRadius: '2px' }}
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="Enter official identifier..."
              required 
            />
          </div>

          <button type="submit" className="btn btn-sm btn-info text-dark w-100 fw-bold py-2" style={{ borderRadius: '3px', background: '#38BDF8', border: 'none' }} disabled={loading}>
            {loading ? 'INITIALIZING...' : 'CREATE_SESSION'}
          </button>
        </form>

        <div className="text-center mt-3 pt-2" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.03)' }}>
           <a href="/dashboard" className="text-secondary small text-decoration-none" style={{ fontSize: '0.8rem' }}><i className="bi bi-chevron-left"></i> RETURN_TO_HUB</a>
        </div>
      </div>

      <style>{`
         .hover-success:hover { color: #10B981 !important; }
      `}</style>
    </div>
  );
}
