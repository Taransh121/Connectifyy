import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Home } from './pages/Home';
import { ChatPage } from './pages/ChatPage';
import io from "socket.io-client";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn); // Access user.isLoggedIn from state
  return isLoggedIn ? children : <Navigate to="/login" />;
};

// App component
export default function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Establish a socket connection when the component mounts
    const newSocket = io("http://localhost:8080"); // Change the URL based on your server configuration
    setSocket(newSocket);

    // Clean up the socket connection when the component unmounts
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div className="">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <ChatPage socket={socket} /> {/* Pass socket as a prop to the ChatPage */}
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
