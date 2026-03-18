import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 px-3" style={{ backgroundColor: '#0B0D12', color: '#94A3B8', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <div className="p-4" style={{ backgroundColor: '#11141B', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '4px', width: '100%', maxWidth: '400px' }}>
         <h6 className="mb-3 text-start fw-bold text-white d-flex align-items-center gap-2 pb-2 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.04)', fontSize: '0.95rem', fontFamily: "'IBM Plex Mono', monospace" }}>
            <i className="bi bi-plus-circle-fill" style={{ color: '#06B6D4' }}></i> INITIALIZE_SESSION
         </h6>
         
         <form onSubmit={handleCreate}>
           <div className="mb-3">
             <label className="form-label text-secondary" style={{ fontSize: '0.7rem', fontFamily: "'IBM Plex Mono', monospace" }}>SESSION_TITLE</label>
             <input 
               type="text" 
               className="form-control form-control-sm border-0 border-bottom text-white px-0 bg-transparent shadow-none" 
               style={{ borderRadius: '0', borderColor: '#1E293B', fontSize: '0.85rem' }}
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               placeholder="e.g., Physics_101"
               required 
             />
           </div>
           
           <div className="mb-3">
             <label className="form-label text-secondary" style={{ fontSize: '0.7rem', fontFamily: "'IBM Plex Mono', monospace" }}>INSTRUCTOR_IDENTIFIER</label>
             <input 
               type="text" 
               className="form-control form-control-sm border-0 border-bottom text-white px-0 bg-transparent shadow-none" 
               style={{ borderRadius: '0', borderColor: '#1E293B', fontSize: '0.85rem' }}
               value={teacherName}
               onChange={(e) => setTeacherName(e.target.value)}
               placeholder="e.g., Prof._ABC"
               required 
             />
           </div>

           <button type="submit" className="btn btn-sm w-100 text-white fw-bold d-flex align-items-center justify-content-center gap-1 mt-4" style={{ backgroundColor: '#0891B2', border: '1px solid #06B6D4', borderRadius: '4px', fontSize: '0.85rem' }} disabled={loading}>
             {loading ? (
                <div className="d-flex align-items-center justify-content-center gap-2">
                   <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px' }}></span> DEPLOYING_...
                </div>
             ) : 'MOUNT_SESSION_NODE'}
           </button>
         </form>

         <div className="text-center mt-3 pt-2 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.03)' }}>
            <Link to="/dashboard" className="text-secondary small text-decoration-none" style={{ fontSize: '0.75rem', fontFamily: "'IBM Plex Mono', monospace" }}>
               <i className="bi bi-arrow-left"></i> BACK_TO_CONSOLE
            </Link>
         </div>
      </div>
    </div>
  );
}
