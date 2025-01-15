import React, { useState } from 'react';
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

    // State to control mobile menu toggle
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-gray-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">
                {/* Logo on the left, hidden on mobile */}
                <div className="hidden md:block">
                    <Link to="/" className="text-white text-2xl font-bold">
                        Connectify
                    </Link>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-white focus:outline-none"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                </div>

                {/* Centered links, hidden on mobile */}
                <div className="hidden md:flex items-center gap-4">
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

                {/* User's name and Logout button on the right, visible on both mobile and larger screens */}
                <div className="flex items-center gap-4">
                    {isLoggedIn && (
                        <>
                            {/* Display the user's name */}
                            <span className="text-white text-sm md:block">{userInfo?.name}</span>

                            <button
                                onClick={handleLogout}
                                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </>
                    )}

                    {/* Login button on the right if not logged in */}
                    {!isLoggedIn && (
                        <Link to="/login" className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
                            Login
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-gray-800 text-white px-4 py-2">
                    {isLoggedIn ? (
                        <>
                            <Link to="/chats" className="block py-2">Chats</Link>
                            <a
                                href="https://www.tutorialspoint.com/whiteboard.htm"
                                className="block py-2"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Whiteboard
                            </a>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="block py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Login
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
};
