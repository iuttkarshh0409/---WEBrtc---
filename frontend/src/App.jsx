import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateClassroom from './pages/CreateClassroom';
import JoinClassroom from './pages/JoinClassroom';
import Classroom from './pages/Classroom';
import Landing from './pages/Landing';

function App() {
  return (
    <Router>
      <div className="App text-light min-vh-100" style={{ backgroundColor: '#121212' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateClassroom />} />
          <Route path="/join" element={<JoinClassroom />} />
          <Route path="/room/:roomId" element={<Classroom />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
