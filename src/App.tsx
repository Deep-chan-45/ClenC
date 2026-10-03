import React, { useEffect, useState } from 'react';
import {
  Complaint,
  ComplaintStatus,
  Language,
  PageView,
  PickupRequest,
  PickupStatus,
  Role,
  UserProfile,
} from './types';
import {
  INITIAL_COMPLAINTS,
  INITIAL_PICKUPS,
  INITIAL_USER,
  GUEST_USER,
  WORKERS,
} from './data/mockData';
import {
  LegalModal,
  MobileBottomBar,
  TopNavbar,
} from './components/NavbarAndModals';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import {
  CitizenDashboardView,
  PickupRequestView,
  ReportIssueView,
  TrackComplaintsView,
} from './pages/CitizenViews';
import { AwarenessPage } from './pages/AwarenessPage';
import {
  AdminDashboardView,
  WorkerDashboardView,
} from './pages/WorkerAndAdminViews';
import {
  auth,
  testConnection,
  subscribeToComplaints,
  subscribeToPickups,
  saveComplaintToFirestore,
  updateComplaintInFirestore,
  savePickupToFirestore,
  updatePickupStatusInFirestore,
  saveUserProfileToFirestore,
  logoutFromFirebase,
  seedInitialKanpurDataIfEmpty,
  MUNICIPAL_ADMIN_EMAIL,
  getMunicipalAdminProfile,
  getCollectorWorkerProfile,
  COLLECTOR_DEMO_EMAIL,
  withTimeout,
  DUMMY_COMPLAINT_IDS,
  DUMMY_PICKUP_IDS,
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('landing');
  const [language, setLanguage] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [authUser, setAuthUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('clenc_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved) as UserProfile;
        if (
          !parsed ||
          parsed.name === 'Aarav Sachan' ||
          parsed.name === 'Guest Citizen' ||
          parsed.name?.toLowerCase().includes('aarav') ||
          (parsed.name?.toLowerCase().includes('sachan') && parsed.role !== 'admin') ||
          parsed.contact === '+91 98390 44120'
        ) {
          localStorage.removeItem('clenc_auth_user');
          return null;
        }
        return parsed;
      }
      return null;
    } catch (_) {
      return null;
    }
  });
  const [user, setUser] = useState<UserProfile>(authUser || GUEST_USER);
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem('clenc_complaints_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const authentic = parsed.filter(
            (c: Complaint) => c && c.id && !DUMMY_COMPLAINT_IDS.includes(c.id)
          );
          localStorage.setItem('clenc_complaints_cache', JSON.stringify(authentic));
          return authentic;
        }
      }
    } catch (_) {}
    return INITIAL_COMPLAINTS;
  });
  const [pickups, setPickups] = useState<PickupRequest[]>(() => {
    try {
      const saved = localStorage.getItem('clenc_pickups_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const authentic = parsed.filter(
            (p: PickupRequest) => p && p.id && !DUMMY_PICKUP_IDS.includes(p.id)
          );
          localStorage.setItem('clenc_pickups_cache', JSON.stringify(authentic));
          return authentic;
        }
      }
    } catch (_) {}
    return INITIAL_PICKUPS;
  });
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('clenc_complaints_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed.find(
            (c: Complaint) => c && c.id && !DUMMY_COMPLAINT_IDS.includes(c.id)
          );
          if (first) return first.id;
        }
      }
    } catch (_) {}
    return INITIAL_COMPLAINTS[0]?.id || '';
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<'tos' | 'privacy' | null>(null);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(true);
  const [authNotice, setAuthNotice] = useState<string>('');
  const [authInitialRole, setAuthInitialRole] = useState<Role>('citizen');

  // Initialize Firebase connection, auth listener, and real-time Firestore sync
  useEffect(() => {
    testConnection();
    seedInitialKanpurDataIfEmpty();

    // Listen to Firebase Authentication State
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const cleanEmail = (fbUser.email || '').trim().toLowerCase();
        const displayName = (fbUser.displayName || '').trim().toLowerCase();
        const isMunicipalAdmin = cleanEmail === MUNICIPAL_ADMIN_EMAIL;
        const isCollectorWorker =
          cleanEmail === COLLECTOR_DEMO_EMAIL ||
          cleanEmail.includes('collector') ||
          cleanEmail.includes('worker') ||
          cleanEmail.includes('safai');

        // Immediately purge lingering Aarav Sachan test account or unrecognized auto-sessions
        if (
          displayName.includes('aarav') ||
          (displayName.includes('sachan') && !isMunicipalAdmin) ||
          cleanEmail.includes('aarav')
        ) {
          await logoutFromFirebase().catch(() => {});
          localStorage.removeItem('clenc_auth_user');
          localStorage.removeItem('clenc_session_user');
          setAuthUser(null);
          setUser(GUEST_USER);
          return;
        }

        let savedCachedUser: UserProfile | null = null;
        try {
          const cached = localStorage.getItem('clenc_auth_user');
          if (cached) savedCachedUser = JSON.parse(cached);
        } catch (_) {}

        let resolvedUser: UserProfile;

        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await withTimeout(getDoc(userDocRef), 1000, null);
          if (snap && snap.exists()) {
            let data = snap.data() as UserProfile;
            if (
              data.name?.toLowerCase().includes('aarav') ||
              (data.name?.toLowerCase().includes('sachan') && data.role !== 'admin')
            ) {
              await logoutFromFirebase().catch(() => {});
              localStorage.removeItem('clenc_auth_user');
              localStorage.removeItem('clenc_session_user');
              setAuthUser(null);
              setUser(GUEST_USER);
              return;
            }

            if (isMunicipalAdmin && data.role !== 'admin') {
              data = {
                ...data,
                role: 'admin',
                name: data.name || 'Deepak Sachan',
                ward: data.ward || 'Ward 07 - Civil Lines & Mall Road',
                address: data.address || 'Kanpur Nagar Nigam HQ, Moti Jheel Compound',
              };
              saveUserProfileToFirestore(fbUser.uid, data).catch(() => {});
            } else if ((isCollectorWorker || savedCachedUser?.role === 'worker') && data.role !== 'worker') {
              data = {
                ...data,
                role: 'worker',
                userType: 'Public Place',
              };
              saveUserProfileToFirestore(fbUser.uid, data).catch(() => {});
            }
            resolvedUser = data;
          } else {
            if (isMunicipalAdmin) {
              resolvedUser = getMunicipalAdminProfile(fbUser.uid);
              saveUserProfileToFirestore(fbUser.uid, resolvedUser).catch(() => {});
            } else if (isCollectorWorker || savedCachedUser?.role === 'worker') {
              resolvedUser = getCollectorWorkerProfile(fbUser.uid);
              resolvedUser.contact = fbUser.email || resolvedUser.contact;
              saveUserProfileToFirestore(fbUser.uid, resolvedUser).catch(() => {});
            } else {
              resolvedUser = {
                ...INITIAL_USER,
                name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Civic Citizen',
                contact: fbUser.email || '',
              };
            }
          }
        } catch (e) {
          console.warn('Note reading profile in onAuthStateChanged:', e);
          if (isMunicipalAdmin) {
            resolvedUser = getMunicipalAdminProfile(fbUser.uid);
          } else if (isCollectorWorker || savedCachedUser?.role === 'worker') {
            resolvedUser = getCollectorWorkerProfile(fbUser.uid);
          } else {
            resolvedUser = {
              ...INITIAL_USER,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Civic Citizen',
              contact: fbUser.email || '',
            };
          }
        }

        if (
          resolvedUser.name?.toLowerCase().includes('aarav') ||
          (resolvedUser.name?.toLowerCase().includes('sachan') && resolvedUser.role !== 'admin')
        ) {
          await logoutFromFirebase().catch(() => {});
          localStorage.removeItem('clenc_auth_user');
          localStorage.removeItem('clenc_session_user');
          setAuthUser(null);
          setUser(GUEST_USER);
          return;
        }

        setUser(resolvedUser);
        setAuthUser(resolvedUser);
        try {
          localStorage.setItem('clenc_auth_user', JSON.stringify(resolvedUser));
        } catch (_) {}

        // If the user was on the auth page waiting for sign in, immediately route them to their console or pending target
        setCurrentPage((prevPage) => {
          if (prevPage === 'auth') {
            const pending = sessionStorage.getItem('clenc_pending_page');
            if (pending) {
              sessionStorage.removeItem('clenc_pending_page');
              return pending as PageView;
            }
            if (resolvedUser.role === 'admin') return 'admin-dashboard';
            if (resolvedUser.role === 'worker') return 'worker-dashboard';
            return 'citizen-dashboard';
          }
          return prevPage;
        });
      } else {
        const saved = localStorage.getItem('clenc_auth_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as UserProfile;
            if (
              !parsed ||
              parsed.name === 'Aarav Sachan' ||
              parsed.name === 'Guest Citizen' ||
              parsed.name?.toLowerCase().includes('aarav') ||
              (parsed.name?.toLowerCase().includes('sachan') && parsed.role !== 'admin') ||
              parsed.contact === '+91 98390 44120'
            ) {
              localStorage.removeItem('clenc_auth_user');
              setAuthUser(null);
              setUser(GUEST_USER);
            } else {
              setAuthUser(parsed);
              setUser(parsed);
            }
          } catch (_) {
            setAuthUser(null);
            setUser(GUEST_USER);
          }
        } else {
          setAuthUser(null);
          setUser(GUEST_USER);
        }
      }
    });

    // Real-time Firestore sync for complaints
    const unsubscribeComplaints = subscribeToComplaints(
      (liveComplaints) => {
        const authentic = (liveComplaints || []).filter(
          (c) => c && c.id && !DUMMY_COMPLAINT_IDS.includes(c.id)
        );
        setComplaints(authentic);
        try {
          localStorage.setItem('clenc_complaints_cache', JSON.stringify(authentic));
        } catch (_) {}
      },
      () => {
        // Fall back quietly if firestore offline
        setFirebaseConnected(false);
      }
    );

    // Real-time Firestore sync for pickup bookings
    const unsubscribePickups = subscribeToPickups(
      (livePickups) => {
        const authentic = (livePickups || []).filter(
          (p) => p && p.id && !DUMMY_PICKUP_IDS.includes(p.id)
        );
        setPickups(authentic);
        try {
          localStorage.setItem('clenc_pickups_cache', JSON.stringify(authentic));
        } catch (_) {}
      },
      () => {
        setFirebaseConnected(false);
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeComplaints();
      unsubscribePickups();
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4200);
  };

  const handleNavigate = (page: PageView) => {
    // Clear transient auth notice when navigating normally
    if (page !== 'auth') {
      setAuthNotice('');
    }

    // MANDATORY AUTH GUARD: Unauthenticated citizens cannot access citizen hub, report issue, or book pickups
    if (!authUser && (page === 'report-issue' || page === 'pickup-request' || page === 'citizen-dashboard')) {
      sessionStorage.setItem('clenc_pending_page', page);
      if (page === 'report-issue') {
        setAuthNotice(
          'Registration / Sign In Required: Please register or sign in before reporting a waste issue so your report can be verified, tracked, and stored in the municipal database.'
        );
      } else if (page === 'pickup-request') {
        setAuthNotice(
          'Registration / Sign In Required: Please register or sign in to book a doorstep bulk waste collection pickup.'
        );
      } else {
        setAuthNotice(
          'Registration / Sign In Required: Please sign in or register to access the Citizen Portal.'
        );
      }
      setAuthInitialRole('citizen');
      setCurrentPage('auth');
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }

    // Route guard: Only Municipal Admins can access admin-dashboard
    if (page === 'admin-dashboard') {
      const currentEmail = (auth.currentUser?.email || authUser?.contact || authUser?.email || '').trim().toLowerCase();
      if (!authUser || (authUser.role !== 'admin' && currentEmail !== MUNICIPAL_ADMIN_EMAIL)) {
        sessionStorage.setItem('clenc_pending_page', 'admin-dashboard');
        setAuthNotice('Municipal Admin Login Required: Please sign in with official municipal administrative credentials.');
        setAuthInitialRole('admin');
        setCurrentPage('auth');
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        return;
      }
    }

    // Route guard: Only Safai Mitra (Workers) and Municipal Admins can access worker-dashboard
    if (page === 'worker-dashboard') {
      if (!authUser || (authUser.role !== 'worker' && authUser.role !== 'admin')) {
        sessionStorage.setItem('clenc_pending_page', 'worker-dashboard');
        setAuthNotice(
          'Safai Mitra / Collector Login Required: Please sign in with your collector credentials to access your daily beat task panel.'
        );
        setAuthInitialRole('worker');
        showToast('Safai Mitra / Collector Login Required to open the Worker Task Panel.');
        setCurrentPage('auth');
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        return;
      }
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleRoleRedirect = (
    role: Role,
    updatedProfile?: Partial<UserProfile>
  ) => {
    // Security check: Only deepaksachan450@gmail.com is allowed the admin role
    if (role === 'admin') {
      const email = (
        auth.currentUser?.email ||
        updatedProfile?.contact ||
        authUser?.contact ||
        authUser?.email ||
        user?.contact ||
        user?.email ||
        ''
      ).trim().toLowerCase();

      if (email !== MUNICIPAL_ADMIN_EMAIL) {
        showToast(`Access Denied: Municipal Admin control is strictly restricted to ${MUNICIPAL_ADMIN_EMAIL}.`);
        if (user.role === 'worker') {
          handleNavigate('worker-dashboard');
        } else {
          handleNavigate('citizen-dashboard');
        }
        return;
      }
    }

    const nextUser: UserProfile = {
      ...(authUser || user),
      ...updatedProfile,
      role,
    };
    setUser(nextUser);
    setAuthUser(nextUser);
    try {
      localStorage.setItem('clenc_auth_user', JSON.stringify(nextUser));
    } catch (_) {}

    if (auth.currentUser) {
      saveUserProfileToFirestore(auth.currentUser.uid, nextUser).catch(() => {});
    }

    if (role === 'citizen') {
      handleNavigate('citizen-dashboard');
      showToast(`Signed in as ${nextUser.name} (Citizen Dashboard)`);
    } else if (role === 'worker') {
      handleNavigate('worker-dashboard');
      showToast(`Signed in as ${nextUser.name} (Collector Console)`);
    } else {
      handleNavigate('admin-dashboard');
      showToast(`Signed in as ${nextUser.name} (Municipal Admin Console)`);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutFromFirebase();
    } catch (e) {
      console.warn('Firebase logout note:', e);
    }
    try {
      localStorage.removeItem('clenc_auth_user');
      localStorage.removeItem('clenc_session_user');
    } catch (_) {}
    setAuthUser(null);
    setUser(GUEST_USER);
    handleNavigate('landing');
    showToast('Signed out successfully. Switched to public guest mode.');
  };

  const handleSubmitComplaint = async (newCmp: Complaint) => {
    // 1. Optimistic state update & local storage cache
    const updated = [newCmp, ...complaints.filter((c) => c.id !== newCmp.id)];
    setComplaints(updated);
    try {
      localStorage.setItem('clenc_complaints_cache', JSON.stringify(updated));
    } catch (_) {}
    setSelectedComplaintId(newCmp.id);
    const newPoints = (user.points || 0) + 30;
    const updatedUser = { ...user, points: newPoints };
    setUser(updatedUser);
    if (authUser) {
      setAuthUser(updatedUser);
      try {
        localStorage.setItem('clenc_auth_user', JSON.stringify(updatedUser));
      } catch (_) {}
    }

    // 2. Persist to Firebase Firestore collection 'complaints'
    const targetUid = auth.currentUser?.uid || ('uid' in user ? (user as unknown as { uid: string }).uid : '') || 'citizen_' + Date.now();
    try {
      await saveComplaintToFirestore(newCmp, targetUid);
      showToast(`Grievance ${newCmp.id} stored in Municipal Database (Firestore) · +30 Points`);
    } catch (err) {
      console.warn('Complaint firestore write note:', err);
      showToast(`Grievance ${newCmp.id} registered locally (+30 Points). Syncing with cloud database.`);
    }

    if (auth.currentUser) {
      saveUserProfileToFirestore(auth.currentUser.uid, { points: newPoints }).catch(() => {});
    }
  };

  const handleUpvoteComplaint = (id: string) => {
    let updatedComplaint: Complaint | undefined;
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updatedComplaint = { ...c, upvotes: c.upvotes + 1 };
          return updatedComplaint;
        }
        return c;
      })
    );
    const newPoints = user.points + 25;
    setUser((prev) => ({ ...prev, points: newPoints }));

    if (updatedComplaint) {
      updateComplaintInFirestore(id, { upvotes: updatedComplaint.upvotes }).catch(() => {});
    }

    if (auth.currentUser) {
      saveUserProfileToFirestore(auth.currentUser.uid, { points: newPoints }).catch(() => {});
    }

    showToast(`Upvoted report ${id} · Synced with Firebase (+25 Points)`);
  };

  const handleCreatePickup = (newPkp: PickupRequest) => {
    const updated = [newPkp, ...pickups.filter((p) => p.id !== newPkp.id)];
    setPickups(updated);
    try {
      localStorage.setItem('clenc_pickups_cache', JSON.stringify(updated));
    } catch (_) {}

    const newPoints = user.points + 40;
    setUser((prev) => ({ ...prev, points: newPoints }));

    // Persist to Firebase Firestore
    savePickupToFirestore(newPkp, auth.currentUser?.uid).catch((err) => {
      console.warn('Pickup firestore write note:', err);
    });

    if (auth.currentUser) {
      saveUserProfileToFirestore(auth.currentUser.uid, { points: newPoints }).catch(() => {});
    }

    showToast(
      `Pickup request ${newPkp.id} booked (${newPkp.quantityKg} kg ${newPkp.stream}) · Saved in Firebase`
    );
  };

  const handleAdvancePickupStatus = (id: string) => {
    const order: PickupStatus[] = [
      'Requested',
      'Scheduled',
      'Assigned',
      'Picked Up',
      'Closed',
    ];
    let nextStatus: PickupStatus | undefined;

    const updated = pickups.map((p) => {
      if (p.id !== id) return p;
      const idx = order.indexOf(p.status);
      nextStatus = order[Math.min(idx + 1, order.length - 1)];
      return { ...p, status: nextStatus };
    });

    setPickups(updated);
    try {
      localStorage.setItem('clenc_pickups_cache', JSON.stringify(updated));
    } catch (_) {}

    if (nextStatus) {
      updatePickupStatusInFirestore(id, nextStatus).catch(() => {});
      showToast(`Pickup ${id} status updated to ${nextStatus} (Stored in Firebase)`);
    }
  };

  const handleConfirmResolved = (
    id: string,
    rating: number,
    feedback: string
  ) => {
    let updatedTimeline: Complaint['timeline'] = [];
    const updated: Complaint[] = complaints.map((c) => {
      if (c.id !== id) return c;
      updatedTimeline = c.timeline.map((t) =>
        t.status === 'Closed'
          ? {
              ...t,
              timestamp: 'Verified by Citizen',
              note: `Citizen confirmed resolved (${rating}/5 stars): "${feedback}"`,
              completed: true,
            }
          : { ...t, completed: true }
      );
      return {
        ...c,
        status: 'Closed' as ComplaintStatus,
        slaHoursRemaining: 0,
        rating,
        feedback,
        timeline: updatedTimeline,
      };
    });

    setComplaints(updated);
    try {
      localStorage.setItem('clenc_complaints_cache', JSON.stringify(updated));
    } catch (_) {}

    const newPoints = user.points + 50;
    setUser((prev) => ({ ...prev, points: newPoints }));

    updateComplaintInFirestore(id, {
      status: 'Closed',
      slaHoursRemaining: 0,
      rating,
      feedback,
      timeline: updatedTimeline,
    }).catch(() => {});

    if (auth.currentUser) {
      saveUserProfileToFirestore(auth.currentUser.uid, { points: newPoints }).catch(() => {});
    }

    showToast(`Confirmed resolution for ${id} (${rating}/5 stars) · Synced in Firebase (+50 Points)`);
  };

  const handleReopenComplaint = (id: string, reason: string) => {
    let updatedTimeline: Complaint['timeline'] = [];
    const updated: Complaint[] = complaints.map((c) => {
      if (c.id !== id) return c;
      updatedTimeline = [
        ...c.timeline,
        {
          status: 'Reopened' as ComplaintStatus,
          timestamp: 'Just now',
          actor: user.name,
          note: `Reopened by citizen: ${reason}`,
          completed: true,
        },
      ];
      return {
        ...c,
        status: 'Reopened' as ComplaintStatus,
        slaHoursRemaining: -4,
        timeline: updatedTimeline,
      };
    });

    setComplaints(updated);
    try {
      localStorage.setItem('clenc_complaints_cache', JSON.stringify(updated));
    } catch (_) {}

    updateComplaintInFirestore(id, {
      status: 'Reopened',
      slaHoursRemaining: -4,
      timeline: updatedTimeline,
    }).catch(() => {});

    showToast(`Complaint ${id} reopened and escalated to Ward Supervisor (Stored in Firebase)`);
  };

  const handleWorkerOrAdminStatusChange = (
    id: string,
    status: ComplaintStatus,
    afterPhoto?: string
  ) => {
    let updatedTimeline: Complaint['timeline'] = [];
    let photo: string | undefined;

    const nowStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const updated = complaints.map((c) => {
      if (c.id !== id) return c;
      photo = afterPhoto || c.afterPhoto;
      updatedTimeline = c.timeline.map((t) => {
        if (t.status === status) {
          return {
            ...t,
            timestamp: `${nowStr}, Verified`,
            completed: true,
            note: status === 'Resolved'
              ? 'Site cleared and verified with completion photograph by Safai Mitra.'
              : t.note,
          };
        }
        if (status === 'Resolved' && (t.status === 'Assigned' || t.status === 'In Progress' || t.status === 'Verified' || t.status === 'Submitted')) {
          return { ...t, completed: true };
        }
        return t;
      });
      return {
        ...c,
        status,
        afterPhoto: photo,
        slaHoursRemaining: status === 'Resolved' || status === 'Closed' ? 0 : c.slaHoursRemaining,
        timeline: updatedTimeline,
      };
    });

    setComplaints(updated);
    try {
      localStorage.setItem('clenc_complaints_cache', JSON.stringify(updated));
    } catch (_) {}

    updateComplaintInFirestore(id, {
      status,
      afterPhoto: photo,
      slaHoursRemaining: status === 'Resolved' || status === 'Closed' ? 0 : undefined,
      timeline: updatedTimeline,
    }).catch(() => {});

    showToast(`Complaint ${id} updated to "${status}" with photo verification (Stored in Firebase)`);
  };

  const handleAssignWorker = (complaintId: string, workerId: string) => {
    const worker = WORKERS.find((w) => w.id === workerId);
    if (!worker) return;

    let targetStatus: ComplaintStatus = 'Assigned';
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          targetStatus = c.status === 'Submitted' ? 'Assigned' : c.status;
          return {
            ...c,
            assignedWorkerId: worker.id,
            assignedWorkerName: worker.name,
            assignedWorkerPhone: worker.phone,
            status: targetStatus,
          };
        }
        return c;
      })
    );

    updateComplaintInFirestore(complaintId, {
      assignedWorkerId: worker.id,
      assignedWorkerName: worker.name,
      assignedWorkerPhone: worker.phone,
      status: targetStatus,
    }).catch(() => {});

    showToast(`Assigned ${worker.name} (${worker.id}) to ${complaintId} (Synced in Firebase)`);
  };

  const handleAwardQuizPoints = (pts: number) => {
    const newPoints = user.points + pts;
    setUser((prev) => ({ ...prev, points: newPoints }));

    if (auth.currentUser) {
      saveUserProfileToFirestore(auth.currentUser.uid, { points: newPoints }).catch(() => {});
    }

    showToast(`SWM 2026 Segregation Quiz completed · +${pts} Civic Points saved in Firebase!`);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F2] dark:bg-[#0D1612] text-[#122017] dark:text-[#E7EFEA] flex flex-col">
      {/* Top Bar */}
      <TopNavbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        role={user.role}
        onRoleChange={(r) => handleRoleRedirect(r)}
        language={language}
        onToggleLanguage={() =>
          setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'))
        }
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        currentUser={authUser}
        onSignOut={handleSignOut}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-16 lg:bottom-6 right-4 z-50 max-w-md px-4 py-3 border border-[#15693F] bg-[#122017] text-[#F4F6F2] rounded-sm text-xs font-mono flex items-center justify-between gap-3 shadow-lg"
        >
          <span>[CLENC] {toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[#68C88E] font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Page Router */}
      <div className="flex-1">
        {currentPage === 'landing' && (
          <LandingPage
            language={language}
            onNavigate={handleNavigate}
            onQuickRoleLogin={(role) => {
              if (!authUser) {
                sessionStorage.setItem(
                  'clenc_pending_page',
                  role === 'admin'
                    ? 'admin-dashboard'
                    : role === 'worker'
                    ? 'worker-dashboard'
                    : 'citizen-dashboard'
                );
                setAuthNotice(
                  `Sign In / Registration Required: Please sign in or register to access the ${
                    role === 'worker'
                      ? 'Safai Mitra Task Panel'
                      : role === 'admin'
                      ? 'Municipal Admin Console'
                      : 'Citizen Portal'
                  }.`
                );
                setAuthInitialRole(role);
                handleNavigate('auth');
                return;
              }
              handleRoleRedirect(role);
            }}
            onOpenLegal={(type) => setLegalModal(type)}
            resolvedCount={
              complaints.filter(
                (c) => c.status === 'Resolved' || c.status === 'Closed'
              ).length
            }
            pickupsCount={pickups.length}
          />
        )}

        {currentPage === 'auth' && (
          <AuthPage
            user={user}
            onLoginSuccess={(role, updatedProfile) => {
              setAuthNotice('');
              handleRoleRedirect(role, updatedProfile);
              const pending = sessionStorage.getItem('clenc_pending_page');
              if (pending) {
                sessionStorage.removeItem('clenc_pending_page');
                handleNavigate(pending as PageView);
              }
            }}
            onOpenLegal={(type) => setLegalModal(type)}
            initialNotice={authNotice}
            initialRole={authInitialRole}
            initialMode="login"
          />
        )}

        {currentPage === 'citizen-dashboard' && (
          <CitizenDashboardView
            user={user}
            complaints={complaints}
            pickups={pickups}
            onNavigate={handleNavigate}
            onSelectComplaintToTrack={(id) => setSelectedComplaintId(id)}
            onSignOut={handleSignOut}
          />
        )}

        {currentPage === 'report-issue' && (
          <ReportIssueView
            user={user}
            complaints={complaints}
            onNavigate={handleNavigate}
            onSubmitComplaint={handleSubmitComplaint}
            onUpvoteComplaint={handleUpvoteComplaint}
            onSelectComplaintToTrack={(id) => setSelectedComplaintId(id)}
            isLoggedIn={Boolean(authUser)}
            onRequireLogin={() => {
              sessionStorage.setItem('clenc_pending_page', 'report-issue');
              setAuthNotice(
                'Citizen Login Required: Please sign in or register before reporting a waste issue so your report can be saved to the municipal database.'
              );
              setAuthInitialRole('citizen');
              handleNavigate('auth');
            }}
            onQuickCitizenLogin={() => {
              sessionStorage.setItem('clenc_pending_page', 'report-issue');
              setAuthNotice('Please sign in or register with your citizen account to submit complaints.');
              setAuthInitialRole('citizen');
              handleNavigate('auth');
            }}
            onQuickCollectorLogin={() => {
              sessionStorage.setItem('clenc_pending_page', 'worker-dashboard');
              setAuthNotice('Safai Mitra / Collector Login Required: Please sign in with your collector credentials.');
              setAuthInitialRole('worker');
              handleNavigate('auth');
            }}
          />
        )}

        {currentPage === 'pickup-request' && (
          <PickupRequestView
            user={user}
            pickups={pickups}
            onNavigate={handleNavigate}
            onCreatePickup={handleCreatePickup}
            onAdvancePickupStatus={handleAdvancePickupStatus}
          />
        )}

        {currentPage === 'track-complaints' && (
          <TrackComplaintsView
            user={user}
            complaints={complaints}
            selectedComplaintId={selectedComplaintId}
            onSelectComplaintId={setSelectedComplaintId}
            onNavigate={handleNavigate}
            onConfirmResolved={handleConfirmResolved}
            onReopenComplaint={handleReopenComplaint}
          />
        )}

        {currentPage === 'awareness' && (
          <AwarenessPage
            user={user}
            onNavigate={handleNavigate}
            onAwardQuizPoints={handleAwardQuizPoints}
          />
        )}

        {currentPage === 'worker-dashboard' && (
          user.role === 'worker' || user.role === 'admin' ? (
            <WorkerDashboardView
              complaints={complaints}
              pickups={pickups}
              onUpdateComplaintStatus={handleWorkerOrAdminStatusChange}
              onAdvancePickupStatus={handleAdvancePickupStatus}
              onShowToast={showToast}
              onSignOut={handleSignOut}
            />
          ) : (
            <div className="max-w-xl mx-auto my-12 p-8 border border-[#0F626A] bg-[#DFEFF1] dark:bg-[#112327] rounded-sm text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#0F626A]/10 border border-[#0F626A] flex items-center justify-center text-[#0F626A] text-xl font-bold font-mono">
                🧹
              </div>
              <h2 className="font-display text-xl font-bold text-[#122017] dark:text-[#F4F6F2]">
                Safai Mitra / Collector Login Required
              </h2>
              <p className="text-xs text-[#2A464B] dark:text-[#A8CED4] leading-relaxed">
                The Field Collector Console is reserved for municipal sanitation personnel (Safai Mitra). Sign in with your collector account to access your assigned daily beat task panel.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleRoleRedirect('worker', {
                      name: 'Rameshwar Pal',
                      role: 'worker',
                      contact: '+91 94150 11801',
                      ward: 'Ward 14 - Swaroop Nagar & Arya Nagar',
                      address: 'Zonal Sanitation Depot 14, Swaroop Nagar, Kanpur',
                    });
                    handleNavigate('worker-dashboard');
                  }}
                  className="px-4 py-2.5 bg-[#0F626A] text-white text-xs font-semibold rounded-sm hover:bg-[#0B4B52] transition-colors cursor-pointer"
                >
                  ⚡ One-Click Login as Safai Mitra (Rameshwar Pal)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthNotice(
                      'Safai Mitra Login: Please sign in with your collector credentials to access your daily beat task panel.'
                    );
                    setAuthInitialRole('worker');
                    sessionStorage.setItem('clenc_pending_page', 'worker-dashboard');
                    handleNavigate('auth');
                  }}
                  className="px-4 py-2.5 border border-[#0F626A] text-[#0F626A] dark:text-[#66C7D0] bg-white dark:bg-[#0E1B1D] text-xs font-semibold rounded-sm hover:bg-[#0F626A]/10 transition-colors cursor-pointer"
                >
                  Sign In with Collector Account
                </button>
              </div>
            </div>
          )
        )}

        {currentPage === 'admin-dashboard' && (
          user.role === 'admin' ? (
            <AdminDashboardView
              complaints={complaints}
              onAssignWorker={handleAssignWorker}
              onUpdateStatus={(id, st) => handleWorkerOrAdminStatusChange(id, st)}
              onNavigate={handleNavigate}
              onShowToast={showToast}
              onSignOut={handleSignOut}
            />
          ) : (
            <div className="max-w-xl mx-auto my-12 p-8 border border-[#B8332A] bg-[#FDF5F5] dark:bg-[#20100E] rounded-sm text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#B8332A]/10 border border-[#B8332A] flex items-center justify-center text-[#B8332A] text-xl font-bold font-mono">
                !
              </div>
              <h2 className="font-display text-xl font-bold text-[#122017] dark:text-[#F4F6F2]">
                Access Restricted: Municipal Admin Only
              </h2>
              <p className="text-xs text-[#4A5D52] dark:text-[#A8BEB1] leading-relaxed">
                You are currently logged in as a <strong>{user.role === 'worker' ? 'Safai Mitra (Worker)' : 'Citizen'}</strong> ({user.name}).
                Municipal Admin Control and Telemetry is strictly restricted to verified administrators (<strong>{MUNICIPAL_ADMIN_EMAIL}</strong>).
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNavigate(user.role === 'worker' ? 'worker-dashboard' : 'citizen-dashboard')}
                  className="px-4 py-2 bg-[#15693F] text-white text-xs font-semibold rounded-sm hover:bg-[#105331]"
                >
                  Return to {user.role === 'worker' ? 'Collector Console' : 'Citizen Hub'}
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('auth')}
                  className="px-4 py-2 border border-[#B8C7BC] dark:border-[#2C4438] text-xs font-semibold rounded-sm hover:bg-[#EAEFE7] dark:hover:bg-[#15241D]"
                >
                  Admin Sign In
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomBar currentPage={currentPage} onNavigate={handleNavigate} currentUser={user} />

      {/* Legal Modals (Terms of Service & Privacy Policy) */}
      <LegalModal openType={legalModal} onClose={() => setLegalModal(null)} />
    </div>
  );
}

export default App;
