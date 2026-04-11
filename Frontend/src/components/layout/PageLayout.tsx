import { useState } from 'react';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface PageLayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

const PageLayout = ({ children, rightPanel }: PageLayoutProps) => {
  const role = useSelector((state: RootState) => state.auth.role);
  const activeRole = role || 'ROLE_LEARNER';
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#C7CEEA] font-sans text-[#4A4A4A] overflow-hidden">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/10 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar role={activeRole as any} isOpen={isSidebarOpen} />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
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
