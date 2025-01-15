import React from 'react';
import { Navbar } from '../components/Navbar';
import loginImg from "../assets/login.png";


export const Home = () => {

    return (
        <>
            <Navbar />
            <div className="bg-gray-100">
                {/* Hero Section */}

                <section className="flex items-center justify-center bg-cover bg-center h-screen text-white relative" style={{ backgroundImage: 'https://www.istockphoto.com/photos/online-study-group' }}>
                    <div className="absolute inset-0 opacity-50" /> {/* Background overlay for better text visibility */}
                    <div className="text-center space-y-6 z-10">
                        <h1 className="text-5xl text-black font-bold mb-4">Collaborate, Learn, Succeed</h1>
                        <p className="text-lg text-black mb-6">Create study groups, chat in real time, share resources, and succeed together.</p>
                        <br />
                        <a href="#features" className="px-6 py-3 bg-blue-600 rounded-lg text-xl hover:bg-blue-700 transition duration-300">Get Started</a>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-white">
                    <div className="max-w-screen-xl mx-auto px-6">
                        <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="text-center bg-gray-50 p-6 rounded-lg shadow-lg">
                                <h3 className="text-2xl font-semibold mb-4">Group Creation</h3>
                                <p>Create and manage study groups, collaborate with ease.</p>
                            </div>
                            <div className="text-center bg-gray-50 p-6 rounded-lg shadow-lg">
                                <h3 className="text-2xl font-semibold mb-4">Real-Time Chat</h3>
                                <p>Engage in live conversations with group members.</p>
                            </div>
                            <div className="text-center bg-gray-50 p-6 rounded-lg shadow-lg">
                                <h3 className="text-2xl font-semibold mb-4">File Sharing</h3>
                                <p>Share documents, notes, and resources with your group.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-20 bg-blue-600 text-white">
                    <div className="max-w-screen-xl mx-auto px-6 text-center">
                        <h2 className="text-4xl font-bold mb-6">About Connectify</h2>
                        <p className="text-lg mb-6">Connectify is a platform designed to bring students together to collaborate on their learning. Create groups, share resources, and chat in real time to enhance your study experience.</p>
                        <a href="#" className="px-6 py-3 bg-blue-800 rounded-lg text-xl hover:bg-blue-900 transition duration-300">Contact Us</a>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-800 text-white py-6">
                    <div className="max-w-screen-xl mx-auto text-center">
                        <p>&copy; 2025 Connectify. All rights reserved.</p>
                        <div className="space-x-4 mt-4">
                            <a href="#" className="hover:text-blue-300">Privacy Policy</a>
                            <a href="#" className="hover:text-blue-300">Terms of Service</a>
                            <a href="#" className="hover:text-blue-300">Support</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>

    );
};

