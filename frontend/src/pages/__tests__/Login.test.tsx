import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';

const mockNavigate = jest.fn();
const mockApiPost = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../api/axios', () => ({
  post: () => mockApiPost(),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const LoginWithRouter = () => (
  <BrowserRouter>
    <Login />
  </BrowserRouter>
);

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form', () => {
    render(<LoginWithRouter />);
    
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('disables submit button when fields are empty', () => {
    render(<LoginWithRouter />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when fields are filled', async () => {
    const user = userEvent.setup();
    render(<LoginWithRouter />);
    
    await user.type(screen.getByPlaceholderText(/username or email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    expect(submitButton).toBeEnabled();
  });

  it('handles successful login', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: {
        token: 'fake-token',
        id: 'user-id',
        username: 'testuser',
      },
    };
    
    mockApiPost.mockResolvedValueOnce(mockResponse);
    
    render(<LoginWithRouter />);
    
    await user.type(screen.getByPlaceholderText(/username or email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-token');
      expect(localStorage.getItem('userId')).toBe('user-id');
      expect(localStorage.getItem('username')).toBe('testuser');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    const mockError = {
      response: {
        data: {
          error: 'Invalid credentials',
        },
      },
    };
    
    mockApiPost.mockRejectedValueOnce(mockError);
    
    render(<LoginWithRouter />);
    
    await user.type(screen.getByPlaceholderText(/username or email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('renders register link', () => {
    render(<LoginWithRouter />);
    
    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});