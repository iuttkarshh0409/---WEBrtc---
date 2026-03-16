import json
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps room_id to a list of connected WebSockets
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
        
        # Notify others that a new peer has joined
        # This will instruct the clients to create a new peer connection if needed
        await self.broadcast(room_id, json.dumps({
            "type": "peer-joined",
            "message": "A new peer connected to the room."
        }), exclude=websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            
            # Clean up empty rooms
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, room_id: str, message: str, exclude: WebSocket = None):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if connection != exclude:
                    await connection.send_text(message)

manager = ConnectionManager()
