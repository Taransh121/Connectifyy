import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BellIcon, ChevronDownIcon } from "@heroicons/react/outline"; // Heroicons for icons
import { Transition } from "@headlessui/react"; // For transitions
import { setNotifications, setSelectedChat } from "../Redux/chatSlice"; // Replace with actual slice path
import { logout } from "../Redux/userSlice"; // Replace with actual slice path

export const SideDrawer = () => {
    const dispatch = useDispatch();

    // Fetching data from Redux
    const { user } = useSelector((state) => state.user);
    const { notifications } = useSelector((state) => state.chat);

    // Local state
    const [search, setSearch] = useState("");
    const [isDrawerOpen, setDrawerOpen] = useState(false);

    // Handle logout
    const logoutHandler = () => {
        // localStorage.removeItem("token");
        dispatch(logout());
        window.location.href = "/"; // Redirect to home
    };

    // Handle search functionality
    const handleSearch = () => {
        if (!search.trim()) {
            alert("Please enter a search term.");
            return;
        }
        // Implement search logic or dispatch an action
        console.log("Searching for:", search);
    };

    return (
        <div className="flex justify-between items-center bg-white shadow p-4 border-b">
            {/* Search Button */}
            <button
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                onClick={() => setDrawerOpen(true)}
            >
                <i className="fas fa-search"></i>
                <span className="hidden md:block">Search User</span>
            </button>

            {/* Brand Name */}
            <h1 className="text-2xl font-bold text-gray-800">Talk-A-Tive</h1>

            {/* Notifications and Profile */}
            <div className="flex items-center space-x-4">
                {/* Notification Menu */}
                <div className="relative">
                    <button className="relative">
                        <BellIcon className="w-6 h-6 text-gray-600" />
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2">
                                {notifications.length}
                            </span>
                        )}
                    </button>
                    <Transition
                        show={notifications.length > 0}
                        enter="transition ease-out duration-100"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
                            {notifications.length === 0 ? (
                                <p className="p-2 text-sm text-gray-600">No new messages</p>
                            ) : (
                                notifications.map((notif, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            dispatch(setSelectedChat(notif.chat));
                                            dispatch(setNotification(notifications.filter((n) => n !== notif)));
                                        }}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        {notif.chat.isGroupChat
                                            ? `New message in ${notif.chat.chatName}`
                                            : `New message from ${notif.chat.senderName}`}
                                    </button>
                                ))
                            )}
                        </div>
                    </Transition>
                </div>

                {/* Profile Menu */}
                <div className="relative">
                    <button className="flex items-center space-x-2 bg-white border border-gray-300 rounded-full px-3 py-1">
                        <img
                            src={
                                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtuphMb4mq-EcVWhMVT8FCkv5dqZGgvn_QiA&s"
                            }
                            alt={user?.name || "User"}
                            className="w-8 h-8 rounded-full"
                        />
                        <span className="hidden md:block">{user?.name || "Profile"}</span>
                        <ChevronDownIcon className="w-4 h-4" />
                    </button>
                    <Transition
                        show={true}
                        enter="transition ease-out duration-100"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
                            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                My Profile
                            </button>
                            <div className="border-t border-gray-200"></div>
                            <button
                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                onClick={logoutHandler}
                            >
                                Logout
                            </button>
                        </div>
                    </Transition>
                </div>
            </div>

            {/* Drawer */}
            <Transition
                show={isDrawerOpen}
                enter="transition ease-out duration-300"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
            >
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40" onClick={() => setDrawerOpen(false)}></div>
                <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg z-50">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">Search Users</h2>
                    </div>
                    <div className="p-4">
                        <input
                            type="text"
                            placeholder="Search by name or email"
                            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button
                            className="w-full mt-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                            onClick={handleSearch}
                        >
                            Search
                        </button>
                        {/* Render search results */}
                    </div>
                </div>
            </Transition>
        </div>
    );
};
