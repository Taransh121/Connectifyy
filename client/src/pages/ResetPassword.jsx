import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import loginImg from "../assets/login.png";

export const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log("Token from URL:", token);  // Debugging token
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('❌ Passwords do not match!');
            return;
        }

        setLoading(true);
        try {
            console.log("Sending request with token:", token);  // Debugging API request
            const response = await axios.post(`http://localhost:8080/user/reset-password/${token}`, { password });

            console.log("API Response:", response.data);  // Debug response
            setMessage('✅ Password reset successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            console.error("Error resetting password:", error.response?.data || error.message);
            setMessage('❌ Error resetting password. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="m-5 flex items-center justify-center">
                <div className="border border-green-100 flex flex-col md:flex-row w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="hidden md:flex w-1/2">
                        <img src={loginImg} alt="Reset Password" className="object-cover w-full h-full" />
                    </div>

                    <div className="flex flex-col justify-center w-full md:w-1/2 p-8">
                        <h2 className="text-3xl font-semibold text-white mb-2">Reset Your Password</h2>
                        <p className="text-sm text-gray-400 mb-6">Enter your new password below.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400">New Password</label>
                                <input
                                    type="password"
                                    className="mt-2 w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-900 text-gray-100 focus:border-green-500 focus:ring-green-500 focus:outline-none"
                                    placeholder="Enter New Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400">Confirm Password</label>
                                <input
                                    type="password"
                                    className="mt-2 w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-900 text-gray-100 focus:border-green-500 focus:ring-green-500 focus:outline-none"
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {message && <p className={`text-sm ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}

                            <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none" disabled={loading}>
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};
