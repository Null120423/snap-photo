/** @format */

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CreateRoomPage from "./pages/CreateRoomPage";
import MyRoomsPage from "./pages/MyRoomsPage";
import RoomPage from "./pages/RoomPage";
import PhotoDetailPage from "./pages/PhotoDetailPage";
import ProfilePage from "./pages/ProfilePage";

// Wrapper to handle room ID from route params
function RoomPageWrapper() {
  const { roomId } = useParams<{ roomId: string }>();
  if (!roomId) return <Navigate to='/' replace />;
  return <RoomPage roomId={roomId} />;
}

export default function App() {
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
