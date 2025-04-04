import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Register } from '../pages/Register';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../Redux/userSlice';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock browser APIs
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock console.log to avoid cluttering test output
const originalConsoleLog = console.log;
console.log = jest.fn();

// Mock window.alert
const originalAlert = window.alert;
window.alert = jest.fn();

// Mock navigate
const mockNavigate = jest.fn();

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Create a mock Redux store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer,
    },
    preloadedState: {
      user: {
        isLoggedIn: false,
        userInfo: null,
        error: null,
        loading: false,
        ...initialState.user
      }
    }
  });
};

// Helper function to render Register component with Redux store
const renderRegister = (initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    </Provider>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    window.alert = originalAlert;
  });

  test('renders register form correctly', () => {
    renderRegister();
    
    // Check headings and text
    expect(screen.getByText('Sign up to begin journey')).toBeInTheDocument();
    
    // Check form elements
    expect(screen.getByLabelText(/Enter your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    
    // Check button and link
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByText(/Already have an account/i)).toBeInTheDocument();
  });

  test('handles input changes', () => {
    renderRegister();
    
    // Get form elements
    const nameInput = screen.getByLabelText(/Enter your name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    
    // Simulate user typing
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Check if inputs reflect the changes
    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('displays success message after registration', async () => {
    renderRegister();
    
    // Fill the form
    fireEvent.change(screen.getByLabelText(/Enter your name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    // Mock successful API response
    const mockResponse = {
      data: {
        token: 'mock-token'
      }
    };
    axios.post.mockResolvedValueOnce(mockResponse);
    
    // Need to make sure setUserDetails gets called
    const submitButton = screen.getByRole('button', { name: /Register/i });
    fireEvent.click(submitButton);
    
    // Check for success message
    await waitFor(() => {
      expect(screen.queryByText('Registration Successful!')).not.toBeNull();
    });
  });

  test('handles registration error', async () => {
    renderRegister();
    
    // Fill the form
    fireEvent.change(screen.getByLabelText(/Enter your name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    // Mock API error response
    const mockError = {
      response: {
        data: {
          msg: 'Email already exists'
        }
      }
    };
    axios.post.mockRejectedValueOnce(mockError);
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Register/i });
    fireEvent.click(submitButton);
    
    // Check for error alert
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error: Email already exists');
    });
  });
});
