import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../Redux/userSlice';
import { Link } from 'react-router-dom';
import { clearChats } from '../Redux/chatSlice';

export const Navbar = () => {
    const { isLoggedIn, userInfo } = useSelector((state) => state.user); // Access user state
    const dispatch = useDispatch(); // To dispatch actions

    const handleLogout = () => {
        dispatch(logout()); // Dispatch the logout action
        dispatch(clearChats());
        localStorage.removeItem("token");
    };

    return (
        <nav className="bg-gray-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">
                {/* Logo on the left */}
                <div>
                    <Link to="/" className="text-white text-2xl font-bold">
                        Connectify
                    </Link>
                </div>

                {/* Centered links */}
                <div className="flex items-center gap-4">
                    {isLoggedIn && (
                        <>
                            <Link to="/chats" className="text-white hover:underline">Chats</Link>
                            <a
                                href="https://www.tutorialspoint.com/whiteboard.htm"
                                className="text-white hover:underline"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Whiteboard
                            </a>
                        </>
                    )}
                </div>

                {/* Logout button on the right */}
                {isLoggedIn && (
                    <div>
                        <span className="text-white"> [ {userInfo?.name} ] </span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                )}

                {/* Login button on the right if not logged in */}
                {!isLoggedIn && (
                    <Link to="/login" className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};