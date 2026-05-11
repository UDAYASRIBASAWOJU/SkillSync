import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../../components/ui/Toast';

// Component to trigger toast for testing
const TestComponent = ({ message, type }: { message: string; type?: 'success' | 'error' | 'info' }) => {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast({ message, type })}>
      Trigger Toast
    </button>
  );
};

describe('Toast Component & Provider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('does not show toast initially', () => {
    render(
      <ToastProvider>
        <TestComponent message="Hello" />
      </ToastProvider>
    );
    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
  });

  it('shows success toast and removes it after 3 seconds', () => {
    render(
      <ToastProvider>
        <TestComponent message="Success message" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Trigger Toast'));

    // Toast should be visible
    const toast = screen.getByText('Success message');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass('bg-primary');

    // Fast-forward 3000ms
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Toast should be removed
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('shows error toast with correct styling', () => {
    render(
      <ToastProvider>
        <TestComponent message="Error message" type="error" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Trigger Toast'));

    const toast = screen.getByText('Error message');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass('bg-error');
  });

  it('shows info toast with correct styling', () => {
    render(
      <ToastProvider>
        <TestComponent message="Info message" type="info" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Trigger Toast'));

    const toast = screen.getByText('Info message');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass('bg-secondary');
  });

  it('throws error when useToast is used outside of ToastProvider', () => {
    const OriginalError = console.error;
    console.error = vi.fn(); // Suppress expected error log

    const BrokenComponent = () => {
      useToast();
      return null;
    };

    expect(() => render(<BrokenComponent />)).toThrow('useToast must be used within ToastProvider');

    console.error = OriginalError;
  });
});
