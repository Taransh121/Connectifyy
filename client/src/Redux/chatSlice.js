import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    chats: [],
    activeChat: null,
    messages: [],
    notifications: [],
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setChats: (state, action) => {
            state.chats = action.payload;
        },
        setActiveChat: (state, action) => {
            state.activeChat = action.payload;
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        setNotifications: (state, action) => {
            state.notifications = action.payload;
        },
        addNotification: (state, action) => {
            state.notifications.push(action.payload);
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(
                n => n.chatId !== action.payload
            );
        },
        addChat: (state, action) => {
            state.chats.push(action.payload);
        },
        clearChats: (state) => {
            state.chats = [];
            state.activeChat = null;
            state.messages = [];
            state.notifications = [];
        },
    },
});

export const {
    setChats,
    setActiveChat,
    setMessages,
    addMessage,
    setNotifications,
    addNotification,
    removeNotification,
    addChat,
    clearChats
} = chatSlice.actions;

export default chatSlice.reducer;