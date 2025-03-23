import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import loginImg from "../assets/login.png";
import { Navbar } from '../components/Navbar';

export const ForgetPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/user/forgot-password', { email });
            setMessage(response.data.msg);
            setError('');
        } catch (error) {
            setError(error.response?.data?.msg || 'Something went wrong');
            setMessage('');
        }
    };

    return (
        <>
            <Navbar />
            <div className="m-5 flex items-center justify-center">
                <div className="border border-green-100 flex flex-col md:flex-row w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="hidden md:flex w-1/2">
                        <img src={loginImg} alt="Office View" className="object-cover w-full h-full" />
                    </div>

                    <div className="flex flex-col justify-center w-full md:w-1/2 p-8">
                        <div className="text-left">
                            <h2 className="text-3xl font-semibold text-white mb-2">Forgot Your Password?</h2>
                            <p className="text-sm text-gray-400 mb-6">Enter your email to receive a password reset link.</p>
                        </div>

                        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                        <form onSubmit={handleSubmit} className="space-y-6">
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
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none"
                                >
                                    Send Reset Link
                                </button>
                            </div>

                            <div className="flex justify-between mt-2">
                                <Link to='/login' className='text-sm text-blue-500 hover:text-blue-600'>
                                    Back to Login
                                </Link>
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