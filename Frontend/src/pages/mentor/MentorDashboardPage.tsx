
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import api from '../../services/axios';
import { useToast } from '../../components/ui/Toast';
import { useActionConfirm } from '../../components/ui/ActionConfirm';
import { formatDateTimeIST } from '../../utils/dateTime';

const MentorDashboardPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { requestConfirmation } = useActionConfirm();

  // Fetch Mentor Profile to get mentorId and rating
  const { data: mentorData } = useQuery({
    queryKey: ['mentor', 'my'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/mentors/me', { _skipErrorRedirect: true } as any);
        return res.data;
      } catch (e) {
        return null;
      }
    }
  });

  const mentorId = mentorData?.id;

  const { data: mentorSessionsObj } = useQuery({
    queryKey: ['sessions', 'mentor', 'dashboard-summary'],
    queryFn: async () => {
      const res = await api.get('/api/sessions/mentor?page=0&size=200', { _skipErrorRedirect: true } as any);
      return res.data;
    },
    refetchInterval: 20000,
  });

  // Reviews Query
  const { data: recentReviewsObj } = useQuery({
    queryKey: ['reviews', mentorId],
    queryFn: async () => {
      const res = await api.get(`/api/reviews/mentor/${mentorId}?page=0&size=3`, { _skipErrorRedirect: true } as any);
      return res.data;
    },
    enabled: !!mentorId
  });

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: async (id: number) => api.put(`/api/sessions/${id}/accept`, undefined, { _skipErrorRedirect: true } as any),
    onSuccess: () => {
      showToast({ message: 'Session accepted!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => api.put(`/api/sessions/${id}/reject`, undefined, { _skipErrorRedirect: true } as any),
    onSuccess: () => {
      showToast({ message: 'Session rejected.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (id: number) => api.put(`/api/sessions/${id}/complete`, undefined, { _skipErrorRedirect: true } as any),
    onSuccess: () => {
      showToast({ message: 'Session marked complete!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['mentor', 'earnings'] });
      queryClient.invalidateQueries({ queryKey: ['mentor', 'earnings', 'completed-sessions'] });
    }
  });

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const p = name.split(' ');
    return p.length > 1 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : p[0][0].toUpperCase();
  };

  const handleAccept = async (req: any) => {
    const name = getSessionDisplayName(req);
    const time = getSessionDateTimeLabel(req);
    const confirmed = await requestConfirmation({
      title: 'Accept Session Request?',
      message: `Are you sure you want to accept the session request from ${name} scheduled on ${time}? Once accepted, the learner will be notified and the session will appear in your upcoming schedule.`,
      confirmLabel: 'Yes, Accept',
      cancelLabel: 'Not Now',
      variant: 'success',
    });
    if (!confirmed) return;
    acceptMutation.mutate(req.id);
  };

  const handleReject = async (req: any) => {
    const name = getSessionDisplayName(req);
    const time = getSessionDateTimeLabel(req);
    const confirmed = await requestConfirmation({
      title: 'Reject Session Request?',
      message: `Are you sure you want to reject the session request from ${name} on ${time}? The learner will be notified and a refund will be initiated automatically.`,
      confirmLabel: 'Yes, Reject',
      cancelLabel: 'Keep Request',
      variant: 'danger',
    });
    if (!confirmed) return;
    rejectMutation.mutate(req.id);
  };

  const allMentorSessions = mentorSessionsObj?.content || [];
  const pendingRequests = allMentorSessions.filter((session: any) => session.status === 'REQUESTED').slice(0, 5);
  const pendingRequestsCount = allMentorSessions.filter((session: any) => session.status === 'REQUESTED').length;
  const upcomingSessions = allMentorSessions.filter((session: any) => session.status === 'ACCEPTED').slice(0, 5);
  const upcomingSessionsCount = allMentorSessions.filter((session: any) => session.status === 'ACCEPTED').length;
  const totalSessionsCount = Number(
    mentorData?.totalSessions ?? allMentorSessions.filter((session: any) => session.status === 'COMPLETED').length
  );
  const recentReviews = recentReviewsObj?.content || [];
  const mentorRating = Number(mentorData?.avgRating ?? mentorData?.rating ?? 0);
  const isNewMentor = totalSessionsCount === 0;

  const getSessionDisplayName = (session: any) => {
    if (session.learnerName) return session.learnerName;
    return 'Learner';
  };

  const getSessionDateTimeLabel = (session: any) => {
    const raw = session.startTime || session.sessionDate;
    if (!raw) return 'Time unavailable';
    return formatDateTimeIST(raw);
  };

  const rightPanel = (
    <>
      {/* Manage Groups */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/15">
        <h3 className="font-bold text-lg text-on-surface mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined">groups</span> Manage Groups
        </h3>
        <p className="text-xs text-on-surface-variant font-medium mb-4 leading-relaxed">
          Explore groups and join communities. Joined groups let you message and moderate learner messages.
        </p>
        <button
          onClick={() => navigate('/groups')}
          className="w-full bg-primary text-on-primary px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary-dark transition-colors"
        >
          Open Group Hub
        </button>
      </div>

      {/* Action Required — Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-amber-500/20">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="font-bold text-lg text-on-surface">Action Required</h3>
            <span className="bg-error text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingRequestsCount} Pending
            </span>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((req: any) => (
              <div key={req.id} className="flex flex-col gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {getInitials(getSessionDisplayName(req))}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-on-surface leading-tight">{getSessionDisplayName(req)}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{getSessionDateTimeLabel(req)}</p>
                  </div>
                </div>
                {/* Accept / Reject buttons — confirm dialog via handler */}
                <div className="flex gap-2">
                  <button
                    onClick={() => void handleReject(req)}
                    disabled={rejectMutation.isPending}
                    className="flex-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-3 py-1.5 rounded-lg text-xs font-bold border border-outline-variant/30 transition-colors disabled:opacity-50"
                  >Reject</button>
                  <button
                    onClick={() => void handleAccept(req)}
                    disabled={acceptMutation.isPending}
                    className="flex-1 gradient-btn text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  >Accept</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Reviews */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/15">
        <h3 className="font-bold text-lg text-on-surface mb-4">Recent Reviews</h3>
        
        {recentReviews.length > 0 ? (
          <div className="space-y-4">
            {recentReviews.map((review: any) => (
              <div key={review.id} className="pb-4 border-b border-outline-variant/10 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-on-surface">{review.learnerName || 'Learner'}</span>
                  <span className="text-xs font-semibold text-on-surface-variant">{formatDateTimeIST(review.createdAt)}</span>
                </div>
                <div className="flex text-amber-500 text-[12px] mb-1">
                  {Array(5).fill(0).map((_, i) => (
                    <span key={i} className={i < review.rating ? 'material-symbols-outlined' : 'material-symbols-outlined text-outline-variant/30'}>
                      star
                    </span>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant italic line-clamp-2">"{review.comment}"</p>
              </div>
            ))}
            {mentorId && (
              <button 
                onClick={() => navigate(`/mentors/${mentorId}`)}
                className="w-full text-center text-sm font-bold text-primary hover:underline block pt-2"
              >
                View All Profile Reviews
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm font-medium text-on-surface-variant italic text-center py-4">No reviews received yet.</p>
        )}
      </div>

    </>
  );

  return (
    <PageLayout rightPanel={rightPanel}>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden mb-2">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl -ml-8 -mb-8" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-teal-200 text-2xl">school</span>
              <span className="text-teal-200 text-sm font-bold uppercase tracking-widest">Mentor Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">Mentor Dashboard</h1>
            <p className="text-teal-100 text-base">Manage requests, view your schedule, and set availability.</p>
          </div>
          {mentorId && (
            <button onClick={() => navigate(`/mentors/${mentorId}`)} className="shrink-0 flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur px-5 py-2.5 rounded-xl text-sm font-bold border border-white/20 transition-all">
              View Public Profile <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats and Availability Manager Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Vertical Stats Column */}
        <section className="flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border-l-4 border-amber-400 flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-amber-500 text-[24px]">star</span>
            </div>
            <div>
              <p className="text-2xl font-black text-on-surface">{isNewMentor ? 'NEW' : mentorRating.toFixed(1)}</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Avg Rating</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border-l-4 border-teal-500 flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-teal-500 text-[24px]">event_note</span>
            </div>
            <div>
              <p className="text-2xl font-black text-on-surface">{totalSessionsCount}</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total Sessions</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border-l-4 border-orange-400 flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-orange-400/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-orange-500 text-[24px]">pending_actions</span>
            </div>
            <div>
              <p className={`text-2xl font-black ${pendingRequestsCount > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>{pendingRequestsCount}</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Pending</p>
            </div>
          </div>
        </section>

        {/* Availability Manager */}
        {mentorId && (
          <section className="lg:col-span-2 h-full">
            <div className="bg-primary/5 p-8 rounded-2xl shadow-sm border border-primary/20 h-full flex flex-col justify-center items-start">
              <h2 className="text-2xl font-bold text-primary mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[28px]">event_available</span> Availability Manager
              </h2>
              <p className="text-base text-on-surface-variant font-medium mb-6 leading-relaxed max-w-lg">
                Manage your weekly schedule.
              </p>
              <button
                onClick={() => navigate('/mentor/availability')}
                className="gradient-btn text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                Open Availability Manager
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Upcoming Sessions */}
      <section className="mb-4">
        <h2 className="text-xl font-bold text-on-surface mb-4">Upcoming Sessions</h2>
        <div className="space-y-4">
          {upcomingSessionsCount > 0 ? (
            upcomingSessions.map((session: any) => (
              <div key={session.id} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    {getInitials(getSessionDisplayName(session))}
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface leading-tight text-lg">{getSessionDisplayName(session)}</h4>
                    <p className="text-xs font-semibold text-on-surface-variant mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {getSessionDateTimeLabel(session)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button className="bg-surface-container hover:bg-surface-container-high text-on-surface px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors border border-outline-variant/10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">videocam</span> Join Call
                  </button>
                  <button 
                    onClick={() => completeMutation.mutate(session.id)}
                    disabled={completeMutation.isPending}
                    className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    Mark Comp
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm font-medium text-on-surface-variant px-2">No upcoming confirmed sessions.</p>
          )}
        </div>
      </section>

    </PageLayout>
  );
};

export default MentorDashboardPage;
