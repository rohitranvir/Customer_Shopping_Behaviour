import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
    const { user, logout } = useContext(AuthContext);
    const [rooms, setRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Since we don't have a list endpoint yet, let's just make it simple.
        // This would fetch user's rooms from a real endpoint.
    }, []);

    const createRoom = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('rooms/create/', { name: newRoomName });
            navigate(`/room/${res.data.id}`);
        } catch (err) {
            console.error(err);
        }
    };

    const joinRoom = async (roomId) => {
        try {
            await api.post(`rooms/${roomId}/join/`);
            navigate(`/room/${roomId}`);
        } catch (err) {
            console.error(err);
            // If already joined or other error, still navigate
            navigate(`/room/${roomId}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-bold text-blue-500">CodeReview Platform</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-400">Welcome, {user?.username}</span>
                        <button onClick={logout} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">Logout</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Create a Room</h2>
                        <form onSubmit={createRoom} className="space-y-4">
                            <input type="text" placeholder="Room Name" required
                                className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={newRoomName}
                                onChange={e => setNewRoomName(e.target.value)}
                            />
                            <button type="submit" className="w-full py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700">
                                Create Room
                            </button>
                        </form>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Join a Room</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Paste Room ID here" id="join-room-id"
                                className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                                onClick={() => joinRoom(document.getElementById('join-room-id').value)}
                                className="w-full py-2 font-bold text-white bg-green-600 rounded hover:bg-green-700">
                                Join Room
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
