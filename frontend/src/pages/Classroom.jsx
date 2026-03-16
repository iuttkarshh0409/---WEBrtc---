import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

export default function Classroom() {
  const { roomId } = useParams();
  const searchParams = new URLSearchParams(useLocation().search);
  const role = searchParams.get('role');
  const name = searchParams.get('name') || 'Anonymous';
  const navigate = useNavigate();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [participants, setParticipants] = useState([name]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef(null);
  const wsRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const dataChannelsRef = useRef({});

  // STUN/TURN servers
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    let stream;
    
    // Abstracting functions out to prevent closure stale state, using Refs heavily
    const setupDataChannel = (channel, peerId) => {
      dataChannelsRef.current[peerId] = channel;
      channel.onopen = () => console.log('Data channel open for', peerId);
      channel.onmessage = (event) => {
        setMessages(prev => [...prev, { from: `Peer`, text: event.data }]);
      };
    };

    const createPeerConnection = (peerId, currentStream) => {
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnectionsRef.current[peerId] = pc;

      if (currentStream) {
        currentStream.getTracks().forEach(track => pc.addTrack(track, currentStream));
      }

      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            from: 'me', 
            to: peerId,
            candidate: event.candidate
          }));
        }
      };

      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setRemoteStreams(prev => {
          if (prev.some(s => s.id === remoteStream.id)) return prev;
          return [...prev, remoteStream];
        });
        setParticipants(prev => {
          const newParticipant = `Participant ${peerId.slice(-4)}`;
          return prev.includes(newParticipant) ? prev : [...prev, newParticipant];
        });
      };

      const dataChannel = pc.createDataChannel('chat');
      setupDataChannel(dataChannel, peerId);
      
      pc.ondatachannel = (event) => {
        setupDataChannel(event.channel, peerId);
      };

      return pc;
    };

    const createOffer = async (peerId, currentStream) => {
      const pc = createPeerConnection(peerId, currentStream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      wsRef.current.send(JSON.stringify({
        type: 'offer',
        from: 'me',
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
        from: 'me',
        to: peerId,
        answer: answer
      }));
    };

    const handleAnswer = async (data) => {
      const pc = Object.values(peerConnectionsRef.current).find(p => p.signalingState === 'have-local-offer');
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    };

    const handleIceCandidate = async (data) => {
      for (const pc of Object.values(peerConnectionsRef.current)) {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(e => console.error('Error adding ice candidate', e));
        }
      }
    };

    const connectWebSocket = (currentStream) => {
      const wsUrl = `ws://localhost:8000/ws/${roomId}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Connected to signaling server');
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log("WS message:", data.type);

        if (data.type === 'peer-joined') {
          const randomPeerId = `peer_${Date.now()}`;
          await createOffer(randomPeerId, currentStream);
        } 
        else if (data.type === 'offer') {
          await handleOffer(data, currentStream);
        } 
        else if (data.type === 'answer') {
          await handleAnswer(data);
        } 
        else if (data.type === 'ice-candidate') {
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
        channel.send(chatInput);
      }
    });

    setMessages(prev => [...prev, { from: 'Me', text: chatInput }]);
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
    <div className="container-fluid min-vh-100 d-flex flex-column py-3" style={{ background: '#121212', color: '#ffffff' }}>
      <header className="d-flex justify-content-between align-items-center mb-4 px-3">
        <h3 className="m-0 fw-bold text-light">Classroom <span className="text-secondary fs-5 fw-normal">#{roomId}</span></h3>
        <div>
          <span className="badge bg-primary fs-6 py-2 px-3 fw-normal shadow-sm">Role: {role}</span>
        </div>
      </header>

      <div className="row flex-grow-1 gy-3 px-3">
        {/* Main Video Area */}
        <div className="col-12 col-lg-8 d-flex flex-column gap-3">
          <div className="row row-cols-1 row-cols-md-2 g-3 flex-grow-1">
            {/* Local Video */}
            <div className="col h-100 position-relative">
              <div className="bg-dark rounded-4 overflow-hidden shadow h-100 position-relative border border-secondary" style={{ minHeight: '300px' }}>
                <video ref={localVideoRef} autoPlay playsInline muted 
                  className="w-100 h-100 position-absolute top-0 start-0" style={{ objectFit: 'cover' }} />
                <div className="position-absolute bottom-0 start-0 m-3 bg-black bg-opacity-75 px-3 py-1 rounded-pill small">
                  {name} (Me)
                </div>
              </div>
            </div>

            {/* Remote Videos */}
            {remoteStreams.map((stream, idx) => (
              <div key={stream.id || idx} className="col h-100 position-relative">
                <div className="bg-dark rounded-4 overflow-hidden shadow h-100 position-relative border border-secondary" style={{ minHeight: '300px' }}>
                  <video 
                    autoPlay 
                    playsInline 
                    className="w-100 h-100 position-absolute top-0 start-0" 
                    style={{ objectFit: 'cover' }}
                    ref={video => {
                      if (video && video.srcObject !== stream) {
                        video.srcObject = stream;
                      }
                    }}
                  />
                  <div className="position-absolute bottom-0 start-0 m-3 bg-black bg-opacity-75 px-3 py-1 rounded-pill small">
                    Remote Participant
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="bg-dark p-3 rounded-4 d-flex justify-content-center flex-wrap gap-3 border border-secondary shadow">
            <button onClick={toggleAudio} className={`btn rounded-pill px-4 ${audioMuted ? 'btn-danger' : 'btn-secondary'}`}>
              <i className={audioMuted ? 'bi bi-mic-mute-fill' : 'bi bi-mic-fill'}></i> {audioMuted ? 'Unmute' : 'Mute'}
            </button>
            <button onClick={toggleVideo} className={`btn rounded-pill px-4 ${videoMuted ? 'btn-danger' : 'btn-secondary'}`}>
              <i className={videoMuted ? 'bi bi-camera-video-off-fill' : 'bi bi-camera-video-fill'}></i> {videoMuted ? 'Start Video' : 'Stop Video'}
            </button>
            {role === 'teacher' && (
              <button onClick={toggleScreenShare} className={`btn rounded-pill px-4 ${isScreenSharing ? 'btn-success' : 'btn-primary'}`}>
                <i className="bi bi-display"></i> {isScreenSharing ? 'Stop Sharing' : 'Screen Share'}
              </button>
            )}
            <button onClick={() => navigate('/')} className="btn rounded-pill px-4 btn-outline-danger ms-auto">
              Leave Room
            </button>
          </div>
        </div>

        {/* Sidebar: Chat & Participants */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-3">
          {/* Participants */}
          <div className="bg-dark rounded-4 p-4 flex-shrink-0 border border-secondary shadow">
            <h5 className="border-bottom border-secondary pb-3 mb-3 fw-bold">People ({participants.length})</h5>
            <ul className="list-unstyled m-0 text-light" style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {participants.map((p, i) => (
                <li key={i} className="py-2 d-flex align-items-center">
                  <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '30px', height: '30px' }}>
                    <i className="bi bi-person-fill text-light"></i>
                  </div>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Chat Panel */}
          <div className="bg-dark rounded-4 p-3 flex-grow-1 d-flex flex-column border border-secondary shadow overflow-hidden" style={{ minHeight: '400px' }}>
            <h5 className="border-bottom border-secondary pb-3 mb-3 px-2 fw-bold">Room Chat</h5>
            
            <div className="flex-grow-1 overflow-auto rounded p-2 mb-3 px-2">
              {messages.length === 0 ? (
                <div className="text-muted text-center mt-5 small">Send a message to start the chat.</div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`mb-3 d-flex flex-column ${msg.from === 'Me' ? 'align-items-end' : 'align-items-start'}`}>
                    <small className="text-secondary mb-1" style={{ fontSize: '0.75rem' }}>{msg.from}</small>
                    <div className={`py-2 px-3 rounded-4 ${msg.from === 'Me' ? 'bg-primary text-light' : 'bg-secondary text-light'}`} style={{ maxWidth: '85%', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="d-flex gap-2 mt-auto p-2 bg-black bg-opacity-25 rounded-pill">
              <input 
                type="text" 
                className="form-control bg-transparent text-light border-0 shadow-none px-3" 
                placeholder="Type your message..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary rounded-pill px-4">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
