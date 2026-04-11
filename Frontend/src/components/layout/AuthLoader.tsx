import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { useLocation } from 'react-router-dom';
import api from '../../services/axios';
import { store } from '../../store';
import type { ReactNode } from 'react';

export const AuthLoader = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const hasAttempted = useRef(false);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const path = location.pathname;
      const isPublicPath =
        path === '/' ||
        path === '/ppt' ||
        path === '/feppt' ||
        path === '/skillsync_study_guide.html' ||
        path === '/login' ||
        path === '/register' ||
        path === '/verify-otp' ||
        path === '/reset-password' ||
        path === '/setup-password' ||
        path === '/forgot-password';

      if (isPublicPath) {
        if (mounted) setLoading(false);
        return;
      }

      // Read directly from store to avoid stale closures and prevent
      // re-triggering the effect when auth state changes.
      const currentAuth = store.getState().auth;

      // If user isn't loaded yet, try to fetch identity using cookies
      if (!currentAuth.user && !hasAttempted.current) {
        hasAttempted.current = true;

        const loadCurrentUser = async () => {
          const { data } = await api.get('/api/auth/me', {
            _skipErrorRedirect: true,
            _skipAuthRedirect: true,
          } as any);

          if (mounted && data) {
            const latestAuth = store.getState().auth;
            dispatch(setCredentials({
              accessToken: latestAuth.accessToken ?? undefined,
              refreshToken: latestAuth.refreshToken ?? undefined,
              user: data,
            }));
          }
        };

        try {
          // Use /api/auth/me which extracts user from JWT cookie and returns UserSummary with role
          await loadCurrentUser();
        } catch (error) {
          const status = (error as any)?.response?.status;

          if (status === 401) {
            try {
              // Access token may be expired (24h). Try refresh cookie (7d) and retry /me once.
              await api.post(
                '/api/auth/refresh',
                undefined,
                {
                  _skipErrorRedirect: true,
                  _skipAuthRedirect: true,
                } as any,
              );
              await loadCurrentUser();
            } catch {
              console.error('User not authenticated on load - requires login');
            }
          } else {
            console.error('User not authenticated on load - requires login');
          }
        }
      }
      
      if (mounted) setLoading(false);
    };

    initAuth();

    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthLoader;
