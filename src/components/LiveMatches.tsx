'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Fixture } from '@/types';
import { Radio, Clock, ChevronDown } from 'lucide-react';
import { t, translateTeam, formatNumber } from '@/utils/i18n';
import { getFlagUrl, getNationalColors } from '@/utils/flags';
import FlagCrest from '@/components/FlagCrest';

interface LiveMatchesProps {
  fixtures: Fixture[];
  nextRefreshSeconds: number;
  lang: 'en' | 'fa';
  pinnedTeams?: string[];
  onMatchClick?: (fixture: Fixture) => void;
}

const isMatchLive = (s: string) => ['1H', '2H', 'HT', 'ET', 'P', 'INT', 'BT', 'LIVE'].includes(s);
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

function MatchHero({ fixture, lang, onClick, className = 'mb-4' }: { fixture: Fixture; lang: 'en' | 'fa'; onClick?: () => void; className?: string }) {
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
    ? 'border-rose-500/50'
    : finished
    ? 'border-pitch-border/30'
    : 'border-neon-teal/30';

  const shadowColor = live
    ? '0 0 30px rgba(225,29,72,0.2), 0 0 60px rgba(225,29,72,0.08)'
    : finished
    ? '0 0 10px rgba(0,0,0,0.2)'
    : '0 0 25px rgba(0,245,212,0.08)';

  const homeFlagUrl = getFlagUrl(fixture.teams.home.code);
  const awayFlagUrl = getFlagUrl(fixture.teams.away.code);

  const homeColors = getNationalColors(fixture.teams.home.code);
  const awayColors = getNationalColors(fixture.teams.away.code);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden shadow-2xl border ${borderColor} ${className}`}
      style={{ boxShadow: shadowColor }}
    >
      {/* Home national color strip — left edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] z-10"
        style={{ background: `linear-gradient(to bottom, ${homeColors.join(', ')})` }}
      />
      {/* Away national color strip — right edge */}
      <div
        className="absolute right-0 top-0 bottom-0 w-[3px] z-10"
        style={{ background: `linear-gradient(to bottom, ${awayColors.join(', ')})` }}
      />
      {/* Animated mesh gradient + pitch markings */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute inset-0 ${finished ? '' : 'animate-[meshShift_12s_ease-in-out_infinite]'}`}
          style={{
            background: finished
              ? 'var(--color-stadium-indigo)'
              : `radial-gradient(ellipse at 20% 50%, rgba(0,80,60,0.35) 0%, transparent 50%),
                 radial-gradient(ellipse at 80% 30%, rgba(10,30,70,0.5) 0%, transparent 50%),
                 radial-gradient(ellipse at 50% 80%, rgba(0,60,45,0.25) 0%, transparent 50%),
                 var(--color-stadium-indigo)`,
            backgroundSize: '200% 200%',
          }}
        />
        {/* Pitch markings at 5% opacity */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.05]" preserveAspectRatio="none" viewBox="0 0 1000 300">
          <rect x="0" y="0" width="1000" height="300" fill="none" stroke="white" strokeWidth="2" />
          <line x1="500" y1="0" x2="500" y2="300" stroke="white" strokeWidth="1.5" />
          <circle cx="500" cy="150" r="60" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="500" cy="150" r="3" fill="white" />
          <rect x="0" y="60" width="100" height="180" fill="none" stroke="white" strokeWidth="1.5" />
          <rect x="900" y="60" width="100" height="180" fill="none" stroke="white" strokeWidth="1.5" />
          <rect x="0" y="100" width="40" height="100" fill="none" stroke="white" strokeWidth="1" />
          <rect x="960" y="100" width="40" height="100" fill="none" stroke="white" strokeWidth="1" />
          <path d="M 100 120 Q 130 150 100 180" fill="none" stroke="white" strokeWidth="1" />
          <path d="M 900 120 Q 870 150 900 180" fill="none" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative">
        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2">
          {live && (
            <span
              className="animate-[breathe_3s_ease-in-out_infinite] inline-flex items-center gap-1.5 text-[10px] font-black text-white uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md"
              style={{
                background: 'rgba(225, 29, 72, 0.35)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 0 12px rgba(225,29,72,0.4)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              {fixture.status.short === 'INT' ? 'INTERRUPTED' : fixture.status.short === 'HT' ? 'HALF TIME' : 'LIVE'}
            </span>
          )}
          {!live && (
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
              {t('Group Stage', lang)}
            </span>
          )}
          {finished && (
            <span className="bg-white/10 text-white/80 border border-white/20 text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider backdrop-blur-sm">
              {t('FULL TIME', lang)}
            </span>
          )}
          {upcoming && (
            <span className="bg-neon-teal/20 text-neon-teal border border-neon-teal/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 backdrop-blur-sm">
              <Clock size={10} />
              {formatKickoff(fixture.date)}
            </span>
          )}
        </div>

        {/* Teams + score with flag crests */}
        <div className="px-6 py-5 md:py-7">
          <div className="flex items-center justify-center gap-4 md:gap-6">
            <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              <FlagCrest code={fixture.teams.home.code} fallbackEmoji={fixture.teams.home.flag} size="xxl" muted={finished} />
              <span className={`text-xs md:text-sm font-bold tracking-tight text-center ${finished ? 'text-white/50' : 'text-white'}`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                {translateTeam(fixture.teams.home.name, lang)}
              </span>
            </div>

            <div className="shrink-0 flex flex-col items-center">
              {(live || finished) && (
                <>
                  <div className="flex items-center gap-2">
                    {/* Home score capsule */}
                    <div
                      className="relative rounded-xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(180deg, rgba(30,40,60,0.9) 0%, rgba(15,20,35,0.95) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: live
                          ? '0 0 20px rgba(225,29,72,0.3), inset 0 1px 0 rgba(255,255,255,0.08)'
                          : '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                      }}
                    >
                      <span
                        className="text-3xl md:text-4xl font-black tracking-wider text-white"
                        style={{ fontFamily: 'var(--font-orbitron), monospace' }}
                      >
                        {formatNumber(fixture.goals.home, lang)}
                      </span>
                    </div>

                    {/* Center time ring */}
                    <div className={`relative mx-2 shrink-0 ${live ? 'animate-[breathe_3s_ease-in-out_infinite]' : ''}`} style={{ width: 48, height: 48, boxShadow: live ? '0 0 12px rgba(225,29,72,0.3)' : 'none', borderRadius: '50%' }}>
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                        {/* Track */}
                        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                        {/* Progress arc */}
                        <circle
                          cx="24" cy="24" r="20" fill="none"
                          stroke={live ? '#fb7185' : finished ? 'rgba(255,255,255,0.25)' : 'rgba(0,245,212,0.3)'}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 20}`}
                          strokeDashoffset={`${2 * Math.PI * 20 * (1 - Math.min((fixture.status.elapsed ?? (['HT','INT','BT'].includes(fixture.status.short) ? 45 : finished ? 90 : 0)) / 90, 1))}`}
                          style={{ transition: 'stroke-dashoffset 1s ease' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className={`text-[10px] font-black ${live ? 'text-rose-400' : finished ? 'text-white/50' : 'text-neon-teal/60'}`}
                          style={{ fontFamily: 'var(--font-orbitron), monospace' }}
                        >
                          {live
                            ? fixture.status.short === 'HT' ? 'HT'
                            : fixture.status.short === 'INT' ? 'INT'
                            : fixture.status.short === 'BT' ? 'BT'
                            : (fixture.status.elapsed ?? 0) + '\''
                            : finished ? 'FT' : 'VS'}
                        </span>
                      </div>
                    </div>

                    {/* Away score capsule */}
                    <div
                      className="relative rounded-xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(180deg, rgba(30,40,60,0.9) 0%, rgba(15,20,35,0.95) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: live
                          ? '0 0 20px rgba(225,29,72,0.3), inset 0 1px 0 rgba(255,255,255,0.08)'
                          : '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                      }}
                    >
                      <span
                        className="text-3xl md:text-4xl font-black tracking-wider text-white"
                        style={{ fontFamily: 'var(--font-orbitron), monospace' }}
                      >
                        {formatNumber(fixture.goals.away, lang)}
                      </span>
                    </div>
                  </div>

                </>
              )}
              {upcoming && (
                <div className="flex flex-col items-center">
                  <div
                    className="rounded-xl px-5 py-2"
                    style={{
                      background: 'linear-gradient(180deg, rgba(30,40,60,0.9) 0%, rgba(15,20,35,0.95) 100%)',
                      border: '1px solid rgba(0,245,212,0.15)',
                      boxShadow: '0 0 20px rgba(0,245,212,0.1), inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}
                  >
                    <span
                      className="text-xl md:text-2xl font-black text-neon-teal tracking-wider"
                      style={{ fontFamily: 'var(--font-orbitron), monospace' }}
                    >
                      <Countdown targetDate={fixture.date} lang={lang} />
                    </span>
                  </div>
                  <span className="text-[9px] text-neon-teal/70 font-bold uppercase tracking-widest mt-2">
                    {t('KICK-OFF', lang)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              <FlagCrest code={fixture.teams.away.code} fallbackEmoji={fixture.teams.away.flag} size="xxl" muted={finished} />
              <span className={`text-xs md:text-sm font-bold tracking-tight text-center ${finished ? 'text-white/50' : 'text-white'}`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                {translateTeam(fixture.teams.away.name, lang)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini event timeline bar */}
      {(live || finished) && (() => {
        const maxMin = finished ? 90 : Math.max(fixture.status.elapsed ?? 90, 90);
        const keyEvents = (fixture.events ?? []).filter(e => e.type === 'goal' || e.type === 'red-card');
        return (
          <div className="relative px-6 pb-3">
            {/* Track */}
            <div className="relative h-[6px] rounded-full bg-white/10 overflow-visible">
              {/* Elapsed fill */}
              <div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{
                  width: `${Math.min(((fixture.status.elapsed ?? (['HT','INT','BT'].includes(fixture.status.short) ? 45 : finished ? 90 : 0)) / maxMin) * 100, 100)}%`,
                  background: live
                    ? 'linear-gradient(90deg, #f43f5e, #e11d48)'
                    : 'rgba(255,255,255,0.15)',
                }}
              />
              {/* Half-time marker */}
              <div className="absolute top-0 bottom-0 w-px bg-white/20" style={{ left: '50%' }} />
              {/* Event markers */}
              {keyEvents.map((ev, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 w-4 h-4 flex items-center justify-center group cursor-default z-10"
                  style={{
                    left: `${Math.min((ev.minute / maxMin) * 100, 99)}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <span className="text-[10px] select-none leading-none flex items-center justify-center">
                    {ev.type === 'goal' ? '⚽' : '🟥'}
                  </span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex items-center px-2 py-1 rounded-lg bg-deep-navy/95 border border-pitch-border/50 shadow-xl whitespace-nowrap z-20">
                    <span className="text-[9px] font-bold text-white">{ev.player}</span>
                    <span className="text-[9px] text-stadium-gray ml-1">{ev.minute}'</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Time labels */}
            <div className="flex justify-between mt-1">
              <span className="text-[7px] text-white/20 font-mono">0'</span>
              <span className="text-[7px] text-white/20 font-mono">45'</span>
              <span className="text-[7px] text-white/20 font-mono">90'</span>
            </div>
          </div>
        );
      })()}

      {/* View details link */}
      {hasDetails && (
        <button
          onClick={onClick}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 border-t border-pitch-border/20 text-[10px] font-bold uppercase tracking-widest text-stadium-gray/60 hover:text-stadium-gray hover:bg-pitch-border/5 transition-colors cursor-pointer"
        >
          {t('Match Details', lang)}
          <ChevronDown size={12} className="-rotate-90" />
        </button>
      )}
    </div>
  );
}

