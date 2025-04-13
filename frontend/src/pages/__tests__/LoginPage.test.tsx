import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    // Clear localStorage and reset mocks before each test
    localStorage.clear();
    mockNavigate.mockClear();
  });

  it('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Check that the form elements are rendered
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByText(/esqueceu sua senha/i)).toBeInTheDocument();
  });

  it('handles admin login successfully', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@sistema.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'admin123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    // Wait for the navigation to occur
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    // Check that user info was stored in localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    expect(userInfo.email).toBe('admin@sistema.com');
    expect(userInfo.role).toBe('admin');

    // Check that tokens were stored in localStorage
    const authTokens = JSON.parse(localStorage.getItem('authTokens') || '{}');
    expect(authTokens.access_token).toBeTruthy();
  });

  it('shows error message for invalid credentials', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Fill in the form with invalid credentials
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'wrongpassword' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
    });

    // Check that navigation did not occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('toggles to forgot password form when link is clicked', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Click on the forgot password link
    fireEvent.click(screen.getByText(/esqueceu sua senha/i));

    // Check that the forgot password form is displayed
    expect(screen.getByText(/redefinir senha/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });
});
