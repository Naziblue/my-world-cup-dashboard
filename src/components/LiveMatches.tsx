'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Fixture } from '@/types';
import { Radio, Clock, ChevronDown } from 'lucide-react';
import { t, translateTeam, formatNumber } from '@/utils/i18n';

interface LiveMatchesProps {
  fixtures: Fixture[];
  nextRefreshSeconds: number;
  lang: 'en' | 'fa';
  pinnedTeams?: string[];
}

const isMatchLive = (s: string) => ['1H', '2H', 'HT', 'ET', 'P'].includes(s);
const isMatchFinished = (s: string) => s === 'FT';
const isMatchUpcoming = (s: string) => s === 'NS' || s === 'TBD';

function StatBar({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away || 1;
  const homePct = Math.round((home / total) * 100);
  const awayPct = 100 - homePct;

  return (
    <div className="flex items-center gap-3 text-[10px]">
      <span className="w-8 text-right font-bold text-white tabular-nums">{home}</span>
      <div className="flex-1 flex h-1.5 rounded-full overflow-hidden bg-pitch-border/30">
        <div
          className="bg-neon-teal/80 rounded-l-full transition-all duration-500"
          style={{ width: `${homePct}%` }}
        />
        <div
          className="bg-rose-500/60 rounded-r-full transition-all duration-500"
          style={{ width: `${awayPct}%` }}
        />
      </div>
      <span className="w-8 font-bold text-white tabular-nums">{away}</span>
      <span className="w-24 text-stadium-gray truncate">{label}</span>
    </div>
  );
}

function Countdown({ targetDate, lang }: { targetDate: string; lang: 'en' | 'fa' }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining(lang === 'fa' ? 'به زودی' : 'Starting soon');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const parts: string[] = [];
      if (h > 0) parts.push(`${formatNumber(h, lang)}h`);
      parts.push(`${formatNumber(m, lang)}m`);
      parts.push(`${formatNumber(s, lang)}s`);
      setRemaining(parts.join(' '));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate, lang]);

  return <span className="font-mono tabular-nums">{remaining}</span>;
}

const eventIcon = (type: string) => {
  if (type === 'goal') return '⚽';
  if (type === 'red-card') return '🟥';
  if (type === 'yellow-card') return '🟨';
  return '•';
};

type TimelineEntry = {
  minute: number;
  team: 'home' | 'away';
  kind: 'goal' | 'red-card' | 'yellow-card' | 'substitution';
  player: string;
  detail?: string; // assist or playerOut
};

