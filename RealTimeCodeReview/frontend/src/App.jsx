import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RoomPage from './pages/RoomPage';
import { useAuth } from './services/AuthContext';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/room/:roomId"
          element={
            <PrivateRoute>
              <RoomPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
