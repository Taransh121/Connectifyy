import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Function to handle logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Function to determine the text in the navbar based on the current route
    const getNavbarText = () => {
        if (location.pathname === '/login') {
            return 'Connecting People With Technology';
        } else if (location.pathname === '/register') {
            return '';
        } else {
            return '';
        }
    };

    // Function to determine whether to show the logout button
    const showLogoutButton = () => {
        return location.pathname !== '/login' && location.pathname !== '/register';
    };

    return (
        <nav className="bg-gray-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-white text-2xl font-bold">
                            Levitation
                        </Link>
                    </div>

                    {/* Conditional Text */}
                    <div className="text-white text-lg">
                        {getNavbarText()}
                    </div>

                    {/* Logout button only visible if not on login or register */}
                    {showLogoutButton() && (
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                        >
                            Logout
                        </button>
                    )}

                    {/* Redirect to login if on register page */}
                    {location.pathname === '/register' && (
                        <Link to="/login" className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};
