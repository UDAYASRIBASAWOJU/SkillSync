import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import api from '../../services/axios';

interface SidebarProps {
  role: 'ROLE_LEARNER' | 'ROLE_MENTOR' | 'ROLE_ADMIN';
  isOpen: boolean;
}

const Sidebar = ({ role, isOpen }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.warn("Logout request failed cleanly", e);
    } finally {
      dispatch(logout());
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-[#FFDAC1]/50 flex flex-col justify-between z-40 transition-all duration-300 shadow-sm ${isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'}`}>
      <div className="flex flex-col flex-1 overflow-y-auto w-full scrollbar-hide pt-4">

        {/* NAVIGATION LIKS */}
        <nav className="flex-1 w-full px-2 py-4 space-y-2">
          {activeNav.map((item) => {
            const isActive = location.pathname === item.path;
            const linkClasses = `flex items-center justify-center ${isOpen ? 'lg:justify-start' : ''} px-2 h-12 rounded-2xl transition-all duration-200 group ${
              isActive 
                ? 'bg-[#FFDAC1] text-[#A66C68] shadow-sm font-extrabold' 
                : 'text-[#888888] hover:bg-[#F2F0C8]/50 hover:text-[#5A5A5A] font-semibold'
            }`;

            return (
              <Link key={item.name} to={item.path} className={linkClasses} title={!isOpen ? item.name : undefined}>
                <span className={`material-symbols-outlined text-[26px] transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'} ${isOpen ? 'ml-2' : ''}`}>
                  {item.icon}
                </span>
                <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 ml-4 max-w-[200px]' : 'opacity-0 max-w-0 ml-0 hidden lg:block'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM SECTION */}
      <div className="w-full shrink-0 p-2 border-t border-[#FFDAC1]/50 flex flex-col gap-2 bg-[#FFDAC1]/10">
        {role === 'ROLE_LEARNER' && (
          <button 
            onClick={() => navigate('/mentors')}
            className={`w-full flex items-center justify-center h-12 bg-[#FFB7B2] text-white rounded-2xl shadow-sm hover:focus:ring-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${!isOpen ? 'px-0' : 'px-4'}`}
            title="Find a Mentor"
          >
            <span className="material-symbols-outlined text-[26px]">search</span>
            <span className={`font-bold whitespace-nowrap transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 ml-2 max-w-[200px]' : 'opacity-0 max-w-0 ml-0 hidden lg:block'}`}>
              Find a Mentor
            </span>
          </button>
        )}

        <Link to="/help" className={`flex items-center justify-center ${isOpen ? 'lg:justify-start' : ''} px-2 h-12 rounded-2xl text-[#888888] hover:bg-[#F2F0C8]/50 hover:text-[#5A5A5A] transition-all duration-200 group`} title="Help Center">
          <span className={`material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform ${isOpen ? 'ml-2' : ''}`}>help</span>
          <span className={`font-semibold whitespace-nowrap transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 ml-4 max-w-[200px]' : 'opacity-0 max-w-0 ml-0 hidden lg:block'}`}>
            Help Center
          </span>
        </Link>

        <button 
          onClick={handleLogout}
          className={`w-full flex items-center justify-center ${isOpen ? 'lg:justify-start' : ''} px-2 h-12 rounded-2xl text-[#FFB7B2] hover:bg-[#FFB7B2]/10 transition-all duration-200 group`}
          title="Logout"
        >
          <span className={`material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform ${isOpen ? 'ml-2' : ''}`}>logout</span>
          <span className={`font-semibold whitespace-nowrap transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 ml-4 max-w-[200px]' : 'opacity-0 max-w-0 ml-0 hidden lg:block'}`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
