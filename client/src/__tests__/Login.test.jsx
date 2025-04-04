import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from '../pages/Login';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../Redux/userSlice';
import chatReducer from '../Redux/chatSlice';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock alert
const mockAlert = jest.fn();
global.alert = mockAlert;

// Create a mock store
const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
  },
});

const renderLogin = () => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </Provider>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders login form with all elements', () => {
    renderLogin();
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login now/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
  });

  test('validates email format', () => {
    renderLogin();
    
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    expect(emailInput.validity.valid).toBe(false);
    expect(emailInput.validity.typeMismatch).toBe(true);
  });

  test('handles successful login', async () => {
    const mockUserData = {
      data: {
        token: 'mock-token',
        user: {
          name: 'Test User',
          email: 'test@example.com'
        }
      }
    };

    const mockChatData = {
      data: []
    };

    // Mock successful API responses
    axios.post.mockResolvedValueOnce(mockUserData);
    axios.get.mockResolvedValueOnce(mockChatData);

    renderLogin();

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login now/i }));

    // Wait for navigation and storage updates
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(localStorage.getItem('token')).toBe('mock-token');
    });
  });

  test('handles login failure', async () => {
    axios.post.mockRejectedValueOnce(new Error());

    renderLogin();

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login now/i }));

    // Wait for error alert
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Invalid credentials');
    });

    // Check that we didn't navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
