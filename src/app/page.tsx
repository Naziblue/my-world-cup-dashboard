'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Group, Team, Fixture, StandingsResponse } from '@/types';
import GroupTable from '@/components/GroupTable';
import ThirdPlaceTable from '@/components/ThirdPlaceTable';
import LiveMatches from '@/components/LiveMatches';
import KnockoutBracket from '@/components/KnockoutBracket';
import TeamDetailDrawer from '@/components/TeamDetailDrawer';
import MatchDetailModal from '@/components/MatchDetailModal';
import {
  Trophy,
  Search,
  LayoutGrid,
  Award,
  Info,
  Globe,
  Play,
  RefreshCw,
  Users,
  Tv,
  Star
} from 'lucide-react';
import { t, translateTeam, formatNumber } from '@/utils/i18n';

export default function Home() {
  const [data, setData] = useState<StandingsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'groups' | 'third-place' | 'bracket' | 'info'>('groups');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [nextRefreshSeconds, setNextRefreshSeconds] = useState<number>(5);
  const [lang, setLang] = useState<'en' | 'fa'>('en');
  const [pinnedTeams, setPinnedTeams] = useState<string[]>([]);
  const [drawerTeam, setDrawerTeam] = useState<{ team: Team; group: Group } | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Fixture | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load pinned teams from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wc2026_pinned_teams');
      if (stored) setPinnedTeams(JSON.parse(stored));
    } catch {}
  }, []);

  const openTeamDetail = useCallback((team: Team, group: Group) => {
    setDrawerTeam({ team, group });
  }, []);

  const togglePin = useCallback((code: string) => {
    setPinnedTeams(prev => {
      const next = prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code];
      try { localStorage.setItem('wc2026_pinned_teams', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const LIVE_INTERVAL = 5;
  const COOLDOWN_INTERVAL = 1800; // 30 minutes

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/standings');
      if (!res.ok) {
        throw new Error('Failed to retrieve standings data');
      }
      const jsonData: StandingsResponse = await res.json();
      if (jsonData.success) {
        setData(jsonData);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'An error occurred while loading data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Smart polling: 5s during operational window, 30min cooldown outside
  useEffect(() => {
    if (!data?.fixtures) return;

    const isMatchLive = (s: string) => ['1H', '2H', 'HT', 'ET', 'P'].includes(s);
    const isMatchFinished = (s: string) => s === 'FT';

    const computeInterval = (): number => {
      const now = Date.now();
      const localToday = new Date().toDateString();

      const todaysFixtures = data.fixtures.filter(f => {
        if (isMatchLive(f.status.short)) return true;
        return new Date(f.date).toDateString() === localToday;
      });

      if (todaysFixtures.length === 0) return COOLDOWN_INTERVAL;

      // Operational window: first kickoff of the day → last kickoff + 3.5h
      const allKickoffs = todaysFixtures.map(f => new Date(f.date).getTime());
      const firstKickoff = Math.min(...allKickoffs);
      const lastKickoff = Math.max(...allKickoffs);
      const windowEnd = lastKickoff + 3.5 * 3600000;

      if (now < firstKickoff) {
        const secsUntil = Math.ceil((firstKickoff - now) / 1000);
        return Math.min(secsUntil, COOLDOWN_INTERVAL);
      }

      if (now >= firstKickoff && now <= windowEnd) {
        return LIVE_INTERVAL;
      }

      return COOLDOWN_INTERVAL;
    };

    const intervalSecs = computeInterval();
    setNextRefreshSeconds(intervalSecs);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setNextRefreshSeconds(prev => {
        if (prev <= 1) {
          fetchData(true);
          return intervalSecs;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [data, fetchData]);

  // Set document dir & lang dynamically
  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 text-white font-sans">
      {/* Hero Banner — geometric overlay */}
      <header className="mb-6 relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-stadium-indigo" />
        {/* Geometric angular slashes */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1400 200">
          <polygon points="600,0 1400,0 1400,200 800,200" fill="rgba(0,0,0,0.2)" />
          <polygon points="900,0 1100,0 700,200 500,200" fill="rgba(0,0,0,0.12)" />
          <polygon points="1100,0 1250,0 950,200 800,200" fill="rgba(0,0,0,0.08)" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-electric-purple/5" />

        {/* Content */}
        <div className="relative flex flex-col gap-4 md:flex-row md:justify-between md:items-center px-6 py-6 md:py-8">
          <div className="flex items-center gap-4">
            <img
              src="/fifa-logo.png"
              alt="FIFA World Cup 2026"
              className="h-14 md:h-18 w-auto shrink-0"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
                {lang === 'fa' ? 'جام جهانی فیفا' : 'FIFA WORLD CUP'}
                <span className="text-volt-yellow">™</span>
              </h1>
              <p className="text-[11px] md:text-xs text-stadium-gray font-semibold tracking-widest uppercase mt-0.5">
                {lang === 'fa' ? 'آمریکا · مکزیک · کانادا ۲۰۲۶' : 'USA · MEXICO · CANADA 2026'}
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-center shrink-0">
            <button
              onClick={() => setLang(lang === 'en' ? 'fa' : 'en')}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-deep-navy/60 border border-pitch-border text-stadium-gray hover:text-white hover:border-cyber-orchid/30 transition-colors cursor-pointer backdrop-blur-sm"
            >
              <Globe size={12} />
              {lang === 'en' ? 'فارسی' : 'English'}
            </button>

          </div>
        </div>
      </header>

      {/* Live Matches & Scores Widget */}
      {data && data.fixtures && data.fixtures.length > 0 && (
        <LiveMatches fixtures={data.fixtures} nextRefreshSeconds={nextRefreshSeconds} lang={lang} pinnedTeams={pinnedTeams} onMatchClick={setSelectedMatch} />
      )}

      {/* Control Bar (Tabs & Search) */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-stadium-indigo border border-pitch-border p-3 rounded-2xl mb-8 backdrop-blur-md">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin shrink-0">
          <button 
            className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'groups' 
                ? 'bg-electric-purple text-white border border-cyber-orchid/30' 
                : 'text-stadium-gray hover:bg-deep-navy hover:text-white border border-transparent'
            }`}
            onClick={() => setActiveTab('groups')}
          >
            <LayoutGrid size={14} />
            {t('Groups Grid', lang)}
          </button>
          <button 
            className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'third-place' 
                ? 'bg-electric-purple text-white border border-cyber-orchid/30' 
                : 'text-stadium-gray hover:bg-deep-navy hover:text-white border border-transparent'
            }`}
            onClick={() => setActiveTab('third-place')}
          >
            <Award size={14} />
            {t('Third Place Wildcard', lang)}
          </button>
          <button 
            className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'bracket' 
                ? 'bg-electric-purple text-white border border-cyber-orchid/30' 
                : 'text-stadium-gray hover:bg-deep-navy hover:text-white border border-transparent'
            }`}
            onClick={() => setActiveTab('bracket')}
          >
            <Trophy size={14} />
            {t('Knockout Bracket', lang)}
          </button>
          <button 
            className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'info' 
                ? 'bg-electric-purple text-white border border-cyber-orchid/30' 
                : 'text-stadium-gray hover:bg-deep-navy hover:text-white border border-transparent'
            }`}
            onClick={() => setActiveTab('info')}
          >
            <Info size={14} />
            {t('Tournament Stats', lang)}
          </button>
        </div>

        {activeTab !== 'info' && activeTab !== 'bracket' && (
          <div className="relative w-full sm:max-w-xs">
            <Search size={14} className={`absolute top-1/2 -translate-y-1/2 text-stadium-gray pointer-events-none ${lang === 'fa' ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              placeholder={t('Search: team, code, "group A", or "live"...', lang)}
              className={`w-full bg-deep-navy border border-pitch-border rounded-xl py-2.5 text-xs md:text-sm text-white placeholder-stadium-gray/50 focus:outline-none focus:border-cyber-orchid/50 focus:ring-1 focus:ring-cyber-orchid/30 transition-all ${
                lang === 'fa' ? 'pr-9 pl-4 text-right' : 'pl-9 pr-4 text-left'
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-stadium-indigo border border-pitch-border rounded-2xl p-5 h-[310px] animate-pulse">
                  <div className="h-5 w-24 bg-pitch-border/50 rounded mb-4" />
                  <div className="space-y-3 mt-6">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-pitch-border/40 rounded-full shrink-0" />
                        <div className="h-3.5 flex-1 bg-pitch-border/40 rounded" />
                        <div className="h-3.5 w-8 bg-pitch-border/30 rounded" />
                        <div className="h-3.5 w-8 bg-pitch-border/30 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            className="flex flex-col items-center justify-center min-h-[400px] gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-rose-400 text-lg font-bold">{t('Error Loading Dashboard', lang)}</div>
            <p className="text-stadium-gray">{error}</p>
            <button 
              className="px-5 py-2.5 bg-electric-purple text-white border border-cyber-orchid/30 rounded-xl font-bold cursor-pointer transition-all hover:bg-cyber-orchid"
              onClick={() => fetchData()}
            >
              {t('Try Again', lang)}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {activeTab === 'groups' && data && (() => {
              // Compute which 3rd-place teams qualify (top 8 of 12)
              const thirdPlaceTeams = data.groups
                .map(g => g.teams[2])
                .filter(Boolean)
                .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
              const qualifiedThirdCodes = new Set(thirdPlaceTeams.slice(0, 8).map(t => t.code));

              const q = searchQuery.trim().toLowerCase();

              // Smart search: "group X" isolator
              const groupMatch = q.match(/^group\s+([a-l])$/i);
              // Smart search: "live" isolator
              const liveFilter = q === 'live';

              let filtered = data.groups;

              if (groupMatch) {
                const letter = groupMatch[1].toUpperCase();
                filtered = data.groups.filter(g => g.letter === letter);
              } else if (liveFilter) {
                const liveTeams = new Set(
                  data.fixtures
                    .filter(f => ['1H', '2H', 'HT', 'ET', 'P'].includes(f.status.short))
                    .flatMap(f => [f.teams.home.name.toLowerCase(), f.teams.away.name.toLowerCase()])
                );
                filtered = data.groups.filter(g =>
                  g.teams.some(t => liveTeams.has(t.name.toLowerCase()))
                );
              }

              // Reorder: pinned groups first
              const sorted = [...filtered].sort((a, b) => {
                const aHasPin = a.teams.some(t => pinnedTeams.includes(t.code));
                const bHasPin = b.teams.some(t => pinnedTeams.includes(t.code));
                if (aHasPin && !bHasPin) return -1;
                if (!aHasPin && bHasPin) return 1;
                return a.letter.localeCompare(b.letter);
              });

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sorted.map((group) => (
                    <GroupTable
                      key={group.letter}
                      group={group}
                      searchQuery={groupMatch || liveFilter ? '' : searchQuery}
                      fixtures={data.fixtures}
                      lang={lang}
                      pinnedTeams={pinnedTeams}
                      onTogglePin={togglePin}
                      onTeamClick={(team) => openTeamDetail(team, group)}
                      onMatchClick={setSelectedMatch}
                      qualifiedThirdCodes={qualifiedThirdCodes}
                    />
                  ))}
                </div>
              );
            })()}

            {activeTab === 'third-place' && data && (
              <ThirdPlaceTable 
                groups={data.groups} 
                searchQuery={searchQuery}
                lang={lang}
              />
            )}

            {activeTab === 'bracket' && data && (
              <KnockoutBracket groups={data.groups} lang={lang} />
            )}

            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="relative border border-pitch-border rounded-3xl p-6 shadow-2xl text-start overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=70&auto=format')` }} />
                  <div className="absolute inset-0 bg-stadium-indigo/90" />
                  <div className="relative">
                  <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-pitch-border flex items-center gap-2">
                    <Users size={16} className="text-neon-teal" />
                    {t('48-Team Format Rules', lang)}
                  </h3>
                  <p className="text-stadium-gray text-xs md:text-sm leading-relaxed mb-4">
                    {t('For the first time in history, the FIFA World Cup features 48 nations, increasing the matches played from 64 to 104 across 3 host nations.', lang)}
                  </p>
                  <ul className="space-y-2.5 text-xs text-stadium-gray font-medium">
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> <span>{t('12 groups of 4 teams each.', lang)}</span></li>
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> <span>{t('Top 2 teams from each group automatically qualify.', lang)}</span></li>
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> <span>{t('The 8 best third-placed teams qualify for the Round of 32 knockout stage.', lang)}</span></li>
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> <span>{t('Group stage matches do not have extra time; draws award 1 point.', lang)}</span></li>
                  </ul>
                  </div>
                </div>

                <div className="relative border border-pitch-border rounded-3xl p-6 shadow-2xl text-start overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600&q=70&auto=format')` }} />
                  <div className="absolute inset-0 bg-stadium-indigo/90" />
                  <div className="relative">
                  <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-pitch-border flex items-center gap-2">
                    <Tv size={16} className="text-neon-teal" />
                    {t('Tournament Venues', lang)}
                  </h3>
                  <p className="text-stadium-gray text-xs md:text-sm leading-relaxed mb-4">
                    {t('Matches are being hosted across 16 world-class venues in Canada, Mexico, and the United States.', lang)}
                  </p>
                  <ul className="space-y-2.5 text-xs text-stadium-gray font-medium">
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-neon-teal font-bold shrink-0">✓</span> 
                      <span>
                        <strong className="text-white">{t('United States:', lang)}</strong> {t('11 cities including NY/NJ (Final), LA, Miami, and Dallas.', lang)}
                      </span>
                    </li>
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-neon-teal font-bold shrink-0">✓</span> 
                      <span>
                        <strong className="text-white">{t('Mexico:', lang)}</strong> {t('Mexico City (Estadio Azteca), Guadalajara, and Monterrey.', lang)}
                      </span>
                    </li>
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-neon-teal font-bold shrink-0">✓</span> 
                      <span>
                        <strong className="text-white">{t('Canada:', lang)}</strong> {t('Toronto and Vancouver.', lang)}
                      </span>
                    </li>
                  </ul>
                  </div>
                </div>

                <div className="relative border border-pitch-border rounded-3xl p-6 shadow-2xl text-start overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&q=70&auto=format')` }} />
                  <div className="absolute inset-0 bg-stadium-indigo/90" />
                  <div className="relative">
                  <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-pitch-border flex items-center gap-2">
                    <Play size={16} className="text-neon-teal" />
                    {t('Live Schedule Context', lang)}
                  </h3>
                  <p className="text-stadium-gray text-xs md:text-sm leading-relaxed mb-4">
                    {t('The tournament is currently active, with groups A-D concluding their final matches, groups E-H finishing matchday 2, and groups I-L in their initial matches.', lang)}
                  </p>
                  <ul className="space-y-2.5 text-xs text-stadium-gray font-medium">
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> <span>{t('Group matches are played concurrently within groups for final matchday fairness.', lang)}</span></li>
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> <span>{t('Standings update immediately in real-time as goals are scored.', lang)}</span></li>
                  </ul>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Detail Modal */}
      <MatchDetailModal
        fixture={selectedMatch}
        lang={lang}
        onClose={() => setSelectedMatch(null)}
      />

      {/* Team Detail Drawer */}
      <TeamDetailDrawer
        team={drawerTeam?.team ?? null}
        group={drawerTeam?.group ?? null}
        fixtures={data?.fixtures ?? []}
        lang={lang}
        isPinned={drawerTeam ? pinnedTeams.includes(drawerTeam.team.code) : false}
        onTogglePin={togglePin}
        onClose={() => setDrawerTeam(null)}
      />
    </main>
  );
}

