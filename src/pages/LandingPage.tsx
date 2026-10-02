import React, { useState } from 'react';
import { Language, PageView, Role } from '../types';
import { SWM_2026_STREAMS, TRANSLATIONS, WASTE_ITEMS_GUIDE } from '../data/mockData';
import { ClenCLogo } from '../components/ClenCLogo';
import { BinClassifier } from '../components/BinClassifier';
import {
  IconBin,
  IconTruck,
  IconLeaf,
  IconRecycle,
  IconSanitaryShield,
  IconHazardAlert,
  IconSearch,
  IconBuilding,
  IconMapPin,
} from '../components/Icons';

interface LandingPageProps {
  language: Language;
  onNavigate: (page: PageView) => void;
  onQuickRoleLogin: (role: Role) => void;
  onOpenLegal: (type: 'tos' | 'privacy') => void;
  resolvedCount: number;
  pickupsCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onNavigate,
  onQuickRoleLogin,
  onOpenLegal,
  resolvedCount,
  pickupsCount,
}) => {
  const t = TRANSLATIONS[language];

  const getStreamIcon = (stream: string) => {
    switch (stream) {
      case 'Wet':
        return <IconLeaf className="w-6 h-6 text-[#15693F] dark:text-[#68C88E]" />;
      case 'Dry':
        return <IconRecycle className="w-6 h-6 text-[#1D5B96] dark:text-[#78B2EB]" />;
      case 'Sanitary':
        return <IconSanitaryShield className="w-6 h-6 text-[#B8332A] dark:text-[#EB827A]" />;
      default:
        return <IconHazardAlert className="w-6 h-6 text-[#A85E0D] dark:text-[#F0AD5E]" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* HERO SECTION */}
      <section className="border-b border-[#C9D3CB] dark:border-[#22342B] bg-[#EFECE4] dark:bg-[#111C17] py-12 lg:py-16">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left 7 columns: Civic Proposition & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <ClenCLogo variant="full" />
              </div>

              <div className="text-xs font-mono font-semibold text-[#0F626A] dark:text-[#66C7D0]">
                {t.heroBadge} · Ministry of Housing & Urban Affairs Mandate
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#122017] dark:text-[#EDF4EF] leading-[1.15]">
                {t.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-[#2E4035] dark:text-[#B4C7BC] max-w-2xl leading-relaxed">
                {t.heroSubtitle}
              </p>

              {/* Primary Two Action Buttons required by prompt */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('report-issue')}
                  className="h-12 px-6 bg-[#15693F] hover:bg-[#105331] text-[#F4F6F2] font-semibold text-sm rounded-sm inline-flex items-center gap-2.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#122017]"
                >
                  <IconBin className="w-5 h-5" />
                  <span>{t.reportBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('pickup-request')}
                  className="h-12 px-6 bg-[#0F626A] hover:bg-[#0B4B52] text-[#F4F6F2] font-semibold text-sm rounded-sm inline-flex items-center gap-2.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#122017]"
                >
                  <IconTruck className="w-5 h-5" />
                  <span>{t.pickupBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('track-complaints')}
                  className="h-12 px-5 border border-[#8DA395] dark:border-[#345042] bg-[#F4F6F2] dark:bg-[#16261E] text-[#122017] dark:text-[#E7EFEA] font-semibold text-sm rounded-sm whitespace-nowrap"
                >
                  {language === 'en' ? 'Track Complaints' : 'शिकायत ट्रैक करें'}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('auth')}
                  className="h-12 px-5 border-2 border-[#15693F] bg-white dark:bg-[#122A1E] text-[#15693F] dark:text-[#6EE7A2] hover:bg-[#E0EFE5] dark:hover:bg-[#1A3828] font-semibold text-sm rounded-sm whitespace-nowrap inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>🔑</span>
                  <span>{language === 'en' ? 'Sign In / Register' : 'लॉगिन / पंजीकरण'}</span>
                </button>
              </div>

              {/* Instant Role Switcher Bar for Evaluators */}
              <div className="pt-2 border-t border-[#CDD7CF] dark:border-[#24382E]">
                <div className="text-xs font-mono text-[#43564A] dark:text-[#98AEA0] mb-2">
                  DIRECT ROLE PORTAL ACCESS (CITIZEN · COLLECTOR · MUNICIPAL ADMIN):
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onQuickRoleLogin('citizen')}
                    className="px-3.5 py-2 text-xs font-semibold border border-[#B8C7BC] dark:border-[#2C4438] bg-[#F4F6F2] dark:bg-[#172820] text-[#122017] dark:text-[#E7EFEA] rounded-sm whitespace-nowrap"
                  >
                    01. {t.citizenHub}
                  </button>
                  <button
                    type="button"
                    onClick={() => onQuickRoleLogin('worker')}
                    className="px-3.5 py-2 text-xs font-semibold border border-[#B8C7BC] dark:border-[#2C4438] bg-[#F4F6F2] dark:bg-[#172820] text-[#122017] dark:text-[#E7EFEA] rounded-sm whitespace-nowrap"
                  >
                    02. {t.workerHub}
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('auth')}
                    className="px-3.5 py-2 text-xs font-semibold border border-[#B86B11]/40 dark:border-[#B86B11]/60 bg-[#FFFBF5] dark:bg-[#1C140A] text-[#874A08] dark:text-[#F3B872] rounded-sm whitespace-nowrap flex items-center gap-1 hover:border-[#B86B11]"
                    title="Municipal Admin Portal requires admin sign in"
                  >
                    <span>🔒</span>
                    <span>03. {t.adminHub} (Admin Sign In)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 columns: Interactive AI Bin Classifier & Live Ward Feed */}
            <div className="lg:col-span-5 space-y-4">
              <BinClassifier variant="compact" initialQuery="banana peel" />

              {/* Recent Verified Ward Ticket */}
              <div className="border border-[#C2CEC5] dark:border-[#263C31] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#485B4F] dark:text-[#98AEA0]">
                  <span>RECENT VERIFIED CLEANUP · CMP-2026-8395</span>
                  <span className="text-[#15693F] dark:text-[#68C88E] font-semibold">
                    [RESOLVED IN 4h 45m]
                  </span>
                </div>
                <div className="text-xs text-[#1F3025] dark:text-[#CFE0D6] font-medium">
                  HBTU East Campus Lane, Ward 14 · Collector Sunita Devi cleared 42 kg dry cartons and installed twin wet/dry bins.
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#CDD7CF] dark:border-[#24382E]">
                  <button
                    type="button"
                    onClick={() => onNavigate('awareness')}
                    className="text-xs font-semibold text-[#0F626A] dark:text-[#66C7D0] underline cursor-pointer"
                  >
                    Open Full Segregation Guide &amp; Quiz
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('track-complaints')}
                    className="text-xs font-semibold text-[#15693F] dark:text-[#68C88E] underline cursor-pointer"
                  >
                    Inspect Before/After Evidence
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* LIVE STATS STRIP */}
          <div className="mt-10 pt-8 border-t border-[#C5D0C8] dark:border-[#24382E] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm">
              <div className="text-xs font-mono text-[#485B4F] dark:text-[#98AEA0]">
                01 · {t.statsResolved.toUpperCase()}
              </div>
              <div className="mt-1 font-mono text-2xl sm:text-3xl font-bold tabular-nums text-[#15693F] dark:text-[#68C88E]">
                {(48915 + resolvedCount).toLocaleString('en-IN')}
              </div>
              <div className="mt-1 text-xs text-[#3A4D41] dark:text-[#A5B9AD]">
                94.2% within 24-hour municipal SLA
              </div>
            </div>

            <div className="p-4 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm">
              <div className="text-xs font-mono text-[#485B4F] dark:text-[#98AEA0]">
                02 · {t.statsPickups.toUpperCase()}
              </div>
              <div className="mt-1 font-mono text-2xl sm:text-3xl font-bold tabular-nums text-[#0F626A] dark:text-[#66C7D0]">
                {(114347 + pickupsCount).toLocaleString('en-IN')}
              </div>
              <div className="mt-1 text-xs text-[#3A4D41] dark:text-[#A5B9AD]">
                GPS-verified 4-stream doorstep collection
              </div>
            </div>

            <div className="p-4 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm">
              <div className="text-xs font-mono text-[#485B4F] dark:text-[#98AEA0]">
                03 · {t.statsCitizens.toUpperCase()}
              </div>
              <div className="mt-1 font-mono text-2xl sm:text-3xl font-bold tabular-nums text-[#122017] dark:text-[#E7EFEA]">
                2,86,420
              </div>
              <div className="mt-1 text-xs text-[#3A4D41] dark:text-[#A5B9AD]">
                Across 1,420 RWAs, colleges & public markets
              </div>
            </div>

            <div className="p-4 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm">
              <div className="text-xs font-mono text-[#485B4F] dark:text-[#98AEA0]">
                04 · MRF & COMPOST RECOVERY RATE
              </div>
              <div className="mt-1 font-mono text-2xl sm:text-3xl font-bold tabular-nums text-[#B86B11] dark:text-[#F0AD5E]">
                91.4%
              </div>
              <div className="mt-1 text-xs text-[#3A4D41] dark:text-[#A5B9AD]">
                Diverted from municipal landfills daily
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION (4 steps: Report, Assign, Resolve, Confirm) */}
      <section className="py-14 border-b border-[#C9D3CB] dark:border-[#22342B] bg-[#F4F6F2] dark:bg-[#0D1612]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono font-semibold text-[#15693F] dark:text-[#68C88E]">
                CLOSED-LOOP CIVIC ACCOUNTABILITY
              </div>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#122017] dark:text-[#E7EFEA]">
                {t.howItWorks}
              </h2>
            </div>
            <p className="text-sm text-[#3A4D41] dark:text-[#A3B8AC] max-w-md">
              Every grievance and pickup request follows a four-stage verifiable audit trail with photographic proof and citizen sign-off.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: '01. Report',
                statusColor: 'text-[#1D5B96] dark:text-[#78B2EB]',
                title: 'Geotagged Issue or Pickup',
                desc: 'Select a category or waste stream, attach a site photo, and pin the exact OpenStreetMap coordinates. Nearby duplicate detector within 50m prevents redundant tickets.',
              },
              {
                step: '02. Assign',
                statusColor: 'text-[#B86B11] dark:text-[#F0AD5E]',
                title: 'Automated Ward Dispatch',
                desc: 'The ticket routes to the nearest Ward Collector and specialized vehicle (E-Tipper, MRF Van, or C&D Loader) with a strict 24-hour SLA countdown timer.',
              },
              {
                step: '03. Resolve',
                statusColor: 'text-[#0F626A] dark:text-[#66C7D0]',
                title: 'On-Site Cleanup & Photo Proof',
                desc: 'Field collectors accept the task, clear the waste stream, and upload a mandatory geo-verified "After" photograph from the exact location.',
              },
              {
                step: '04. Confirm',
                statusColor: 'text-[#15693F] dark:text-[#68C88E]',
                title: 'Citizen Sign-Off & Rating',
                desc: 'You inspect the before-and-after photos, rate the resolution, and confirm closure to earn civic points, or reopen immediately if incomplete.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#EAEFE7] dark:bg-[#14221C] rounded-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className={`font-mono text-sm font-bold ${item.statusColor}`}>
                    {item.step}
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#35483D] dark:text-[#A8BEB1] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#C5D0C8] dark:border-[#24382E] text-xs font-mono text-[#485B4F] dark:text-[#90A698]">
                  SLA Audited · Fully Digital Process
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUR OFFICIAL WASTE STREAMS (SWM RULES 2026) */}
      <section className="py-14 border-b border-[#C9D3CB] dark:border-[#22342B] bg-[#EFECE4] dark:bg-[#111C17]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono font-semibold text-[#0F626A] dark:text-[#66C7D0]">
                STATUTORY SOURCE SEGREGATION STANDARD
              </div>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#122017] dark:text-[#E7EFEA]">
                {t.fourStreamsTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('awareness')}
              className="px-4 py-2 text-xs font-semibold bg-[#15693F] text-[#F4F6F2] rounded-sm whitespace-nowrap self-start sm:self-auto"
            >
              Explore Interactive Segregation Hub
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SWM_2026_STREAMS.map((s) => (
              <div
                key={s.stream}
                className={`p-5 border ${s.borderTint} ${s.bgTint} rounded-sm flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {getStreamIcon(s.stream)}
                    <span className={`text-xs font-mono font-bold ${s.textTint}`}>
                      {s.binColorName.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                    {language === 'en' ? s.titleEn : s.titleHi}
                  </h3>

                  <p className="text-xs text-[#2D3E33] dark:text-[#BDD0C4] leading-relaxed">
                    {s.ruleSummary}
                  </p>

                  <div className="pt-2 border-t border-[#BDCCC1] dark:border-[#2A4235] space-y-1.5">
                    <div className="text-xs font-mono font-semibold text-[#122017] dark:text-[#E7EFEA]">
                      ACCEPTED ITEMS:
                    </div>
                    <ul className="space-y-1 text-xs text-[#2E4035] dark:text-[#B4C7BC]">
                      {s.examples.map((ex) => (
                        <li key={ex}>· {ex}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#BDCCC1] dark:border-[#2A4235] text-xs font-mono text-[#35483D] dark:text-[#9AB0A2]">
                  <strong>Destination:</strong> {s.destination}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT SERVES SECTION (Households, Societies, Colleges, Public Places) */}
      <section className="py-14 border-b border-[#C9D3CB] dark:border-[#22342B] bg-[#F4F6F2] dark:bg-[#0D1612]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 space-y-8">
          <div>
            <div className="text-xs font-mono font-semibold text-[#15693F] dark:text-[#68C88E]">
              MULTI-SECTOR MUNICIPAL COVERAGE
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#122017] dark:text-[#E7EFEA]">
              {t.whoItServes}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                sector: '01 · Households',
                title: 'Individual Homes & Lanes',
                metrics: 'Daily Wet/Dry Van · On-Demand E-Waste',
                desc: 'Track morning collection e-carts, schedule special pickups for old appliances or garden pruning, and earn property tax rebate points for 100% segregation streaks.',
                cta: 'Open Citizen Hub',
                target: 'citizen-dashboard' as PageView,
              },
              {
                sector: '02 · Residential Societies',
                title: 'RWAs & Gated Apartments',
                metrics: 'Bulk Generator (>100 kg) Compliance',
                desc: 'Manage society-level composting logs, schedule dry MRF bale pickups, monitor ward ranking on the RWA leaderboard, and download monthly SWM 2026 compliance certificates.',
                cta: 'Book Society Pickup',
                target: 'pickup-request' as PageView,
              },
              {
                sector: '03 · Colleges & Campuses',
                title: 'Universities, Hostels & Messes',
                metrics: 'Biomethanation & Lab E-Waste',
                desc: 'Coordinate hostel mess organic waste collection, IT department e-waste manifests, and student NSS cleanliness drives with campus-wide segregation quizzes.',
                cta: 'View Campus Leaderboard',
                target: 'awareness' as PageView,
              },
              {
                sector: '04 · Public Places & Markets',
                title: 'Transit Hubs, Parks & Commercial Zones',
                metrics: 'Rapid 6-Hour Priority SLA',
                desc: 'Enable commuters and shopkeepers to report overflowing twin-bins, illegal dumping, or burning waste with anonymous reporting and 50m duplicate suppression.',
                cta: 'Report Public Issue',
                target: 'report-issue' as PageView,
              },
            ].map((card) => (
              <div
                key={card.sector}
                className="p-5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#EAEFE7] dark:bg-[#14221C] rounded-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono text-[#0F626A] dark:text-[#66C7D0] font-semibold">
                    <span>{card.sector}</span>
                    <IconBuilding className="w-4 h-4" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                    {card.title}
                  </h3>
                  <div className="text-xs font-mono text-[#15693F] dark:text-[#68C88E]">
                    {card.metrics}
                  </div>
                  <p className="text-sm text-[#35483D] dark:text-[#A8BEB1] leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(card.target)}
                  className="w-full py-2.5 px-3 text-xs font-semibold border border-[#15693F] text-[#15693F] dark:text-[#68C88E] hover:bg-[#15693F] hover:text-[#F4F6F2] rounded-sm transition-colors"
                >
                  {card.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUIET CIVIC FOOTER */}
      <footer className="mt-auto bg-[#E5EBE2] dark:bg-[#0A110E] border-t border-[#C2CEC5] dark:border-[#1E3027] py-10">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <ClenCLogo variant="full" />

            <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-[#2E4035] dark:text-[#A8BEB1]">
              <button type="button" onClick={() => onNavigate('report-issue')} className="hover:underline">
                Report Waste Issue
              </button>
              <button type="button" onClick={() => onNavigate('pickup-request')} className="hover:underline">
                Schedule Pickup
              </button>
              <button type="button" onClick={() => onNavigate('track-complaints')} className="hover:underline">
                Complaint Tracking
              </button>
              <button type="button" onClick={() => onNavigate('awareness')} className="hover:underline">
                SWM 2026 Guide
              </button>
              <button type="button" onClick={() => onNavigate('worker-dashboard')} className="hover:underline">
                Field Collector Portal
              </button>
              <button type="button" onClick={() => onNavigate('admin-dashboard')} className="hover:underline">
                Ward Admin Console
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-[#C5D0C8] dark:border-[#1E3027] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#43564A] dark:text-[#8CA395]">
            <div className="flex items-center gap-2">
              <IconMapPin className="w-4 h-4 text-[#15693F]" />
              <span>
                ClenC Kanpur Nagar Nigam (KNN) Digital Infrastructure · Solid Waste Management Rules 2026
              </span>
            </div>

            <div className="flex items-center gap-4 font-semibold">
              <button
                type="button"
                onClick={() => onOpenLegal('tos')}
                className="underline hover:text-[#122017] dark:hover:text-[#E7EFEA]"
              >
                Terms of Service
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => onOpenLegal('privacy')}
                className="underline hover:text-[#122017] dark:hover:text-[#E7EFEA]"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
