import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActionConfirmProvider, useActionConfirm } from '../../components/ui/ActionConfirm';

// Simple test component that triggers the confirmation dialog
const TriggerButton = ({ variant = 'danger' as const, message = 'Are you sure?' }) => {
  const { requestConfirmation } = useActionConfirm();
  return (
    <button
      onClick={async () => {
        await requestConfirmation({ title: 'Confirm', message, variant });
      }}
    >
      Open Dialog
    </button>
  );
};

const renderWithProvider = (ui: React.ReactElement) =>
  render(<ActionConfirmProvider>{ui}</ActionConfirmProvider>);

describe('ActionConfirmProvider', () => {
  it('renders children without showing dialog initially', () => {
    renderWithProvider(<div data-testid="child">Child</div>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /confirm/i })).not.toBeInTheDocument();
  });

  it('opens dialog when requestConfirmation is called', async () => {
    renderWithProvider(<TriggerButton message="Delete this item?" />);
    fireEvent.click(screen.getByText('Open Dialog'));
    await waitFor(() => {
      expect(screen.getByText('Delete this item?')).toBeInTheDocument();
    });
  });

  it('shows the correct title and message', async () => {
    renderWithProvider(<TriggerButton message="This cannot be undone." />);
    fireEvent.click(screen.getByText('Open Dialog'));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Confirm' })).toBeInTheDocument();
      expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    });
  });

  it('closes dialog when Cancel is clicked', async () => {
    renderWithProvider(<TriggerButton />);
    fireEvent.click(screen.getByText('Open Dialog'));
    await waitFor(() => screen.getByText('Are you sure?'));

    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });
  });

  it('closes dialog when Confirm is clicked', async () => {
    renderWithProvider(<TriggerButton />);
    fireEvent.click(screen.getByText('Open Dialog'));
    await waitFor(() => screen.getByText('Are you sure?'));

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => {
      expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });
  });

  it('closes dialog when backdrop is clicked', async () => {
    renderWithProvider(<TriggerButton />);
    fireEvent.click(screen.getByText('Open Dialog'));
    await waitFor(() => screen.getByText('Are you sure?'));

    // The outer overlay div acts as backdrop
    const backdrop = screen.getByText('Are you sure?').closest('[class*="fixed"]');
    if (backdrop) fireEvent.click(backdrop);

    await waitFor(() => {
      expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });
  });

  it('closes dialog on Escape key press', async () => {
    renderWithProvider(<TriggerButton />);
    fireEvent.click(screen.getByText('Open Dialog'));
    await waitFor(() => screen.getByText('Are you sure?'));

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });
  });

  it('throws if useActionConfirm is used outside provider', () => {
    const OriginalError = console.error;
    console.error = vi.fn(); // suppress React's error boundary noise

    const BrokenComponent = () => {
      useActionConfirm();
      return null;
    };

    expect(() => render(<BrokenComponent />)).toThrow(
      'useActionConfirm must be used within ActionConfirmProvider'
    );

    console.error = OriginalError;
  });
});
