import { getResumeHTML } from '../getResumeHTML';

jest.mock('@fileforge/react-print', () => ({
  Tailwind: ({ children }: { children: React.ReactNode }) => <div data-testid="tailwind-wrapper">{children}</div>,
  compile: jest.fn((component) => Promise.resolve(`<html>${component}</html>`))
}));

describe('getResumeHTML', () => {
  it('returns a compiled HTML string', async () => {
    const result = await getResumeHTML();
    expect(typeof result).toBe('string');
    expect(result).toContain('<html>');
  });

  it('includes expected content structure', async () => {
    const mockCompile = require('@fileforge/react-print').compile;
    
    await getResumeHTML();
    
    expect(mockCompile).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.any(Function),
        props: expect.objectContaining({
          children: expect.any(Object)
        })
      })
    );
  });

  it('calls compile function once', async () => {
    const mockCompile = require('@fileforge/react-print').compile;
    mockCompile.mockClear();
    
    await getResumeHTML();
    
    expect(mockCompile).toHaveBeenCalledTimes(1);
  });
});