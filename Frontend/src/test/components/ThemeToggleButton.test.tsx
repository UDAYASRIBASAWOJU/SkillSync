import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggleButton from '../../components/ui/ThemeToggleButton';

const mockToggleTheme = vi.fn();

// Mock useTheme hook
vi.mock('../../context/ThemeContext', () => ({
  useTheme: vi.fn(() => ({
    isDark: false,
    toggleTheme: mockToggleTheme,
  })),
}));

import { useTheme } from '../../context/ThemeContext';

describe('ThemeToggleButton Component', () => {
  it('renders correctly in light mode', () => {
    // isDark is false by default in our mock
    render(<ThemeToggleButton />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    expect(screen.getByText('light_mode')).toBeInTheDocument();
    expect(screen.getByText('Light Mode')).toBeInTheDocument();
  });

  it('renders correctly in dark mode', () => {
    // Override mock to return dark mode
    vi.mocked(useTheme).mockReturnValueOnce({
      isDark: true,
      toggleTheme: mockToggleTheme,
    } as any);

    render(<ThemeToggleButton />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    expect(screen.getByText('dark_mode')).toBeInTheDocument();
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', () => {
    render(<ThemeToggleButton />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('hides label when showLabel is false', () => {
    render(<ThemeToggleButton showLabel={false} />);
    
    expect(screen.queryByText('Light Mode')).not.toBeInTheDocument();
    // Icon should still be there
    expect(screen.getByText('light_mode')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ThemeToggleButton className="custom-test-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-test-class');
  });
});
