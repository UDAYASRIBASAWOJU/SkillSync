import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/axios';
import notificationService from '../../services/notificationService';
import type { RootState } from '../../store';
import ThemeToggleButton from '../ui/ThemeToggleButton';
import logo from '../../assets/skillsync-logo.png';

interface NavbarProps {
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
}

const Navbar = ({ onMenuClick, isSidebarOpen }: NavbarProps) => {
  const user = useSelector((state: RootState) => state.auth.user);
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
  const avatarClass = colors[colorIndex] || 'bg-[#FFB7B2]';

  return (
    <header className="h-16 w-full glass-nav bg-white/90 border-b border-[#FFDAC1]/50 flex items-center justify-between px-4 lg:px-6 z-30 sticky top-0 transition-all shadow-sm">
      <div className="flex-1 flex items-center gap-3">
        <button onClick={onMenuClick} className="p-2 -ml-2 rounded-xl text-[#888888] hover:text-[#FFB7B2] hover:bg-[#FFB7B2]/10 transition-colors focus:outline-none">
          <span className="material-symbols-outlined text-[28px] leading-none">{isSidebarOpen ? 'menu_open' : 'menu'}</span>
        </button>
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logo} alt="SkillSync logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-black text-[#FFB7B2] tracking-tight hidden sm:block">SkillSync</span>
        </Link>
      </div>

      <div className="flex items-center space-x-3">
        <ThemeToggleButton className="px-2.5 py-1.5" showLabel={false} />

        <Link to="/notifications" className="relative p-2 rounded-full flex hover:bg-[#F2F0C8]/50 text-[#888888] hover:text-[#FFB7B2] transition-all duration-200">
          <span className="material-symbols-outlined text-[26px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 min-w-[18px] h-[18px] bg-[#B5EAD7] text-[#4A4A4A] border border-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <Link to="/profile" className="flex items-center pl-3 border-l border-[#FFDAC1]/50 hover:opacity-80 transition-opacity">
          <div className="hidden md:flex flex-col items-end mr-3">
            <span className="text-sm font-bold text-[#4A4A4A] leading-tight">{user?.firstName} {user?.lastName}</span>
            <span className="text-xs text-[#888888] font-medium">Hello there</span>
          </div>
          <div className={`w-9 h-9 rounded-full ${avatarClass} text-white flex items-center justify-center font-bold shadow-sm shrink-0 border-2 border-white`}>
            {initials}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
