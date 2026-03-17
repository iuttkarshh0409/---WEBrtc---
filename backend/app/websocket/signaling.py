import json
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps room_id to a dict of { peer_id: WebSocket }
        self.active_connections: dict[str, dict[str, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, peer_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
        self.active_connections[room_id][peer_id] = websocket
        
        # Notify others with identification parameters
        await self.broadcast(room_id, json.dumps({
            "type": "peer-joined",
            "from": peer_id,
            "message": "A new peer connected to the room."
        }), exclude=websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            peer_to_remove = None
            for pid, ws in self.active_connections[room_id].items():
                if ws == websocket:
                    peer_to_remove = pid
                    break
            
            if peer_to_remove:
                del self.active_connections[room_id][peer_to_remove]
                
                # Clean up empty rooms
                if not self.active_connections[room_id]:
                    del self.active_connections[room_id]
                
                return peer_to_remove # Return so main.py can broadcast it node!
        return None

    async def broadcast(self, room_id: str, message: str, exclude: WebSocket = None):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id].values():
                if connection != exclude:
                    await connection.send_text(message)

manager = ConnectionManager()
