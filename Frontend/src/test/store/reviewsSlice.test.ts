import { describe, it, expect } from 'vitest';
import reviewsReducer, {
  setReviews,
  setMentorReviews,
  setMyReviews,
  addReview,
  updateReview,
  removeReview,
  setSelectedReview,
  setReviewsLoading,
  setReviewsError,
  setReviewsTotalElements,
  setReviewsPage,
} from '../../store/slices/reviewsSlice';
import type { ReviewData } from '../../store/slices/reviewsSlice';

describe('reviewsSlice reducer', () => {
  const initialState = {
    reviews: [],
    mentorReviews: [],
    myReviews: [],
    selectedReview: null,
    isLoading: false,
    error: null,
    totalElements: 0,
    currentPage: 0,
  };

  const mockReview: ReviewData = {
    id: 1,
    mentorId: 10,
    mentorName: 'Jane Mentor',
    learnerId: 20,
    learnerName: 'John Learner',
    sessionId: 30,
    rating: 5,
    comment: 'Excellent session!',
    isAnonymous: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  it('should handle initial state', () => {
    expect(reviewsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setReviews', () => {
    const actual = reviewsReducer(initialState, setReviews([mockReview]));
    expect(actual.reviews).toHaveLength(1);
    expect(actual.reviews[0].comment).toBe('Excellent session!');
  });

  it('should handle setMentorReviews', () => {
    const actual = reviewsReducer(initialState, setMentorReviews([mockReview]));
    expect(actual.mentorReviews).toHaveLength(1);
  });

  it('should handle setMyReviews', () => {
    const actual = reviewsReducer(initialState, setMyReviews([mockReview]));
    expect(actual.myReviews).toHaveLength(1);
  });

  it('should handle addReview', () => {
    const actual = reviewsReducer(initialState, addReview(mockReview));
    expect(actual.reviews).toHaveLength(1);
    expect(actual.myReviews).toHaveLength(1); // Also added to myReviews
  });

  it('should handle updateReview', () => {
    const stateWithReview = {
      ...initialState,
      reviews: [mockReview],
      myReviews: [mockReview],
    };
    
    const updatedReview = { ...mockReview, rating: 4, comment: 'Good' };
    const actual = reviewsReducer(stateWithReview, updateReview(updatedReview));
    
    expect(actual.reviews[0].rating).toBe(4);
    expect(actual.myReviews[0].rating).toBe(4);
  });

  it('should handle removeReview', () => {
    const stateWithReview = {
      ...initialState,
      reviews: [mockReview],
      myReviews: [mockReview],
    };
    
    const actual = reviewsReducer(stateWithReview, removeReview(1));
    expect(actual.reviews).toHaveLength(0);
    expect(actual.myReviews).toHaveLength(0);
  });

  it('should handle setSelectedReview', () => {
    const actual = reviewsReducer(initialState, setSelectedReview(mockReview));
    expect(actual.selectedReview).toEqual(mockReview);
  });

  it('should handle setReviewsLoading', () => {
    const actual = reviewsReducer(initialState, setReviewsLoading(true));
    expect(actual.isLoading).toBe(true);
  });

  it('should handle setReviewsError', () => {
    const actual = reviewsReducer(initialState, setReviewsError('Failed'));
    expect(actual.error).toBe('Failed');
  });

  it('should handle setReviewsTotalElements', () => {
    const actual = reviewsReducer(initialState, setReviewsTotalElements(10));
    expect(actual.totalElements).toBe(10);
  });

  it('should handle setReviewsPage', () => {
    const actual = reviewsReducer(initialState, setReviewsPage(1));
    expect(actual.currentPage).toBe(1);
  });
});
