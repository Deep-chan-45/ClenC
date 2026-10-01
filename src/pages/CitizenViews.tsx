import React, { useState } from 'react';
import {
  Complaint,
  ComplaintCategory,
  PageView,
  PickupRequest,
  PickupStatus,
  PickupSubType,
  SeverityLevel,
  UserProfile,
  WasteStream,
} from '../types';
import { createSitePhotoDataUri, WARDS } from '../data/mockData';
import {
  IconAward,
  IconBin,
  IconCamera,
  IconClock,
  IconCompass,
  IconFlame,
  IconHazardAlert,
  IconLeaf,
  IconMapPin,
  IconRecycle,
  IconSanitaryShield,
  IconSearch,
  IconStar,
  IconTruck,
  IconUser,
} from '../components/Icons';
import { LeafletMap } from '../components/LeafletMap';
import { SkeletonLoaderRows, StatusLabel } from '../components/NavbarAndModals';
import { Leaderboard } from '../components/Leaderboard';

interface CitizenSidebarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  user: UserProfile;
  onSignOut?: () => void;
}

export const CitizenSidebar: React.FC<CitizenSidebarProps> = ({
  currentPage,
  onNavigate,
  user,
  onSignOut,
}) => {
  const items: { label: string; page: PageView; code: string }[] = [
    { code: '01', label: 'Citizen Dashboard', page: 'citizen-dashboard' },
    { code: '02', label: 'Report Waste Issue', page: 'report-issue' },
    { code: '03', label: 'Request Pickup', page: 'pickup-request' },
    { code: '04', label: 'Track Complaints', page: 'track-complaints' },
    { code: '05', label: 'Waste Awareness & Quiz', page: 'awareness' },
  ];

  return (
    <aside className="hidden lg:flex lg:w-64 shrink-0 flex-col justify-between border-r border-[#C5D0C8] dark:border-[#22342B] bg-[#EAEFE7] dark:bg-[#111D17] p-5 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="p-3.5 border border-[#B8C7BC] dark:border-[#263C31] bg-[#F4F6F2] dark:bg-[#16261E] rounded-sm space-y-1">
          <div className="text-[11px] font-mono font-semibold text-[#15693F] dark:text-[#68C88E]">
            CITIZEN PROFILE · {user.userType.toUpperCase()}
          </div>
          <div className="font-display text-sm font-bold text-[#122017] dark:text-[#E7EFEA]">
            {user.name}
          </div>
          <div className="text-xs font-mono text-[#485B4F] dark:text-[#98AEA0]">
            {user.ward}
          </div>
        </div>

        <nav className="space-y-1.5" aria-label="Citizen Workspace Navigation">
          {items.map((item) => {
            const active = currentPage === item.page;
            return (
              <button
                key={item.page}
                type="button"
                onClick={() => onNavigate(item.page)}
                className={`w-full px-3.5 py-2.5 text-left text-xs font-semibold rounded-sm flex items-center justify-between transition-colors ${
                  active
                    ? 'bg-[#15693F] text-[#F4F6F2]'
                    : 'text-[#2D3F34] dark:text-[#B0C4B7] hover:bg-[#DCE6D9] dark:hover:bg-[#182921]'
                }`}
              >
                <span>{item.label}</span>
                <span className="font-mono text-[11px] opacity-80">{item.code}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3">
        <div className="p-3.5 border border-[#B8C7BC] dark:border-[#263C31] bg-[#F4F6F2] dark:bg-[#16261E] rounded-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#485B4F] dark:text-[#98AEA0]">CIVIC POINTS</span>
            <span className="font-bold tabular-nums text-[#15693F] dark:text-[#68C88E]">
              {user.points.toLocaleString('en-IN')} PTS
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#485B4F] dark:text-[#98AEA0]">SEGREGATION STREAK</span>
            <span className="font-bold tabular-nums text-[#B86B11] dark:text-[#F0AD5E]">
              {user.streakDays} DAYS
            </span>
          </div>
        </div>

        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="w-full py-2.5 px-3 text-xs font-mono font-semibold border border-[#E0BCB9] dark:border-[#522926] bg-[#FDF5F5] dark:bg-[#2B1716] hover:bg-[#F8E0DE] dark:hover:bg-[#401E1C] text-[#A82820] dark:text-[#F38A82] rounded-sm transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>← Sign Out of Account</span>
          </button>
        )}
      </div>
    </aside>
  );
};

/* ============================================================================
   1. CITIZEN DASHBOARD (MAIN HUB)
   ============================================================================ */
export const CitizenDashboardView: React.FC<{
  user: UserProfile;
  complaints: Complaint[];
  pickups: PickupRequest[];
  onNavigate: (page: PageView) => void;
  onSelectComplaintToTrack: (id: string) => void;
  onSignOut?: () => void;
}> = ({ user, complaints, pickups, onNavigate, onSelectComplaintToTrack, onSignOut }) => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] pb-16 lg:pb-0">
      <CitizenSidebar
        currentPage="citizen-dashboard"
        onNavigate={onNavigate}
        user={user}
        onSignOut={onSignOut}
      />

      <main className="flex-1 max-w-[1140px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Welcome Header */}
        <div className="p-6 border border-[#C5D0C8] dark:border-[#24382E] bg-[#EAEFE7] dark:bg-[#14221C] rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono font-semibold text-[#15693F] dark:text-[#68C88E]">
              CLENC CITIZEN HUB · {user.ward.toUpperCase()} · {user.userType.toUpperCase()}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#122017] dark:text-[#E7EFEA]">
              Welcome back, {user.name}
            </h1>
            <p className="text-sm text-[#3A4D41] dark:text-[#A3B8AC]">
              Premises: {user.address} · Morning Wet/Dry E-Cart scheduled at 07:30 daily
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('report-issue')}
              className="h-11 px-5 bg-[#15693F] hover:bg-[#105331] text-[#F4F6F2] text-xs font-semibold rounded-sm whitespace-nowrap cursor-pointer transition-colors"
            >
              + Report Waste Issue
            </button>
            <button
              type="button"
              onClick={() => onNavigate('pickup-request')}
              className="h-11 px-5 bg-[#0F626A] hover:bg-[#0B4B52] text-[#F4F6F2] text-xs font-semibold rounded-sm whitespace-nowrap cursor-pointer transition-colors"
            >
              + Request Pickup
            </button>
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="h-11 px-4 border border-[#E0BCB9] dark:border-[#522926] bg-[#FDF5F5] dark:bg-[#2B1716] hover:bg-[#F8E0DE] dark:hover:bg-[#401E1C] text-[#A82820] dark:text-[#F38A82] text-xs font-semibold rounded-sm whitespace-nowrap cursor-pointer transition-colors"
                title="Sign out of account"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* 4 Quick Action Cards */}
        <section className="space-y-3">
          <h2 className="font-display text-base font-bold text-[#122017] dark:text-[#E7EFEA]">
            Quick Civic Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Report Waste Issue',
                meta: 'Geo-pin + photo · 24h SLA',
                desc: 'Overflowing bins, roadside litter, missed collection, or burning waste.',
                page: 'report-issue' as PageView,
                icon: <IconBin className="w-5 h-5 text-[#15693F]" />,
              },
              {
                title: 'Request Pickup',
                meta: '4 Streams + E-waste / Bulky',
                desc: 'Schedule doorstep collection for Wet, Dry, Sanitary, or Special Care loads.',
                page: 'pickup-request' as PageView,
                icon: <IconTruck className="w-5 h-5 text-[#0F626A]" />,
              },
              {
                title: 'Track Complaints',
                meta: `${complaints.length} active & past tickets`,
                desc: 'Inspect vertical timelines, SLA countdowns, and before/after site photos.',
                page: 'track-complaints' as PageView,
                icon: <IconSearch className="w-5 h-5 text-[#1D5B96]" />,
              },
              {
                title: 'Learn Segregation',
                meta: 'SWM Rules 2026 + Quiz',
                desc: 'Use the "Which bin?" search, classify photos, and view nearby MRF centres.',
                page: 'awareness' as PageView,
                icon: <IconLeaf className="w-5 h-5 text-[#B86B11]" />,
              },
            ].map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={() => onNavigate(card.page)}
                className="p-5 text-left border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] hover:border-[#15693F] rounded-sm flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between w-full">
                  {card.icon}
                  <span className="text-[11px] font-mono text-[#485B4F] dark:text-[#98AEA0]">
                    {card.meta}
                  </span>
                </div>
                <div>
                  <div className="font-display text-base font-bold text-[#122017] dark:text-[#E7EFEA]">
                    {card.title}
                  </div>
                  <p className="mt-1 text-xs text-[#3A4D41] dark:text-[#A3B8AC] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Main 12-Col Grid: My Recent Complaints (7 cols) + Upcoming Pickups & Rewards (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* My Recent Complaints */}
          <div className="lg:col-span-7 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#C5D0C8] dark:border-[#24382E] pb-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                  My Recent Complaints
                </h2>
                <p className="text-xs text-[#485B4F] dark:text-[#98AEA0]">
                  Click any ticket to open full timeline, worker details & before/after photos
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('track-complaints')}
                className="text-xs font-semibold text-[#15693F] dark:text-[#68C88E] underline whitespace-nowrap"
              >
                View All ({complaints.length})
              </button>
            </div>

            <div className="divide-y divide-[#CDD7CF] dark:divide-[#22342B]">
              {complaints.slice(0, 4).map((cmp) => (
                <div
                  key={cmp.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-[#122017] dark:text-[#E7EFEA]">
                        {cmp.id}
                      </span>
                      <span>·</span>
                      <span className="text-[#35483D] dark:text-[#A3B8AC]">{cmp.category}</span>
                      <span>·</span>
                      <StatusLabel
                        status={cmp.status}
                        slaHoursRemaining={cmp.slaHoursRemaining}
                      />
                    </div>
                    <div className="text-sm font-semibold text-[#122017] dark:text-[#E7EFEA]">
                      {cmp.title}
                    </div>
                    <div className="text-xs text-[#485B4F] dark:text-[#98AEA0] font-mono">
                      {cmp.ward} · Collector: {cmp.assignedWorkerName} ·{' '}
                      {cmp.slaHoursRemaining > 0
                        ? `${cmp.slaHoursRemaining}h left in SLA`
                        : cmp.status === 'Resolved' || cmp.status === 'Closed'
                        ? 'SLA Met'
                        : `Overdue by ${Math.abs(cmp.slaHoursRemaining)}h`}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectComplaintToTrack(cmp.id);
                      onNavigate('track-complaints');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold border border-[#B8C7BC] dark:border-[#2C4438] bg-[#EAEFE7] dark:bg-[#101C16] text-[#122017] dark:text-[#E7EFEA] rounded-sm shrink-0 self-start sm:self-center"
                  >
                    Inspect Timeline
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Upcoming Pickups Card + Rewards & Badges Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Upcoming Pickups Card */}
            <div className="border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#C5D0C8] dark:border-[#24382E] pb-3">
                <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                  Upcoming & Active Pickups
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate('pickup-request')}
                  className="text-xs font-semibold text-[#0F626A] dark:text-[#66C7D0] underline"
                >
                  + Schedule New
                </button>
              </div>

              <div className="space-y-3">
                {pickups.slice(0, 2).map((pkp) => (
                  <div
                    key={pkp.id}
                    className="p-3.5 border border-[#C5D0C8] dark:border-[#263C31] bg-[#EAEFE7] dark:bg-[#101C16] rounded-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[#122017] dark:text-[#E7EFEA]">
                        {pkp.id} · {pkp.stream} ({pkp.subType})
                      </span>
                      <StatusLabel status={pkp.status} />
                    </div>
                    <div className="text-xs text-[#2D3F34] dark:text-[#B8CCC0] font-mono tabular-nums">
                      Weight: {pkp.quantityKg} kg · Date: {pkp.preferredDate} · {pkp.timeSlot}
                    </div>
                    <div className="text-xs text-[#485B4F] dark:text-[#98AEA0]">
                      Vehicle: {pkp.vehicleNumber}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards, Segregation Streak & Earned Badges Card */}
            <div className="border border-[#C5D0C8] dark:border-[#24382E] bg-[#EAEFE7] dark:bg-[#14221C] rounded-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#C5D0C8] dark:border-[#24382E] pb-3">
                <div className="flex items-center gap-2">
                  <IconAward className="w-5 h-5 text-[#15693F]" />
                  <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                    Civic Rewards & Segregation Streak
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold text-[#15693F] dark:text-[#68C88E]">
                  RANK #4 IN WARD 12
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 border border-[#B8C7BC] dark:border-[#263C31] bg-[#F4F6F2] dark:bg-[#16261E] rounded-sm">
                  <div className="text-xs font-mono text-[#485B4F] dark:text-[#98AEA0]">
                    GREEN REWARD POINTS
                  </div>
                  <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#15693F] dark:text-[#68C88E]">
                    {user.points.toLocaleString('en-IN')} pts
                  </div>
                  <div className="text-[11px] text-[#485B4F] dark:text-[#98AEA0]">
                    Redeemable on municipal property tax
                  </div>
                </div>

                <div className="p-3.5 border border-[#B8C7BC] dark:border-[#263C31] bg-[#F4F6F2] dark:bg-[#16261E] rounded-sm">
                  <div className="flex items-center gap-1 text-xs font-mono text-[#485B4F] dark:text-[#98AEA0]">
                    <IconFlame className="w-3.5 h-3.5 text-[#B86B11]" />
                    <span>SOURCE STREAK</span>
                  </div>
                  <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#B86B11] dark:text-[#F0AD5E]">
                    {user.streakDays} Days
                  </div>
                  <div className="text-[11px] text-[#485B4F] dark:text-[#98AEA0]">
                    100% 4-stream daily compliance
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono font-semibold text-[#2E4035] dark:text-[#A8BEB1]">
                  EARNED CIVIC BADGES:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {user.badges.map((badge) => (
                    <div
                      key={badge}
                      className="px-3 py-2 border border-[#B8C7BC] dark:border-[#263C31] bg-[#F4F6F2] dark:bg-[#16261E] rounded-sm text-xs font-semibold text-[#122017] dark:text-[#E7EFEA]"
                    >
                      · {badge}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOP 10 SWACHH CITIZENS LEADERBOARD */}
        <section aria-label="Kanpur Civic Points Leaderboard">
          <Leaderboard currentUser={user} onNavigate={onNavigate} />
        </section>
      </main>
    </div>
  );
};

/* ============================================================================
   2. REPORT WASTE ISSUE PAGE (STEP-BY-STEP FORM + 50M DUPLICATE DETECTOR)
   ============================================================================ */
export const ReportIssueView: React.FC<{
  user: UserProfile;
  complaints: Complaint[];
  onNavigate: (page: PageView) => void;
  onSubmitComplaint: (newCmp: Complaint) => Promise<void> | void;
  onUpvoteComplaint: (id: string) => void;
  onSelectComplaintToTrack: (id: string) => void;
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
  onQuickCitizenLogin?: () => void;
  onQuickCollectorLogin?: () => void;
}> = ({
  user,
  complaints,
  onNavigate,
  onSubmitComplaint,
  onUpvoteComplaint,
  onSelectComplaintToTrack,
  isLoggedIn = true,
  onRequireLogin,
  onQuickCitizenLogin,
  onQuickCollectorLogin,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [category, setCategory] = useState<ComplaintCategory>('Overflowing bin');
  const [photoUri, setPhotoUri] = useState<string>(() =>
    createSitePhotoDataUri('before', 'Overflowing bin', 'LIVE-CAPTURE')
  );
  const [photoLabel, setPhotoLabel] = useState('IMG_20260930_WARD14_GEOTAG.jpg');
  const [lat, setLat] = useState<number>(26.4784);
  const [lng, setLng] = useState<number>(80.3238);
  const [ward, setWard] = useState<string>(user.ward || 'Ward 14 - Swaroop Nagar & Arya Nagar');
  const [address, setAddress] = useState<string>(
    'Motijheel Avenue, Near Kanpur Metro Gate 2'
  );
  const [description, setDescription] = useState<string>(
    'Secondary dry waste bin is overflowing onto the pedestrian walkway; immediate tipper clearance requested.'
  );
  const [severity, setSeverity] = useState<SeverityLevel>('High');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [upvotedExistingId, setUpvotedExistingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dbStoreStatus, setDbStoreStatus] = useState<string>('Stored in Cloud Firestore');

  // Gated View: Ask user to log in before reporting if not authenticated
  if (isLoggedIn === false) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] pb-16 lg:pb-0">
        <CitizenSidebar currentPage="report-issue" onNavigate={onNavigate} user={user} />
        <main className="flex-1 max-w-2xl mx-auto p-4 sm:p-8 space-y-6">
          <div className="p-6 sm:p-8 border-2 border-[#15693F] bg-[#EAEFE7] dark:bg-[#14231C] rounded-sm space-y-6 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#B86B11] animate-ping"></span>
              <span className="text-xs font-mono font-bold text-[#B86B11] dark:text-[#F0AD5E]">
                AUTHENTICATION MANDATORY BEFORE LODGING GRIEVANCE
              </span>
            </div>

            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#122017] dark:text-[#E7EFEA]">
                Sign In to File a Municipal Waste Report
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#35483D] dark:text-[#A8BEB1] leading-relaxed">
                Under Kanpur Nagar Nigam Solid Waste By-Laws 2026, waste grievances require user authentication to record valid GPS coordinates, prevent duplicate spam tickets, assign a designated Ward Safai Mitra, and store your report in the central municipal database.
              </p>
            </div>

            <div className="p-4 border border-[#B8C7BC] dark:border-[#284235] bg-[#F4F6F2] dark:bg-[#0E1914] rounded-sm space-y-3">
              <div className="text-xs font-mono font-semibold text-[#15693F] dark:text-[#68C88E]">
                BENEFITS OF AUTHENTICATED REPORTING:
              </div>
              <ul className="text-xs text-[#2D3E33] dark:text-[#B8CCC0] space-y-1.5 list-disc pl-4">
                <li>Instant sync and persistent storage into Kanpur Nagar Nigam Firestore database</li>
                <li>Live SLA countdown timer (6h – 24h guaranteed field resolution)</li>
                <li>Earn <strong>+30 Civic Points</strong> towards monthly Swachh awards and certificates</li>
                <li>Direct SMS & in-app updates with Safai Mitra "Before/After" photo verification</li>
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={onRequireLogin || (() => onNavigate('auth'))}
                className="w-full h-11 px-4 text-xs font-bold text-white bg-[#15693F] hover:bg-[#105331] rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>🔑</span>
                <span>Sign In or Register with ClenC Account</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {onQuickCitizenLogin && (
                  <button
                    type="button"
                    onClick={onQuickCitizenLogin}
                    className="h-10 px-3 text-xs font-semibold border border-[#15693F] bg-[#F4F6F2] dark:bg-[#16261E] hover:bg-[#E0EFE5] dark:hover:bg-[#1E372A] text-[#15693F] dark:text-[#68C88E] rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>⚡ Instant Demo Citizen (Aarav)</span>
                  </button>
                )}
                {onQuickCollectorLogin && (
                  <button
                    type="button"
                    onClick={onQuickCollectorLogin}
                    className="h-10 px-3 text-xs font-semibold border border-[#0F626A] bg-[#F4F6F2] dark:bg-[#16261E] hover:bg-[#DFEFF1] dark:hover:bg-[#162D33] text-[#0F626A] dark:text-[#66C7D0] rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🧹 Login as Safai Mitra</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const categories: { name: ComplaintCategory; sub: string; sla: string }[] = [
    { name: 'Overflowing bin', sub: 'Public twin-bin or RWA container full', sla: '12h SLA' },
    { name: 'Garbage on road', sub: 'Roadside litter or uncollected heap', sla: '24h SLA' },
    { name: 'Missed collection', sub: 'Door-to-door e-cart skipped lane', sla: '12h SLA' },
    { name: 'Illegal dumping', sub: 'C&D rubble or nocturnal bulk dumping', sla: '24h SLA' },
    { name: 'Burning waste', sub: 'Open burning of leaves, plastic or trash', sla: '6h Priority' },
    { name: 'Dead animal', sub: 'Sanitary bio-hazard clearance', sla: '6h Priority' },
    { name: 'Other', sub: 'Leachate spill, damaged bin or signage', sla: '24h SLA' },
  ];

  // Calculate distance in meters between current pin and existing open complaints
  const findNearbyDuplicate = (): { complaint: Complaint; distanceMeters: number } | null => {
    for (const cmp of complaints) {
      if (cmp.status === 'Closed') continue;
      const dLat = (cmp.lat - lat) * 111320;
      const dLng = (cmp.lng - lng) * 111320 * Math.cos((lat * Math.PI) / 180);
      const dist = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
      if (dist <= 50) {
        return { complaint: cmp, distanceMeters: dist };
      }
    }
    return null;
  };

  const nearbyMatch = findNearbyDuplicate();

  // Downscale and compress image to max 800px JPEG so it safely fits Firestore's 1MB limit
  const compressImageToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.72);
          resolve(compressed);
        };
        img.onerror = () => {
          resolve(e.target?.result as string);
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        resolve('');
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLabel(file.name);
    try {
      const compressed = await compressImageToDataUri(file);
      if (compressed) {
        setPhotoUri(compressed);
      }
    } catch (_) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoUri(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoDetectLocation = () => {
    // Sets coordinates 28m from CMP-2026-8412 so user can also see the 50m duplicate detector
    setLat(26.4784);
    setLng(80.3238);
    setAddress('Motijheel Avenue, 28m North of Kanpur Metro Gate 2');
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const newId = `CMP-2026-${Math.floor(8500 + Math.random() * 490)}`;
    const nowIso = new Date().toISOString();
    const formattedDate = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newComplaint: Complaint = {
      id: newId,
      title: `${category} reported at ${address.split(',')[0]}`,
      category,
      description: description || `${category} requiring municipal clearance.`,
      ward,
      address,
      lat,
      lng,
      status: 'Submitted',
      severity,
      createdAt: nowIso,
      slaHoursRemaining: severity === 'Critical' ? 6 : 24,
      assignedWorkerId: 'WRK-101',
      assignedWorkerName: 'Rameshwar Pal',
      assignedWorkerPhone: '+91 94150 11801',
      citizenName: isAnonymous ? 'Anonymous Citizen' : user.name,
      isAnonymous,
      upvotes: 1,
      beforePhoto: photoUri,
      timeline: [
        {
          status: 'Submitted',
          timestamp: formattedDate,
          actor: isAnonymous ? 'Anonymous Citizen' : `${user.name} (Citizen)`,
          note: `Submitted via ClenC with geotag (${lat.toFixed(4)}, ${lng.toFixed(4)}) and stored in municipal cloud database.`,
          completed: true,
        },
        {
          status: 'Verified',
          timestamp: 'Auto-queued',
          actor: `${ward} Control Desk`,
          note: 'Geotag and photo metadata verified in central ledger.',
          completed: false,
        },
        {
          status: 'Assigned',
          timestamp: 'Pending dispatch',
          actor: 'Sanitation Supervisor',
          note: 'Routing to beat collector Rameshwar Pal.',
          completed: false,
        },
        {
          status: 'In Progress',
          timestamp: 'Pending',
          actor: 'Field Collector',
          note: 'Pending on-site arrival.',
          completed: false,
        },
        {
          status: 'Resolved',
          timestamp: 'Pending',
          actor: 'Field Collector',
          note: 'Pending after-photo upload.',
          completed: false,
        },
        {
          status: 'Closed',
          timestamp: 'Pending',
          actor: 'Citizen',
          note: 'Pending citizen confirmation.',
          completed: false,
        },
      ],
    };

    try {
      await onSubmitComplaint(newComplaint);
      setDbStoreStatus('Stored in Cloud Firestore (Collection: complaints)');
    } catch (e) {
      console.warn('Complaint submission note:', e);
      setDbStoreStatus('Saved locally and queued for Cloud Firestore sync');
    } finally {
      setIsSubmitting(false);
      setSubmittedComplaint(newComplaint);
    }
  };

  if (submittedComplaint) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] pb-16 lg:pb-0">
        <CitizenSidebar currentPage="report-issue" onNavigate={onNavigate} user={user} />
        <main className="flex-1 max-w-3xl mx-auto p-4 sm:p-8">
          <div className="p-6 sm:p-8 border border-[#15693F] bg-[#EAEFE7] dark:bg-[#13241B] rounded-sm space-y-6">
            <div className="text-xs font-mono font-bold text-[#15693F] dark:text-[#68C88E]">
              [GRIEVANCE REGISTERED · SLA TIMER STARTED]
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#122017] dark:text-[#E7EFEA]">
              Complaint Submitted Successfully
            </h1>
            <p className="text-sm text-[#35483D] dark:text-[#A8BEB1]">
              Your geotagged waste report has been logged in the municipal ledger and routed to {submittedComplaint.ward}. You have earned <strong>+30 Civic Points</strong>.
            </p>

            {/* Database storage confirmation badge */}
            <div className="p-3.5 bg-[#E0EFE5] dark:bg-[#122A1E] border border-[#15693F] rounded-sm text-xs space-y-1.5">
              <div className="font-mono font-bold text-[#15693F] dark:text-[#6EE7A2] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#15693F] animate-pulse"></span>
                  <span>STORED IN MUNICIPAL CLOUD DATABASE (FIRESTORE)</span>
                </span>
                <span className="text-[10px] font-semibold bg-[#15693F]/15 px-2 py-0.5 rounded-xs">
                  {dbStoreStatus}
                </span>
              </div>
              <p className="text-[#234230] dark:text-[#BDE6CE] font-mono text-[11px] leading-relaxed">
                Collection: <span className="font-bold underline">complaints</span> · Document ID: <span className="font-bold underline">{submittedComplaint.id}</span> · Synced with Kanpur Nagar Nigam Central Grievance Ledger · GPS Coordinates ({submittedComplaint.lat.toFixed(4)}, {submittedComplaint.lng.toFixed(4)}) Verified.
              </p>
            </div>

            <div className="p-4 border border-[#B8C7BC] dark:border-[#284235] bg-[#F4F6F2] dark:bg-[#0E1914] rounded-sm grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-[#485B4F] dark:text-[#98AEA0]">COMPLAINT ID:</span>
                <div className="text-base font-bold text-[#15693F] dark:text-[#68C88E]">
                  {submittedComplaint.id}
                </div>
              </div>
              <div>
                <span className="text-[#485B4F] dark:text-[#98AEA0]">CATEGORY & SEVERITY:</span>
                <div className="font-bold text-[#122017] dark:text-[#E7EFEA]">
                  {submittedComplaint.category} · {submittedComplaint.severity}
                </div>
              </div>
              <div>
                <span className="text-[#485B4F] dark:text-[#98AEA0]">SLA TARGET:</span>
                <div className="font-bold text-[#B86B11] dark:text-[#F0AD5E]">
                  {submittedComplaint.slaHoursRemaining} Hours Countdown
                </div>
              </div>
              <div>
                <span className="text-[#485B4F] dark:text-[#98AEA0]">REPORTER IDENTITY:</span>
                <div className="font-bold text-[#122017] dark:text-[#E7EFEA]">
                  {submittedComplaint.isAnonymous ? 'Protected (Anonymous)' : submittedComplaint.citizenName}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onSelectComplaintToTrack(submittedComplaint.id);
                  onNavigate('track-complaints');
                }}
                className="h-11 px-5 bg-[#15693F] text-[#F4F6F2] text-xs font-semibold rounded-sm"
              >
                Track Complaint Timeline ({submittedComplaint.id})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedComplaint(null);
                  setStep(1);
                }}
                className="h-11 px-5 border border-[#8DA395] text-xs font-semibold rounded-sm"
              >
                Submit Another Report
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] pb-16 lg:pb-0">
      <CitizenSidebar currentPage="report-issue" onNavigate={onNavigate} user={user} />

      <main className="flex-1 max-w-[1040px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C5D0C8] dark:border-[#24382E] pb-4">
          <div>
            <div className="text-xs font-mono font-semibold text-[#15693F] dark:text-[#68C88E]">
              CLENC CIVIC GRIEVANCE ENGINE · 5-STEP WORKFLOW
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#122017] dark:text-[#E7EFEA]">
              Report a Waste Issue
            </h1>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            {[
              { n: 1, label: '1.Category' },
              { n: 2, label: '2.Photo' },
              { n: 3, label: '3.Location' },
              { n: 4, label: '4.Details' },
              { n: 5, label: '5.Review' },
            ].map((s) => (
              <button
                key={s.n}
                type="button"
                onClick={() => setStep(s.n as 1 | 2 | 3 | 4 | 5)}
                className={`px-2.5 py-1.5 rounded-xs border ${
                  step === s.n
                    ? 'bg-[#15693F] text-[#F4F6F2] border-[#15693F] font-bold'
                    : 'bg-[#EAEFE7] dark:bg-[#14221C] border-[#C5D0C8] dark:border-[#263C31] text-[#35483D] dark:text-[#98AEA0]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 1: CHOOSE CATEGORY */}
        {step === 1 && (
          <div className="p-6 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-5">
            <div>
              <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                Step 1: Select Waste Issue Category
              </h2>
              <p className="text-xs text-[#485B4F] dark:text-[#98AEA0]">
                Choose the tile that best matches the sanitation issue to route the right collection vehicle
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {categories.map((cat) => {
                const selected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      setCategory(cat.name);
                      setPhotoUri(createSitePhotoDataUri('before', cat.name, 'LIVE-CAPTURE'));
                    }}
                    className={`p-4 text-left border rounded-sm flex flex-col justify-between space-y-3 ${
                      selected
                        ? 'border-[#15693F] bg-[#E2EFE7] dark:bg-[#1A3326]'
                        : 'border-[#C5D0C8] dark:border-[#263C31] bg-[#EAEFE7] dark:bg-[#101C16]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <IconBin className="w-5 h-5 text-[#15693F] dark:text-[#68C88E]" />
                      <span className="text-[11px] font-mono font-semibold text-[#0F626A] dark:text-[#66C7D0]">
                        {cat.sla}
                      </span>
                    </div>
                    <div>
                      <div className="font-display text-sm font-bold text-[#122017] dark:text-[#E7EFEA]">
                        {cat.name}
                      </div>
                      <p className="mt-1 text-xs text-[#43564A] dark:text-[#98AEA0]">
                        {cat.sub}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-11 px-6 bg-[#15693F] text-[#F4F6F2] text-xs font-semibold rounded-sm"
              >
                Continue to Step 2: Photo Evidence
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: UPLOAD OR CAPTURE PHOTO */}
        {step === 2 && (
          <div className="p-6 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-5">
            <div>
              <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                Step 2: Upload or Capture Geotagged Site Photo
              </h2>
              <p className="text-xs text-[#485B4F] dark:text-[#98AEA0]">
                Clear visual evidence helps ward supervisors dispatch the correct equipment
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-7 space-y-3">
                <div className="border border-[#B8C7BC] dark:border-[#283E33] rounded-sm overflow-hidden bg-[#EAEFE7] dark:bg-[#101C16]">
                  <img
                    src={photoUri}
                    alt={`Site evidence for ${category}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-60 object-cover"
                  />
                </div>
                <div
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  className="text-xs font-mono text-[#485B4F] dark:text-[#98AEA0]"
                >
                  ACTIVE FILE: {photoLabel} · EXIF TIMESTAMP VERIFIED
                </div>
              </div>

              <div className="md:col-span-5 space-y-4">
                <label className="block p-4 border border-dashed border-[#15693F] bg-[#EAEFE7] dark:bg-[#101C16] rounded-sm cursor-pointer text-center space-y-2">
                  <IconCamera className="w-6 h-6 text-[#15693F] mx-auto" />
                  <div className="text-xs font-semibold text-[#122017] dark:text-[#E7EFEA]">
                    Upload Photo or Capture from Camera
                  </div>
                  <div className="text-[11px] text-[#485B4F] dark:text-[#98AEA0]">
                    Supports JPG, PNG, WEBP up to 10 MB
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                <div className="space-y-1.5">
                  <div className="text-xs font-mono font-semibold text-[#35483D] dark:text-[#A3B8AC]">
                    OR SELECT DEMO CAMERA PRESET:
                  </div>
                  {(['Overflowing bin', 'Garbage on road', 'Illegal dumping'] as ComplaintCategory[]).map(
                    (preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setPhotoUri(createSitePhotoDataUri('before', preset, 'CAM-PRESET'));
                          setPhotoLabel(`CAMERA_${preset.replace(/\s+/g, '_').toUpperCase()}.svg`);
                        }}
                        style={{
                          fontFamily: preset === 'Illegal dumping' ? 'Georgia' : 'Inter, sans-serif',
                        }}
                        className="w-full py-2 px-3 text-left text-xs font-mono border border-[#C5D0C8] dark:border-[#263C31] bg-[#EAEFE7] dark:bg-[#101C16] rounded-sm"
                      >
                        Use Sample Evidence: {preset}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-11 px-5 border border-[#8DA395] text-xs font-semibold rounded-sm"
              >
                Back to Category
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="h-11 px-6 bg-[#15693F] text-[#F4F6F2] text-xs font-semibold rounded-sm"
              >
                Continue to Step 3: Map & Duplicate Check
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LOCATION & 50M DUPLICATE DETECTION */}
        {step === 3 && (
          <div className="p-6 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                  Step 3: Pin Exact Location & 50m Duplicate Check
                </h2>
                <p className="text-xs text-[#485B4F] dark:text-[#98AEA0]">
                  Drag the pin or click on the map. ClenC scans a 50-meter radius for existing reports.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoDetectLocation}
                  className="px-3.5 py-2 text-xs font-semibold bg-[#0F626A] text-[#F4F6F2] rounded-sm inline-flex items-center gap-1.5"
                >
                  <IconCompass className="w-4 h-4" />
                  <span>Auto-Detect GPS (Near Motijheel Metro Gate 2)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLat(26.4950);
                    setLng(80.3100);
                    setAddress('Rawatpur Crossing, GT Road, Kanpur');
                  }}
                  className="px-3 py-2 text-xs font-mono border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
                >
                  Move Pin &gt;500m Away
                </button>
              </div>
            </div>

            {/* 50-Meter Duplicate Detection Prompt */}
            {nearbyMatch && (
              <div className="p-4 border border-[#B86B11] bg-[#FBF1E4] dark:bg-[#2C1E0E] rounded-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#A85E0D] dark:text-[#F0AD5E]">
                    <IconHazardAlert className="w-4 h-4" />
                    <span>
                      SIMILAR REPORT NEARBY ({nearbyMatch.distanceMeters}m AWAY · WITHIN 50m RADIUS) — UPVOTE INSTEAD?
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#15693F] dark:text-[#68C88E]">
                    {nearbyMatch.complaint.upvotes} Citizens Upvoted
                  </span>
                </div>

                <div className="text-xs text-[#2D3E33] dark:text-[#D5E3DA]">
                  <strong>{nearbyMatch.complaint.id}:</strong> {nearbyMatch.complaint.title} ({nearbyMatch.complaint.address}) is already <strong>{nearbyMatch.complaint.status}</strong> with Collector {nearbyMatch.complaint.assignedWorkerName}. Upvoting boosts its ward priority score without creating a duplicate ticket.
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={upvotedExistingId === nearbyMatch.complaint.id}
                    onClick={() => {
                      onUpvoteComplaint(nearbyMatch.complaint.id);
                      setUpvotedExistingId(nearbyMatch.complaint.id);
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-[#15693F] text-[#F4F6F2] rounded-sm"
                  >
                    {upvotedExistingId === nearbyMatch.complaint.id
                      ? 'Upvoted Existing Report (+25 Civic Points Awarded)'
                      : `Upvote ${nearbyMatch.complaint.id} Instead (+25 Points)`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectComplaintToTrack(nearbyMatch.complaint.id);
                      onNavigate('track-complaints');
                    }}
                    className="px-3.5 py-2 text-xs font-semibold border border-[#A85E0D] text-[#A85E0D] dark:text-[#F0AD5E] rounded-sm"
                  >
                    Inspect Existing Report
                  </button>
                </div>
              </div>
            )}

            <LeafletMap
              mode="picker"
              lat={lat}
              lng={lng}
              heightClass="h-64"
              onLocationChange={(newLat, newLng) => {
                setLat(newLat);
                setLng(newLng);
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Municipal Ward / Zone</label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
                >
                  {WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Exact Street / Landmark</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-11 px-5 border border-[#8DA395] text-xs font-semibold rounded-sm"
              >
                Back to Photo
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="h-11 px-6 bg-[#15693F] text-[#F4F6F2] text-xs font-semibold rounded-sm"
              >
                Continue to Step 4: Severity & Privacy
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DESCRIPTION, SEVERITY & ANONYMOUS TOGGLE */}
        {step === 4 && (
          <div className="p-6 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-5">
            <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
              Step 4: Severity Level, Description & Anonymous Shield
            </h2>

            <div>
              <label className="block text-xs font-mono font-semibold mb-2">
                SELECT ISSUE SEVERITY:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['Low', 'Medium', 'High', 'Critical'] as SeverityLevel[]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-2.5 px-3 text-xs font-semibold border rounded-sm ${
                      severity === sev
                        ? 'bg-[#15693F] text-[#F4F6F2] border-[#15693F]'
                        : 'bg-[#EAEFE7] dark:bg-[#101C16] border-[#C5D0C8] dark:border-[#283E33]'
                    }`}
                  >
                    {sev} {sev === 'Critical' ? '(6h SLA)' : '(24h SLA)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Field Notes / Access Instructions (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-sm bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
              />
            </div>

            {/* Anonymous Reporting Toggle */}
            <div className="p-4 border border-[#B8C7BC] dark:border-[#283E33] bg-[#EAEFE7] dark:bg-[#101C16] rounded-sm flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-[#122017] dark:text-[#E7EFEA]">
                  Submit as Anonymous Citizen Report
                </div>
                <p className="text-xs text-[#485B4F] dark:text-[#98AEA0]">
                  Masks your name and mobile number on public ward logs and collector handsets (ideal for reporting illegal dumping or burning waste).
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isAnonymous}
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`px-4 py-2 text-xs font-mono font-bold rounded-sm border shrink-0 ${
                  isAnonymous
                    ? 'bg-[#15693F] text-[#F4F6F2] border-[#15693F]'
                    : 'bg-[#F4F6F2] dark:bg-[#15241D] border-[#8DA395]'
                }`}
              >
                {isAnonymous ? 'ANONYMOUS: ON' : 'ANONYMOUS: OFF'}
              </button>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="h-11 px-5 border border-[#8DA395] text-xs font-semibold rounded-sm"
              >
                Back to Map
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="h-11 px-6 bg-[#15693F] text-[#F4F6F2] text-xs font-semibold rounded-sm"
              >
                Continue to Step 5: Review & Submit
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & SUBMIT */}
        {step === 5 && (
          <div className="p-6 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-5">
            <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
              Step 5: Review & Confirm Grievance Submission
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5">
                <img
                  src={photoUri}
                  alt="Review site evidence"
                  referrerPolicy="no-referrer"
                  className="w-full h-48 object-cover border border-[#B8C7BC] rounded-sm"
                />
              </div>
              <div className="md:col-span-7 space-y-2 text-xs font-mono">
                <div className="p-3 bg-[#EAEFE7] dark:bg-[#101C16] border border-[#C5D0C8] dark:border-[#263C31] rounded-sm space-y-1.5">
                  <div>
                    <strong>CATEGORY:</strong> {category} · <strong>SEVERITY:</strong> {severity}
                  </div>
                  <div>
                    <strong>WARD:</strong> {ward}
                  </div>
                  <div>
                    <strong>LOCATION:</strong> {address} ({lat.toFixed(4)}, {lng.toFixed(4)})
                  </div>
                  <div>
                    <strong>IDENTITY:</strong>{' '}
                    {isAnonymous ? 'Anonymous Shield Active' : `${user.name} (${user.contact})`}
                  </div>
                  <div>
                    <strong>DESCRIPTION:</strong> {description}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="h-11 px-5 border border-[#8DA395] text-xs font-semibold rounded-sm"
              >
                Back to Details
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="h-11 px-6 bg-[#15693F] hover:bg-[#105331] text-[#F4F6F2] text-xs font-semibold rounded-sm"
              >
                Submit Official Complaint Now
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

/* ============================================================================
   3. WASTE PICKUP REQUEST PAGE (WITH >100KG BULK GENERATOR NOTICE & STEPPER)
   ============================================================================ */
export const PickupRequestView: React.FC<{
  user: UserProfile;
  pickups: PickupRequest[];
  onNavigate: (page: PageView) => void;
  onCreatePickup: (pkp: PickupRequest) => void;
  onAdvancePickupStatus: (id: string) => void;
}> = ({ user, pickups, onNavigate, onCreatePickup, onAdvancePickupStatus }) => {
  const [stream, setStream] = useState<WasteStream>('Dry');
  const [subType, setSubType] = useState<PickupSubType>('E-waste');
  const [quantityKg, setQuantityKg] = useState<number>(25);
  const [preferredDate, setPreferredDate] = useState<string>('2026-10-02');
  const [timeSlot, setTimeSlot] = useState<string>('06:30 - 09:30 Morning');
  const [ward, setWard] = useState<string>(user.ward);
  const [address, setAddress] = useState<string>(user.address);

  const isBulk = quantityKg > 100;

  const stepsOrder: PickupStatus[] = [
    'Requested',
    'Scheduled',
    'Assigned',
    'Picked Up',
    'Closed',
  ];

  const handleBookPickup = (e: React.FormEvent) => {
    e.preventDefault();
    const newPickup: PickupRequest = {
      id: `PKP-2026-${Math.floor(3100 + Math.random() * 800)}`,
      stream,
      subType,
      quantityKg,
      isBulkGenerator: isBulk,
      preferredDate,
      timeSlot,
      ward,
      address,
      lat: user.lat,
      lng: user.lng,
      status: 'Requested',
      assignedWorkerName: 'Rameshwar Pal',
      vehicleNumber:
        subType === 'E-waste'
          ? 'UP-78-EW-0914 (CPCB E-Waste Van)'
          : subType === 'Construction debris'
          ? 'UP-78-CD-2090 (C&D Loader)'
          : 'UP-78-SW-4021 (Segregated Tipper)',
      citizenName: user.name,
      createdAt: '2026-09-30 11:30',
    };
    onCreatePickup(newPickup);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] pb-16 lg:pb-0">
      <CitizenSidebar currentPage="pickup-request" onNavigate={onNavigate} user={user} />

      <main className="flex-1 max-w-[1140px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="border-b border-[#C5D0C8] dark:border-[#24382E] pb-4">
          <div className="text-xs font-mono font-semibold text-[#0F626A] dark:text-[#66C7D0]">
            DOORSTEP SEGREGATED COLLECTION & BULK GENERATOR DISPATCH
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#122017] dark:text-[#E7EFEA]">
            Schedule a Waste Pickup Request
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Cols: Booking Form */}
          <form
            onSubmit={handleBookPickup}
            className="lg:col-span-7 p-6 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-5"
          >
            {/* Primary 4 Waste Streams */}
            <div>
              <label className="block text-xs font-mono font-semibold mb-2">
                01 · SELECT SWM 2026 PRIMARY WASTE STREAM:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(
                  [
                    { s: 'Wet', label: 'Wet (Green)', icon: <IconLeaf className="w-4 h-4" /> },
                    { s: 'Dry', label: 'Dry (Blue)', icon: <IconRecycle className="w-4 h-4" /> },
                    {
                      s: 'Sanitary',
                      label: 'Sanitary (Red)',
                      icon: <IconSanitaryShield className="w-4 h-4" />,
                    },
                    {
                      s: 'Special Care',
                      label: 'Special Care',
                      icon: <IconHazardAlert className="w-4 h-4" />,
                    },
                  ] as { s: WasteStream; label: string; icon: React.ReactNode }[]
                ).map((item) => (
                  <button
                    key={item.s}
                    type="button"
                    onClick={() => setStream(item.s)}
                    className={`p-3 border rounded-sm text-left space-y-1 ${
                      stream === item.s
                        ? 'border-[#15693F] bg-[#E2EFE7] dark:bg-[#1A3326] font-bold'
                        : 'border-[#C5D0C8] dark:border-[#283E33] bg-[#EAEFE7] dark:bg-[#101C16]'
                    }`}
                  >
                    {item.icon}
                    <div className="text-xs">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Specialized Sub-Types: Standard, Bulky, E-waste, Construction debris */}
            <div>
              <label className="block text-xs font-mono font-semibold mb-2">
                02 · SELECT SPECIALIZED PICKUP SUB-TYPE:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(
                  [
                    'Standard Segregated',
                    'Bulky',
                    'E-waste',
                    'Construction debris',
                  ] as PickupSubType[]
                ).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubType(sub)}
                    className={`py-2.5 px-3 text-xs font-semibold border rounded-sm ${
                      subType === sub
                        ? 'bg-[#0F626A] text-[#F4F6F2] border-[#0F626A]'
                        : 'bg-[#EAEFE7] dark:bg-[#101C16] border-[#C5D0C8] dark:border-[#283E33]'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Approximate Quantity in KG + Bulk Generator Trigger */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold">
                  03 · APPROXIMATE QUANTITY (IN KG):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantityKg(18)}
                    className="px-2 py-1 text-[11px] font-mono border border-[#B8C7BC] rounded-xs"
                  >
                    18 kg (Household)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantityKg(140)}
                    className="px-2 py-1 text-[11px] font-mono border border-[#B86B11] text-[#A85E0D] dark:text-[#F0AD5E] rounded-xs font-semibold"
                  >
                    140 kg (Test &gt;100 kg Bulk Notice)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={300}
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(Number(e.target.value))}
                  className="flex-1 accent-[#15693F]"
                />
                <input
                  type="number"
                  min={1}
                  max={2000}
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(Number(e.target.value) || 1)}
                  className="w-24 h-10 px-3 text-sm font-mono font-bold tabular-nums bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
                />
                <span className="text-xs font-mono font-bold">KG</span>
              </div>
            </div>

            {/* Statutory Bulk Generator Notice (> 100 kg) */}
            {isBulk && (
              <div className="p-4 border border-[#B86B11] bg-[#FBF1E4] dark:bg-[#2E2010] rounded-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#A85E0D] dark:text-[#F0AD5E]">
                  <IconHazardAlert className="w-4 h-4 shrink-0" />
                  <span>
                    BULK WASTE GENERATOR (BWG) STATUTORY NOTICE · QUANTITY EXCEEDS 100 KG ({quantityKg} KG)
                  </span>
                </div>
                <p className="text-xs text-[#2D3E33] dark:text-[#E2D5C4] leading-relaxed">
                  Under <strong>Solid Waste Management Rules 2026</strong>, any entity generating above 100 kg/day is designated a Bulk Waste Generator. Extra statutory responsibilities apply:
                </p>
                <ul className="text-xs text-[#2D3E33] dark:text-[#E2D5C4] space-y-1 font-mono">
                  <li>· 1. Wet biodegradable waste must be composted or biomethanated on-site where feasible.</li>
                  <li>· 2. Dry, E-waste, and C&amp;D loads require a signed Form-IV Digital Manifest and bulk collection tariff.</li>
                  <li>· 3. An authorized high-capacity compactor or CPCB recycler vehicle will be dispatched.</li>
                </ul>
              </div>
            )}

            {/* Preferred Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Preferred Pickup Date</label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full h-10 px-3 text-sm font-mono bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Preferred Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
                >
                  <option value="06:30 - 09:30 Morning">06:30 - 09:30 Morning</option>
                  <option value="10:00 - 13:00 Midday">10:00 - 13:00 Midday</option>
                  <option value="14:00 - 17:00 Afternoon">14:00 - 17:00 Afternoon</option>
                  <option value="17:30 - 20:00 Evening">17:30 - 20:00 Evening</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Ward / Zone</label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
                >
                  {WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Pickup Gate / Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#15693F] hover:bg-[#105331] text-[#F4F6F2] text-xs font-semibold rounded-sm"
            >
              Confirm & Schedule Segregated Pickup ({quantityKg} kg · {stream} / {subType})
            </button>
          </form>

          {/* Right 5 Cols: Active Pickup Status Flow Stepper */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                  Pickup Status Flow Stepper
                </h2>
                <p className="text-xs text-[#485B4F] dark:text-[#98AEA0]">
                  Live 5-stage tracking: Requested -&gt; Scheduled -&gt; Assigned -&gt; Picked Up -&gt; Closed
                </p>
              </div>

              <div className="space-y-4">
                {pickups.map((pkp) => {
                  const currentIdx = stepsOrder.indexOf(pkp.status);
                  return (
                    <div
                      key={pkp.id}
                      className="p-4 border border-[#B8C7BC] dark:border-[#263C31] bg-[#EAEFE7] dark:bg-[#101C16] rounded-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#122017] dark:text-[#E7EFEA]">
                          {pkp.id} · {pkp.stream} ({pkp.subType})
                        </span>
                        <StatusLabel status={pkp.status} />
                      </div>

                      <div className="text-xs font-mono text-[#35483D] dark:text-[#A8BEB1]">
                        {pkp.quantityKg} kg {pkp.isBulkGenerator ? '[BULK GENERATOR]' : ''} · {pkp.preferredDate} ({pkp.timeSlot})
                      </div>

                      {/* 5-Stage Stepper */}
                      <div className="grid grid-cols-5 gap-1 pt-1">
                        {stepsOrder.map((st, idx) => {
                          const done = idx <= currentIdx;
                          return (
                            <div key={st} className="space-y-1">
                              <div
                                className={`h-2 rounded-xs ${
                                  done
                                    ? 'bg-[#15693F] dark:bg-[#62C384]'
                                    : 'bg-[#C5D0C8] dark:bg-[#24382E]'
                                }`}
                              />
                              <div
                                className={`text-[10px] font-mono truncate ${
                                  done
                                    ? 'font-bold text-[#122017] dark:text-[#E7EFEA]'
                                    : 'text-[#5A6E61] dark:text-[#788E80]'
                                }`}
                              >
                                {idx + 1}.{st}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t border-[#C5D0C8] dark:border-[#24382E] flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] text-[#485B4F] dark:text-[#98AEA0]">
                          {pkp.assignedWorkerName} · {pkp.vehicleNumber.split(' ')[0]}
                        </span>
                        {pkp.status !== 'Closed' && (
                          <button
                            type="button"
                            onClick={() => onAdvancePickupStatus(pkp.id)}
                            className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-[#0F626A] text-[#F4F6F2] rounded-xs"
                          >
                            Advance Stage -&gt;
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* ============================================================================
   4. COMPLAINT TRACKING PAGE (TABS, TIMELINE, SLA COUNTDOWN, BEFORE/AFTER, RATING)
   ============================================================================ */
export const TrackComplaintsView: React.FC<{
  user: UserProfile;
  complaints: Complaint[];
  selectedComplaintId: string;
  onSelectComplaintId: (id: string) => void;
  onNavigate: (page: PageView) => void;
  onConfirmResolved: (id: string, rating: number, feedback: string) => void;
  onReopenComplaint: (id: string, reason: string) => void;
}> = ({
  user,
  complaints,
  selectedComplaintId,
  onSelectComplaintId,
  onNavigate,
  onConfirmResolved,
  onReopenComplaint,
}) => {
  const [tab, setTab] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>(
    'Spot cleaned thoroughly and segregated twin-bins restored.'
  );
  const [reopenReason, setReopenReason] = useState<string>('');
  const [showReopenBox, setShowReopenBox] = useState<boolean>(false);

  const filtered = complaints.filter((cmp) => {
    const matchesTab =
      tab === 'All'
        ? true
        : tab === 'Open'
        ? cmp.status === 'Submitted' || cmp.status === 'Verified' || cmp.status === 'Reopened'
        : tab === 'In Progress'
        ? cmp.status === 'Assigned' || cmp.status === 'In Progress'
        : cmp.status === 'Resolved' || cmp.status === 'Closed';

    const matchesSearch =
      cmp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmp.ward.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const activeComplaint =
    complaints.find((c) => c.id === selectedComplaintId) ||
    filtered[0] ||
    complaints[0];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] pb-16 lg:pb-0">
      <CitizenSidebar currentPage="track-complaints" onNavigate={onNavigate} user={user} />

      <main className="flex-1 max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C5D0C8] dark:border-[#24382E] pb-4">
          <div>
            <div className="text-xs font-mono font-semibold text-[#15693F] dark:text-[#68C88E]">
              REAL-TIME SLA AUDIT & PHOTOGRAPHIC VERIFICATION
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#122017] dark:text-[#E7EFEA]">
              Complaint Tracking & Resolution Sign-Off
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowSkeleton(!showSkeleton)}
            className="px-3 py-1.5 text-xs font-mono border border-[#B8C7BC] dark:border-[#283E33] bg-[#EAEFE7] dark:bg-[#14221C] rounded-sm self-start sm:self-auto"
          >
            {showSkeleton ? 'Show Populated Data' : 'Preview Loading Skeleton State'}
          </button>
        </div>

        {/* Search & Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-[#EAEFE7] dark:bg-[#14221C] p-1 border border-[#C5D0C8] dark:border-[#24382E] rounded-sm">
            {(['All', 'Open', 'In Progress', 'Resolved'] as const).map((tName) => (
              <button
                key={tName}
                type="button"
                onClick={() => setTab(tName)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xs whitespace-nowrap ${
                  tab === tName
                    ? 'bg-[#15693F] text-[#F4F6F2]'
                    : 'text-[#35483D] dark:text-[#A8BEB1]'
                }`}
              >
                {tName}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, category, ward..."
              className="w-full h-10 pl-9 pr-3 text-xs bg-[#F4F6F2] dark:bg-[#15241D] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
            />
            <IconSearch className="w-4 h-4 text-[#485B4F] absolute left-3 top-3" />
          </div>
        </div>

        {showSkeleton ? (
          <SkeletonLoaderRows count={4} />
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center border border-[#C5D0C8] dark:border-[#24382E] bg-[#EAEFE7] dark:bg-[#14221C] rounded-sm space-y-3">
            <div className="font-display text-lg font-bold">
              No matching complaints in "{tab}"
            </div>
            <p className="text-xs text-[#485B4F] dark:text-[#98AEA0]">
              Try clearing your search query or submit a new geotagged waste report.
            </p>
            <button
              type="button"
              onClick={() => {
                setTab('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold bg-[#15693F] text-[#F4F6F2] rounded-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 5 Cols: Complaint List */}
            <div className="lg:col-span-5 space-y-3">
              {filtered.map((cmp) => {
                const isSelected = activeComplaint?.id === cmp.id;
                return (
                  <button
                    key={cmp.id}
                    type="button"
                    onClick={() => onSelectComplaintId(cmp.id)}
                    className={`w-full p-4 text-left border rounded-sm space-y-2 transition-colors ${
                      isSelected
                        ? 'border-[#15693F] bg-[#E2EFE7] dark:bg-[#193024]'
                        : 'border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[#122017] dark:text-[#E7EFEA]">
                        {cmp.id}
                      </span>
                      <StatusLabel
                        status={cmp.status}
                        slaHoursRemaining={cmp.slaHoursRemaining}
                      />
                    </div>
                    <div className="font-display text-sm font-bold text-[#122017] dark:text-[#E7EFEA]">
                      {cmp.title}
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono text-[#485B4F] dark:text-[#98AEA0]">
                      <span>{cmp.category}</span>
                      <span>
                        {cmp.slaHoursRemaining > 0
                          ? `${cmp.slaHoursRemaining} hours left`
                          : cmp.status === 'Closed' || cmp.status === 'Resolved'
                          ? 'Resolved within SLA'
                          : `Overdue ${Math.abs(cmp.slaHoursRemaining)}h`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right 7 Cols: Detailed Vertical Timeline, SLA Countdown, Worker, Before/After & Confirm/Reopen */}
            {activeComplaint && (
              <div className="lg:col-span-7 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm p-6 space-y-6">
                {/* Header + SLA Countdown Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#C5D0C8] dark:border-[#24382E] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-[#15693F] dark:text-[#68C88E]">
                        {activeComplaint.id}
                      </span>
                      <span>·</span>
                      <span>{activeComplaint.ward}</span>
                      <span>·</span>
                      <StatusLabel
                        status={activeComplaint.status}
                        slaHoursRemaining={activeComplaint.slaHoursRemaining}
                      />
                    </div>
                    <h2 className="font-display text-xl font-bold text-[#122017] dark:text-[#E7EFEA]">
                      {activeComplaint.title}
                    </h2>
                    <p className="text-xs text-[#3A4D41] dark:text-[#A3B8AC]">
                      {activeComplaint.description}
                    </p>
                  </div>

                  {/* SLA Countdown Indicator */}
                  <div className="px-3.5 py-2 border border-[#B8C7BC] dark:border-[#283E33] bg-[#EAEFE7] dark:bg-[#101C16] rounded-sm text-right shrink-0 font-mono">
                    <div className="text-[10px] text-[#485B4F] dark:text-[#98AEA0]">
                      SLA COUNTDOWN
                    </div>
                    <div
                      className={`text-sm font-bold tabular-nums ${
                        activeComplaint.slaHoursRemaining < 0
                          ? 'text-[#B8332A] dark:text-[#F08078]'
                          : 'text-[#15693F] dark:text-[#68C88E]'
                      }`}
                    >
                      {activeComplaint.slaHoursRemaining > 0
                        ? `${activeComplaint.slaHoursRemaining} hours left`
                        : activeComplaint.status === 'Closed'
                        ? 'SLA Completed'
                        : `Overdue ${Math.abs(activeComplaint.slaHoursRemaining)}h`}
                    </div>
                  </div>
                </div>

                {/* Assigned Worker Info */}
                <div className="p-3.5 border border-[#C5D0C8] dark:border-[#263C31] bg-[#EAEFE7] dark:bg-[#101C16] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <IconUser className="w-4 h-4 text-[#0F626A]" />
                    <span>
                      <strong>Assigned Collector:</strong> {activeComplaint.assignedWorkerName} ({activeComplaint.assignedWorkerId})
                    </span>
                  </div>
                  <span>Contact: {activeComplaint.assignedWorkerPhone}</span>
                </div>

                {/* Before & After Photos */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-semibold text-[#2E4035] dark:text-[#A8BEB1]">
                    GEOTAGGED SITE PHOTOGRAPHS (BEFORE &amp; AFTER COMPARISON):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <img
                        src={activeComplaint.beforePhoto}
                        alt="Before cleanup"
                        referrerPolicy="no-referrer"
                        className="w-full h-44 object-cover border border-[#B8C7BC] rounded-sm"
                      />
                      <div className="text-[11px] font-mono text-[#485B4F] dark:text-[#98AEA0]">
                        01 · BEFORE PHOTO (Citizen Submission)
                      </div>
                    </div>

                    <div className="space-y-1">
                      {activeComplaint.afterPhoto ? (
                        <img
                          src={activeComplaint.afterPhoto}
                          alt="After resolution"
                          referrerPolicy="no-referrer"
                          className="w-full h-44 object-cover border border-[#15693F] rounded-sm"
                        />
                      ) : (
                        <div className="w-full h-44 border border-dashed border-[#8DA395] bg-[#EAEFE7] dark:bg-[#101C16] rounded-sm flex flex-col items-center justify-center p-4 text-center">
                          <IconCamera className="w-6 h-6 text-[#485B4F] mb-1" />
                          <span className="text-xs font-mono text-[#485B4F] dark:text-[#98AEA0]">
                            Awaiting Field Collector "After" Photo Upload
                          </span>
                        </div>
                      )}
                      <div className="text-[11px] font-mono text-[#485B4F] dark:text-[#98AEA0]">
                        02 · AFTER PHOTO (Collector Verification)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vertical Resolution Timeline */}
                <div className="space-y-3">
                  <div className="text-xs font-mono font-semibold text-[#2E4035] dark:text-[#A8BEB1]">
                    VERTICAL AUDIT TIMELINE (SUBMITTED -&gt; VERIFIED -&gt; ASSIGNED -&gt; IN PROGRESS -&gt; RESOLVED -&gt; CLOSED):
                  </div>
                  <div className="space-y-2.5 pl-2 border-l-2 border-[#B8C7BC] dark:border-[#2C4438]">
                    {activeComplaint.timeline.map((ev, idx) => (
                      <div key={idx} className="pl-3 space-y-0.5">
                        <div className="flex flex-wrap items-center justify-between text-xs font-mono">
                          <span
                            className={`font-bold ${
                              ev.completed
                                ? 'text-[#15693F] dark:text-[#68C88E]'
                                : 'text-[#5A6E61] dark:text-[#788E80]'
                            }`}
                          >
                            {ev.completed ? '[DONE]' : '[PENDING]'} {ev.status} · {ev.actor}
                          </span>
                          <span className="tabular-nums text-[#485B4F] dark:text-[#98AEA0]">
                            {ev.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-[#35483D] dark:text-[#A8BEB1]">{ev.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Citizen Action Box when Resolved (Confirm Resolved, Star Rating, Feedback, or Reopen) */}
                {(activeComplaint.status === 'Resolved' ||
                  activeComplaint.status === 'In Progress') && (
                  <div className="p-4 border border-[#15693F] bg-[#EAEFE7] dark:bg-[#112219] rounded-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-sm font-bold text-[#122017] dark:text-[#E7EFEA]">
                        Citizen Verification & Resolution Sign-Off
                      </h3>
                      <span className="text-xs font-mono text-[#15693F] dark:text-[#68C88E]">
                        +50 Civic Points on Confirmation
                      </span>
                    </div>

                    {/* Star Rating Selector */}
                    <div className="space-y-1">
                      <label className="block text-xs font-mono font-semibold">
                        RATE CLEANUP QUALITY (1 TO 5 STARS):
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`p-1.5 border rounded-xs ${
                              star <= rating
                                ? 'border-[#B86B11] bg-[#FBF1E4] dark:bg-[#2F2110] text-[#B86B11]'
                                : 'border-[#C5D0C8] text-[#7A8E80]'
                            }`}
                            aria-label={`Rate ${star} stars`}
                          >
                            <IconStar className="w-4 h-4" filled={star <= rating} />
                          </button>
                        ))}
                        <span className="text-xs font-mono font-bold ml-2">{rating} / 5 Stars</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Citizen Feedback Note
                      </label>
                      <input
                        type="text"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full h-9 px-3 text-xs bg-[#F4F6F2] dark:bg-[#15241D] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          onConfirmResolved(activeComplaint.id, rating, feedback)
                        }
                        className="px-4 py-2 text-xs font-semibold bg-[#15693F] text-[#F4F6F2] rounded-sm"
                      >
                        Confirm Resolved &amp; Close Ticket
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowReopenBox(!showReopenBox)}
                        className="px-4 py-2 text-xs font-semibold border border-[#B8332A] text-[#B8332A] dark:text-[#F08078] rounded-sm"
                      >
                        Reopen Complaint (Unsatisfactory Cleanup)
                      </button>
                    </div>

                    {showReopenBox && (
                      <div className="pt-3 border-t border-[#C5D0C8] dark:border-[#283E33] flex items-center gap-2">
                        <input
                          type="text"
                          value={reopenReason}
                          onChange={(e) => setReopenReason(e.target.value)}
                          placeholder="State reason for reopening (e.g., leachate or debris still remaining)..."
                          className="flex-1 h-9 px-3 text-xs bg-[#F4F6F2] dark:bg-[#15241D] border border-[#B8332A] rounded-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onReopenComplaint(
                              activeComplaint.id,
                              reopenReason || 'Incomplete site clearance reported by citizen.'
                            );
                            setShowReopenBox(false);
                          }}
                          className="h-9 px-4 text-xs font-semibold bg-[#B8332A] text-[#F4F6F2] rounded-sm whitespace-nowrap"
                        >
                          Confirm Reopen
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
