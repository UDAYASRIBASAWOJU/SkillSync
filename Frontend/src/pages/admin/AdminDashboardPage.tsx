import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axios';
import PageLayout from '../../components/layout/PageLayout';

interface AdminStats {
  totalUsers: number;
  totalMentors: number;
  totalSessions: number;
  pendingMentorApprovals: number;
}

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/admin/stats');
        return res.data as AdminStats;
      } catch {
        return { totalUsers: 0, totalMentors: 0, totalSessions: 0, pendingMentorApprovals: 0 } as AdminStats;
      }
    },
    staleTime: 30_000,
  });

  if (statsLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
        </div>
      </PageLayout>
    );
  }

  const statCards = [
    { label: 'Total Users',        value: stats?.totalUsers ?? 0,             icon: 'group',           border: 'border-l-pink-500',   iconBg: 'bg-pink-500/10',   iconColor: 'text-pink-500' },
    { label: 'Approved Mentors',   value: stats?.totalMentors ?? 0,           icon: 'school',          border: 'border-l-rose-500',   iconBg: 'bg-rose-500/10',   iconColor: 'text-rose-500' },
    { label: 'Total Sessions',     value: stats?.totalSessions ?? 0,          icon: 'event',           border: 'border-l-fuchsia-500',iconBg: 'bg-fuchsia-500/10',iconColor: 'text-fuchsia-500' },
    { label: 'Pending Approvals',  value: stats?.pendingMentorApprovals ?? 0, icon: 'pending_actions', border: 'border-l-amber-500',  iconBg: 'bg-amber-500/10',  iconColor: 'text-amber-500' },
  ];

  const quickLinks = [
    { title: 'Manage Users',     description: 'View, search, filter, and manage all platform users',          icon: 'manage_accounts', path: '/admin/users',             color: 'text-pink-600',    bg: 'bg-pink-500/10' },
    { title: 'Mentor Approvals', description: 'Review and approve/reject pending mentor applications',        icon: 'how_to_reg',      path: '/admin/mentor-approvals',  color: 'text-rose-600',    bg: 'bg-rose-500/10' },
    { title: 'Manage Skills',    description: 'Add and manage platform skills for mentors',                   icon: 'psychology',      path: '/admin/skills',            color: 'text-fuchsia-600', bg: 'bg-fuchsia-500/10' },
    { title: 'Manage Groups',    description: 'Create groups, edit group settings, and remove members',       icon: 'groups',          path: '/admin/groups',            color: 'text-pink-700',    bg: 'bg-pink-700/10' },
  ];

  return (
    <PageLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="w-1/2 bg-gradient-to-r from-rose-100 via-pink-100 to-orange-50 rounded-xl p-5 relative overflow-hidden border border-rose-200/60 shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/30 rounded-full blur-2xl -mr-8 -mt-8" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-pink-400 text-base">admin_panel_settings</span>
                <span className="text-pink-500 text-[10px] font-bold uppercase tracking-widest">Admin Portal</span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-rose-900 mb-0.5">Admin Dashboard</h1>
              <p className="text-rose-600 text-xs">System overview and platform management tools</p>
            </div>
            <span className="material-symbols-outlined text-pink-200 text-[52px] shrink-0 hidden md:block">shield</span>
          </div>
        </div>

        {/* Stats Cards — compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`bg-surface-container-lowest rounded-xl p-4 shadow-sm border-l-4 ${card.border} border border-outline-variant/10 hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-3`}
            >
              <div className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined text-[20px] ${card.iconColor}`}>{card.icon}</span>
              </div>
              <div>
                <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">{card.label}</p>
                <p className="text-2xl font-black text-on-surface leading-tight">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-extrabold text-on-surface tracking-tight">Quick Actions</h2>
            <span className="text-[9px] font-black uppercase tracking-widest bg-pink-500/10 text-pink-500 border border-pink-500/20 px-2 py-0.5 rounded-full">
              Admin Controls
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/10 hover:shadow-md hover:-translate-y-0.5 hover:border-pink-400/40 transition-all text-left group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 group-hover:from-pink-500/5 group-hover:to-rose-500/5 transition-all duration-300 rounded-xl" />
                <div className={`w-10 h-10 ${link.bg} rounded-lg flex items-center justify-center mb-3 relative z-10`}>
                  <span className={`material-symbols-outlined text-[20px] ${link.color}`}>{link.icon}</span>
                </div>
                <h3 className="text-base font-extrabold text-on-surface mb-0.5 group-hover:text-pink-600 transition-colors relative z-10">{link.title}</h3>
                <p className="text-xs text-on-surface-variant relative z-10 leading-relaxed">{link.description}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                  Open <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminDashboardPage;
