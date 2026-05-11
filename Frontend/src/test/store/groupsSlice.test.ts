import { describe, it, expect } from 'vitest';
import groupsReducer, {
  setGroups,
  setMyGroups,
  addGroup,
  updateGroup,
  removeGroup,
  setSelectedGroup,
  setGroupsLoading,
  setGroupsError,
  setGroupsTotalElements,
  setGroupsPage,
  setGroupsSearchQuery,
  joinGroup,
  leaveGroup,
} from '../../store/slices/groupsSlice';
import type { GroupData } from '../../store/slices/groupsSlice';

describe('groupsSlice reducer', () => {
  const initialState = {
    groups: [],
    myGroups: [],
    selectedGroup: null,
    isLoading: false,
    error: null,
    totalElements: 0,
    currentPage: 0,
    searchQuery: '',
  };

  const mockGroup: GroupData = {
    id: 1,
    name: 'Study Group',
    description: 'A place to study',
    category: 'Education',
    createdBy: 123,
    createdByName: 'John Doe',
    memberCount: 5,
    isJoined: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-02',
  };

  it('should handle initial state', () => {
    expect(groupsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setGroups', () => {
    const actual = groupsReducer(initialState, setGroups([mockGroup]));
    expect(actual.groups).toHaveLength(1);
    expect(actual.groups[0].id).toBe(1);
  });

  it('should handle setMyGroups', () => {
    const actual = groupsReducer(initialState, setMyGroups([mockGroup]));
    expect(actual.myGroups).toHaveLength(1);
    expect(actual.myGroups[0].id).toBe(1);
  });

  it('should handle addGroup', () => {
    const actual = groupsReducer(initialState, addGroup(mockGroup));
    expect(actual.groups).toHaveLength(1);
    expect(actual.myGroups).toHaveLength(1);
    expect(actual.groups[0].id).toBe(1);
  });

  it('should handle updateGroup', () => {
    const stateWithGroup = { ...initialState, groups: [mockGroup] };
    const updatedGroup = { ...mockGroup, name: 'Updated Name' };
    const actual = groupsReducer(stateWithGroup, updateGroup(updatedGroup));
    expect(actual.groups[0].name).toBe('Updated Name');
  });

  it('should not update if group not found', () => {
    const stateWithGroup = { ...initialState, groups: [mockGroup] };
    const updatedGroup = { ...mockGroup, id: 99, name: 'Updated Name' };
    const actual = groupsReducer(stateWithGroup, updateGroup(updatedGroup));
    expect(actual.groups[0].name).toBe('Study Group');
  });

  it('should handle removeGroup', () => {
    const stateWithGroup = { ...initialState, groups: [mockGroup], myGroups: [mockGroup] };
    const actual = groupsReducer(stateWithGroup, removeGroup(1));
    expect(actual.groups).toHaveLength(0);
    expect(actual.myGroups).toHaveLength(0);
  });

  it('should handle setSelectedGroup', () => {
    const actual = groupsReducer(initialState, setSelectedGroup(mockGroup));
    expect(actual.selectedGroup).toEqual(mockGroup);
  });

  it('should handle setGroupsLoading', () => {
    const actual = groupsReducer(initialState, setGroupsLoading(true));
    expect(actual.isLoading).toBe(true);
  });

  it('should handle setGroupsError', () => {
    const actual = groupsReducer(initialState, setGroupsError('Failed to load'));
    expect(actual.error).toBe('Failed to load');
  });

  it('should handle setGroupsTotalElements', () => {
    const actual = groupsReducer(initialState, setGroupsTotalElements(42));
    expect(actual.totalElements).toBe(42);
  });

  it('should handle setGroupsPage', () => {
    const actual = groupsReducer(initialState, setGroupsPage(2));
    expect(actual.currentPage).toBe(2);
  });

  it('should handle setGroupsSearchQuery', () => {
    const actual = groupsReducer(initialState, setGroupsSearchQuery('test'));
    expect(actual.searchQuery).toBe('test');
  });

  it('should handle joinGroup', () => {
    const stateWithGroup = { ...initialState, groups: [mockGroup] };
    const actual = groupsReducer(stateWithGroup, joinGroup(1));
    expect(actual.groups[0].isJoined).toBe(true);
    expect(actual.groups[0].memberCount).toBe(6);
    expect(actual.myGroups).toHaveLength(1);
    expect(actual.myGroups[0].id).toBe(1);
  });

  it('should handle leaveGroup', () => {
    const joinedGroup = { ...mockGroup, isJoined: true, memberCount: 6 };
    const stateWithGroup = { 
      ...initialState, 
      groups: [joinedGroup],
      myGroups: [joinedGroup]
    };
    
    const actual = groupsReducer(stateWithGroup, leaveGroup(1));
    expect(actual.groups[0].isJoined).toBe(false);
    expect(actual.groups[0].memberCount).toBe(5);
    expect(actual.myGroups).toHaveLength(0);
  });

  it('should not fail on joinGroup if group not found', () => {
    const actual = groupsReducer(initialState, joinGroup(99));
    expect(actual).toEqual(initialState);
  });

  it('should not fail on leaveGroup if group not found', () => {
    const actual = groupsReducer(initialState, leaveGroup(99));
    expect(actual).toEqual(initialState);
  });
});
