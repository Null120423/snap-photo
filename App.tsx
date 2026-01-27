/** @format */

import { useState } from "react";
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
    useParams,
} from "react-router-dom";
import Layout from "./components/Layout";
import CreateRoomPage from "./pages/CreateRoomPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MyRoomsPage from "./pages/MyRoomsPage";
import PhotoDetailPage from "./pages/PhotoDetailPage";
import ProfilePage from "./pages/ProfilePage";
import RoomPage from "./pages/RoomPage";
import { isAuthenticated, saveAuth } from "./utils/storage";

// Wrapper to handle room ID from route params
function RoomPageWrapper() {
  const { roomId } = useParams<{ roomId: string }>();
  if (!roomId) return <Navigate to='/' replace />;
  return <RoomPage roomId={roomId} />;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  const handleLogin = (name: string, password: string) => {
    saveAuth(name, password);
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/create' element={<CreateRoomPage />} />
          <Route path='/my-rooms' element={<MyRoomsPage />} />
          <Route path='/room/:roomId' element={<RoomPageWrapper />} />
          <Route path='/photo/:photoId' element={<PhotoDetailPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
