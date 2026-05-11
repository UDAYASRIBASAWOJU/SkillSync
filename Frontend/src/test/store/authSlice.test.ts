import { describe, it, expect } from 'vitest';
import authReducer, {
  setCredentials,
  logout,
  updateUserName,
} from '../../store/slices/authSlice';

describe('authSlice reducer', () => {
  const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    role: null,
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'ROLE_LEARNER',
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setCredentials', () => {
    const payload = {
      user: mockUser,
      accessToken: 'access123',
      refreshToken: 'refresh123',
    };

    const actual = authReducer(initialState, setCredentials(payload));
    expect(actual.user).toEqual(mockUser);
    expect(actual.accessToken).toBe('access123');
    expect(actual.refreshToken).toBe('refresh123');
    expect(actual.isAuthenticated).toBe(true);
    expect(actual.role).toBe('ROLE_LEARNER');
  });

  it('should handle setCredentials omitting tokens to update user only', () => {
    const stateWithTokens = {
      ...initialState,
      accessToken: 'old-access',
      refreshToken: 'old-refresh',
      isAuthenticated: true,
    };

    const payload = {
      user: { ...mockUser, firstName: 'Jane' },
    };

    const actual = authReducer(stateWithTokens, setCredentials(payload));
    
    expect(actual.user?.firstName).toBe('Jane');
    // tokens should be preserved since they were not provided in payload
    expect(actual.accessToken).toBe('old-access');
    expect(actual.refreshToken).toBe('old-refresh');
  });

  it('should handle logout', () => {
    const loggedInState = {
      user: mockUser,
      accessToken: 'access123',
      refreshToken: 'refresh123',
      isAuthenticated: true,
      role: 'ROLE_LEARNER' as const,
    };

    const actual = authReducer(loggedInState, logout());
    expect(actual).toEqual(initialState);
  });

  it('should handle updateUserName', () => {
    const stateWithUser = {
      ...initialState,
      user: mockUser,
    };

    const actual = authReducer(stateWithUser, updateUserName({ firstName: 'Johnny', lastName: 'Smith' }));
    expect(actual.user?.firstName).toBe('Johnny');
    expect(actual.user?.lastName).toBe('Smith');
  });

  it('should do nothing on updateUserName if no user is set', () => {
    const actual = authReducer(initialState, updateUserName({ firstName: 'Johnny', lastName: 'Smith' }));
    expect(actual.user).toBeNull();
  });
});
