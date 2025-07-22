import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

const HeaderWithRouter = () => (
  <BrowserRouter>
    <Header />
  </BrowserRouter>
);

describe('Header', () => {
  it('renders the Resume Builder title', () => {
    render(<HeaderWithRouter />);
    expect(screen.getByText('Resume Builder')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<HeaderWithRouter />);
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    const profileLink = screen.getByRole('link', { name: /profile/i });
    
    expect(dashboardLink).toBeInTheDocument();
    expect(profileLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(profileLink).toHaveAttribute('href', '/profile');
  });

  it('applies correct CSS classes', () => {
    render(<HeaderWithRouter />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-[#2d2d2d]', 'text-white', 'px-4', 'py-2');
  });
});