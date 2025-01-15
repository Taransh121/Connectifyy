import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Navbar } from "../components/Navbar";
import io from "socket.io-client";
import debounce from "lodash/debounce";
import { setChats, setActiveChat, setMessages, addMessage } from "../Redux/chatSlice";

const SOCKET_URL = "http://localhost:8080";

export const ChatPage = () => {
    const dispatch = useDispatch();
    const { chats, activeChat, messages } = useSelector((state) => state.chat);
    const { userInfo } = useSelector((state) => state.user);
    const [searchQuery, setSearchQuery] = useState(""); // Input value for search
    const [groupSearchQuery, setGroupSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]); // Array of search results
    const [groupSearchResults, setGroupSearchResults] = useState([]);
    const [socketConnected, setSocketConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [addingUserToGroup, setAddingUserToGroup] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const socketRef = useRef(null);
    const messageEndRef = useRef(null);

    // Add state variables for the group creation modal
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [groupUsers, setGroupUsers] = useState([]);

    // Function to toggle the group creation modal
    const toggleGroupCreation = () => {
        setIsCreatingGroup(!isCreatingGroup);
        setNewGroupName(""); // Reset the group name input
        setGroupUsers([]); // Reset the selected users
    };

    // Function to add a user to the group
    const handleAddUserToGroupList = (user) => {
        if (!groupUsers.find((u) => u._id === user._id)) {
            setGroupUsers([...groupUsers, user]);
        }
    };

    // Function to remove a user from the group
    const handleRemoveUserFromGroupList = (userId) => {
        setGroupUsers(groupUsers.filter((u) => u._id !== userId));
    };

    // Function to create a new group
    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || groupUsers.length === 0) {
            alert("Group name and users are required!");
            return;
        }

        try {
            const { data } = await axios.post(
                `http://localhost:8080/chat/createGroup`,
                {
                    chatName: newGroupName.trim(),
                    users: JSON.stringify(groupUsers.map((user) => user._id)),
                },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );

            // Add the new group to the chats list
            dispatch(setChats([...chats, data]));
            dispatch(setActiveChat(data)); // Set the new group as the active chat

            // Reset the modal state
            toggleGroupCreation();
        } catch (error) {
            console.error("Error creating group:", error);
            alert(`Error creating group: ${error.message}`);
        }
    };

    // Fetch chats when the component mounts
    useEffect(() => {
        if (userInfo.token) {
            const fetchChats = async () => {
                try {
                    const { data } = await axios.get(
                        'http://localhost:8080/chat/allChats',
                        {
                            headers: { Authorization: `Bearer ${userInfo.token}` },
                        }
                    );
                    dispatch(setChats(data));
                } catch (error) {
                    console.error("Error fetching chats:", error);
                }
            };
            fetchChats();
        }
    }, [dispatch, userInfo.token]);


    // Initialize socket connection
    useEffect(() => {
        socketRef.current = io(SOCKET_URL);

        socketRef.current.on("connect", () => {
            console.log("Socket connected");
            setSocketConnected(true);
            socketRef.current.emit("setup", userInfo);
        });

        socketRef.current.on("connected", () => {
            console.log("Setup completed");
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [userInfo]);

    // Socket event listeners
    useEffect(() => {
        if (!socketRef.current) return;

        const messageHandler = (newMessageReceived) => {
            console.log("New message received:", newMessageReceived);
            if (activeChat?._id === newMessageReceived.chat._id) {
                dispatch(addMessage(newMessageReceived));
            }
        };

        const typingHandler = () => setIsTyping(true);
        const stopTypingHandler = () => setIsTyping(false);

        socketRef.current.on("message recieved", messageHandler);
        socketRef.current.on("typing", typingHandler);
        socketRef.current.on("stop typing", stopTypingHandler);

        if (activeChat) {
            console.log("Joining chat:", activeChat._id);
            socketRef.current.emit("join chat", activeChat._id);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off("message recieved", messageHandler);
                socketRef.current.off("typing", typingHandler);
                socketRef.current.off("stop typing", stopTypingHandler);
            }
        };
    }, [activeChat, dispatch]);

    // Fetch messages when active chat changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (!activeChat) return;

            try {
                const { data } = await axios.get(
                    `http://localhost:8080/message/${activeChat._id}`,
                    { headers: { Authorization: `Bearer ${userInfo.token}` } }
                );
                dispatch(setMessages(data));
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, [activeChat, userInfo.token, dispatch]);

    // Handle sending messages
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        const messageData = {
            content: newMessage,
            chatId: activeChat._id,
        };

        setNewMessage(""); // Clear input immediately for better UX

        try {
            const { data } = await axios.post(
                "http://localhost:8080/message",
                messageData,
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );

            console.log("Sending new message:", data);
            socketRef.current?.emit("new message", {
                ...data,
                chat: activeChat
            });
            dispatch(addMessage(data));
        } catch (error) {
            console.error("Error sending message:", error);
            setNewMessage(messageData.content); // Restore message if failed
        }
    };

    // Search users based on input
    const handleSearchUsers = debounce(async () => {
        if (!searchQuery.trim()) return;

        try {
            const { data } = await axios.get(
                `http://localhost:8080/user?search=${searchQuery}`,
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            setSearchResults(data);
        } catch (error) {
            console.error("Error searching users:", error);
            alert(`Error searching users: ${error.message}`);
        }
    }, 500);

    useEffect(() => {
        handleSearchUsers();
        return () => handleSearchUsers.cancel();
    }, [searchQuery]);

    // Typing indicators
    const handleTyping = () => {
        if (!socketConnected || !activeChat) return;
        socketRef.current?.emit("typing", activeChat._id);
    };

    const handleStopTyping = debounce(() => {
        if (!socketConnected || !activeChat) return;
        socketRef.current?.emit("stop typing", activeChat._id);
    }, 500);

    //Rename the group
    const handleRenameGroup = async (chat) => {
        const newGroupName = prompt("Enter the new group name:", chat.chatName);
        if (!newGroupName || newGroupName.trim() === chat.chatName) return;

        try {
            const { data } = await axios.put(
                `http://localhost:8080/chat/renameGroup`,
                { chatId: chat._id, chatName: newGroupName.trim() },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );

            // Update the chats list with the renamed group
            const updatedChats = chats.map((c) =>
                c._id === chat._id ? { ...c, chatName: data.chatName } : c
            );
            dispatch(setChats(updatedChats));
            if (activeChat?._id === chat._id) {
                dispatch(setActiveChat({ ...activeChat, chatName: data.chatName }));
            }
        } catch (error) {
            console.error("Error renaming group:", error);
            alert(`Error renaming group: ${error.message}`);
        }
    };
    //handle start chat
    const handleStartChat = async (user) => {
        try {
            const { data } = await axios.post(
                "http://localhost:8080/chat",
                { userId: user._id },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );

            // Add chat to the list if it's new
            if (!chats.some((chat) => chat._id === data._id)) {
                dispatch(setChats([data, ...chats]));
            }
            dispatch(setActiveChat(data));
        } catch (error) {
            console.error("Error starting chat:", error);
            alert("Failed to start chat");
        }
    };

    // Group search handler
    const handleGroupSearch = debounce(async () => {
        if (!groupSearchQuery.trim()) return;
        try {
            const { data } = await axios.get(
                `http://localhost:8080/user?search=${groupSearchQuery}`,
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            setGroupSearchResults(data);
        } catch (error) {
            console.error("Error searching users for group:", error);
        }
    }, 500);

    useEffect(() => {
        handleGroupSearch();
        return () => handleGroupSearch.cancel();
    }, [groupSearchQuery]);

    // Add User to Group
    const handleAddUserToGroup = async (userId) => {
        if (!selectedGroup) return;
        try {
            const { data } = await axios.put(
                `http://localhost:8080/chat/addToGroup`,
                { chatId: selectedGroup._id, userId },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );

            console.log('Data after adding user to group:', data);

            // Update the chats array by merging the updated group chat
            const updatedChats = chats.map(chat =>
                chat._id === data._id ? data : chat
            );

            // If the group chat doesn't exist in the array, add it to the chats
            if (!updatedChats.some(chat => chat._id === data._id)) {
                updatedChats.push(data);
            }
            alert("User added to group.")
            // Dispatch the updated chats array to Redux store
            dispatch(setChats(updatedChats));

            // Reset the state for adding user to group
            setAddingUserToGroup(false);
            setSearchQuery("");
        } catch (error) {
            console.error("Error adding user to group:", error);
        }
    };



    // Auto-scroll to latest message
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <>
            <Navbar />
            <div className="flex flex-col md:flex-row bg-gray-900 text-white">
                {/* Sidebar */}
                <div className="w-full md:w-1/4 bg-gray-800 p-4">
                    <h2 className="text-2xl font-bold border-b pb-2">Chats</h2>
                    {/* User Search */}
                    <div className="mt-4">
                        <input
                            type="text"
                            className="w-full p-2 rounded bg-gray-700 text-white"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Search Results */}
                    {searchQuery && (
                        <div className="mt-2">
                            <h3 className="font-bold text-lg">Search Results:</h3>
                            {searchResults.length ? (
                                <ul>
                                    {searchResults.map((user) => (
                                        <li
                                            key={user._id}
                                            className="flex items-center justify-between p-2 bg-gray-700 rounded mt-2 cursor-pointer hover:bg-gray-600"
                                            onClick={() => handleStartChat(user)}
                                        >
                                            <span>{user.name}</span>
                                            <span className="text-gray-400 text-sm">{user.email}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 mt-2">No users found</p>
                            )}
                        </div>
                    )}

                    {/* Chat List */}
                    <div className="mt-4 space-y-2">
                        <h3 className="text-lg font-semibold mb-2">Recent Chats :</h3>
                        {chats.map((chat) => (
                            <div
                                key={chat._id}
                                className={`w-full p-3 flex items-center justify-between cursor-pointer ${activeChat?._id === chat._id
                                    ? "border-b"
                                    : "border-b hover:bg-gray-600"
                                    }`}
                            >
                                <div
                                    onClick={() => dispatch(setActiveChat(chat))}
                                    className="flex-1"
                                >
                                    {chat.isGroupChat
                                        ? `${chat.chatName} - (Group)`
                                        : chat.users && chat.users.find(user => user.name !== userInfo.name)?.name + " - (Private)"
                                    }
                                </div>
                                {chat.isGroupChat && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setSelectedGroup(chat);
                                                setAddingUserToGroup(true);
                                            }}
                                            className="ml-2 text-sm text-blue-400 hover:underline"
                                        >
                                            | Add User |
                                        </button>
                                        <button
                                            onClick={() => handleRenameGroup(chat)}
                                            className="ml-2 text-sm text-blue-400 hover:underline"
                                        >
                                            Rename |
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Create New Group */}
                    <div className="mt-4">
                        <button
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded"
                            onClick={toggleGroupCreation}
                        >
                            {isCreatingGroup ? "Cancel Group Creation" : "Create New Group"}
                        </button>

                        {isCreatingGroup && (
                            <div className="mt-4 bg-gray-700 p-4 rounded shadow">
                                {/* Group Name Input */}
                                <div className="mb-4">
                                    <label className="block text-sm mb-2">Group Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 text-black rounded"
                                        placeholder="Enter group name"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                    />
                                </div>

                                {/* Search Users */}
                                <div className="mb-4">
                                    <label className="block text-sm mb-2">Search Users</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 text-black rounded"
                                        placeholder="Search users to add"
                                        value={groupSearchQuery}
                                        onChange={(e) => setGroupSearchQuery(e.target.value)}
                                    />
                                    <div className="mt-2">
                                        {groupSearchResults.map((user) => (
                                            <div
                                                key={user._id}
                                                className="flex items-center justify-between p-2 bg-gray-800 rounded mb-2"
                                            >
                                                <span>{user.name}</span>
                                                <button
                                                    className="text-sm bg-green-600 px-2 py-1 rounded"
                                                    onClick={() => handleAddUserToGroupList(user)}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Selected Users */}
                                <div className="mb-4">
                                    <h4 className="text-sm mb-2">Selected Users</h4>
                                    <div>
                                        {groupUsers.map((user) => (
                                            <div
                                                key={user._id}
                                                className="flex items-center justify-between p-2 bg-gray-800 rounded mb-2"
                                            >
                                                <span>{user.name}</span>
                                                <button
                                                    className="text-sm bg-red-600 px-2 py-1 rounded"
                                                    onClick={() => handleRemoveUserFromGroupList(user._id)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Create Group Button */}
                                <button
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded"
                                    onClick={handleCreateGroup}
                                >
                                    Create Group
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Add User Modal */}
                    {addingUserToGroup && (
                        <div className="absolute bg-gray-700 p-4 rounded-lg w-96">
                            <h3 className="text-lg font-semibold mb-2">Search Users</h3>
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full p-2 mb-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="space-y-2">
                                {Array.isArray(searchResults) &&
                                    searchResults.map((user) => (
                                        <div
                                            key={user._id}
                                            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer"
                                            onClick={() => handleAddUserToGroup(user._id)}
                                        >
                                            <p>{user.name}</p>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Content */}
                <div className="flex-1 h-[calc(100vh-4rem)] flex flex-col p-6 overflow-hidden">
                    {!activeChat ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <h2 className="text-3xl font-bold mb-4">Select a chat to start messaging</h2>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            <h2 className="text-xl font-bold mb-4 text-green-500">
                                {activeChat.isGroupChat
                                    ? (
                                        <>
                                            <span>Group Name : {activeChat.chatName}</span>
                                            <div className="text-sm text-gray-500">
                                                <span>Participants: </span>
                                                {activeChat.users.map((user, index) => (
                                                    <span key={user._id}>
                                                        {user.name}
                                                        {index < activeChat.users.length - 1 && ", "}
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    )
                                    : activeChat.users && activeChat.users.find(user => user.name !== userInfo.name)?.name
                                }
                            </h2>

                            <div className="flex-1 overflow-y-auto mb-4">
                                <div className="space-y-4">
                                    {messages.map((message) => (
                                        <div
                                            key={message._id}
                                            className={`mr-5 flex ${message.sender.name === userInfo.name
                                                ? "justify-end"
                                                : "justify-start"
                                                }`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-lg p-3 ${message.sender.name === userInfo._name
                                                    ? "bg-gray-700"
                                                    : "bg-gray-700"
                                                    }`}
                                            >
                                                {message.sender.name !== userInfo.name ? (
                                                    <p className="mb-1 text-black">
                                                        <strong>
                                                            {message.sender.name}
                                                        </strong>
                                                    </p>
                                                ) : (
                                                    <strong className="mb-1 text-black">Me</strong>
                                                )}
                                                <p>{message.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="text-gray-400 italic">Someone is typing...</div>
                                    )}
                                    <div ref={messageEndRef} />
                                </div>
                            </div>

                            <form
                                onSubmit={handleSendMessage}
                                className="mt-auto"
                            >
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={handleTyping}
                                        onKeyUp={handleStopTyping}
                                        placeholder="Type a message"
                                        className="flex-1 p-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

        </>
    );
};
