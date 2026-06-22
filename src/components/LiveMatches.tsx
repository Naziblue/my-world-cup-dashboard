'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Fixture } from '@/types';
import { Radio } from 'lucide-react';
import { t, translateTeam, formatNumber } from '@/utils/i18n';

interface LiveMatchesProps {
  fixtures: Fixture[];
  nextRefreshSeconds: number;
  lang: 'en' | 'fa';
}

const isMatchLive = (s: string) => ['1H', '2H', 'HT', 'ET', 'P'].includes(s);
const isMatchFinished = (s: string) => s === 'FT';

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

function LiveHero({ fixture, lang }: { fixture: Fixture; lang: 'en' | 'fa' }) {
  const events = fixture.events ?? [];
  const statistics = fixture.statistics ?? [];
  const substitutions = fixture.substitutions ?? [];

  const homeEvents = events.filter(e => e.team === 'home');
  const awayEvents = events.filter(e => e.team === 'away');

  const eventIcon = (type: string) => {
    if (type === 'goal') return '⚽';
    if (type === 'red-card') return '🟥';
    if (type === 'yellow-card') return '🟨';
    return '•';
  };

  return (
    <div
      className="bg-stadium-indigo border border-rose-500/30 rounded-2xl overflow-hidden shadow-2xl mb-6"
      style={{ boxShadow: '0 0 40px rgba(225,29,72,0.08)' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-rose-500/15 bg-rose-500/5">
        <span className="text-[10px] font-bold text-stadium-gray uppercase tracking-wider">
          {t('Group Stage', lang)}
        </span>
        <span className="bg-rose-500/15 text-rose-400 border border-rose-500/25 text-[10px] px-2.5 py-0.5 rounded-full font-black flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          {fixture.status.short === 'HT'
            ? t('HALF TIME', lang)
            : formatNumber(fixture.status.elapsed, lang) + '\''}
        </span>
      </div>

      {/* Main score banner */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-center gap-6 md:gap-10">
          {/* Home */}
          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <span className="text-3xl md:text-4xl">{fixture.teams.home.flag}</span>
            <span className="text-sm md:text-base font-bold text-white tracking-tight text-center">
              {translateTeam(fixture.teams.home.name, lang)}
            </span>
            <span className="text-[10px] font-mono text-stadium-gray">{fixture.teams.home.code}</span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-black font-mono text-rose-400 tracking-wider">
              {formatNumber(fixture.goals.home, lang)} – {formatNumber(fixture.goals.away, lang)}
            </span>
            <span className="text-[10px] text-rose-400/70 font-bold mt-1 uppercase tracking-widest">
              {fixture.status.short === 'HT' ? t('HT', lang) : formatNumber(fixture.status.elapsed, lang) + '\''}
            </span>
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <span className="text-3xl md:text-4xl">{fixture.teams.away.flag}</span>
            <span className="text-sm md:text-base font-bold text-white tracking-tight text-center">
              {translateTeam(fixture.teams.away.name, lang)}
            </span>
            <span className="text-[10px] font-mono text-stadium-gray">{fixture.teams.away.code}</span>
          </div>
        </div>
      </div>

      {/* Events + Stats + Subs grid */}
      {(events.length > 0 || statistics.length > 0 || substitutions.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-pitch-border/20 border-t border-pitch-border/20">
          {/* Events timeline */}
          {events.length > 0 && (
            <div className="bg-stadium-indigo px-5 py-4">
              <div className="text-[9px] font-bold uppercase tracking-widest text-stadium-gray mb-3">
                {t('Match Events', lang)}
              </div>
              <div className="flex gap-8">
                {/* Home events */}
                <div className="flex-1 space-y-1.5">
                  {homeEvents.length > 0 ? homeEvents.map((ev, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px]">
                      <span>{eventIcon(ev.type)}</span>
                      <span className="font-semibold text-white">{ev.player}</span>
                      <span className="text-stadium-gray">{ev.minute}'</span>
                    </div>
                  )) : (
                    <div className="text-[10px] text-stadium-gray/50">—</div>
                  )}
                </div>
                {/* Away events */}
                <div className="flex-1 space-y-1.5">
                  {awayEvents.length > 0 ? awayEvents.map((ev, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px]">
                      <span>{eventIcon(ev.type)}</span>
                      <span className="font-semibold text-white">{ev.player}</span>
                      <span className="text-stadium-gray">{ev.minute}'</span>
                      {ev.assist && <span className="text-stadium-gray/60 text-[9px]">({ev.assist})</span>}
                    </div>
                  )) : (
                    <div className="text-[10px] text-stadium-gray/50">—</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          {statistics.length > 0 && (
            <div className="bg-stadium-indigo px-5 py-4">
              <div className="text-[9px] font-bold uppercase tracking-widest text-stadium-gray mb-3">
                {t('Statistics', lang)}
              </div>
              <div className="space-y-2.5">
                {statistics.map((stat, i) => (
                  <StatBar key={i} label={stat.label} home={stat.home} away={stat.away} />
                ))}
              </div>
            </div>
          )}

          {/* Substitutions */}
          {substitutions.length > 0 && (
            <div className="bg-stadium-indigo px-5 py-4 md:col-span-2 border-t border-pitch-border/20">
              <div className="text-[9px] font-bold uppercase tracking-widest text-stadium-gray mb-2">
                {t('Substitutions', lang)}
              </div>
              <div className="flex flex-wrap gap-3">
                {substitutions.map((sub, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px] bg-pitch-border/15 rounded-lg px-2.5 py-1">
                    <span className="text-neon-teal font-bold">▲</span>
                    <span className="text-white font-semibold">{sub.playerIn}</span>
                    <span className="text-rose-400 font-bold">▼</span>
                    <span className="text-stadium-gray">{sub.playerOut}</span>
                    <span className="text-stadium-gray/60 text-[9px] ml-1">{sub.minute}'</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MatchCard({
  fixture,
  lang,
}: {
  fixture: Fixture;
  lang: 'en' | 'fa';
}) {
  const live = isMatchLive(fixture.status.short);
  const finished = isMatchFinished(fixture.status.short);

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
      }`}
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

export default function LiveMatches({ fixtures, nextRefreshSeconds, lang }: LiveMatchesProps) {
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

  const liveMatch = displayedFixtures.find(f => isMatchLive(f.status.short));
  const upcomingMatches = displayedFixtures
    .filter(f => !isMatchLive(f.status.short) && !isMatchFinished(f.status.short))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const finishedMatches = displayedFixtures
    .filter(f => isMatchFinished(f.status.short))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const scheduleMatches = [...upcomingMatches, ...finishedMatches];

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
          {/* Hero: live match */}
          {liveMatch && <LiveHero fixture={liveMatch} lang={lang} />}

          {/* Daily schedule row: upcoming first, finished last */}
          {scheduleMatches.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-3 pt-1 snap-x scrollbar-thin items-start">
              {upcomingMatches.length > 0 && finishedMatches.length > 0 && (
                <div className="shrink-0 self-center text-[8px] font-bold uppercase tracking-widest text-neon-teal/70 [writing-mode:vertical-lr] rotate-180">
                  {t('UPCOMING', lang)}
                </div>
              )}
              {upcomingMatches.map(fixture => (
                <MatchCard key={fixture.id} fixture={fixture} lang={lang} />
              ))}
              {upcomingMatches.length > 0 && finishedMatches.length > 0 && (
                <div className="shrink-0 self-stretch flex flex-col items-center justify-center gap-1 mx-1">
                  <div className="flex-1 w-px bg-pitch-border/40" />
                  <div className="shrink-0 self-center text-[8px] font-bold uppercase tracking-widest text-stadium-gray/50 [writing-mode:vertical-lr] rotate-180">
                    {t('FINISHED', lang)}
                  </div>
                  <div className="flex-1 w-px bg-pitch-border/40" />
                </div>
              )}
              {finishedMatches.map(fixture => (
                <MatchCard key={fixture.id} fixture={fixture} lang={lang} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