function HeroEventsAndStats({ fixture, lang }: { fixture: Fixture; lang: 'en' | 'fa' }) {
  const events = fixture.events ?? [];
  const statistics = fixture.statistics ?? [];
  const substitutions = fixture.substitutions ?? [];

  // Merge events + substitutions into a single chronological timeline
  const timeline: TimelineEntry[] = [
    ...events.map(ev => ({
      minute: ev.minute,
      team: ev.team,
      kind: ev.type,
      player: ev.player,
      detail: ev.assist,
    })),
    ...substitutions.map(sub => ({
      minute: sub.minute,
      team: sub.team,
      kind: 'substitution' as const,
      player: sub.playerIn,
      detail: sub.playerOut,
    })),
  ].sort((a, b) => a.minute - b.minute);

  if (timeline.length === 0 && statistics.length === 0) return null;

  const renderIcon = (kind: string) => {
    if (kind === 'goal') return <span>⚽</span>;
    if (kind === 'red-card') return <span>🟥</span>;
    if (kind === 'yellow-card') return <span>🟨</span>;
    if (kind === 'substitution') return <span className="text-neon-teal">🔄</span>;
    return null;
  };

  const renderContent = (entry: TimelineEntry) => {
    if (entry.kind === 'substitution') {
      return (
        <span className="flex items-center gap-1 text-[11px]">
          <span className="text-neon-teal font-bold">▲</span>
          <span className="text-white font-semibold">{entry.player}</span>
          <span className="text-stadium-gray/40 mx-0.5">/</span>
          <span className="text-rose-400 font-bold">▼</span>
          <span className="text-stadium-gray">{entry.detail}</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px]">
        <span className="font-semibold text-white">{entry.player}</span>
        {entry.detail && <span className="text-stadium-gray/50 text-[9px]">({entry.detail})</span>}
      </span>
    );
  };

  return (
    <div className="border-t border-pitch-border/20">
      {/* Chronological timeline */}
      {timeline.length > 0 && (
        <div className="bg-stadium-indigo px-5 py-4">
          <div className="text-[9px] font-bold uppercase tracking-widest text-stadium-gray mb-3 text-center">
            {t('Timeline', lang)}
          </div>
          <div className="relative">
            {/* Center axis */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-pitch-border/30 -translate-x-1/2" />

            <div className="space-y-2">
              {timeline.map((entry, i) => {
                const isHome = entry.team === 'home';
                return (
                  <div key={i} className={`flex items-center gap-2 ${isHome ? 'flex-row pr-[52%]' : 'flex-row-reverse pl-[52%]'}`}>
                    <div className={`flex items-center gap-1.5 flex-1 min-w-0 ${isHome ? 'justify-end text-right' : 'justify-start text-left'}`}>
                      {isHome ? (
                        <>
                          {renderContent(entry)}
                          {renderIcon(entry.kind)}
                        </>
                      ) : (
                        <>
                          {renderIcon(entry.kind)}
                          {renderContent(entry)}
                        </>
                      )}
                    </div>
                    {/* Minute marker on the axis */}
                    <div className="shrink-0 w-8 h-5 rounded-full bg-pitch-border/20 border border-pitch-border/40 flex items-center justify-center z-10">
                      <span className="text-[8px] font-mono font-bold text-stadium-gray">{entry.minute}'</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Statistics below timeline */}
      {statistics.length > 0 && (
        <div className="bg-stadium-indigo px-5 py-4 border-t border-pitch-border/20">
          <div className="text-[9px] font-bold uppercase tracking-widest text-stadium-gray mb-3 text-center">
            {t('Statistics', lang)}
          </div>
          <div className="space-y-2.5 max-w-md mx-auto">
            {statistics.map((stat, i) => (
              <StatBar key={i} label={stat.label} home={stat.home} away={stat.away} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchHero({ fixture, lang }: { fixture: Fixture; lang: 'en' | 'fa' }) {
  const [expanded, setExpanded] = useState(false);
  const live = isMatchLive(fixture.status.short);
  const finished = isMatchFinished(fixture.status.short);
  const upcoming = isMatchUpcoming(fixture.status.short);
  const hasDetails = (live || finished) && ((fixture.events?.length ?? 0) > 0 || (fixture.statistics?.length ?? 0) > 0 || (fixture.substitutions?.length ?? 0) > 0);

  const formatKickoff = (dateStr: string) => {
    const d = new Date(dateStr);
    const locale = lang === 'fa' ? 'fa-IR' : 'en-US';
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
  };

  const borderColor = live
    ? 'border-rose-500/30'
    : finished
    ? 'border-pitch-border/60'
    : 'border-neon-teal/30';

  const shadowColor = live
    ? '0 0 40px rgba(225,29,72,0.08)'
    : finished
    ? '0 0 20px rgba(0,0,0,0.15)'
    : '0 0 30px rgba(45,212,191,0.06)';

  const topBarBg = live
    ? 'border-b border-rose-500/15 bg-rose-500/5'
    : finished
    ? 'border-b border-pitch-border/20 bg-pitch-border/5'
    : 'border-b border-neon-teal/15 bg-neon-teal/5';

  return (
    <div
      className={`bg-stadium-indigo border ${borderColor} rounded-2xl overflow-hidden shadow-2xl mb-4`}
      style={{ boxShadow: shadowColor }}
    >
      {/* Compact score banner */}
      <div className={`flex items-center justify-between px-4 py-3 ${topBarBg}`}>
        <span className="text-[10px] font-bold text-stadium-gray uppercase tracking-wider">
          {t('Group Stage', lang)}
        </span>
        {live && (
          <span className="bg-rose-500/15 text-rose-400 border border-rose-500/25 text-[10px] px-2.5 py-0.5 rounded-full font-black flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            {fixture.status.short === 'HT'
              ? t('HALF TIME', lang)
              : formatNumber(fixture.status.elapsed, lang) + '\''}
          </span>
        )}
        {finished && (
          <span className="bg-pitch-border/40 text-stadium-gray border border-pitch-border/50 text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
            {t('FULL TIME', lang)}
          </span>
        )}
        {upcoming && (
          <span className="bg-neon-teal/10 text-neon-teal border border-neon-teal/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
            <Clock size={10} />
            {formatKickoff(fixture.date)}
          </span>
        )}
      </div>

      {/* Compact single-row score */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <span className="text-sm font-bold text-white tracking-tight truncate text-right">
              {translateTeam(fixture.teams.home.name, lang)}
            </span>
            <span className="text-2xl shrink-0">{fixture.teams.home.flag}</span>
          </div>

          <div className="shrink-0 flex flex-col items-center min-w-[80px]">
            {(live || finished) && (
              <>
                <span className={`text-2xl md:text-3xl font-black font-mono tracking-wider ${live ? 'text-rose-400' : 'text-white'}`}>
                  {formatNumber(fixture.goals.home, lang)} – {formatNumber(fixture.goals.away, lang)}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${live ? 'text-rose-400/70' : 'text-stadium-gray'}`}>
                  {live
                    ? fixture.status.short === 'HT' ? t('HT', lang) : formatNumber(fixture.status.elapsed, lang) + '\''
                    : t('FT', lang)}
                </span>
              </>
            )}
            {upcoming && (
              <div className="flex flex-col items-center">
                <span className="text-lg md:text-xl font-black text-neon-teal tracking-wider">
                  <Countdown targetDate={fixture.date} lang={lang} />
                </span>
                <span className="text-[9px] text-neon-teal/60 font-bold uppercase tracking-widest">
                  {t('KICK-OFF', lang)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-0 justify-start">
            <span className="text-2xl shrink-0">{fixture.teams.away.flag}</span>
            <span className="text-sm font-bold text-white tracking-tight truncate">
              {translateTeam(fixture.teams.away.name, lang)}
            </span>
          </div>
        </div>
      </div>

      {/* Expand toggle for details */}
      {hasDetails && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 border-t border-pitch-border/20 text-[10px] font-bold uppercase tracking-widest text-stadium-gray/60 hover:text-stadium-gray hover:bg-pitch-border/5 transition-colors cursor-pointer"
          >
            {expanded ? t('Hide Details', lang) : t('Match Details', lang)}
            <ChevronDown size={12} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>

          {expanded && <HeroEventsAndStats fixture={fixture} lang={lang} />}
        </>
      )}
    </div>
  );
}

function MatchCard({ fixture, lang, pinnedTeams = [] }: { fixture: Fixture; lang: 'en' | 'fa'; pinnedTeams?: string[] }) {
  const finished = isMatchFinished(fixture.status.short);
  const hasPinnedTeam = pinnedTeams.includes(fixture.teams.home.code) || pinnedTeams.includes(fixture.teams.away.code);

  const formatKickoff = (dateStr: string) => {
    const d = new Date(dateStr);
    const locale = lang === 'fa' ? 'fa-IR' : 'en-US';
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
  };

  return (
    <motion.div
      className={`snap-center shrink-0 w-[260px] md:w-[280px] bg-stadium-indigo/90 border rounded-2xl p-4 backdrop-blur-md transition-all shadow-xl ${
        finished
          ? 'border-pitch-border/60 opacity-75'
          : 'border-pitch-border hover:border-cyber-orchid/30'
      } ${hasPinnedTeam ? 'border-l-2 border-l-volt-yellow' : ''}`}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[9px] font-bold text-stadium-gray tracking-wider uppercase">
          {t('Group Stage', lang)}
        </span>
        {finished ? (
          <span className="bg-pitch-border text-stadium-gray border border-pitch-border/50 text-[9px] px-2 py-0.5 rounded-full font-black">
            FT
          </span>
        ) : (
          <span className="bg-deep-navy text-neon-teal border border-neon-teal/10 text-[9px] px-2 py-0.5 rounded-full font-bold">
            {formatKickoff(fixture.date)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-1.5 my-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-start text-start">
          <span className="text-base shrink-0">{fixture.teams.home.flag}</span>
          <span className="text-xs font-semibold tracking-tight text-white truncate">
            {translateTeam(fixture.teams.home.name, lang)}
          </span>
        </div>

        <div className="shrink-0 flex items-center justify-center min-w-[60px] text-center">
          {finished ? (
            <span className="text-sm font-black font-mono tracking-wider px-2 py-0.5 rounded bg-pitch-border/20 text-white">
              {formatNumber(fixture.goals.home, lang)} - {formatNumber(fixture.goals.away, lang)}
            </span>
          ) : (
            <span className="text-xs font-bold text-stadium-gray font-mono">VS</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-end">
          <span className="text-xs font-semibold tracking-tight text-white truncate">
            {translateTeam(fixture.teams.away.name, lang)}
          </span>
          <span className="text-base shrink-0">{fixture.teams.away.flag}</span>
        </div>
      </div>

      {finished && (
        <div className="mt-2.5 pt-2 border-t border-pitch-border/30 flex justify-center">
          <span className="text-[9px] text-stadium-gray font-bold uppercase tracking-wider">
            {t('FINAL', lang)}
          </span>
        </div>
      )}
    </motion.div>
  );
}

export default function LiveMatches({ fixtures, nextRefreshSeconds, lang, pinnedTeams = [] }: LiveMatchesProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayedFixtures = useMemo(() => {
    if (!isMounted) return [];

    const localToday = new Date().toDateString();

    const todays = fixtures.filter(f => {
      if (isMatchLive(f.status.short)) return true;
      const matchLocal = new Date(f.date).toDateString();
      return matchLocal === localToday;
    });

    const sortMatches = (list: Fixture[]) =>
      [...list].sort((a, b) => {
        const aLive = isMatchLive(a.status.short);
        const bLive = isMatchLive(b.status.short);
        if (aLive && !bLive) return -1;
        if (!aLive && bLive) return 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

    if (todays.length > 0) return sortMatches(todays);

    const chronological = [...fixtures].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sortMatches(chronological.slice(0, 6));
  }, [fixtures, isMounted]);

  if (!isMounted) {
    return (
      <div className="mb-6">
        <div className="h-48 bg-stadium-indigo/40 border border-pitch-border/50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Phase 1: Hero selection — live > last finished > first upcoming
  const liveMatch = displayedFixtures.find(f => isMatchLive(f.status.short));
  const finishedByRecency = displayedFixtures
    .filter(f => isMatchFinished(f.status.short))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const upcomingByTime = displayedFixtures
    .filter(f => isMatchUpcoming(f.status.short))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const heroMatch = liveMatch ?? finishedByRecency[0] ?? upcomingByTime[0] ?? null;

  const scheduleMatches = displayedFixtures.filter(f => heroMatch && f.id !== heroMatch.id);
  const scheduleUpcoming = scheduleMatches.filter(f => isMatchUpcoming(f.status.short))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const scheduleFinished = scheduleMatches.filter(f => isMatchFinished(f.status.short))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const scheduleRow = [...scheduleUpcoming, ...scheduleFinished];

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Radio className={liveMatch ? 'text-rose-500 animate-pulse' : 'text-stadium-gray'} size={16} />
          <h2 className="text-[11px] uppercase font-extrabold tracking-widest text-white flex items-center gap-2">
            {t("Today's Matches", lang)}
            {liveMatch && (
              <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase animate-pulse">
                {t('LIVE NOW', lang)}
              </span>
            )}
          </h2>
        </div>
        <div className="text-[10px] text-stadium-gray font-bold tracking-wider uppercase bg-pitch-border/30 px-3 py-1 rounded-lg border border-pitch-border/50 flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-teal opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-teal" />
          </span>
          {t('Auto-sync:', lang)} {formatNumber(nextRefreshSeconds, lang)}s
        </div>
      </div>

      {displayedFixtures.length === 0 ? (
        <div className="bg-stadium-indigo border border-pitch-border p-6 rounded-2xl text-center text-xs text-stadium-gray">
          {t('No matches scheduled for today.', lang)}
        </div>
      ) : (
        <>
          {heroMatch && <MatchHero fixture={heroMatch} lang={lang} />}

          {scheduleRow.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-3 pt-1 snap-x scrollbar-thin items-start">
              {scheduleUpcoming.length > 0 && scheduleFinished.length > 0 && (
                <div className="shrink-0 self-center text-[8px] font-bold uppercase tracking-widest text-neon-teal/70 [writing-mode:vertical-lr] rotate-180">
                  {t('UPCOMING', lang)}
                </div>
              )}
              {scheduleUpcoming.map(fixture => (
                <MatchCard key={fixture.id} fixture={fixture} lang={lang} pinnedTeams={pinnedTeams} />
              ))}
              {scheduleUpcoming.length > 0 && scheduleFinished.length > 0 && (
                <div className="shrink-0 self-stretch flex flex-col items-center justify-center gap-1 mx-1">
                  <div className="flex-1 w-px bg-pitch-border/40" />
                  <div className="shrink-0 self-center text-[8px] font-bold uppercase tracking-widest text-stadium-gray/50 [writing-mode:vertical-lr] rotate-180">
                    {t('FINISHED', lang)}
                  </div>
                  <div className="flex-1 w-px bg-pitch-border/40" />
                </div>
              )}
              {scheduleFinished.map(fixture => (
                <MatchCard key={fixture.id} fixture={fixture} lang={lang} pinnedTeams={pinnedTeams} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
