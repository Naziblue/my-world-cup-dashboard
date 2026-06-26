'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Fixture, MatchEvent, MatchStatistic } from '@/types';
import { t, translateTeam, formatNumber } from '@/utils/i18n';

interface MatchDetailModalProps {
  fixture: Fixture | null;
  lang: 'en' | 'fa';
  onClose: () => void;
}

function StatBar({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away || 1;
  const homePct = Math.round((home / total) * 100);
  const awayPct = 100 - homePct;
  return (
    <div className="flex items-center gap-3 text-[10px]">
      <span className="w-8 text-right font-bold text-white tabular-nums">{home}</span>
      <div className="flex-1 flex h-1.5 rounded-full overflow-hidden bg-pitch-border/30">
        <div className="bg-neon-teal/80 rounded-l-full transition-all duration-500" style={{ width: `${homePct}%` }} />
        <div className="bg-rose-500/60 rounded-r-full transition-all duration-500" style={{ width: `${awayPct}%` }} />
      </div>
      <span className="w-8 font-bold text-white tabular-nums">{away}</span>
      <span className="w-24 text-stadium-gray truncate">{label}</span>
    </div>
  );
}

const eventIcon = (kind: string, disallowed?: boolean) => {
  if (kind === 'goal') {
    return disallowed ? (
      <span className="relative inline-flex items-center justify-center w-4 h-4">
        <span className="opacity-40">⚽</span>
        <span className="absolute text-rose-500 font-bold text-[10px] select-none pointer-events-none">✕</span>
      </span>
    ) : '⚽';
  }
  if (kind === 'red-card') return '🟥';
  if (kind === 'yellow-card') return '🟨';
  if (kind === 'substitution') return '🔄';
  return '•';
};

type TimelineEntry = {
  minute: number;
  team: 'home' | 'away';
  kind: string;
  player: string;
  detail?: string;
  disallowed?: boolean;
};

export default function MatchDetailModal({ fixture, lang, onClose }: MatchDetailModalProps) {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [statistics, setStatistics] = useState<MatchStatistic[]>([]);
  const [substitutions, setSubstitutions] = useState<{ minute: number; team: 'home' | 'away'; playerIn: string; playerOut: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fixture) return;

    if (fixture.events?.length || fixture.statistics?.length || fixture.substitutions?.length) {
      setEvents(fixture.events ?? []);
      setStatistics(fixture.statistics ?? []);
      setSubstitutions(fixture.substitutions ?? []);
      return;
    }

    const isStarted = fixture.status.short !== 'NS' && fixture.status.short !== 'TBD';
    if (!isStarted) return;

    setLoading(true);
    fetch(`/api/match-events?id=${fixture.id}`)
      .then(r => r.json())
      .then(data => {
        setEvents(data.events ?? []);
        setStatistics(data.statistics ?? []);
        setSubstitutions(data.substitutions ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fixture]);

  // Reset when fixture changes
  useEffect(() => {
    if (!fixture) {
      setEvents([]);
      setStatistics([]);
      setSubstitutions([]);
    }
  }, [fixture]);

  const timeline: TimelineEntry[] = [
    ...events.map(ev => ({ minute: ev.minute, team: ev.team, kind: ev.type, player: ev.player, detail: ev.assist, disallowed: ev.disallowed })),
    ...substitutions.map(sub => ({ minute: sub.minute, team: sub.team, kind: 'substitution', player: sub.playerIn, detail: sub.playerOut })),
  ].sort((a, b) => a.minute - b.minute);

  const isLive = fixture && ['1H', '2H', 'HT', 'ET', 'P', 'INT', 'BT', 'LIVE'].includes(fixture.status.short);
  const isFinished = fixture?.status.short === 'FT';

  return (
    <AnimatePresence>
      {fixture && (
        <>
          <motion.div
            key="modal-backdrop"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="modal-content"
            className="fixed inset-x-4 top-[5vh] bottom-[5vh] md:inset-x-auto md:left-1/2 md:w-full md:max-w-lg md:-translate-x-1/2 bg-deep-navy border border-pitch-border rounded-2xl z-50 overflow-y-auto shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <div className="sticky top-0 z-10 bg-deep-navy/95 backdrop-blur-sm flex items-center justify-between px-5 py-3 border-b border-pitch-border/30">
              <span className="text-[10px] font-bold text-stadium-gray uppercase tracking-wider">
                {t('Group Stage', lang)}
              </span>
              <div className="flex items-center gap-3">
                {isLive && (
                  <span className="bg-rose-500/15 text-rose-400 border border-rose-500/25 text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    {fixture.status.short === 'HT' ? t('HT', lang) : formatNumber(fixture.status.elapsed, lang) + '\''}
                  </span>
                )}
                {isFinished && (
                  <span className="bg-pitch-border/40 text-stadium-gray text-[10px] px-2 py-0.5 rounded-full font-black uppercase">FT</span>
                )}
                <button onClick={onClose} className="text-stadium-gray hover:text-white transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Score banner */}
            <div className="px-5 py-5">
              <div className="flex items-center justify-center gap-5">
                <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <span className="text-3xl">{fixture.teams.home.flag}</span>
                  <span className="text-sm font-bold text-white text-center">{translateTeam(fixture.teams.home.name, lang)}</span>
                  <span className="text-[10px] font-mono text-stadium-gray">{fixture.teams.home.code}</span>
                </div>
                <div className="flex flex-col items-center">
                  {(isLive || isFinished) ? (
                    <>
                      <span className={`text-3xl font-black font-mono tracking-wider ${isLive ? 'text-rose-400' : 'text-white'}`}>
                        {formatNumber(fixture.goals.home, lang)} – {formatNumber(fixture.goals.away, lang)}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${isLive ? 'text-rose-400/70' : 'text-stadium-gray'}`}>
                        {isLive ? (fixture.status.short === 'HT' ? t('HT', lang) : formatNumber(fixture.status.elapsed, lang) + '\'') : t('FT', lang)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-stadium-gray font-mono">VS</span>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <span className="text-3xl">{fixture.teams.away.flag}</span>
                  <span className="text-sm font-bold text-white text-center">{translateTeam(fixture.teams.away.name, lang)}</span>
                  <span className="text-[10px] font-mono text-stadium-gray">{fixture.teams.away.code}</span>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-pitch-border/30 border-t-electric-purple rounded-full animate-spin" />
              </div>
            )}

            {/* Timeline */}
            {timeline.length > 0 && (
              <div className="px-5 py-4 border-t border-pitch-border/20">
                <div className="text-[9px] font-bold uppercase tracking-widest text-stadium-gray mb-3 text-center">
                  {t('Timeline', lang)}
                </div>
                <div className="relative">
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-pitch-border/30 -translate-x-1/2" />
                  <div className="space-y-2">
                    {timeline.map((entry, i) => {
                      const isHome = entry.team === 'home';
                      return (
                        <div key={i} className={`flex items-center gap-2 ${isHome ? 'flex-row pr-[52%]' : 'flex-row-reverse pl-[52%]'}`}>
                          <div className={`flex items-center gap-1.5 flex-1 min-w-0 ${isHome ? 'justify-end text-right' : 'justify-start text-left'}`}>
                            {isHome ? (
                              <>
                                {entry.kind === 'substitution' ? (
                                  <span className="flex items-center gap-1 text-[11px]">
                                    <span className="text-neon-teal font-bold">▲</span>
                                    <span className="text-white font-semibold">{entry.player}</span>
                                    <span className="text-stadium-gray/40 mx-0.5">/</span>
                                    <span className="text-rose-400 font-bold">▼</span>
                                    <span className="text-stadium-gray">{entry.detail}</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[11px]">
                                    <span className={`font-semibold ${entry.disallowed ? 'text-rose-500 line-through decoration-rose-500/50' : 'text-white'}`}>{entry.player}</span>
                                    {entry.detail && <span className={`${entry.disallowed ? 'text-rose-500/70 line-through decoration-rose-500/30' : 'text-stadium-gray/50'} text-[9px]`}>({entry.detail})</span>}
                                    {entry.disallowed && (
                                      <span className="text-rose-500/80 text-[8px] font-bold italic ml-1">({t('Disallowed', lang)})</span>
                                    )}
                                  </span>
                                )}
                                <span>{eventIcon(entry.kind, entry.disallowed)}</span>
                              </>
                            ) : (
                              <>
                                <span>{eventIcon(entry.kind, entry.disallowed)}</span>
                                {entry.kind === 'substitution' ? (
                                  <span className="flex items-center gap-1 text-[11px]">
                                    <span className="text-neon-teal font-bold">▲</span>
                                    <span className="text-white font-semibold">{entry.player}</span>
                                    <span className="text-stadium-gray/40 mx-0.5">/</span>
                                    <span className="text-rose-400 font-bold">▼</span>
                                    <span className="text-stadium-gray">{entry.detail}</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[11px]">
                                    <span className={`font-semibold ${entry.disallowed ? 'text-rose-500 line-through decoration-rose-500/50' : 'text-white'}`}>{entry.player}</span>
                                    {entry.detail && <span className={`${entry.disallowed ? 'text-rose-500/70 line-through decoration-rose-500/30' : 'text-stadium-gray/50'} text-[9px]`}>({entry.detail})</span>}
                                    {entry.disallowed && (
                                      <span className="text-rose-500/80 text-[8px] font-bold italic ml-1">({t('Disallowed', lang)})</span>
                                    )}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
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

            {/* Statistics */}
            {statistics.length > 0 && (
              <div className="px-5 py-4 border-t border-pitch-border/20">
                <div className="text-[9px] font-bold uppercase tracking-widest text-stadium-gray mb-3 text-center">
                  {t('Statistics', lang)}
                </div>
                <div className="space-y-2.5">
                  {statistics.map((stat, i) => (
                    <StatBar key={i} label={stat.label} home={stat.home} away={stat.away} />
                  ))}
                </div>
              </div>
            )}

            {/* No data message for started matches */}
            {!loading && timeline.length === 0 && statistics.length === 0 && (isLive || isFinished) && (
              <div className="px-5 py-6 text-center text-xs text-stadium-gray/50">
                {t('No detailed match data available', lang)}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
