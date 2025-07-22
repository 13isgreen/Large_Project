import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DownloadButton from '../DownloadButton';

jest.mock('@fileforge/react-print', () => ({
  Tailwind: ({ children }: { children: React.ReactNode }) => <div data-testid="tailwind-wrapper">{children}</div>,
  compile: jest.fn(() => Promise.resolve('<div id="root"><script type="text/babel">test code</script></div>'))
}));

jest.mock('html2pdf.js', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    save: jest.fn(() => Promise.resolve())
  }))
}));

describe('DownloadButton', () => {
  const mockCode = '<div>Test Resume</div>';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders download button with correct text', () => {
    render(<DownloadButton code={mockCode} />);
    
    const button = screen.getByRole('button', { name: /download as pdf/i });
    expect(button).toBeInTheDocument();
  });

  it('has correct CSS classes', () => {
    render(<DownloadButton code={mockCode} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-4', 'py-2', 'bg-blue-600', 'text-white', 'rounded', 'hover:bg-blue-700');
  });

  it('calls handleDownload when clicked', async () => {
    const mockCompile = require('@fileforge/react-print').compile;
    const mockHtml2pdf = require('html2pdf.js').default;
    
    render(<DownloadButton code={mockCode} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockCompile).toHaveBeenCalled();
      expect(mockHtml2pdf).toHaveBeenCalled();
    });
  });

  it('renders container with correct structure', () => {
    render(<DownloadButton code={mockCode} />);
    
    const container = screen.getByRole('button').closest('div');
    expect(container).toHaveClass('p-2', 'border-t', 'bg-gray-100');
  });
});