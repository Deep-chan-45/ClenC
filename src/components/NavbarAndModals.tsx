import React from 'react';
import { Language, PageView, Role, ComplaintStatus, PickupStatus, UserProfile } from '../types';
import { ClenCLogo } from './ClenCLogo';
import {
  IconSun,
  IconMoon,
  IconBin,
  IconTruck,
  IconSearch,
  IconLeaf,
  IconChart,
  IconUser,
  IconClose,
} from './Icons';

interface TopNavProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  role: Role;
  onRoleChange: (role: Role) => void;
  language: Language;
  onToggleLanguage: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser?: UserProfile | null;
  onSignOut?: () => void;
}

export const TopNavbar: React.FC<TopNavProps> = ({
  currentPage,
  onNavigate,
  language,
  onToggleLanguage,
  darkMode,
  onToggleDarkMode,
  currentUser,
  onSignOut,
}) => {
  const currentRole: Role = currentUser?.role || 'citizen';
  const isAdmin = currentRole === 'admin';
  const isWorker = currentRole === 'worker';

  // Base navigation items for citizens and public guests
  const navItems: { label: string; labelHi: string; page: PageView }[] = [
    { label: 'Citizen Hub', labelHi: 'नागरिक केंद्र', page: 'citizen-dashboard' },
    { label: 'Report Issue', labelHi: 'शिकायत दर्ज', page: 'report-issue' },
    { label: 'Request Pickup', labelHi: 'पिकअप बुक', page: 'pickup-request' },
    { label: 'Track Status', labelHi: 'स्थिति ट्रैक', page: 'track-complaints' },
    { label: 'Segregation Guide', labelHi: 'कचरा ज्ञान', page: 'awareness' },
  ];

  // Worker Tasks is ONLY shown to Workers (Safai Mitra) and Municipal Admins
  if (isWorker || isAdmin) {
    navItems.push({ label: 'Worker Tasks', labelHi: 'सफाई मित्र', page: 'worker-dashboard' });
  }

  // Admin Console is STRICTLY shown to Municipal Admins only
  if (isAdmin) {
    navItems.push({ label: 'Admin Console', labelHi: 'प्रशासन', page: 'admin-dashboard' });
  }

  const roleBadgeMap: Record<Role, string> = {
    citizen: 'bg-[#15693F] text-white',
    worker: 'bg-[#0F626A] text-white',
    admin: 'bg-[#B86B11] text-white',
  };
  const roleBadgeColor = roleBadgeMap[currentRole] || roleBadgeMap.citizen;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F4F6F2] dark:bg-[#0D1612] border-b border-[#CDD7CF] dark:border-[#22342B]">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Title */}
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="text-left focus-visible:outline-2 focus-visible:outline-[#15693F] shrink-0"
        >
          <ClenCLogo variant="header" />
        </button>

        {/* Zone 2: Clean Text Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-5 text-sm font-medium text-[#35483D] dark:text-[#A8BEB1]"
        >
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                type="button"
                onClick={() => onNavigate(item.page)}
                className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#15693F] ${
                  isActive
                    ? 'border-[#15693F] text-[#122017] dark:text-[#F4F6F2] font-semibold'
                    : 'border-transparent hover:text-[#15693F] dark:hover:text-[#62C384]'
                }`}
              >
                {language === 'en' ? item.label : item.labelHi}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Language, Theme, Sign In / Role Access) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleLanguage}
            className="h-10 px-3 text-xs font-mono font-semibold border border-[#C5D0C8] dark:border-[#283E33] bg-[#EAEFE7] dark:bg-[#15241D] text-[#122017] dark:text-[#E7EFEA] rounded-sm whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#15693F]"
            title="Switch Language (English / Hindi)"
          >
            {language === 'en' ? 'EN · हिंदी' : 'हिंदी · EN'}
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="h-10 w-10 inline-flex items-center justify-center border border-[#C5D0C8] dark:border-[#283E33] bg-[#EAEFE7] dark:bg-[#15241D] text-[#122017] dark:text-[#E7EFEA] rounded-sm shrink-0 focus-visible:outline-2 focus-visible:outline-[#15693F]"
          >
            {darkMode ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onNavigate('auth')}
                className="hidden sm:flex items-center gap-2 h-10 px-3 border border-[#B8C7BC] dark:border-[#283E33] bg-[#EAEFE7] dark:bg-[#15241D] rounded-sm text-left hover:border-[#15693F] transition-colors cursor-pointer"
                title="Switch Role or Account"
              >
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-xs font-bold ${roleBadgeColor}`}>
                  {currentUser.role}
                </span>
                <span className="text-xs font-semibold text-[#122017] dark:text-[#E7EFEA] max-w-[110px] truncate">
                  {currentUser.name}
                </span>
              </button>

              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="h-10 px-3 text-xs font-mono font-semibold border border-[#E0BCB9] dark:border-[#522926] bg-[#FDF5F5] dark:bg-[#2B1716] hover:bg-[#F8E0DE] dark:hover:bg-[#401E1C] text-[#A82820] dark:text-[#F38A82] rounded-sm transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 shadow-xs"
                  title="Sign out of account and return to guest view"
                >
                  <span>{language === 'en' ? 'Sign Out' : 'लॉगआउट'}</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('auth')}
              className={`h-10 px-4 text-xs font-semibold rounded-sm whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#15693F] ${
                currentPage === 'auth'
                  ? 'bg-[#0F626A] text-[#F4F6F2]'
                  : 'bg-[#15693F] hover:bg-[#105331] text-[#F4F6F2]'
              }`}
            >
              {language === 'en' ? 'Sign In / Roles' : 'लॉगिन / भूमिका'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export const MobileBottomBar: React.FC<{
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  currentUser?: UserProfile | null;
}> = ({ currentPage, onNavigate, currentUser }) => {
  const currentRole: Role = currentUser?.role || 'citizen';
  const isAdmin = currentRole === 'admin';
  const isWorker = currentRole === 'worker';

  const mobileLinks: { label: string; page: PageView; icon: React.ReactNode }[] = [
    { label: 'Hub', page: 'citizen-dashboard', icon: <IconUser className="w-4 h-4" /> },
    { label: 'Report', page: 'report-issue', icon: <IconBin className="w-4 h-4" /> },
    { label: 'Pickup', page: 'pickup-request', icon: <IconTruck className="w-4 h-4" /> },
    { label: 'Track', page: 'track-complaints', icon: <IconSearch className="w-4 h-4" /> },
  ];

  if (isAdmin) {
    mobileLinks.push({ label: 'Admin', page: 'admin-dashboard', icon: <IconChart className="w-4 h-4" /> });
  } else if (isWorker) {
    mobileLinks.push({ label: 'Tasks', page: 'worker-dashboard', icon: <IconTruck className="w-4 h-4" /> });
  } else {
    mobileLinks.push({ label: 'Guide', page: 'awareness', icon: <IconLeaf className="w-4 h-4" /> });
  }

  const gridClass = mobileLinks.length === 5 ? 'grid-cols-5' : 'grid-cols-4';

  return (
    <nav
      aria-label="Mobile Navigation"
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-[#EAEFE7] dark:bg-[#121F1A] border-t border-[#C5D0C8] dark:border-[#253B30] grid ${gridClass}`}
    >
      {mobileLinks.map((item) => {
        const active = currentPage === item.page;
        return (
          <button
            key={item.page}
            type="button"
            onClick={() => onNavigate(item.page)}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium whitespace-nowrap ${
              active
                ? 'text-[#15693F] dark:text-[#62C384] font-semibold bg-[#DCE6D9] dark:bg-[#1A2D25]'
                : 'text-[#425449] dark:text-[#98AEA0]'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export const StatusLabel: React.FC<{
  status: ComplaintStatus | PickupStatus;
  slaHoursRemaining?: number;
}> = ({ status, slaHoursRemaining }) => {
  const isOverdue = typeof slaHoursRemaining === 'number' && slaHoursRemaining < 0 && status !== 'Resolved' && status !== 'Closed';

  if (isOverdue || status === 'Reopened') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#B8332A] dark:text-[#F08078] whitespace-nowrap">
        <span>[OVERDUE]</span>
        <span>·</span>
        <span>{status}</span>
      </span>
    );
  }

  if (status === 'Submitted' || status === 'Verified' || status === 'Requested') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#1D5B96] dark:text-[#78B2EB] whitespace-nowrap">
        <span>[OPEN]</span>
        <span>·</span>
        <span>{status}</span>
      </span>
    );
  }

  if (status === 'Assigned' || status === 'In Progress' || status === 'Scheduled') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#B86B11] dark:text-[#F0AD5E] whitespace-nowrap">
        <span>[ACTIVE]</span>
        <span>·</span>
        <span>{status}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#15693F] dark:text-[#68C88E] whitespace-nowrap">
      <span>[RESOLVED]</span>
      <span>·</span>
      <span>{status}</span>
    </span>
  );
};

export const SkeletonLoaderRows: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3" aria-busy="true" aria-label="Loading records">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="p-4 border border-[#C9D3CB] dark:border-[#24382E] bg-[#EAEFE7] dark:bg-[#14221C] rounded-sm animate-pulse space-y-2.5"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="h-4 w-48 bg-[#CED9D0] dark:bg-[#23382E] rounded-xs" />
          <div className="h-4 w-24 bg-[#CED9D0] dark:bg-[#23382E] rounded-xs" />
        </div>
        <div className="h-3 w-3/4 bg-[#D8E2DA] dark:bg-[#1D3027] rounded-xs" />
        <div className="h-3 w-1/2 bg-[#D8E2DA] dark:bg-[#1D3027] rounded-xs" />
      </div>
    ))}
  </div>
);

export const LegalModal: React.FC<{
  openType: 'tos' | 'privacy' | null;
  onClose: () => void;
}> = ({ openType, onClose }) => {
  if (!openType) return null;

  const isTos = openType === 'tos';

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0D1612]/75 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl bg-[#F4F6F2] dark:bg-[#13201A] border border-[#C5D0C8] dark:border-[#2A4035] rounded-sm p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#C5D0C8] dark:border-[#2A4035] pb-3">
          <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
            {isTos
              ? 'Terms of Service · ClenC Civic Charter'
              : 'Privacy Policy · Citizen Data & Geotag Protection'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#3B4E42] dark:text-[#A3B8AC] hover:text-[#122017]"
            aria-label="Close modal"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        {isTos ? (
          <div className="space-y-3 text-sm text-[#2A3B30] dark:text-[#C4D4CA] leading-relaxed">
            <p>
              <strong>1. Statutory Framework (SWM Rules 2026):</strong> ClenC operates in accordance with the Solid Waste Management Rules 2026 notified by the Ministry of Environment, Forest and Climate Change. All citizens, Resident Welfare Associations (RWAs), campuses, and commercial establishments are mandated to segregate waste at source into four streams: Wet, Dry, Sanitary, and Special Care.
            </p>
            <p>
              <strong>2. Bulk Waste Generator (BWG) Obligations:</strong> Any entity generating more than 100 kg of waste per day or occupying an area above 5,000 sq.m is classified as a Bulk Waste Generator. BWGs must process wet biodegradable waste on-site via composting or biomethanation and hand over dry/e-waste streams only to authorized recyclers.
            </p>
            <p>
              <strong>3. Authentic Grievance Reporting:</strong> Geotagged photographs submitted on ClenC are routed directly to Ward Sanitation Supervisors. Submitting fabricated images or obstructing field workers carries administrative penalties under municipal sanitation bylaws.
            </p>
            <p>
              <strong>4. Service Level Agreements (SLA):</strong> Standard complaints carry a 24-hour resolution target. Unresolved complaints automatically escalate to the Sanitation Supervisor at 24 hours, Ward Admin at 48 hours, and Municipal Super Admin at 72 hours.
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-[#2A3B30] dark:text-[#C4D4CA] leading-relaxed">
            <p>
              <strong>1. Minimal Civic Data Collection:</strong> ClenC collects only your name, contact number/email, ward selection, and report GPS coordinates solely for dispatching municipal waste collection vehicles and verifying complaint resolution.
            </p>
            <p>
              <strong>2. Anonymous Reporting Shield:</strong> When you enable the "Anonymous Report" toggle on the Report Issue screen, your name and phone number are masked from field worker handsets and public ward logs.
            </p>
            <p>
              <strong>3. Geotag & Photographic Evidence Retention:</strong> Uploaded site photographs and EXIF location pins are retained strictly for audit verification of before-and-after cleanup compliance.
            </p>
            <p>
              <strong>4. Zero Commercial Sharing:</strong> Citizen household records, RWA segregation scores, and pickup manifests are never sold or shared with third-party advertisers.
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-[#C5D0C8] dark:border-[#2A4035] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-[#15693F] text-[#F4F6F2] rounded-sm"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
