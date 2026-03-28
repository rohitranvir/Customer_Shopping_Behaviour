from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        # Maps room_id to a list of active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
        
        # Notify others
        await self.broadcast(room_id, {"type": "user_joined"}, sender=websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, room_id: str, message: dict, sender: WebSocket = None):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if connection != sender:
                    try:
                        await connection.send_json(message)
                    except Exception:
                        pass # Handle stale connections if needed

manager = ConnectionManager()
