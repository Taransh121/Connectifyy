import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatPage } from '../pages/ChatPage';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../Redux/userSlice';
import chatReducer from '../Redux/chatSlice';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock socket.io-client
const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  connect: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn()
};

jest.mock('socket.io-client', () => {
  return jest.fn(() => mockSocket);
});

// Mock browser APIs
window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.scrollTo = jest.fn();

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/chat' }),
  useSearchParams: () => [new URLSearchParams(), jest.fn()]
}));

// Create a mock store with initial state
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer,
      chat: chatReducer,
    },
    preloadedState: {
      user: {
        isLoggedIn: true,
        userInfo: {
          _id: '1',
          name: 'Test User',
          email: 'test@example.com',
          token: 'mock-token'
        },
        error: null,
        loading: false,
        ...initialState.user
      },
      chat: {
        chats: [],
        activeChat: null,
        messages: [],
        loading: false,
        error: null,
        ...initialState.chat
      }
    }
  });
};

const renderChatPage = (initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ChatPage />
      </BrowserRouter>
    </Provider>
  );
};

describe('ChatPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket.emit.mockClear();
    mockSocket.on.mockClear();
    mockSocket.off.mockClear();
  });

  test('renders chat interface when active chat exists', () => {
    renderChatPage({
      chat: {
        activeChat: {
          _id: '1',
          chatName: 'Test Chat',
          isGroupChat: false,
          users: [{ _id: '1', name: 'Test User' }]
        },
        messages: []
      }
    });
    
    expect(screen.getByPlaceholderText('Type a message')).toBeInTheDocument();
  });

  test('fetches chats on mount', async () => {
    const mockChats = [
      { _id: '1', chatName: 'Chat 1', isGroupChat: false },
      { _id: '2', chatName: 'Chat 2', isGroupChat: true }
    ];

    axios.get.mockResolvedValueOnce({ data: mockChats });

    renderChatPage();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/chat/allChats',
        {
          headers: { Authorization: 'Bearer mock-token' }
        }
      );
    });
  });

  test('displays no-chat message when no active chat is selected', () => {
    renderChatPage();
    
    expect(screen.getByText(/Select a chat to start messaging/i)).toBeInTheDocument();
  });

  test('renders messages when active chat has messages', () => {
    const mockMessages = [
      {
        _id: '1',
        content: 'Hello there',
        sender: { _id: '2', name: 'Other User' },
        chat: { _id: '1' },
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        content: 'Hi, how are you?',
        sender: { _id: '1', name: 'Test User' },
        chat: { _id: '1' },
        createdAt: new Date().toISOString()
      }
    ];

    renderChatPage({
      chat: {
        activeChat: {
          _id: '1',
          chatName: 'Test Chat',
          isGroupChat: false,
          users: [
            { _id: '1', name: 'Test User' },
            { _id: '2', name: 'Other User' }
          ]
        },
        messages: mockMessages
      }
    });

    // Check for message content
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(screen.getByText('Hi, how are you?')).toBeInTheDocument();
  });

  test('socket connection is established on mount', () => {
    renderChatPage();
    
    // Verify that socket connection is attempted
    expect(mockSocket.on).toHaveBeenCalledWith('connected', expect.any(Function));
  });
});