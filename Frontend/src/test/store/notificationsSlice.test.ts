import { describe, it, expect } from 'vitest';
import notificationsReducer, {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearNotifications,
} from '../../store/slices/notificationsSlice';
import type { NotificationData } from '../../store/slices/notificationsSlice';

describe('notificationsSlice reducer', () => {
  const initialState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    totalElements: 0,
  };

  const unreadNotif: NotificationData = {
    id: 1,
    userId: 10,
    type: 'SYSTEM',
    title: 'Welcome',
    message: 'Hello world',
    isRead: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const readNotif: NotificationData = {
    ...unreadNotif,
    id: 2,
    isRead: true,
  };

  it('should handle initial state', () => {
    expect(notificationsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setNotifications and calculate unread count', () => {
    const actual = notificationsReducer(initialState, setNotifications([unreadNotif, readNotif]));
    expect(actual.notifications).toHaveLength(2);
    expect(actual.unreadCount).toBe(1);
  });

  it('should handle addNotification (unread) and increment count', () => {
    const actual = notificationsReducer(initialState, addNotification(unreadNotif));
    expect(actual.notifications).toHaveLength(1);
    expect(actual.unreadCount).toBe(1);
    
    // Add another unread
    const actual2 = notificationsReducer(actual, addNotification({ ...unreadNotif, id: 3 }));
    expect(actual2.notifications).toHaveLength(2);
    expect(actual2.unreadCount).toBe(2);
  });

  it('should handle addNotification (read) without incrementing count', () => {
    const actual = notificationsReducer(initialState, addNotification(readNotif));
    expect(actual.notifications).toHaveLength(1);
    expect(actual.unreadCount).toBe(0);
  });

  it('should handle markAsRead', () => {
    const stateWithNotifs = notificationsReducer(initialState, setNotifications([unreadNotif, readNotif]));
    
    const actual = notificationsReducer(stateWithNotifs, markAsRead(1)); // Mark the unread one as read
    
    expect(actual.notifications[0].isRead).toBe(true);
    expect(actual.unreadCount).toBe(0);
  });

  it('should ignore markAsRead if already read or not found', () => {
    const stateWithNotifs = notificationsReducer(initialState, setNotifications([unreadNotif, readNotif]));
    
    // Attempt to mark the already read one
    const actual = notificationsReducer(stateWithNotifs, markAsRead(2));
    expect(actual.unreadCount).toBe(1); // Unchanged
    
    // Attempt to mark a non-existent one
    const actual2 = notificationsReducer(stateWithNotifs, markAsRead(99));
    expect(actual2.unreadCount).toBe(1); // Unchanged
  });

  it('should handle markAllAsRead', () => {
    const stateWithNotifs = notificationsReducer(initialState, setNotifications([unreadNotif, { ...unreadNotif, id: 3 }]));
    expect(stateWithNotifs.unreadCount).toBe(2);
    
    const actual = notificationsReducer(stateWithNotifs, markAllAsRead());
    expect(actual.unreadCount).toBe(0);
    expect(actual.notifications.every(n => n.isRead)).toBe(true);
  });

  it('should handle removeNotification', () => {
    const stateWithNotifs = notificationsReducer(initialState, setNotifications([unreadNotif, readNotif]));
    
    // Remove the unread one
    const actual = notificationsReducer(stateWithNotifs, removeNotification(1));
    expect(actual.notifications).toHaveLength(1);
    expect(actual.unreadCount).toBe(0); // Decremented
  });

  it('should handle clearNotifications', () => {
    const stateWithNotifs = notificationsReducer(initialState, setNotifications([unreadNotif, readNotif]));
    
    const actual = notificationsReducer(stateWithNotifs, clearNotifications());
    expect(actual.notifications).toHaveLength(0);
    expect(actual.unreadCount).toBe(0);
  });
});
