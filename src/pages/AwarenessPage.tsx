import React, { useState } from 'react';
import { PageView, UserProfile, WasteStream } from '../types';
import {
  QUIZ_QUESTIONS,
  RECYCLING_CENTERS,
  SOCIETY_LEADERBOARD,
  SWM_2026_STREAMS,
  WASTE_ITEMS_GUIDE,
} from '../data/mockData';
import { CitizenSidebar } from './CitizenViews';
import { BinClassifier } from '../components/BinClassifier';
import {
  IconAward,
  IconCamera,
  IconClock,
  IconFlame,
  IconHazardAlert,
  IconLeaf,
  IconMapPin,
  IconRecycle,
  IconSanitaryShield,
  IconSearch,
} from '../components/Icons';

interface AwarenessPageProps {
  user: UserProfile;
  onNavigate: (page: PageView) => void;
  onAwardQuizPoints: (pts: number) => void;
}

export const AwarenessPage: React.FC<AwarenessPageProps> = ({
  user,
  onNavigate,
  onAwardQuizPoints,
}) => {
  const [selectedStreamTab, setSelectedStreamTab] = useState<WasteStream>('Wet');

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, WasteStream>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Recycling center filter
  const [centerFilter, setCenterFilter] = useState<string>('All');

  const handleCalculateQuiz = () => {
    setQuizSubmitted(true);
    let correctCount = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (quizAnswers[q.id] === q.correctStream) correctCount += 1;
    });
    if (correctCount > 0) {
      onAwardQuizPoints(correctCount * 25);
    }
  };

  const activeStreamDetail =
    SWM_2026_STREAMS.find((s) => s.stream === selectedStreamTab) ||
    SWM_2026_STREAMS[0];

  const filteredCenters = RECYCLING_CENTERS.filter((c) =>
    centerFilter === 'All' ? true : c.type === centerFilter
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)] pb-16 lg:pb-0">
      <CitizenSidebar currentPage="awareness" onNavigate={onNavigate} user={user} />

      <main className="flex-1 max-w-[1180px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="border-b border-[#C5D0C8] dark:border-[#24382E] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-semibold text-[#15693F] dark:text-[#68C88E]">
              SOLID WASTE MANAGEMENT RULES 2026 · CITIZEN EDUCATION & GAMIFICATION
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#122017] dark:text-[#E7EFEA]">
              Waste Awareness, "Which Bin?" Search & Community Leaderboard
            </h1>
          </div>
          <div className="text-xs font-mono font-bold text-[#0F626A] dark:text-[#66C7D0]">
            YOUR SCORE: {user.points.toLocaleString('en-IN')} PTS · {user.streakDays}-DAY STREAK
          </div>
        </div>

        {/* SECTION 1: "WHICH BIN?" INSTANT SEARCH */}
        <section>
          <BinClassifier variant="full" initialQuery="banana peel" />
        </section>

        {/* SECTION 2: INTERACTIVE 4-STREAM SEGREGATION GUIDE */}
        <section className="p-6 border border-[#C5D0C8] dark:border-[#24382E] bg-[#EAEFE7] dark:bg-[#14221C] rounded-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-[#122017] dark:text-[#E7EFEA]">
                Interactive Four-Stream Segregation Guide (SWM Rules 2026)
              </h2>
              <p className="text-xs text-[#485B4F] dark:text-[#98AEA0]">
                Select each official stream to inspect example items, preparation rules, and recovery pathways
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {SWM_2026_STREAMS.map((s) => (
                <button
                  key={s.stream}
                  type="button"
                  onClick={() => setSelectedStreamTab(s.stream)}
                  className={`px-4 py-2 text-xs font-semibold rounded-sm border ${
                    selectedStreamTab === s.stream
                      ? 'bg-[#15693F] text-[#F4F6F2] border-[#15693F]'
                      : 'bg-[#F4F6F2] dark:bg-[#15241D] border-[#B8C7BC] dark:border-[#283E33]'
                  }`}
                >
                  {s.stream} ({s.binColorName})
                </button>
              ))}
            </div>
          </div>

          <div
            className={`p-5 border ${activeStreamDetail.borderTint} ${activeStreamDetail.bgTint} rounded-sm grid grid-cols-1 md:grid-cols-12 gap-6`}
          >
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center gap-2">
                {activeStreamDetail.stream === 'Wet' && <IconLeaf className="w-5 h-5 text-[#15693F]" />}
                {activeStreamDetail.stream === 'Dry' && <IconRecycle className="w-5 h-5 text-[#1D5B96]" />}
                {activeStreamDetail.stream === 'Sanitary' && (
                  <IconSanitaryShield className="w-5 h-5 text-[#B8332A]" />
                )}
                {activeStreamDetail.stream === 'Special Care' && (
                  <IconHazardAlert className="w-5 h-5 text-[#A85E0D]" />
                )}
                <h3 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                  {activeStreamDetail.titleEn} · {activeStreamDetail.titleHi}
                </h3>
              </div>

              <p className="text-sm text-[#233429] dark:text-[#D0E0D6] leading-relaxed">
                {activeStreamDetail.ruleSummary}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-[#F4F6F2] dark:bg-[#0F1B15] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm">
                  <div className="text-xs font-mono font-bold text-[#15693F] dark:text-[#68C88E] mb-1">
                    INCLUDED EXAMPLE ITEMS:
                  </div>
                  <ul className="text-xs space-y-1">
                    {activeStreamDetail.examples.map((ex) => (
                      <li key={ex}>· {ex}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-[#F4F6F2] dark:bg-[#0F1B15] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm space-y-2">
                  <div>
                    <div className="text-xs font-mono font-bold text-[#B8332A] dark:text-[#F08078]">
                      STRICTLY PROHIBITED IN THIS BIN:
                    </div>
                    <p className="text-xs mt-1">{activeStreamDetail.prohibited}</p>
                  </div>
                  <div className="pt-2 border-t border-[#C5D0C8] dark:border-[#24382E]">
                    <div className="text-xs font-mono font-bold text-[#0F626A] dark:text-[#66C7D0]">
                      MUNICIPAL RECOVERY PLANT:
                    </div>
                    <p className="text-xs mt-1">{activeStreamDetail.destination}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Stream Diagram */}
            <div className="md:col-span-5 flex flex-col justify-between p-4 bg-[#F4F6F2] dark:bg-[#0F1B15] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm">
              <div className="text-xs font-mono font-bold text-[#485B4F] dark:text-[#98AEA0]">
                VISUAL CONTAINER SPECIFICATION · {activeStreamDetail.binColorName.toUpperCase()}
              </div>
              <div className="my-4 flex items-center justify-center">
                <div
                  className="w-32 h-36 rounded-sm border-2 flex flex-col items-center justify-center p-3 text-center font-mono"
                  style={{
                    borderColor: activeStreamDetail.accentHex,
                    backgroundColor: `${activeStreamDetail.accentHex}18`,
                  }}
                >
                  <div className="text-xs font-bold">{activeStreamDetail.stream.toUpperCase()}</div>
                  <div className="text-[11px] mt-1">{activeStreamDetail.binColorName}</div>
                  <div className="text-[10px] mt-2 opacity-80">SWM 2026 STANDARD</div>
                </div>
              </div>
              <div className="text-xs font-mono text-center text-[#35483D] dark:text-[#A8BEB1]">
                Daily Collection Window: 07:00 - 10:30 AM
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: INTERACTIVE QUIZ + DAILY TIPS & COLLECTION SCHEDULE */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Segregation Quiz (7 cols) */}
          <div className="lg:col-span-7 p-6 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#C5D0C8] dark:border-[#24382E] pb-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                  Interactive SWM 2026 Segregation Quiz
                </h2>
                <p className="text-xs text-[#485B4F] dark:text-[#98AEA0]">
                  Test your 4-stream knowledge for instant feedback and +25 points per right answer
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#15693F] dark:text-[#68C88E]">
                +100 MAX PTS
              </span>
            </div>

            <div className="space-y-4">
              {QUIZ_QUESTIONS.map((q, idx) => {
                const chosen = quizAnswers[q.id];
                const isCorrect = chosen === q.correctStream;
                return (
                  <div
                    key={q.id}
                    className="p-4 border border-[#B8C7BC] dark:border-[#263C31] bg-[#EAEFE7] dark:bg-[#101C16] rounded-sm space-y-2.5"
                  >
                    <div className="text-xs font-bold text-[#122017] dark:text-[#E7EFEA]">
                      Q{idx + 1}. {q.question}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['Wet', 'Dry', 'Sanitary', 'Special Care'] as WasteStream[]).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setQuizAnswers((prev) => ({ ...prev, [q.id]: opt }))
                          }
                          className={`py-1.5 px-2.5 text-xs font-semibold border rounded-xs ${
                            chosen === opt
                              ? 'bg-[#15693F] text-[#F4F6F2] border-[#15693F]'
                              : 'bg-[#F4F6F2] dark:bg-[#15241D] border-[#C5D0C8] dark:border-[#283E33]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {chosen && (
                      <div
                        className={`text-xs font-mono pt-1 ${
                          isCorrect
                            ? 'text-[#15693F] dark:text-[#68C88E]'
                            : 'text-[#B8332A] dark:text-[#F08078]'
                        }`}
                      >
                        {isCorrect ? '[CORRECT]' : `[INCORRECT - Answer: ${q.correctStream}]`} ·{' '}
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleCalculateQuiz}
              className="h-10 px-5 bg-[#15693F] text-[#F4F6F2] text-xs font-semibold rounded-sm"
            >
              {quizSubmitted
                ? 'Quiz Points Credited to Your Citizen Profile'
                : 'Submit Quiz Answers & Claim Civic Points'}
            </button>
          </div>

          {/* Daily Civic Tips & Local Collection Schedule Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-3">
              <div className="flex items-center gap-2">
                <IconClock className="w-5 h-5 text-[#0F626A]" />
                <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                  Local Ward Collection Schedule ({user.ward.split(' - ')[0]})
                </h2>
              </div>

              <div className="divide-y divide-[#C5D0C8] dark:divide-[#24382E] text-xs font-mono">
                <div className="py-2.5 flex justify-between">
                  <span>Wet (Green) &amp; Sanitary (Red)</span>
                  <span className="font-bold text-[#15693F] dark:text-[#68C88E]">
                    Daily · 07:00 - 09:30
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span>Dry Recyclables (Blue MRF Van)</span>
                  <span className="font-bold text-[#1D5B96] dark:text-[#78B2EB]">
                    Daily · 09:30 - 12:00
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span>Special Care &amp; E-Waste Van</span>
                  <span className="font-bold text-[#B86B11] dark:text-[#F0AD5E]">
                    Wed &amp; Sat · 14:00 - 17:00
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span>Garden Pruning &amp; Bulky Waste</span>
                  <span className="font-bold">On-Demand via Pickup Tab</span>
                </div>
              </div>
            </div>

            <div className="p-5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#EAEFE7] dark:bg-[#14221C] rounded-sm space-y-3">
              <div className="flex items-center gap-2">
                <IconFlame className="w-5 h-5 text-[#B86B11]" />
                <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                  Daily Zero-Waste Civic Tips
                </h2>
              </div>
              <ul className="space-y-2 text-xs text-[#2D3E33] dark:text-[#B8CCC0] leading-relaxed">
                <li>
                  <strong>Tip 01 (Milk Packets):</strong> Snip only a corner when opening milk pouches so the tiny plastic triangle does not become unrecyclable micro-litter.
                </li>
                <li>
                  <strong>Tip 02 (Pizza Boxes):</strong> Tear off the oil-stained bottom half for the Wet Bin, and keep the clean top lid in the Dry Blue Bin.
                </li>
                <li>
                  <strong>Tip 03 (Broken Glass):</strong> Never drop loose glass shards in bags; wrap in thick carton and mark "SHARP" for Special Care collectors.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 4: NEARBY RECYCLING & E-WASTE CENTRES + RWA / COLLEGE LEADERBOARD */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Nearby Recycling & E-Waste Centres */}
          <div className="lg:col-span-6 p-6 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <IconMapPin className="w-5 h-5 text-[#15693F]" />
                <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                  Nearby Recycling, MRF &amp; E-Waste Centres
                </h2>
              </div>

              <select
                value={centerFilter}
                onChange={(e) => setCenterFilter(e.target.value)}
                className="h-8 px-2 text-xs bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
              >
                <option value="All">All Facility Types</option>
                <option value="MRF & Dry Waste">MRF &amp; Dry Waste</option>
                <option value="Authorized E-Waste">Authorized E-Waste</option>
                <option value="Biomethanation & Compost">Biomethanation &amp; Compost</option>
                <option value="Special Care & Hazardous">Special Care &amp; Hazardous</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredCenters.map((rc) => (
                <div
                  key={rc.id}
                  className="p-3.5 border border-[#B8C7BC] dark:border-[#263C31] bg-[#EAEFE7] dark:bg-[#101C16] rounded-sm space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#15693F] dark:text-[#68C88E]">{rc.type}</span>
                    <span className="tabular-nums font-bold">{rc.distanceKm} km away</span>
                  </div>
                  <div className="font-display text-sm font-bold text-[#122017] dark:text-[#E7EFEA]">
                    {rc.name}
                  </div>
                  <div className="text-xs text-[#3A4D41] dark:text-[#A3B8AC]">{rc.address}</div>
                  <div className="text-[11px] font-mono text-[#485B4F] dark:text-[#98AEA0]">
                    Hours: {rc.hours} · Tel: {rc.contact}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Residential Society & College Campus Leaderboard */}
          <div className="lg:col-span-6 p-6 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-4">
            <div className="flex items-center gap-2">
              <IconAward className="w-5 h-5 text-[#B86B11]" />
              <div>
                <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                  Residential Society &amp; College Campus Leaderboard
                </h2>
                <p className="text-xs text-[#485B4F] dark:text-[#98AEA0]">
                  Ranked by source segregation compliance and on-site monthly composting
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#C5D0C8] dark:border-[#24382E] font-mono text-[#485B4F] dark:text-[#98AEA0]">
                    <th className="py-2 pr-2">RANK</th>
                    <th className="py-2 pr-2">INSTITUTION / RWA</th>
                    <th className="py-2 pr-2 text-right">SEGREGATION</th>
                    <th className="py-2 pr-2 text-right">COMPOST/MO</th>
                    <th className="py-2 text-right">POINTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CDD7CF] dark:divide-[#22342B]">
                  {SOCIETY_LEADERBOARD.map((row) => (
                    <tr key={row.rank}>
                      <td className="py-2.5 pr-2 font-mono font-bold text-[#15693F] dark:text-[#68C88E]">
                        #{row.rank}
                      </td>
                      <td className="py-2.5 pr-2">
                        <div className="font-semibold text-[#122017] dark:text-[#E7EFEA]">
                          {row.name}
                        </div>
                        <div className="text-[11px] font-mono text-[#485B4F] dark:text-[#98AEA0]">
                          {row.type} · {row.ward}
                        </div>
                      </td>
                      <td className="py-2.5 pr-2 text-right font-mono tabular-nums font-bold">
                        {row.segregationRate}%
                      </td>
                      <td className="py-2.5 pr-2 text-right font-mono tabular-nums">
                        {row.compostingKgPerMonth.toLocaleString('en-IN')} kg
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums font-bold text-[#0F626A] dark:text-[#66C7D0]">
                        {row.points.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
