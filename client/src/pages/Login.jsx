import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import loginImg from "../assets/login.png";
import { Navbar } from '../components/Navbar';
import { login } from '../Redux/userSlice'; // Import Redux login action
import { setChats } from '../Redux/chatSlice'; // Import Redux chat action

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch(); // Access Redux dispatch function

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Step 1: Login request
            const response = await axios.post('http://localhost:8080/user/login', { email, password });

            // Save token in localStorage
            localStorage.setItem('token', response.data.token);

            // Step 2: Fetch user-specific chat data
            const chatResponse = await axios.get('http://localhost:8080/chat/allChats', {
                headers: {
                    Authorization: `Bearer ${response.data.token}`, // Pass token to authenticate
                },
            });
            console.log(chatResponse);


            // Step 3: Save user and chat data in Redux store
            dispatch(login({
                name: response.data.user.name,
                email: response.data.user.email,
                token: response.data.token,
            }));

            // Store chats in Redux
            dispatch(setChats(chatResponse.data));

            // Navigate to home page
            navigate('/');
        } catch (error) {
            alert('Invalid credentials');
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
                            <h2 className="text-3xl font-semibold text-white mb-2">Let the Journey Begin!</h2>
                            <p className="text-sm text-gray-400 mb-6">Ready to rock and roll? Let's go!</p>
                        </div>

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
                                    autoComplete="username"
                                />
                                <p className="text-xs text-gray-500 mt-1">This email will be displayed with your inquiry.</p>
                            </div>

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
                                    autoComplete="current-password"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none"
                                >
                                    Login now
                                </button>
                            </div>

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
