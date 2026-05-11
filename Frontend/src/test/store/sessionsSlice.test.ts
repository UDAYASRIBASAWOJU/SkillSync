import { describe, it, expect } from 'vitest';
import sessionsReducer, {
  setSessions,
  setUpcomingSessions,
  setCompletedSessions,
  setPendingSessions,
  setCancelledSessions,
  addSession,
  updateSession,
  deleteSession,
  setSelectedSession,
  setSessionsLoading,
  setSessionsError,
  setSessionsTotalElements,
  setSessionsPage,
} from '../../store/slices/sessionsSlice';
import type { SessionData } from '../../store/slices/sessionsSlice';

describe('sessionsSlice reducer', () => {
  const initialState = {
    sessions: [],
    upcomingSessions: [],
    completedSessions: [],
    pendingSessions: [],
    cancelledSessions: [],
    selectedSession: null,
    isLoading: false,
    error: null,
    totalElements: 0,
    currentPage: 0,
  };

  const mockSession: SessionData = {
    id: 1,
    mentorId: 10,
    learnerId: 20,
    mentorName: 'Jane Mentor',
    learnerName: 'John Learner',
    sessionDate: '2024-05-15T10:00:00Z',
    sessionDuration: 60,
    sessionFees: 50,
    status: 'REQUESTED',
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-01T10:00:00Z',
  };

  it('should handle initial state', () => {
    expect(sessionsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setSessions', () => {
    const actual = sessionsReducer(initialState, setSessions([mockSession]));
    expect(actual.sessions).toHaveLength(1);
  });

  it('should handle setUpcomingSessions', () => {
    const actual = sessionsReducer(initialState, setUpcomingSessions([mockSession]));
    expect(actual.upcomingSessions).toHaveLength(1);
  });

  it('should handle setCompletedSessions', () => {
    const actual = sessionsReducer(initialState, setCompletedSessions([mockSession]));
    expect(actual.completedSessions).toHaveLength(1);
  });

  it('should handle setPendingSessions', () => {
    const actual = sessionsReducer(initialState, setPendingSessions([mockSession]));
    expect(actual.pendingSessions).toHaveLength(1);
  });

  it('should handle setCancelledSessions', () => {
    const actual = sessionsReducer(initialState, setCancelledSessions([mockSession]));
    expect(actual.cancelledSessions).toHaveLength(1);
  });

  it('should handle addSession', () => {
    const actual = sessionsReducer(initialState, addSession(mockSession));
    expect(actual.sessions).toHaveLength(1);
    expect(actual.sessions[0].id).toBe(1);
  });

  it('should handle updateSession', () => {
    const stateWithSession = { ...initialState, sessions: [mockSession] };
    const updatedSession = { ...mockSession, status: 'ACCEPTED' as const };
    
    const actual = sessionsReducer(stateWithSession, updateSession(updatedSession));
    expect(actual.sessions[0].status).toBe('ACCEPTED');
  });

  it('should ignore updateSession if not found', () => {
    const stateWithSession = { ...initialState, sessions: [mockSession] };
    const updatedSession = { ...mockSession, id: 99, status: 'ACCEPTED' as const };
    
    const actual = sessionsReducer(stateWithSession, updateSession(updatedSession));
    expect(actual.sessions[0].status).toBe('REQUESTED'); // Unchanged
  });

  it('should handle deleteSession', () => {
    const stateWithSession = { ...initialState, sessions: [mockSession] };
    const actual = sessionsReducer(stateWithSession, deleteSession(1));
    expect(actual.sessions).toHaveLength(0);
  });

  it('should handle setSelectedSession', () => {
    const actual = sessionsReducer(initialState, setSelectedSession(mockSession));
    expect(actual.selectedSession).toEqual(mockSession);
  });

  it('should handle setSessionsLoading', () => {
    const actual = sessionsReducer(initialState, setSessionsLoading(true));
    expect(actual.isLoading).toBe(true);
  });

  it('should handle setSessionsError', () => {
    const actual = sessionsReducer(initialState, setSessionsError('Error'));
    expect(actual.error).toBe('Error');
  });

  it('should handle setSessionsTotalElements', () => {
    const actual = sessionsReducer(initialState, setSessionsTotalElements(100));
    expect(actual.totalElements).toBe(100);
  });

  it('should handle setSessionsPage', () => {
    const actual = sessionsReducer(initialState, setSessionsPage(3));
    expect(actual.currentPage).toBe(3);
  });
});
