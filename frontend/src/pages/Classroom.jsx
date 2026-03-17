import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './Classroom.css';

export default function Classroom() {
  const { roomId } = useParams();
  const searchParams = new URLSearchParams(useLocation().search);
  const role = searchParams.get('role');
  const name = searchParams.get('name') || 'Anonymous';
  const navigate = useNavigate();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]); // [{ peerId, stream, name }]
  const [participants, setParticipants] = useState([name]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [requests, setRequests] = useState([]); // Knock requests container
  const [admissionStatus, setAdmissionStatus] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violations, setViolations] = useState(0);
  const [violatingPeers, setViolatingPeers] = useState({}); // { peerId: { count: 3, name: "Name" } }
  const [showViolationsModal, setShowViolationsModal] = useState(false);


  const localVideoRef = useRef(null);
  const wsRef = useRef(null);
  const localPeerId = useRef(`peer_${Math.random().toString(36).substr(2, 9)}`);

  const handleApprove = (req) => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'allow-join',
        from: localPeerId.current,
        to: req.from,
        approved: true
      }));
    }
    setRequests(prev => prev.filter(r => r.from !== req.from));
  };

  const handleReject = (req) => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'allow-join',
        from: localPeerId.current,
        to: req.from,
        approved: false
      }));
    }
    setRequests(prev => prev.filter(r => r.from !== req.from));
  };

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error("Fullscreen Error:", err));
    }
  };

  useEffect(() => {
    if (role === 'student' && admissionStatus === 'approved') {
      enterFullscreen();

      const handleFullscreenChange = () => {
        const isCurrentlyFull = document.fullscreenElement !== null;
        setIsFullscreen(isCurrentlyFull);
        if (!isCurrentlyFull) {
           alert("⚠️ Please stay in Fullscreen during the session to avoid warnings!");
        }
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }
  }, [role, admissionStatus]);

  const handleViolation = (reason) => {
    console.warn(`Violation detected: ${reason}`);
    setViolations(prev => {
       const next = prev + 1;
       Object.values(dataChannelsRef.current).forEach(channel => {
          if (channel.readyState === 'open') {
             channel.send(JSON.stringify({ type: 'violation-update', count: next, reason }));
          }
       });
       return next;
    });

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const payload = {
            type: "violation",
            name: name,
            peerId: localPeerId.current,
            reason: reason,
            timestamp: new Date().toISOString()
        };
        console.log("Sending violation via WebSocket:", payload);
        wsRef.current.send(JSON.stringify(payload));
    } else {
        console.log("WebSocket is not available for violation broadcast.");
    }

    alert(`⚠️ Warning: ${reason} is not allowed during the session!`);
  };

  useEffect(() => {
    if (role === 'student' && admissionStatus === 'approved') {
      const handleVisibilityChange = () => {
        if (document.hidden) {
           handleViolation("Tab switched / Minimized");
        }
      };

      const handleBlur = () => {
         handleViolation("Window focus lost");
      };

      const handleFocus = () => {
         console.log("User returned to window");
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleBlur);
      window.addEventListener('focus', handleFocus);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleBlur);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [role, admissionStatus]);
  
  const handleCopy = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const peerConnectionsRef = useRef({});
  const dataChannelsRef = useRef({});

  // STUN/TURN servers
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelay',
        credential: 'openrelay'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelay',
        credential: 'openrelay'
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelay',
        credential: 'openrelay'
      }
    ]
  };

  useEffect(() => {
    const handleUnload = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
         wsRef.current.send(JSON.stringify({
            type: 'peer-disconnected',
            from: localPeerId.current
         }));
      }
    };
    window.addEventListener('beforeunload', handleUnload);

    let stream;
    
    // Abstracting functions out to prevent closure stale state, using Refs heavily
    const setupDataChannel = (channel, peerId) => {
      dataChannelsRef.current[peerId] = channel;
      
      channel.onopen = () => {
        console.log('Data channel open for', peerId);
        channel.send(JSON.stringify({ type: 'name-metadata', name: name }));
      };

      channel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'name-metadata') {
             setRemoteStreams(prev => prev.map(item => 
               item.peerId === peerId ? { ...item, name: data.name } : item
             ));
             setParticipants(prev => {
                const genericName = `Participant ${peerId.slice(-4)}`;
                const otherNames = prev.filter(p => p !== genericName && p !== name);
                if (!otherNames.includes(data.name)) {
                   return [name, ...otherNames, data.name].sort();
                }
                return prev;
             });
          } else if (data.type === 'chat') {
             setMessages(prev => [...prev, { from: data.sender || 'Peer', text: data.text }]);
          } else if (data.type === 'violation-update') {
             if (role === 'teacher') {
                 setRemoteStreams(streams => {
                     const item = streams.find(s => s.peerId === peerId);
                     const studentName = item ? item.name : `Participant ${peerId.slice(-4)}`;
                     setViolatingPeers(prev => ({
                         ...prev,
                         [peerId]: { count: data.count, name: studentName, lastReason: data.reason }
                     }));
                     return streams;
                 });
             }
          }
        } catch (e) {
          setMessages(prev => [...prev, { from: 'Peer', text: event.data }]);
        }
      };
    };

    const createPeerConnection = (peerId, currentStream) => {
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnectionsRef.current[peerId] = pc;

      if (currentStream) {
        currentStream.getTracks().forEach(track => pc.addTrack(track, currentStream));
      }

      pc.onicecandidate = (event) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            from: localPeerId.current, 
            to: peerId,
            candidate: event.candidate // can send null to signal completion
          }));
        }
      };

      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setRemoteStreams(prev => {
          if (prev.some(s => s.peerId === peerId)) return prev;
          return [...prev, { peerId, stream: remoteStream, name: `Participant ${peerId.slice(-4)}` }];
        });
        setParticipants(prev => {
          const newParticipant = `Participant ${peerId.slice(-4)}`;
          if (prev.includes(newParticipant) || prev.includes(name)) return prev;
          return [...prev, newParticipant].sort();
        });
      };

      const dataChannel = pc.createDataChannel('chat');
      setupDataChannel(dataChannel, peerId);
      
      pc.ondatachannel = (event) => {
        setupDataChannel(event.channel, peerId);
      };

      pc.onconnectionstatechange = () => {
         console.log(`[RTCPeer] ${peerId} Connection: ${pc.connectionState}`);
         
         if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) {
             setRemoteStreams(prev => {
                 // extract displayed name to purge from participants list
                 const item = prev.find(s => s.peerId === peerId);
                 if (item) {
                     setParticipants(p => p.filter(name => name !== item.name));
                 }
                 return prev.filter(s => s.peerId !== peerId);
             });

             if (peerConnectionsRef.current[peerId]) {
                 peerConnectionsRef.current[peerId].close();
                 delete peerConnectionsRef.current[peerId];
             }
             if (dataChannelsRef.current[peerId]) {
                 delete dataChannelsRef.current[peerId];
             }
         }
      };

      pc.oniceconnectionstatechange = () => {
         console.log(`[RTCPeer] ${peerId} ICE: ${pc.iceConnectionState}`);
      };

      pc.onsignalingstatechange = () => {
         console.log(`[RTCPeer] ${peerId} Signaling: ${pc.signalingState}`);
      };

      return pc;
    };

    const createOffer = async (peerId, currentStream) => {
      const pc = createPeerConnection(peerId, currentStream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      wsRef.current.send(JSON.stringify({
        type: 'offer',
        from: localPeerId.current,
        to: peerId,
        offer: offer
      }));
    };

    const handleOffer = async (data, currentStream) => {
      const peerId = data.from; 
      const pc = createPeerConnection(peerId, currentStream);
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      wsRef.current.send(JSON.stringify({
        type: 'answer',
        from: localPeerId.current,
        to: peerId,
        answer: answer
      }));

      // Flush queued candidates received early
      if (pc.iceCandidatesQueue) {
         for (const cand of pc.iceCandidatesQueue) {
            await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(e => console.error('Queued ICE failed:', e));
         }
         pc.iceCandidatesQueue = [];
      }
    };

    const handleAnswer = async (data) => {
      const pc = peerConnectionsRef.current[data.from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        
        // Flush queued candidates received early
        if (pc.iceCandidatesQueue) {
           for (const cand of pc.iceCandidatesQueue) {
              await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(e => console.error('Queued ICE failed:', e));
           }
           pc.iceCandidatesQueue = [];
        }
      }
    };

    const handleIceCandidate = async (data) => {
      const pc = peerConnectionsRef.current[data.from];
      if (pc) {
        if (data.candidate) {
           if (pc.remoteDescription) {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(e => console.error('Error adding ice candidate', e));
           } else {
              if (!pc.iceCandidatesQueue) pc.iceCandidatesQueue = [];
              pc.iceCandidatesQueue.push(data.candidate);
           }
        } else {
           // End-of-candidates signal
           if (pc.remoteDescription) {
              await pc.addIceCandidate(null).catch(e => console.error('Error adding null candidate', e));
           }
        }
      }
    };

    const connectWebSocket = (currentStream) => {
      let wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
      if (wsBaseUrl.endsWith('/')) {
        wsBaseUrl = wsBaseUrl.slice(0, -1);
      }
      const wsUrl = `${wsBaseUrl}/ws/${roomId}?peer_id=${localPeerId.current}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Connected to signaling server');
        const isAlreadyApproved = sessionStorage.getItem(`approved_${roomId}`) === 'true';

        if (role === 'teacher' || isAlreadyApproved) {
            setAdmissionStatus('approved');
            wsRef.current.send(JSON.stringify({
                type: 'peer-joined',
                from: localPeerId.current
            }));
        } else {
            wsRef.current.send(JSON.stringify({
                type: 'request-join',
                from: localPeerId.current,
                name: name
            }));
        }
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log("WS message:", data.type);

        if (data.from === localPeerId.current) return; // ignore self-broadcast

        if (data.type === 'request-join') {
          if (role === 'teacher') {
             setRequests(prev => [...prev, { from: data.from, name: data.name }]);
          }
        } 
        else if (data.type === 'allow-join' && data.to === localPeerId.current) {
          if (data.approved) {
              console.log("Admission Approved! Joining P2P stream...");
              setAdmissionStatus('approved');
              sessionStorage.setItem(`approved_${roomId}`, 'true'); // cache approval
              wsRef.current.send(JSON.stringify({
                 type: 'peer-joined',
                 from: localPeerId.current
              }));
          } else {
              setAdmissionStatus('rejected');
          }
        }
        else if (data.type === 'peer-disconnected') {
          console.log(`[RTCPeer] ${data.from} disconnected instantly`);
          setRemoteStreams(prev => {
             const item = prev.find(s => s.peerId === data.from);
             if (item) {
                 setParticipants(p => p.filter(name => name !== item.name));
             }
             return prev.filter(s => s.peerId !== data.from);
          });
          if (peerConnectionsRef.current[data.from]) {
             peerConnectionsRef.current[data.from].close();
             delete peerConnectionsRef.current[data.from];
          }
        }
        else if (data.type === 'violation') {
           console.log("WebSocket violation received:", data);
           if (role === 'teacher') {
               setViolatingPeers(prev => ({
                   ...prev,
                   [data.peerId]: {
                       name: data.name,
                       count: (prev[data.peerId]?.count || 0) + 1,
                       lastReason: data.reason
                   }
               }));
           }
        }
        else if (data.type === 'peer-joined') {
          await createOffer(data.from, currentStream);
        } 
        else if (data.type === 'offer' && data.to === localPeerId.current) {
          await handleOffer(data, currentStream);
        } 
        else if (data.type === 'answer' && data.to === localPeerId.current) {
          await handleAnswer(data);
        } 
        else if (data.type === 'ice-candidate' && data.to === localPeerId.current) {
          await handleIceCandidate(data);
        }
        else if (data.type === 'peer-disconnected') {
          console.log("Peer disconnected");
        }
      };
    };

    const initMedia = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        connectWebSocket(stream);
      } catch (err) {
        console.error("Failed to access media devices.", err);
        connectWebSocket(null);
      }
    };
    
    initMedia();

    return () => {
      if (wsRef.current) wsRef.current.close();
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
      peerConnectionsRef.current = {};
      window.removeEventListener('beforeunload', handleUnload);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomId]);


  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // Send to all connected data channels
    Object.values(dataChannelsRef.current).forEach(channel => {
      if (channel.readyState === 'open') {
        channel.send(JSON.stringify({ type: 'chat', text: chatInput, sender: name }));
      }
    });

    setMessages(prev => [...prev, { from: name, text: chatInput }]);
    setChatInput('');
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = audioMuted;
        setAudioMuted(!audioMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = videoMuted;
        setVideoMuted(!videoMuted);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        Object.values(peerConnectionsRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        screenTrack.onended = () => stopScreenShare();
        setIsScreenSharing(true);
      } catch (e) {
        console.error("Screen sharing failed", e);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    Object.values(peerConnectionsRef.current).forEach(pc => {
      const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender && videoTrack) sender.replaceTrack(videoTrack);
    });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    setIsScreenSharing(false);
  };

  return (
    <div className="classroom-container container-fluid d-flex flex-column py-4 px-4 position-relative">
      
      {/* Knock Requests Notification */}
      {requests.length > 0 && (
         <div className="position-fixed top-0 start-50 translate-middle-x mt-3 d-flex flex-column gap-2" style={{ zIndex: 2000 }}>
            {requests.map((req, index) => (
               <div key={index} className="glass-panel p-3 d-flex align-items-center gap-3 shadow-lg" style={{ width: '400px', background: 'rgba(15,20,28,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                  <div className="flex-grow-1 text-start">
                     <span className="fw-bold">{req.name}</span> <span className="text-secondary small">wants to join</span>
                  </div>
                  <div className="d-flex gap-2">
                     <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => handleReject(req)}>Deny</button>
                     <button className="btn btn-sm btn-primary rounded-pill px-3" onClick={() => handleApprove(req)}>Admit</button>
                  </div>
               </div>
            ))}
         </div>
      )}

      {/* Student Admission Loading Overlay / Rejection Banner */}
      {role === 'student' && admissionStatus === 'pending' && (
         <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ zIndex: 1999, backgroundColor: '#0A0C10' }}>
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
            <h4 className="fw-bold">Waiting for instructor approval...</h4>
            <p className="text-secondary small">Please stay on this page. You will join automatically once admitted.</p>
         </div>
      )}

      {role === 'student' && admissionStatus === 'rejected' && (
         <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ zIndex: 1999, backgroundColor: '#0A0C10' }}>
            <div className="bg-danger bg-opacity-10 p-4 rounded-4 border border-danger border-opacity-25 text-center" style={{ maxWidth: '400px' }}>
               <i className="bi bi-x-circle-fill text-danger fs-3 mb-2"></i>
               <h5 className="text-danger fw-bold">Admission Denied</h5>
               <p className="text-secondary small">The instructor of this classroom has rejected your request to join.</p>
               <button className="btn btn-sm btn-outline-secondary mt-2 rounded-pill px-3" onClick={() => navigate('/')}>Dashboard</button>
            </div>
         </div>
      )}

      {/* Teacher Monitoring Violations Modal */}
      {role === 'teacher' && showViolationsModal && (
        <div className="modal-backdrop d-flex align-items-center justify-content-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.75)', zIndex: 2050 }}>
           <div className="bg-dark p-4 rounded-4 border border-secondary" style={{ width: '90%', maxWidth: '420px', backgroundColor: '#11131A' }}>
              <h5 className="mb-3 text-start fw-bold">Monitoring Violations</h5>
              
              <div className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                 {Object.values(violatingPeers).length === 0 ? (
                    <div className="text-secondary opacity-50 small text-center">No student violations on air yet.</div>
                 ) : (
                    Object.values(violatingPeers).map((v, i) => (
                       <div key={i} className="list-group-item bg-transparent text-white border-secondary border-opacity-25 d-flex justify-content-between align-items-center px-0">
                           <div className="text-start">
                              <span className="fw-bold">{v.name}</span>
                           </div>
                           <span className="badge bg-danger rounded-pill px-2">{v.count} Warnings</span>
                       </div>
                    ))
                 )}
              </div>

              <div className="d-flex justify-content-end mt-4">
                 <button className="btn btn-sm btn-outline-secondary px-3 rounded-pill" onClick={() => setShowViolationsModal(false)}>Close</button>
              </div>
           </div>
        </div>
      )}

      <header className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="m-0 fw-bold d-flex align-items-center">
          <span>Classroom</span>
          <span className="text-secondary fs-6 fw-normal ms-2 bg-black bg-opacity-30 px-2 py-1 rounded border border-secondary shadow-sm">
            #{roomId}
          </span>
          <button 
            className={`btn btn-sm ms-1 border-0 ${copied ? 'text-success' : 'text-secondary'}`}
            style={{ background: 'transparent', transition: 'color 0.2s' }}
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy Room ID'}
          >
            <i className={`bi ${copied ? 'bi-check-circle-fill' : 'bi-clipboard'}`}></i>
          </button>
        </h3>
        <div className="d-flex align-items-center">
            <span className="badge bg-primary fs-6 py-2 px-3 fw-normal shadow-sm">Role: {role}</span>
            {role === 'student' && (
              <span className={`badge ${isFullscreen ? 'bg-success' : 'bg-warning text-dark'} fs-6 py-2 px-3 fw-normal shadow-sm ms-2`} style={{ transition: 'all 0.2s' }}>
                <i className={`bi bi-fullscreen me-1 ${isFullscreen ? '' : 'text-danger'}`}></i> Fullscreen: {isFullscreen ? 'ON' : 'OFF'}
              </span>
            )}
            {role === 'teacher' && Object.keys(violatingPeers).length > 0 && (
              <button className="btn btn-sm btn-danger fs-6 py-2 px-3 fw-normal shadow-sm ms-2" style={{ transition: 'all 0.2s', borderRadius: '12px' }} onClick={() => setShowViolationsModal(true)}>
                <i className="bi bi-exclamation-octagon-fill me-1"></i> Violations Dashboard
              </button>
            )}
        </div>
      </header>

      <div className="row flex-grow-1 gy-3">
        {/* Main Video Grid */}
        <div className="col-12 col-lg-8 d-flex flex-column">
          <div className={`row g-3 flex-grow-1 align-items-stretch ${remoteStreams.length === 0 ? 'row-cols-1 justify-content-center' : 'row-cols-1 row-cols-md-2'}`}>
            {/* Local Video */}
            <div className="col position-relative" style={{ minHeight: '320px', maxWidth: remoteStreams.length === 0 ? '640px' : 'none', margin: remoteStreams.length === 0 ? '0 auto' : '0' }}>
              <div className="video-card">
                <video ref={localVideoRef} autoPlay playsInline muted 
                  className="w-100 h-100 position-absolute top-0 start-0" style={{ objectFit: 'cover' }} />
                <div className="video-label">
                  <div className="bg-success rounded-circle me-1" style={{ width: '8px', height: '8px' }}></div>
                  {name} (Me)
                </div>
              </div>
            </div>

            {/* Remote Videos */}
            {remoteStreams.map((item, idx) => (
              <div key={item.stream.id || idx} className="col position-relative" style={{ minHeight: '320px' }}>
                <div className="video-card">
                  <video 
                    autoPlay 
                    playsInline 
                    className="w-100 h-100 position-absolute top-0 start-0" 
                    style={{ objectFit: 'cover' }}
                    ref={video => {
                      if (video && video.srcObject !== item.stream) {
                        video.srcObject = item.stream;
                      }
                    }}
                  />
                  <div className="video-label">
                    <div className="bg-primary rounded-circle me-1" style={{ width: '8px', height: '8px' }}></div>
                    {item.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-3">
          {/* Participants */}
          <div className="glass-panel">
            <h6 className="border-bottom border-secondary border-opacity-25 pb-3 mb-3 fw-bold">People ({participants.length})</h6>
            <ul className="list-unstyled m-0" style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {participants.map((p, i) => (
                <li key={i} className="py-2 d-flex align-items-center gap-2">
                  <div className="bg-secondary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                    <i className="bi bi-person text-light"></i>
                  </div>
                  <span className="small">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Teacher Monitoring Panel */}
          {role === 'teacher' && (
            <div className="glass-panel d-flex flex-column" style={{ maxHeight: '220px', overflow: 'hidden' }}>
               <h6 className="border-bottom border-secondary border-opacity-25 pb-3 mb-3 fw-bold text-danger d-flex align-items-center">
                 <i className="bi bi-eye-fill me-2"></i> Student Monitoring Panel
               </h6>
               {Object.keys(violatingPeers).length === 0 ? (
                  <div className="text-secondary opacity-50 small text-center my-3">No violations recorded yet.</div>
               ) : (
                  <div className="table-responsive flex-grow-1" style={{ overflowY: 'auto' }}>
                    <table className="table table-dark table-sm table-borderless m-0 small">
                       <thead>
                         <tr className="text-secondary" style={{ fontSize: '0.75rem' }}>
                           <th className="px-2">Name</th>
                           <th className="text-center">Count</th>
                           <th>Last Reason</th>
                         </tr>
                       </thead>
                       <tbody>
                          {Object.values(violatingPeers).map((v, i) => {
                             const isHigh = v.count > 2;
                             return (
                               <tr key={i} className={isHigh ? 'text-danger fw-bold' : 'text-white-50'} style={{ transition: 'color 0.2s' }}>
                                  <td className="px-2">{v.name}</td>
                                  <td className="text-center">
                                     <span className={`badge ${isHigh ? 'bg-danger' : 'bg-secondary'} rounded-pill`} style={{ fontSize: '0.65rem' }}>{v.count}</span>
                                  </td>
                                  <td className="text-truncate text-secondary" style={{ maxWidth: '80px', fontSize: '0.70rem' }} title={v.lastReason}>{v.lastReason || 'N/A'}</td>
                               </tr>
                             );
                          })}
                       </tbody>
                    </table>
                  </div>
               )}
            </div>
          )}

          {/* Chat Panel */}
          <div className="glass-panel flex-grow-1 d-flex flex-column overflow-hidden" style={{ minHeight: '420px' }}>
            <h6 className="border-bottom border-secondary border-opacity-25 pb-3 mb-3 fw-bold">Room Chat</h6>
            
            <div className="chat-container flex-grow-1 p-2 mb-3">
              {messages.length === 0 ? (
                <div className="text-secondary opacity-50 text-center mt-5 small">Send a message to start the P2P chat.</div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`chat-bubble ${msg.from === name ? 'me' : 'peer'}`}>
                    <small className="d-block opacity-75 mb-1" style={{ fontSize: '0.70rem' }}>{msg.from}</small>
                    <div>{msg.text}</div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="d-flex gap-2 chat-input-bar p-2 mt-auto">
              <input 
                type="text" 
                className="form-control bg-transparent text-light border-0 shadow-none px-3" 
                placeholder="Type your message..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary rounded-3 px-3">Send</button>
            </form>
          </div>
        </div>
      </div>

      {/* Floating Controls Bar */}
      <div className="controls-bar">
        <button onClick={toggleAudio} className={`control-btn ${audioMuted ? 'active' : ''}`} title="Mute/Unmute">
          <i className={`bi ${audioMuted ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`}></i>
        </button>
        <button onClick={toggleVideo} className={`control-btn ${videoMuted ? 'active' : ''}`} title="Camera On/Off">
          <i className={`bi ${videoMuted ? 'bi-camera-video-off-fill' : 'bi-camera-video-fill'}`}></i>
        </button>
        {role === 'teacher' && (
          <button onClick={toggleScreenShare} className={`control-btn`} title="Screen Share">
            <i className="bi bi-display"></i>
          </button>
        )}
        <div className="vr ms-2" style={{ opacity: 0.1, height: '24px' }}></div>
        <button onClick={() => navigate('/')} className="control-btn control-btn-danger">
          Leave Room
        </button>
      </div>
    </div>
  );
}
