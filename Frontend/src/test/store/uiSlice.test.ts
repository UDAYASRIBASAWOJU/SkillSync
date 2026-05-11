import { describe, it, expect } from 'vitest';
import uiReducer, {
  toggleSidebar,
  setSidebarOpen,
  toggleNotifications,
  setNotificationsOpen,
  setTheme,
  setLoading,
  setError,
  clearError,
} from '../../store/slices/uiSlice';

describe('uiSlice reducer', () => {
  const initialState = {
    sidebarOpen: true,
    notificationsOpen: false,
    theme: 'light' as 'light' | 'dark',
    loading: false,
    error: null,
  };

  it('should handle initial state', () => {
    expect(uiReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle toggleSidebar', () => {
    const actual = uiReducer(initialState, toggleSidebar());
    expect(actual.sidebarOpen).toBe(false);

    const actual2 = uiReducer(actual, toggleSidebar());
    expect(actual2.sidebarOpen).toBe(true);
  });

  it('should handle setSidebarOpen', () => {
    const actual = uiReducer(initialState, setSidebarOpen(false));
    expect(actual.sidebarOpen).toBe(false);
  });

  it('should handle toggleNotifications', () => {
    const actual = uiReducer(initialState, toggleNotifications());
    expect(actual.notificationsOpen).toBe(true);
  });

  it('should handle setNotificationsOpen', () => {
    const actual = uiReducer(initialState, setNotificationsOpen(true));
    expect(actual.notificationsOpen).toBe(true);
  });

  it('should handle setTheme', () => {
    const actual = uiReducer(initialState, setTheme('dark'));
    expect(actual.theme).toBe('dark');
  });

  it('should handle setLoading', () => {
    const actual = uiReducer(initialState, setLoading(true));
    expect(actual.loading).toBe(true);
  });

  it('should handle setError', () => {
    const actual = uiReducer(initialState, setError('Something went wrong'));
    expect(actual.error).toBe('Something went wrong');
  });

  it('should handle clearError', () => {
    const stateWithError = { ...initialState, error: 'Error occurred' };
    const actual = uiReducer(stateWithError, clearError());
    expect(actual.error).toBeNull();
  });
});