function MatchCard({ fixture, lang, pinnedTeams = [], onClick }: { fixture: Fixture; lang: 'en' | 'fa'; pinnedTeams?: string[]; onClick?: () => void }) {
  const finished = isMatchFinished(fixture.status.short);
  const hasPinnedTeam = pinnedTeams.includes(fixture.teams.home.code) || pinnedTeams.includes(fixture.teams.away.code);

  const formatKickoff = (dateStr: string) => {
    const d = new Date(dateStr);
    const locale = lang === 'fa' ? 'fa-IR' : 'en-US';
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
  };

  return (
    <motion.div
      onClick={onClick}
      className={`snap-center shrink-0 w-[300px] md:w-[320px] rounded-2xl cursor-pointer ${
        finished ? 'opacity-70' : ''
      } ${hasPinnedTeam ? 'ring-1 ring-volt-yellow/40' : ''}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        padding: 1,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 15px rgba(106,13,173,0.1)' }}
      transition={{ duration: 0.25 }}
    >
      <div className="bg-stadium-indigo/95 rounded-[15px] p-4 backdrop-blur-md h-full">
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
          <FlagCrest code={fixture.teams.home.code} fallbackEmoji={fixture.teams.home.flag} size="sm" />
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
          <FlagCrest code={fixture.teams.away.code} fallbackEmoji={fixture.teams.away.flag} size="sm" />
        </div>
      </div>

      {finished && (
        <div className="mt-2.5 pt-2 border-t border-pitch-border/30 flex justify-center">
          <span className="text-[9px] text-stadium-gray font-bold uppercase tracking-wider">
            {t('FINAL', lang)}
          </span>
        </div>
      )}
      {!finished && !isMatchLive(fixture.status.short) && (
        <div className="mt-2.5 pt-2 border-t border-pitch-border/30 flex justify-center">
          <span className="text-[9px] text-neon-teal/60 font-bold uppercase tracking-wider">
            {t('UPCOMING', lang)}
          </span>
        </div>
      )}
      </div>
    </motion.div>
  );
}

export default function LiveMatches({ fixtures, nextRefreshSeconds, lang, pinnedTeams = [], onMatchClick }: LiveMatchesProps) {
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

  const liveMatches = displayedFixtures.filter(f => isMatchLive(f.status.short));
  const finishedByRecency = displayedFixtures
    .filter(f => isMatchFinished(f.status.short))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const upcomingByTime = displayedFixtures
    .filter(f => isMatchUpcoming(f.status.short))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // All live matches go to the top, next to each other.
  // If no live matches, select the single hero match.
  const heroMatches = liveMatches.length > 0
    ? liveMatches
    : (finishedByRecency[0] ? [finishedByRecency[0]] : (upcomingByTime[0] ? [upcomingByTime[0]] : []));

  const heroIds = new Set(heroMatches.map(m => m.id));
  const scheduleMatches = displayedFixtures.filter(f => !heroIds.has(f.id));
  const scheduleUpcoming = scheduleMatches.filter(f => isMatchUpcoming(f.status.short))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const scheduleFinished = scheduleMatches.filter(f => isMatchFinished(f.status.short))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const scheduleRow = [...scheduleUpcoming, ...scheduleFinished];

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Radio className={liveMatches.length > 0 ? 'text-rose-500 animate-pulse' : 'text-stadium-gray'} size={16} />
          <h2 className="text-[11px] uppercase font-extrabold tracking-widest text-white flex items-center gap-2">
            {t("Today's Matches", lang)}
            {liveMatches.length > 0 && (
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
          {heroMatches.length > 0 && (
            <div className={`grid grid-cols-1 ${heroMatches.length > 1 ? 'lg:grid-cols-2' : ''} gap-4 mb-4`}>
              {heroMatches.map(fixture => (
                <MatchHero key={fixture.id} fixture={fixture} lang={lang} className="mb-0" onClick={() => onMatchClick?.(fixture)} />
              ))}
            </div>
          )}

          {scheduleRow.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-3 pt-1 snap-x scrollbar-thin items-stretch justify-start">
              {scheduleUpcoming.map(fixture => (
                <MatchCard key={fixture.id} fixture={fixture} lang={lang} pinnedTeams={pinnedTeams} onClick={() => onMatchClick?.(fixture)} />
              ))}
              {scheduleFinished.map(fixture => (
                <MatchCard key={fixture.id} fixture={fixture} lang={lang} pinnedTeams={pinnedTeams} onClick={() => onMatchClick?.(fixture)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
