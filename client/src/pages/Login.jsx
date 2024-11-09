import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import loginImg from "../assets/login.png";
import { Navbar } from '../components/Navbar';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/user/login', { email, password });
            localStorage.setItem('token', response.data.token);
            navigate('/addProducts');
        } catch (error) {
            alert('Invalid credentials');
        }
    };

    return (
        <>
            <Navbar />
            {/* Main container to cover full screen */}
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                {/* Inner container with flex for form and image */}
                <div className="flex flex-col md:flex-row w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg overflow-hidden">

                    {/* Left Side (Image) */}
                    <div className="hidden md:flex w-1/2">
                        <img src={loginImg} alt="Office View" className="object-cover w-full h-full" />
                    </div>

                    {/* Right Side (Form) */}
                    <div className="flex flex-col justify-center w-full md:w-1/2 p-8">
                        {/* Header and description */}
                        <div className="text-left">
                            <h2 className="text-3xl font-semibold text-white mb-2">Let the Journey Begin!</h2>
                            <p className="text-sm text-gray-400 mb-6">This is a basic login page which is used for levitation assignment purposes.</p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="mt-2 w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-900 text-gray-100 focus:border-green-500 focus:ring-green-500 focus:outline-none"
                                    placeholder="Enter Email ID"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">This email will be displayed with your inquiry.</p>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-400">Current Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="mt-2 w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-900 text-gray-100 focus:border-green-500 focus:ring-green-500 focus:outline-none"
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>

                            {/* Login Button */}
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none"
                                >
                                    Login now
                                </button>
                            </div>

                            {/* Registration Link */}
                            <div className="flex justify-end mt-2">
                                <Link to='/register' className='text-sm text-blue-500 hover:text-blue-600'>
                                    Don't have an account? Register here
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};
