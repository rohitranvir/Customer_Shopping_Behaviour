import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import RoomList from './pages/RoomList';
import ChatRoom from './pages/ChatRoom';

/**
 * Protects a route — redirects to /login if the user is not authenticated.
 * Shows a loading spinner while auth state is being resolved.
 */
function ProtectedRoute({ children }) {
    const { token, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <RoomList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/room/:roomId"
                element={
                    <ProtectedRoute>
                        <ChatRoom />
                    </ProtectedRoute>
                }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
