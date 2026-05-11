import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

import api from '../../services/axios';
import { useActionConfirm } from '../../components/ui/ActionConfirm';

interface SidebarProps {
  role: 'ROLE_LEARNER' | 'ROLE_MENTOR' | 'ROLE_ADMIN';
}

const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { requestConfirmation } = useActionConfirm();

  const learnerNav = [
    { name: 'Dashboard', icon: 'grid_view', path: '/learner' },
    { name: 'Mentor Search', icon: 'person_search', path: '/mentors' },
    { name: 'My Sessions', icon: 'event_upcoming', path: '/sessions' },
    { name: 'Groups', icon: 'groups', path: '/groups' },
  ];

  const mentorNav = [
    { name: 'Dashboard', icon: 'grid_view', path: '/mentor' },
    { name: 'My Sessions', icon: 'event_upcoming', path: '/sessions' },
    { name: 'Group', icon: 'groups', path: '/groups' },
    { name: 'My Availability', icon: 'event_available', path: '/mentor/availability' },
    { name: 'My Profile', icon: 'account_circle', path: '/profile' },
    { name: 'Earnings', icon: 'payments', path: '/mentor/earnings' },
  ];

  const adminNav = [
    { name: 'Dashboard', icon: 'grid_view', path: '/admin' },
    { name: 'Manage Users', icon: 'group', path: '/admin/users' },
    { name: 'Approve Mentors', icon: 'how_to_reg', path: '/admin/mentor-approvals' },
    { name: 'Manage Skills', icon: 'psychology', path: '/admin/skills' },
    { name: 'Manage Groups', icon: 'groups', path: '/admin/groups' },
  ];

  const activeNav = role === 'ROLE_MENTOR' ? mentorNav : role === 'ROLE_ADMIN' ? adminNav : learnerNav;

  const handleLogout = async () => {
    const confirmed = await requestConfirmation({
      title: 'Sign Out?',
      message: 'Are you sure you want to log out of SkillSync? You will need to login again to access your account.',
      confirmLabel: 'Yes, Log Out',
      cancelLabel: 'Stay',
      variant: 'warning',
    });
    if (!confirmed) return;

    // Eagerly logout on the client side for instant feedback
    dispatch(logout());
    localStorage.clear();
    navigate('/login');

    // Fire and forget the server-side logout
    api.post('/api/auth/logout').catch((e) => {
      console.warn('Server-side logout request failed or was aborted', e);
    });
  };

  return (
    <nav className="w-full bg-[var(--sidebar-bg)] border-b border-[var(--sidebar-border)] shadow-sm shrink-0 overflow-x-auto scrollbar-hide z-20">
      <div className="flex items-center px-4 lg:px-8 min-w-max">
        {/* NAVIGATION LINKS */}
        <div className="flex flex-1 items-center gap-1 lg:gap-2 py-2">
          {activeNav.map((item) => {
            const isActive = location.pathname === item.path;
            const linkClasses = `flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 group ${isActive
              ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-text)] shadow-sm font-extrabold'
              : 'text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-active-bg)]/40 hover:text-[var(--sidebar-text)] font-semibold'
              }`;

            return (
              <Link key={item.name} to={item.path} className={linkClasses}>
                <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="text-sm whitespace-nowrap">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* DIVIDER */}
        <div className="w-px h-8 bg-outline-variant/30 mx-4 shrink-0" />

        {/* BOTTOM SECTION (Now on the right) */}
        <div className="flex items-center gap-1 lg:gap-2 shrink-0 py-2">
          <Link to="/help" className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-active-bg)]/40 hover:text-[var(--sidebar-text)] transition-all duration-200 group">
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">help</span>
            <span className="text-sm font-semibold whitespace-nowrap">Help Center</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[#ba1a1a] hover:bg-[#ba1a1a]/10 transition-all duration-200 group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">logout</span>
            <span className="text-sm font-semibold whitespace-nowrap">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
