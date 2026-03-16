# Remote Learning WebRTC Platform (MVP)

A real-time video collaboration platform built for a hackathon. It features virtual classrooms using a FastAPI WebSocket signaling backend and Native WebRTC on a React frontend.

## Features
- **Create Classroom**: Teachers can create a room and get a unique Room ID.
- **Join Classroom**: Students can join using the Room ID.
- **Real-time Video/Audio**: P2P communication via WebRTC.
- **Chat**: P2P messaging via RTCDataChannel.
- **Screen Share**: Replace camera stream with screen sharing.
- **Mute/Video Controls**: Toggle audio and video dynamically.

## Prerequisites
- Node.js (v18+)
- Python 3.9+

## 1. Running the Backend

Open a terminal and navigate to the project root:

```bash
cd backend
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend API and WebSocket Signaling will be available at `ws://localhost:8000/ws/{room_id}` and `http://localhost:8000`.

## 2. Running the Frontend

Open a second terminal and navigate to the project root:

```bash
cd frontend
npm install
npm run dev
```

Your React app should open at `http://localhost:5173`. 
