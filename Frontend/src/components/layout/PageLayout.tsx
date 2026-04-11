import type { ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import logo from '../../assets/skillsync-logo.png';

interface PageLayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

const PageLayout = ({ children, rightPanel }: PageLayoutProps) => {
  const role = useSelector((state: RootState) => state.auth.role);
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const dispatch = useDispatch();
  const activeRole = role || 'ROLE_LEARNER';
  const roleLabel = activeRole.replace('ROLE_', '');

  return (
    <div className="flex h-screen bg-surface font-sans text-on-surface overflow-hidden">
      {/* STATIC BRANDING & TOGGLE */}
      <div className="fixed top-0 left-0 h-16 w-64 flex items-center px-4 lg:px-8 z-50 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg hover:bg-black/5 text-[var(--sidebar-text)] transition-colors bg-[var(--navbar-bg)]/50 backdrop-blur-md"
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
      </div>

      <Sidebar role={activeRole} />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'ml-20 lg:ml-64' : 'ml-0'}`}>
        <Navbar />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full p-4 md:p-6 lg:p-8 2xl:p-10 scroll-smooth">
          {rightPanel ? (
            <div className="w-full flex flex-col xl:flex-row gap-6 lg:gap-8">
              <div className="flex-1 min-w-0 flex flex-col gap-6 lg:gap-8">
                {children}
              </div>
              <aside className="w-full xl:w-80 shrink-0 flex flex-col gap-6">
                {rightPanel}
              </aside>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-6 lg:gap-8">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
