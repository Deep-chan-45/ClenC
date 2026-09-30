import React, { useState, useEffect, useMemo } from 'react';
import { CitizenLeader, UserProfile, PageView } from '../types';
import { TOP_CITIZEN_LEADERS, WARDS } from '../data/mockData';
import {
  IconAward,
  IconFlame,
  IconStar,
  IconSearch,
  IconLeaf,
  IconBin,
  IconTruck,
} from './Icons';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, limit } from 'firebase/firestore';

interface LeaderboardProps {
  currentUser?: UserProfile;
  onNavigate?: (page: PageView) => void;
  className?: string;
  compact?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  currentUser,
  onNavigate,
  className = '',
  compact = false,
}) => {
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showIncentivesModal, setShowIncentivesModal] = useState<boolean>(false);
  const [firestoreCitizens, setFirestoreCitizens] = useState<CitizenLeader[]>([]);

  // Real-time synchronization with Firestore users collection
  useEffect(() => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'citizen'), limit(25));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const liveList: CitizenLeader[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && data.name && data.role === 'citizen') {
              liveList.push({
                id: docSnap.id,
                name: data.name,
                contact: data.contact || '',
                ward: data.ward || 'Ward 14 - Swaroop Nagar & Arya Nagar',
                userType: data.userType || 'Household',
                points: Number(data.points) || 100,
                streakDays: Number(data.streakDays) || 1,
                badges: Array.isArray(data.badges) ? data.badges : ['Swachh Citizen'],
                resolvedReportsCount: data.resolvedReportsCount || 5,
                taxRebateTier:
                  (data.points || 0) >= 3000
                    ? '15% KNN Property Tax Rebate'
                    : (data.points || 0) >= 2000
                    ? '10% KNN Property Tax Rebate'
                    : '5% KNN Property Tax Rebate',
              });
            }
          });
          setFirestoreCitizens(liveList);
        },
        (error) => {
          console.warn('Leaderboard Firestore sync note:', error.message);
        }
      );
      return () => unsubscribe();
    } catch {
      // Offline fallback
    }
  }, []);

  // Merge Firestore citizens, mock leaders, and current user into a unified, deduplicated list
  const allRankedCitizens = useMemo(() => {
    const map = new Map<string, CitizenLeader>();

    // 1. Add base top leaders from Kanpur Civic mock data
    TOP_CITIZEN_LEADERS.forEach((leader) => {
      map.set(leader.name.toLowerCase().trim(), { ...leader });
    });

    // 2. Overlay live Firestore citizens
    firestoreCitizens.forEach((c) => {
      const key = c.name.toLowerCase().trim();
      const existing = map.get(key);
      if (existing) {
        map.set(key, {
          ...existing,
          points: Math.max(existing.points, c.points),
          streakDays: Math.max(existing.streakDays, c.streakDays),
          badges: Array.from(new Set([...existing.badges, ...c.badges])),
        });
      } else {
        map.set(key, c);
      }
    });

    // 3. Ensure the active logged-in user is included with their live points & stats
    if (currentUser && currentUser.role === 'citizen') {
      const userKey = currentUser.name.toLowerCase().trim();
      const existingUser = map.get(userKey);
      const points = currentUser.points;
      const rebateTier =
        points >= 3000
          ? '15% KNN Property Tax Rebate'
          : points >= 2000
          ? '10% KNN Property Tax Rebate'
          : points >= 1000
          ? '5% KNN Property Tax Rebate'
          : 'Pending 1,000 PTS Threshold';

      map.set(userKey, {
        id: 'current-user-id',
        name: currentUser.name,
        contact: currentUser.contact,
        ward: currentUser.ward,
        userType: currentUser.userType,
        points: currentUser.points,
        streakDays: currentUser.streakDays,
        badges: currentUser.badges || ['Swachh Citizen'],
        resolvedReportsCount: existingUser?.resolvedReportsCount || 8,
        taxRebateTier: rebateTier,
      });
    }

    // Sort by points descending, then by streakDays
    const sorted = Array.from(map.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.streakDays - a.streakDays;
    });

    // Assign rank numbers
    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [firestoreCitizens, currentUser]);

  // Filtered by selected Ward and optional Search Query
  const filteredCitizens = useMemo(() => {
    return allRankedCitizens.filter((c) => {
      const matchesWard = selectedWard === 'all' || c.ward === selectedWard;
      const matchesSearch =
        searchQuery === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.userType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesWard && matchesSearch;
    });
  }, [allRankedCitizens, selectedWard, searchQuery]);

  // Top 10 citizens to display
  const top10Citizens = useMemo(() => {
    return filteredCitizens.slice(0, 10);
  }, [filteredCitizens]);

  // Determine current user's overall rank
  const currentUserRank = useMemo(() => {
    if (!currentUser) return null;
    const foundIndex = allRankedCitizens.findIndex(
      (c) => c.name.toLowerCase().trim() === currentUser.name.toLowerCase().trim()
    );
    if (foundIndex === -1) return null;
    return {
      rank: foundIndex + 1,
      item: allRankedCitizens[foundIndex],
      isInTop10: foundIndex < 10,
      pointsTo10th:
        foundIndex >= 10 && allRankedCitizens[9]
          ? allRankedCitizens[9].points - allRankedCitizens[foundIndex].points + 1
          : 0,
    };
  }, [allRankedCitizens, currentUser]);

  const top3 = top10Citizens.slice(0, 3);
  const remaining7 = top10Citizens.slice(3, 10);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Component Header Card */}
      <div className="p-5 sm:p-6 border border-[#B8C7BC] dark:border-[#263C31] bg-[#EAEFE7] dark:bg-[#14221C] rounded-sm space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#CCD6CE] dark:border-[#22362C] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#15693F] text-white rounded-xs inline-flex items-center justify-center">
                <IconAward className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#15693F] dark:text-[#68C88E]">
                Kanpur Swachh Bharat Mission (SWM 2026)
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#122017] dark:text-[#E7EFEA]">
              Top 10 Citizens · Civic Points Leaderboard
            </h2>
            <p className="text-xs text-[#3A4D41] dark:text-[#A3B8AC] max-w-2xl">
              Recognizing Kanpur citizens and housing societies leading source segregation, verified grievance reporting, and zero-mix composting. Points unlock statutory municipal property tax rebates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowIncentivesModal(true)}
              className="px-3.5 py-2 text-xs font-semibold border border-[#15693F] text-[#15693F] dark:text-[#68C88E] hover:bg-[#15693F] hover:text-white rounded-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <IconStar className="w-3.5 h-3.5" />
              <span>How Points &amp; Tax Rebates Work</span>
            </button>
          </div>
        </div>

        {/* Filter Controls: Ward Selection & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono font-semibold text-[#485B4F] dark:text-[#98AEA0] mr-1">
              WARD FILTER:
            </span>
            <button
              type="button"
              onClick={() => setSelectedWard('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
                selectedWard === 'all'
                  ? 'bg-[#15693F] text-white shadow-xs'
                  : 'bg-[#F4F6F2] dark:bg-[#182921] border border-[#CCD6CE] dark:border-[#283E33] text-[#33463B] dark:text-[#A8BEB1] hover:border-[#15693F]'
              }`}
            >
              All Kanpur Wards (City-Wide)
            </button>
            {currentUser?.ward && (
              <button
                type="button"
                onClick={() => setSelectedWard(currentUser.ward)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedWard === currentUser.ward
                    ? 'bg-[#15693F] text-white shadow-xs'
                    : 'bg-[#F4F6F2] dark:bg-[#182921] border border-[#CCD6CE] dark:border-[#283E33] text-[#33463B] dark:text-[#A8BEB1] hover:border-[#15693F]'
                }`}
              >
                <span>My Ward</span>
                <span className="text-[10px] font-mono opacity-80 truncate max-w-[120px]">
                  ({currentUser.ward.split('-')[0].trim()})
                </span>
              </button>
            )}
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="h-8 px-2 text-xs bg-[#F4F6F2] dark:bg-[#182921] border border-[#CCD6CE] dark:border-[#283E33] rounded-sm text-[#122017] dark:text-[#E7EFEA] focus:outline-hidden"
            >
              <option value="all">More Wards (All 6 Zones)...</option>
              {WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[220px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by citizen name or ward..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-[#F4F6F2] dark:bg-[#182921] border border-[#CCD6CE] dark:border-[#283E33] rounded-sm text-[#122017] dark:text-[#E7EFEA] focus:border-[#15693F] focus:outline-hidden"
            />
            <IconSearch className="w-3.5 h-3.5 text-[#5D7064] absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Current User Standings Banner */}
        {currentUser && currentUserRank && (
          <div
            className={`p-3.5 rounded-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              currentUserRank.isInTop10
                ? 'border-[#15693F] bg-[#E1EDE5] dark:bg-[#152B20] text-[#122017] dark:text-[#E7EFEA]'
                : 'border-[#B86B11]/50 bg-[#FFFBF5] dark:bg-[#20180F] text-[#122017] dark:text-[#E7EFEA]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-sm flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                  currentUserRank.isInTop10
                    ? 'bg-[#15693F] text-white'
                    : 'bg-[#B86B11] text-white'
                }`}
              >
                #{currentUserRank.rank}
              </div>
              <div>
                <div className="font-semibold flex items-center gap-1.5">
                  <span>Your Current Standing:</span>
                  <span className="font-bold underline">{currentUser.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-white/70 dark:bg-black/30 rounded-xs uppercase">
                    {currentUserRank.isInTop10 ? '★ TOP 10 SWACHH CITIZEN' : 'CITY PARTICIPANT'}
                  </span>
                </div>
                <div className="text-[11px] text-[#485B4F] dark:text-[#98AEA0] font-mono">
                  {currentUser.points.toLocaleString('en-IN')} Civic Points · {currentUser.streakDays} Day Segregation Streak · {currentUser.ward}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] self-end sm:self-center">
              {currentUserRank.isInTop10 ? (
                <span className="text-[#15693F] dark:text-[#68C88E] font-bold">
                  ✓ Qualifies for {currentUserRank.item.taxRebateTier}
                </span>
              ) : (
                <span className="text-[#874A08] dark:text-[#F3B872]">
                  Need <strong>+{currentUserRank.pointsTo10th} PTS</strong> to enter the Top 10
                </span>
              )}
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('awareness')}
                  className="px-2.5 py-1 bg-[#15693F] hover:bg-[#105331] text-white rounded-xs text-[11px] font-semibold whitespace-nowrap"
                >
                  Earn +50 Pts
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Top 3 Podium Highlights (Cards for Rank 1, 2, 3) */}
      {top3.length > 0 && !compact && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((citizen) => {
            const isRank1 = citizen.rank === 1;
            const isRank2 = citizen.rank === 2;
            const isRank3 = citizen.rank === 3;
            const isCurrentUser =
              currentUser &&
              citizen.name.toLowerCase().trim() === currentUser.name.toLowerCase().trim();

            const medalBadge = isRank1 ? '🥇' : isRank2 ? '🥈' : '🥉';
            const medalColor = isRank1
              ? 'bg-[#C27A17] text-white'
              : isRank2
              ? 'bg-[#6F7D74] text-white'
              : 'bg-[#9C5D28] text-white';

            const cardBorder = isCurrentUser
              ? 'border-2 border-[#15693F] shadow-md'
              : isRank1
              ? 'border-[#B86B11] dark:border-[#965A15] shadow-xs'
              : 'border-[#B8C7BC] dark:border-[#283E33]';

            const cardBg = isRank1
              ? 'bg-gradient-to-b from-[#FFFDF8] to-[#F5EEDF] dark:from-[#1E180E] dark:to-[#17130A]'
              : 'bg-[#F4F6F2] dark:bg-[#15231D]';

            return (
              <div
                key={citizen.id || citizen.name}
                className={`p-5 rounded-sm border ${cardBorder} ${cardBg} flex flex-col justify-between space-y-4 transition-all`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl leading-none">{medalBadge}</span>
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider ${medalColor}`}
                      >
                        Rank #{citizen.rank}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#15693F] dark:text-[#68C88E] tabular-nums">
                      {citizen.points.toLocaleString('en-IN')} PTS
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display text-base font-bold text-[#122017] dark:text-[#E7EFEA] truncate">
                        {citizen.name}
                      </h3>
                      {isCurrentUser && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-[#15693F] text-white rounded-xs">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-[#4A5D52] dark:text-[#98AEA0] truncate mt-0.5">
                      {citizen.ward}
                    </div>
                    <div className="text-[11px] font-mono text-[#0F626A] dark:text-[#66C7D0] mt-0.5">
                      Type: {citizen.userType}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#CCD6CE] dark:border-[#263D31] text-xs">
                    <div className="p-2 bg-white/70 dark:bg-black/20 rounded-xs">
                      <div className="text-[10px] font-mono text-[#485B4F] dark:text-[#8EAAA0] flex items-center gap-1">
                        <IconFlame className="w-3 h-3 text-[#B86B11]" />
                        <span>STREAK</span>
                      </div>
                      <div className="font-mono font-bold text-[#122017] dark:text-[#E7EFEA]">
                        {citizen.streakDays} Days
                      </div>
                    </div>
                    <div className="p-2 bg-white/70 dark:bg-black/20 rounded-xs">
                      <div className="text-[10px] font-mono text-[#485B4F] dark:text-[#8EAAA0]">
                        REPORTS
                      </div>
                      <div className="font-mono font-bold text-[#122017] dark:text-[#E7EFEA]">
                        {citizen.resolvedReportsCount} Cleared
                      </div>
                    </div>
                  </div>

                  {/* Badges preview */}
                  {citizen.badges && citizen.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {citizen.badges.slice(0, 2).map((b) => (
                        <span
                          key={b}
                          className="px-2 py-0.5 bg-[#E2ECE5] dark:bg-[#1A2E24] text-[#15693F] dark:text-[#68C88E] text-[10px] font-semibold rounded-xs border border-[#BED2C4] dark:border-[#274636]"
                        >
                          · {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#CCD6CE] dark:border-[#263D31] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#35483D] dark:text-[#A8BEB1]">KNN Tax Benefit:</span>
                  <span className="font-bold text-[#15693F] dark:text-[#68C88E]">
                    {citizen.taxRebateTier || '10% Rebate'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Top 10 Table / List */}
      <div className="border border-[#B8C7BC] dark:border-[#263C31] bg-[#F4F6F2] dark:bg-[#15231D] rounded-sm overflow-hidden shadow-xs">
        <div className="p-4 bg-[#EAEFE7] dark:bg-[#121F1A] border-b border-[#CCD6CE] dark:border-[#22362C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#122017] dark:text-[#E7EFEA] uppercase tracking-wider">
              {selectedWard === 'all'
                ? 'City-Wide Standings (Kanpur Nagar Nigam)'
                : `${selectedWard} Standings`}
            </span>
            <span className="text-[11px] font-mono text-[#4A5D52] dark:text-[#98AEA0]">
              ({top10Citizens.length} Citizens Listed)
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#15693F] dark:text-[#68C88E] font-semibold">
            ● LIVE SWM 2026 LEDGER
          </span>
        </div>

        {top10Citizens.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="text-sm font-semibold text-[#122017] dark:text-[#E7EFEA]">
              No citizens found matching your filter
            </div>
            <p className="text-xs text-[#5D7064] dark:text-[#8EAAA0]">
              Try selecting "All Kanpur Wards" or clear your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#E4ECE1] dark:bg-[#101C16] border-b border-[#CCD6CE] dark:border-[#22362C] font-mono text-[11px] text-[#4A5D52] dark:text-[#98AEA0]">
                  <th className="py-3 px-4 font-bold w-16">RANK</th>
                  <th className="py-3 px-4 font-bold">CITIZEN &amp; PREMISES</th>
                  <th className="py-3 px-4 font-bold hidden md:table-cell">MUNICIPAL WARD</th>
                  <th className="py-3 px-4 font-bold text-center">STREAK</th>
                  <th className="py-3 px-4 font-bold text-right">CIVIC POINTS</th>
                  <th className="py-3 px-4 font-bold text-right hidden lg:table-cell">
                    PROPERTY TAX REBATE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CCD6CE] dark:divide-[#1F3329]">
                {top10Citizens.map((citizen) => {
                  const isCurrentUser =
                    currentUser &&
                    citizen.name.toLowerCase().trim() === currentUser.name.toLowerCase().trim();
                  const isTop3 = (citizen.rank || 0) <= 3;

                  return (
                    <tr
                      key={citizen.id || citizen.name}
                      className={`transition-colors ${
                        isCurrentUser
                          ? 'bg-[#E1EDE5] dark:bg-[#172D22] font-semibold'
                          : 'hover:bg-[#EAEFE7] dark:hover:bg-[#14231C]'
                      }`}
                    >
                      {/* Rank Position */}
                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-xs font-bold text-xs ${
                            citizen.rank === 1
                              ? 'bg-[#C27A17] text-white'
                              : citizen.rank === 2
                              ? 'bg-[#6F7D74] text-white'
                              : citizen.rank === 3
                              ? 'bg-[#9C5D28] text-white'
                              : 'bg-[#D3DDD4] dark:bg-[#203429] text-[#223429] dark:text-[#C5D8CD]'
                          }`}
                        >
                          {citizen.rank}
                        </span>
                      </td>

                      {/* Citizen Name & Badges */}
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-[#122017] dark:text-[#E7EFEA]">
                            {citizen.name}
                          </span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 bg-[#15693F] text-white text-[10px] font-mono font-bold rounded-xs">
                              YOU
                            </span>
                          )}
                          <span className="hidden sm:inline text-[10px] font-mono text-[#0F626A] dark:text-[#66C7D0] px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded-xs">
                            {citizen.userType}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-[#4A5D52] dark:text-[#98AEA0]">
                          <span className="md:hidden">{citizen.ward.split('-')[0].trim()} ·</span>
                          {citizen.badges && citizen.badges.length > 0 && (
                            <span>{citizen.badges.slice(0, 3).join(' · ')}</span>
                          )}
                        </div>
                      </td>

                      {/* Municipal Ward */}
                      <td className="py-3.5 px-4 hidden md:table-cell font-mono text-[#33463B] dark:text-[#A8BEB1]">
                        {citizen.ward}
                      </td>

                      {/* Segregation Streak */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="inline-flex items-center gap-1 font-bold text-[#B86B11] dark:text-[#F0AD5E]">
                          <IconFlame className="w-3.5 h-3.5" />
                          <span>{citizen.streakDays}d</span>
                        </span>
                      </td>

                      {/* Accumulated Civic Points */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono text-sm font-bold tabular-nums text-[#15693F] dark:text-[#68C88E]">
                          {citizen.points.toLocaleString('en-IN')}{' '}
                          <span className="text-[10px] font-normal">PTS</span>
                        </span>
                      </td>

                      {/* Property Tax Rebate Status */}
                      <td className="py-3.5 px-4 text-right hidden lg:table-cell font-mono">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-xs ${
                            citizen.points >= 3000
                              ? 'bg-[#E2ECE5] dark:bg-[#163022] text-[#15693F] dark:text-[#68C88E] border border-[#B9D4C2] dark:border-[#2A4D39]'
                              : citizen.points >= 2000
                              ? 'bg-[#FDF6EA] dark:bg-[#291F11] text-[#B86B11] dark:text-[#F0AD5E] border border-[#ECD9BD] dark:border-[#4B361B]'
                              : 'bg-[#F2F4F1] dark:bg-[#1A2520] text-[#4A5D52] dark:text-[#98AEA0]'
                          }`}
                        >
                          {citizen.taxRebateTier || '5% Rebate'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Actions to Earn More Points */}
        <div className="p-4 bg-[#EAEFE7] dark:bg-[#121F1A] border-t border-[#CCD6CE] dark:border-[#22362C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-[#35483D] dark:text-[#A8BEB1]">
            <IconLeaf className="w-4 h-4 text-[#15693F]" />
            <span>
              Rankings refresh in real-time as citizens report grievances, segregate waste, and take quizzes.
            </span>
          </div>

          {onNavigate && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('report-issue')}
                className="px-3 py-1.5 bg-[#15693F] hover:bg-[#105331] text-white text-xs font-semibold rounded-sm transition-colors flex items-center gap-1 cursor-pointer"
              >
                <IconBin className="w-3.5 h-3.5" />
                <span>Report Issue (+30 Pts)</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('pickup-request')}
                className="px-3 py-1.5 bg-[#0F626A] hover:bg-[#0B4B52] text-white text-xs font-semibold rounded-sm transition-colors flex items-center gap-1 cursor-pointer"
              >
                <IconTruck className="w-3.5 h-3.5" />
                <span>Book Pickup (+40 Pts)</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('awareness')}
                className="px-3 py-1.5 border border-[#15693F] text-[#15693F] dark:text-[#68C88E] hover:bg-[#15693F] hover:text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer"
              >
                SWM Quiz (+50 Pts)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Incentives & Property Tax Rebate Information Modal */}
      {showIncentivesModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="max-w-xl w-full bg-[#F4F6F2] dark:bg-[#15231D] border border-[#CCD6CE] dark:border-[#283E33] rounded-sm p-6 space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex items-start justify-between border-b border-[#CCD6CE] dark:border-[#24382E] pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-[#15693F] dark:text-[#68C88E]">
                  KANPUR NAGAR NIGAM STATUTORY INCENTIVE SCHEME
                </span>
                <h3 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                  How Civic Points &amp; Property Tax Rebates Work
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIncentivesModal(false)}
                className="p-1 hover:bg-[#CCD6CE] dark:hover:bg-[#283E33] rounded-xs text-[#485B4F] dark:text-[#98AEA0]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#35483D] dark:text-[#A8BEB1]">
              <p className="leading-relaxed">
                Under the <strong>Solid Waste Management (SWM) Rules 2026</strong> and Kanpur Nagar Nigam civic guidelines, citizens earn verifiable <strong>Civic Points</strong> for proactive waste management and community stewardship.
              </p>

              <div className="space-y-2 border border-[#CCD6CE] dark:border-[#283E33] bg-[#EAEFE7] dark:bg-[#101C16] p-3.5 rounded-sm">
                <div className="font-mono font-bold text-[#122017] dark:text-[#E7EFEA] text-[11px] uppercase">
                  Point Allocation Schedule:
                </div>
                <ul className="space-y-1.5 font-mono text-[11px]">
                  <li className="flex items-center justify-between">
                    <span>· Geo-verified Waste Report (with before/after photo closure)</span>
                    <span className="font-bold text-[#15693F] dark:text-[#68C88E]">+30 PTS</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>· Validated Community Upvote on Critical Hazard</span>
                    <span className="font-bold text-[#15693F] dark:text-[#68C88E]">+25 PTS</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>· Doorstep Segregated / Bulk Pickup Request Handed Over</span>
                    <span className="font-bold text-[#15693F] dark:text-[#68C88E]">+40 PTS</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>· Daily 4-Stream Source Segregation Streak (per 7 days)</span>
                    <span className="font-bold text-[#B86B11] dark:text-[#F0AD5E]">+100 PTS</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>· SWM 2026 Segregation Quiz Perfect Score</span>
                    <span className="font-bold text-[#15693F] dark:text-[#68C88E]">+50 PTS</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 border border-[#CCD6CE] dark:border-[#283E33] bg-[#EAEFE7] dark:bg-[#101C16] p-3.5 rounded-sm">
                <div className="font-mono font-bold text-[#122017] dark:text-[#E7EFEA] text-[11px] uppercase">
                  Annual Kanpur Property Tax Rebate Tiers:
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span>Tier 1: 1,000 – 1,999 PTS</span>
                    <span className="font-bold text-[#15693F] dark:text-[#68C88E]">5% Annual Tax Rebate</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span>Tier 2: 2,000 – 2,999 PTS</span>
                    <span className="font-bold text-[#15693F] dark:text-[#68C88E]">10% Annual Tax Rebate</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span>Tier 3: 3,000+ PTS (Top 10 Citizens)</span>
                    <span className="font-bold text-[#15693F] dark:text-[#68C88E]">15% Annual Tax Rebate + Swachh Medal</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#CCD6CE] dark:border-[#24382E] flex justify-end">
              <button
                type="button"
                onClick={() => setShowIncentivesModal(false)}
                className="px-4 py-2 bg-[#15693F] hover:bg-[#105331] text-white text-xs font-semibold rounded-sm transition-colors"
              >
                Understood · Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
