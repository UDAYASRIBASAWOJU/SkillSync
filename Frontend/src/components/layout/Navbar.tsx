import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/axios';
import notificationService from '../../services/notificationService';
import type { RootState } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import ThemeToggleButton from '../ui/ThemeToggleButton';
import logo from '../../assets/skillsync-logo.png';

const Navbar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const unsubscribe = notificationService.subscribeToNotifications(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    });

    return unsubscribe;
  }, [queryClient, user?.id]);

  const { data: notificationData } = useQuery({
    queryKey: ['unread-notifications', user?.id || 'unknown'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/notifications/unread/count', { _skipErrorRedirect: true } as any);
        return response.data;
      } catch (e) {
        return { count: 0 };
      }
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const unreadCount = notificationData?.count || 0;
  
  const initial1 = user?.firstName?.[0]?.toUpperCase() || 'U';
  const initial2 = user?.lastName?.[0]?.toUpperCase() || '';
  const initials = `${initial1}${initial2}`;
  
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];
  const colorIndex = (initial1.charCodeAt(0) % colors.length);
  const avatarClass = colors[colorIndex] || 'bg-primary';

  const role = useSelector((state: RootState) => state.auth.role);
  const roleLabel = role?.replace('ROLE_', '') || 'LEARNER';

  return (
    <header className="h-16 w-full glass-nav bg-[var(--navbar-bg)]/80 border-b border-[var(--sidebar-border)] flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0 transition-all">
      <div className="flex-1 flex items-center gap-4">
        <button 
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-lg hover:bg-black/5 text-[var(--sidebar-text)] transition-colors"
          aria-label="Toggle Sidebar"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="SkillSync logo" className="w-8 h-8 object-contain" onError={(e: any) => { e.target.src = 'https://via.placeholder.com/32'; }} />
          <div className="flex flex-col">
            <span className="text-lg font-black text-[var(--sidebar-text)] tracking-tight leading-tight">SkillSync</span>
            <span className="text-[10px] font-bold text-[var(--sidebar-text-muted)] uppercase tracking-widest">{roleLabel}</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-4 text-[#191c1e]">
        <ThemeToggleButton className="px-2.5 py-1.5" showLabel={false} />

        <Link to="/notifications" className="relative p-2 rounded-full flex hover:bg-[var(--pastel-peach)]/50 transition-all duration-200">
          <span className="material-symbols-outlined text-[26px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 min-w-[18px] h-[18px] bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse-slow">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <Link to="/profile" className="flex items-center pl-4 border-l border-outline-variant/30 hover:opacity-80 transition-opacity">
          <div className="hidden md:flex flex-col items-end mr-3">
            <span className="text-sm font-bold text-on-surface leading-tight">{user?.firstName} {user?.lastName}</span>
            <span className="text-xs text-on-surface-variant font-medium">Hello there</span>
          </div>
          <div className={`w-9 h-9 rounded-full ${avatarClass} text-white flex items-center justify-center font-bold shadow-md shrink-0`}>
            {initials}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
