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

  const localVideoRef = useRef(null);
  const wsRef = useRef(null);
  const localPeerId = useRef(`peer_${Math.random().toString(36).substr(2, 9)}`);
  
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
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
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
             setMessages(prev => [...prev, { from: 'Peer', text: data.text }]);
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
        if (event.candidate && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            from: localPeerId.current, 
            to: peerId,
            candidate: event.candidate
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
         console.log(`Connection with ${peerId}: ${pc.connectionState}`);
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
        if (pc.remoteDescription) {
           await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(e => console.error('Error adding ice candidate', e));
        } else {
           if (!pc.iceCandidatesQueue) pc.iceCandidatesQueue = [];
           pc.iceCandidatesQueue.push(data.candidate);
        }
      }
    };

    const connectWebSocket = (currentStream) => {
      let wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
      if (wsBaseUrl.endsWith('/')) {
        wsBaseUrl = wsBaseUrl.slice(0, -1);
      }
      const wsUrl = `${wsBaseUrl}/ws/${roomId}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Connected to signaling server');
        // Announce oneself to trigger offers
        wsRef.current.send(JSON.stringify({
            type: 'peer-joined',
            from: localPeerId.current
        }));
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log("WS message:", data.type);

        if (data.from === localPeerId.current) return; // ignore self-broadcast

        if (data.type === 'peer-joined') {
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
        channel.send(JSON.stringify({ type: 'chat', text: chatInput }));
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
    <div className="classroom-container container-fluid d-flex flex-column py-4 px-4">
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
        <span className="badge bg-primary fs-6 py-2 px-3 fw-normal shadow-sm">Role: {role}</span>
      </header>

      <div className="row flex-grow-1 gy-3">
        {/* Main Video Grid */}
        <div className="col-12 col-lg-8 d-flex flex-column">
          <div className="row row-cols-1 row-cols-md-2 g-3 flex-grow-1 align-items-stretch">
            {/* Local Video */}
            <div className="col position-relative" style={{ minHeight: '300px' }}>
              <div className="bg-dark rounded-4 overflow-hidden shadow-lg h-100 position-relative border border-secondary border-opacity-25">
                <video ref={localVideoRef} autoPlay playsInline muted 
                  className="w-100 h-100 position-absolute top-0 start-0" style={{ objectFit: 'cover' }} />
                <div className="position-absolute bottom-0 start-0 m-3 bg-black bg-opacity-70 px-3 py-1 rounded-pill small border border-secondary border-opacity-25">
                  {name} (Me)
                </div>
              </div>
            </div>

            {/* Remote Videos */}
            {remoteStreams.map((item, idx) => (
              <div key={item.stream.id || idx} className="col position-relative" style={{ minHeight: '300px' }}>
                <div className="bg-dark rounded-4 overflow-hidden shadow-lg h-100 position-relative border border-secondary border-opacity-25">
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
                  <div className="position-absolute bottom-0 start-0 m-3 bg-opacity-70 bg-black px-3 py-1 rounded-pill small border border-secondary border-opacity-25">
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

          {/* Chat Panel */}
          <div className="glass-panel flex-grow-1 d-flex flex-column overflow-hidden" style={{ minHeight: '420px' }}>
            <h6 className="border-bottom border-secondary border-opacity-25 pb-3 mb-3 fw-bold">Room Chat</h6>
            
            <div className="chat-container flex-grow-1 p-2 mb-3">
              {messages.length === 0 ? (
                <div className="text-secondary opacity-50 text-center mt-5 small">Send a message to start the P2P chat.</div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`chat-bubble ${msg.from === 'Me' ? 'me' : 'peer'}`}>
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
