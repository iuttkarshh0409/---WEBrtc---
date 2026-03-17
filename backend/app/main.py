from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes.rooms import router as rooms_router
from .routes.attendance import router as attendance_router
from .websocket.signaling import manager
import json

# Create the DB tables (Usually done with Alembic, but Base.metadata is fine for MVP)
from sqlalchemy import text
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE rooms ADD COLUMN title VARCHAR"))
        conn.execute(text("ALTER TABLE rooms ADD COLUMN teacher_name VARCHAR"))
        conn.execute(text("ALTER TABLE rooms ADD COLUMN is_active BOOLEAN DEFAULT 1"))
        conn.commit()
    except Exception as e:
        print("Migration skipped or already applied:", e)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="WebRTC Collaboration Platform")

# Allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST Routes
app.include_router(rooms_router)
app.include_router(attendance_router)

@app.get("/")
def home():
    return {"message": "Welcome to WebRTC Collaboration MVP Backend Target"}

# WebSocket Endpoint for Signaling
@app.websocket("/ws/{room_id}")
async def websocket_signaling(websocket: WebSocket, room_id: str):
    peer_id = websocket.query_params.get("peer_id")
    await manager.connect(websocket, room_id, peer_id)
    try:
        while True:
            data = await websocket.receive_text()
            
            # Print violation logs if present
            try:
                msg = json.loads(data)
                if msg.get("type") == "violation":
                    print(f"Violation from {msg.get('name')}: {msg.get('reason')}")
            except Exception:
                pass # Safe malformed JSON buffering

            await manager.broadcast(room_id, data, exclude=websocket)

    except WebSocketDisconnect:
        removed_peer = manager.disconnect(websocket, room_id)
        # Notify remaining peers that someone disconnected with peer identity!
        await manager.broadcast(room_id, json.dumps({
            "type": "peer-disconnected",
            "from": removed_peer,
            "message": "A peer disconnected."
        }))
