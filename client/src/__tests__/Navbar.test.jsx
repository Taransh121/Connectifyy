import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '../components/Navbar';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../Redux/userSlice';
import chatReducer from '../Redux/chatSlice';

// Create a mock store
const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      user: userReducer,
      chat: chatReducer,
    },
    preloadedState: {
      user: {
        isLoggedIn: false,
        userInfo: null,
        ...initialState
      }
    }
  });
};

const renderNavbar = (initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    </Provider>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders brand name', () => {
    renderNavbar();
    expect(screen.getByText(/connectify/i)).toBeInTheDocument();
  });

  test('renders login link when user is not logged in', () => {
    renderNavbar({ isLoggedIn: false });
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  test('renders user info and logout when user is logged in', () => {
    renderNavbar({
      isLoggedIn: true,
      userInfo: {
        name: 'Test User',
        email: 'test@example.com'
      }
    });

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
  });

  test('handles logout action', () => {
    renderNavbar({
      isLoggedIn: true,
      userInfo: {
        name: 'Test User',
        email: 'test@example.com'
      }
    });

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    // Check if localStorage is cleared
    expect(localStorage.getItem('token')).toBeNull();
  });
});
