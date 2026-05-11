import { describe, it, expect } from 'vitest';
import mentorsReducer, {
  setMentors,
  addMentor,
  updateMentor,
  setSelectedMentor,
  setMyMentorProfile,
  setMentorsLoading,
  setMentorsError,
  setMentorsTotalElements,
  setMentorsPage,
  setMentorsFilters,
  clearMentorsFilters,
} from '../../store/slices/mentorsSlice';
import type { MentorData } from '../../store/slices/mentorsSlice';

describe('mentorsSlice reducer', () => {
  const initialState = {
    mentors: [],
    selectedMentor: null,
    myMentorProfile: null,
    isLoading: false,
    error: null,
    totalElements: 0,
    currentPage: 0,
    filters: {
      skill: '',
      minRating: 0,
      maxPrice: 10000,
      minPrice: 0,
      search: '',
    },
  };

  const mockMentor: MentorData = {
    id: 1,
    userId: 10,
    name: 'Jane Mentor',
    email: 'jane@example.com',
    bio: 'Great mentor',
    experience: 5,
    hourlyRate: 50,
    rating: 4.8,
    reviewCount: 12,
    isApproved: true,
    skills: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  it('should handle initial state', () => {
    expect(mentorsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setMentors', () => {
    const actual = mentorsReducer(initialState, setMentors([mockMentor]));
    expect(actual.mentors).toHaveLength(1);
    expect(actual.mentors[0].name).toBe('Jane Mentor');
  });

  it('should handle addMentor', () => {
    const actual = mentorsReducer(initialState, addMentor(mockMentor));
    expect(actual.mentors).toHaveLength(1);
  });

  it('should handle updateMentor', () => {
    const stateWithMentor = { ...initialState, mentors: [mockMentor] };
    const updatedMentor = { ...mockMentor, bio: 'Updated bio' };
    const actual = mentorsReducer(stateWithMentor, updateMentor(updatedMentor));
    expect(actual.mentors[0].bio).toBe('Updated bio');
  });

  it('should ignore updateMentor if not found', () => {
    const stateWithMentor = { ...initialState, mentors: [mockMentor] };
    const updatedMentor = { ...mockMentor, id: 99, bio: 'Updated bio' };
    const actual = mentorsReducer(stateWithMentor, updateMentor(updatedMentor));
    expect(actual.mentors[0].bio).toBe('Great mentor'); // Unchanged
  });

  it('should handle setSelectedMentor', () => {
    const actual = mentorsReducer(initialState, setSelectedMentor(mockMentor));
    expect(actual.selectedMentor).toEqual(mockMentor);
  });

  it('should handle setMyMentorProfile', () => {
    const actual = mentorsReducer(initialState, setMyMentorProfile(mockMentor));
    expect(actual.myMentorProfile).toEqual(mockMentor);
  });

  it('should handle setMentorsLoading', () => {
    const actual = mentorsReducer(initialState, setMentorsLoading(true));
    expect(actual.isLoading).toBe(true);
  });

  it('should handle setMentorsFilters', () => {
    const actual = mentorsReducer(initialState, setMentorsFilters({ search: 'React', minRating: 4 }));
    expect(actual.filters.search).toBe('React');
    expect(actual.filters.minRating).toBe(4);
    // Preserves existing keys
    expect(actual.filters.maxPrice).toBe(10000);
  });

  it('should handle clearMentorsFilters', () => {
    const stateWithFilters = {
      ...initialState,
      filters: {
        skill: 'Java',
        minRating: 4.5,
        maxPrice: 50,
        minPrice: 10,
        search: 'Expert',
      },
    };
    const actual = mentorsReducer(stateWithFilters, clearMentorsFilters());
    expect(actual.filters).toEqual(initialState.filters);
  });
});
