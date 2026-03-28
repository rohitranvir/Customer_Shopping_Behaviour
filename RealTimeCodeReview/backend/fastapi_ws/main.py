from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from websocket_manager import manager
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"], # React app URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/room/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Broadcast the received message to everyone else in the room
            await manager.broadcast(room_id, data, sender=websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast(room_id, {"type": "user_left"})
