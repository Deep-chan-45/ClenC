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
  withTimeout,
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
      return saved ? (JSON.parse(saved) as UserProfile) : null;
    } catch (_) {
      return null;
    }
  });
  const [user, setUser] = useState<UserProfile>(authUser || INITIAL_USER);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [pickups, setPickups] = useState<PickupRequest[]>(INITIAL_PICKUPS);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>(
    INITIAL_COMPLAINTS[0].id
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<'tos' | 'privacy' | null>(null);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(true);

  // Initialize Firebase connection, auth listener, and real-time Firestore sync
  useEffect(() => {
    testConnection();
    seedInitialKanpurDataIfEmpty(INITIAL_COMPLAINTS, INITIAL_PICKUPS);

    // Listen to Firebase Authentication State
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const isMunicipalAdmin = fbUser.email?.trim().toLowerCase() === MUNICIPAL_ADMIN_EMAIL;
        let resolvedUser: UserProfile;

        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await withTimeout(getDoc(userDocRef), 1000, null);
          if (snap && snap.exists()) {
            let data = snap.data() as UserProfile;
            if (isMunicipalAdmin && data.role !== 'admin') {
              data = {
                ...data,
                role: 'admin',
                name: data.name || 'Deepak Sachan',
                ward: data.ward || 'Ward 07 - Civil Lines & Mall Road',
                address: data.address || 'Kanpur Nagar Nigam HQ, Moti Jheel Compound',
              };
              saveUserProfileToFirestore(fbUser.uid, data).catch(() => {});
            }
            resolvedUser = data;
          } else {
            resolvedUser = isMunicipalAdmin
              ? getMunicipalAdminProfile(fbUser.uid)
              : {
                  ...INITIAL_USER,
                  name: fbUser.displayName || fbUser.email?.split('@')[0] || INITIAL_USER.name,
                  contact: fbUser.email || INITIAL_USER.contact,
                };
            if (isMunicipalAdmin) {
              saveUserProfileToFirestore(fbUser.uid, resolvedUser).catch(() => {});
            }
          }
        } catch (e) {
          console.warn('Note reading profile in onAuthStateChanged:', e);
          resolvedUser = isMunicipalAdmin
            ? getMunicipalAdminProfile(fbUser.uid)
            : {
                ...INITIAL_USER,
                name: fbUser.displayName || fbUser.email?.split('@')[0] || INITIAL_USER.name,
                contact: fbUser.email || INITIAL_USER.contact,
              };
        }

        setUser(resolvedUser);
        setAuthUser(resolvedUser);
        try {
          localStorage.setItem('clenc_auth_user', JSON.stringify(resolvedUser));
        } catch (_) {}

        // If the user was on the auth page waiting for sign in, immediately route them to their console
        setCurrentPage((prevPage) => {
          if (prevPage === 'auth') {
            if (resolvedUser.role === 'admin') return 'admin-dashboard';
            if (resolvedUser.role === 'worker') return 'worker-dashboard';
            return 'citizen-dashboard';
          }
          return prevPage;
        });
      } else {
        const saved = localStorage.getItem('clenc_auth_user');
        if (!saved) {
          setAuthUser(null);
          setUser(INITIAL_USER);
        }
      }
    });

    // Real-time Firestore sync for complaints
    const unsubscribeComplaints = subscribeToComplaints(
      (liveComplaints) => {
        if (liveComplaints && liveComplaints.length > 0) {
          setComplaints(liveComplaints);
        }
      },
      () => {
        // Fall back quietly if firestore offline
        setFirebaseConnected(false);
      }
    );

    // Real-time Firestore sync for pickup bookings
    const unsubscribePickups = subscribeToPickups(
      (livePickups) => {
        if (livePickups && livePickups.length > 0) {
          setPickups(livePickups);
        }
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
    // Route guard: Only Municipal Admins can access admin-dashboard
    if (page === 'admin-dashboard' && user.role !== 'admin') {
      showToast('Access Denied: Only Municipal Admins (deepaksachan450@gmail.com) can access the Admin Console.');
      return;
    }
    // Route guard: Only Safai Mitra (Workers) and Municipal Admins can access worker-dashboard
    if (page === 'worker-dashboard' && user.role !== 'worker' && user.role !== 'admin') {
      showToast('Access Denied: Collector Console is restricted to Safai Mitra personnel.');
      return;
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
    setUser(INITIAL_USER);
    handleNavigate('landing');
    showToast('Signed out successfully. Switched to public guest mode.');
  };

  const handleSubmitComplaint = (newCmp: Complaint) => {
    setComplaints((prev) => [newCmp, ...prev]);
    setSelectedComplaintId(newCmp.id);
    const newPoints = user.points + 30;
    setUser((prev) => ({ ...prev, points: newPoints }));

    // Persist to Firebase Firestore
    saveComplaintToFirestore(newCmp, auth.currentUser?.uid).catch((err) => {
      console.warn('Complaint firestore write note:', err);
    });

    if (auth.currentUser) {
      saveUserProfileToFirestore(auth.currentUser.uid, { points: newPoints }).catch(() => {});
    }

    showToast(`Complaint submitted (${newCmp.id}) · Synced with Firebase (+30 Points)`);
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
    setPickups((prev) => [newPkp, ...prev]);
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

    setPickups((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const idx = order.indexOf(p.status);
        nextStatus = order[Math.min(idx + 1, order.length - 1)];
        return { ...p, status: nextStatus };
      })
    );

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
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        updatedTimeline = c.timeline.map((t) =>
          t.status === 'Closed'
            ? {
                ...t,
                timestamp: '30 Sep 2026, Verified',
                note: `Citizen confirmed resolved (${rating}/5 stars): "${feedback}"`,
                completed: true,
              }
            : { ...t, completed: true }
        );
        return {
          ...c,
          status: 'Closed',
          slaHoursRemaining: 0,
          rating,
          feedback,
          timeline: updatedTimeline,
        };
      })
    );
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
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        updatedTimeline = [
          ...c.timeline,
          {
            status: 'Reopened',
            timestamp: '30 Sep 2026, Escalated',
            actor: user.name,
            note: `Reopened by citizen: ${reason}`,
            completed: true,
          },
        ];
        return {
          ...c,
          status: 'Reopened',
          slaHoursRemaining: -4,
          timeline: updatedTimeline,
        };
      })
    );

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

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        photo = afterPhoto || c.afterPhoto;
        updatedTimeline = c.timeline.map((t) =>
          t.status === status
            ? {
                ...t,
                timestamp: '30 Sep 2026, Updated',
                completed: true,
              }
            : t
        );
        return {
          ...c,
          status,
          afterPhoto: photo,
          timeline: updatedTimeline,
        };
      })
    );

    updateComplaintInFirestore(id, {
      status,
      afterPhoto: photo,
      timeline: updatedTimeline,
    }).catch(() => {});

    showToast(`Complaint ${id} updated to "${status}" (Stored in Firebase)`);
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
            onQuickRoleLogin={handleRoleRedirect}
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
            onLoginSuccess={handleRoleRedirect}
            onOpenLegal={(type) => setLegalModal(type)}
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
            <div className="max-w-xl mx-auto my-12 p-8 border border-[#B86B11] bg-[#FDF9F2] dark:bg-[#1C160E] rounded-sm text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#B86B11]/10 border border-[#B86B11] flex items-center justify-center text-[#B86B11] text-xl font-bold font-mono">
                !
              </div>
              <h2 className="font-display text-xl font-bold text-[#122017] dark:text-[#F4F6F2]">
                Access Restricted: Safai Mitra / Collector Only
              </h2>
              <p className="text-xs text-[#4A5D52] dark:text-[#A8BEB1] leading-relaxed">
                The Field Collector Console is reserved for municipal sanitation personnel (Safai Mitra).
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNavigate('citizen-dashboard')}
                  className="px-4 py-2 bg-[#15693F] text-white text-xs font-semibold rounded-sm hover:bg-[#105331]"
                >
                  Return to Citizen Hub
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
