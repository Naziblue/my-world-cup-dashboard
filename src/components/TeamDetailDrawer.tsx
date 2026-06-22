'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { Team, Group, Fixture } from '@/types';
import { t, translateTeam, formatNumber } from '@/utils/i18n';

interface TeamDetailDrawerProps {
  team: Team | null;
  group: Group | null;
  fixtures: Fixture[];
  lang: 'en' | 'fa';
  isPinned: boolean;
  onTogglePin: (code: string) => void;
  onClose: () => void;
}

function isLang(en: string, lang: 'en' | 'fa') {
  const map: Record<string, string> = { P: 'بازی', W: 'برد', D: 'مساوی', L: 'باخت', GF: 'گل زده', GA: 'گل خورده', GD: 'تفاضل', Pts: 'امتیاز' };
  return lang === 'fa' ? (map[en] ?? en) : en;
}

export default function TeamDetailDrawer({ team, group, fixtures, lang, isPinned, onTogglePin, onClose }: TeamDetailDrawerProps) {
  // Form guide derived from real fixture data
  const formGuide = useMemo(() => {
    if (!team) return [];
    const teamName = team.name.toLowerCase();
    return fixtures
      .filter(f => {
        const isHome = f.teams.home.name.toLowerCase() === teamName;
        const isAway = f.teams.away.name.toLowerCase() === teamName;
        return (isHome || isAway) && f.status.short === 'FT';
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(f => {
        const isHome = f.teams.home.name.toLowerCase() === teamName;
        const gFor = isHome ? (f.goals.home ?? 0) : (f.goals.away ?? 0);
        const gAgainst = isHome ? (f.goals.away ?? 0) : (f.goals.home ?? 0);
        const opponent = isHome ? f.teams.away : f.teams.home;
        if (gFor > gAgainst) return { result: 'W' as const, opponent, score: `${gFor}-${gAgainst}` };
        if (gFor < gAgainst) return { result: 'L' as const, opponent, score: `${gFor}-${gAgainst}` };
        return { result: 'D' as const, opponent, score: `${gFor}-${gAgainst}` };
      });
  }, [team, fixtures]);

  // Match history list
  const matchHistory = useMemo(() => {
    if (!team) return [];
    const teamName = team.name.toLowerCase();
    return fixtures
      .filter(f => {
        const isHome = f.teams.home.name.toLowerCase() === teamName;
        const isAway = f.teams.away.name.toLowerCase() === teamName;
        return (isHome || isAway) && (f.status.short === 'FT' || ['1H', '2H', 'HT', 'ET', 'P'].includes(f.status.short));
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [team, fixtures]);

  const groupRank = group && team ? group.teams.findIndex(t => t.code === team.code) + 1 : 0;

  return (
    <AnimatePresence>
      {team && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            key="drawer"
            className="fixed top-0 right-0 h-full w-full max-w-md bg-deep-navy border-l border-pitch-border z-50 overflow-y-auto shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="p-6">
              {/* Close + Pin */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={onClose} className="text-stadium-gray hover:text-white transition-colors cursor-pointer">
                  <X size={20} />
                </button>
                <button
                  onClick={() => onTogglePin(team.code)}
                  className="flex items-center gap-1.5 text-xs font-bold cursor-pointer hover:scale-105 transition-transform"
                >
                  <Star size={14} className={isPinned ? 'text-volt-yellow fill-volt-yellow' : 'text-stadium-gray'} />
                  <span className={isPinned ? 'text-volt-yellow' : 'text-stadium-gray'}>
                    {isPinned ? t('Pinned', lang) : t('Pin Team', lang)}
                  </span>
                </button>
              </div>

              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{team.flag}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{translateTeam(team.name, lang)}</h2>
                  <span className="text-xs font-mono text-stadium-gray">{team.code}</span>
                  {group && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-electric-purple/20 text-cyber-orchid px-2 py-0.5 rounded-full font-bold">
                        {t('Group', lang)} {group.letter}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        groupRank <= 2
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : groupRank === 3
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-pitch-border/30 text-stadium-gray'
                      }`}>
                        #{groupRank}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats summary */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[
                  { label: isLang('W', lang), value: team.won, color: 'text-emerald-400' },
                  { label: isLang('D', lang), value: team.drawn, color: 'text-amber-400' },
                  { label: isLang('L', lang), value: team.lost, color: 'text-rose-400' },
                  { label: isLang('Pts', lang), value: team.points, color: 'text-white' },
                ].map((s, i) => (
                  <div key={i} className="bg-stadium-indigo border border-pitch-border rounded-xl p-3 text-center">
                    <div className={`text-lg font-black font-mono ${s.color}`}>{formatNumber(s.value, lang)}</div>
                    <div className="text-[9px] text-stadium-gray font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Extended stats row */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[
                  { label: isLang('GF', lang), value: team.goalsFor },
                  { label: isLang('GA', lang), value: team.goalsAgainst },
                  { label: isLang('GD', lang), value: team.goalDifference },
                ].map((s, i) => (
                  <div key={i} className="bg-stadium-indigo border border-pitch-border rounded-xl p-2.5 text-center">
                    <div className={`text-base font-bold font-mono ${
                      s.label === isLang('GD', lang)
                        ? s.value > 0 ? 'text-emerald-400' : s.value < 0 ? 'text-rose-400' : 'text-stadium-gray'
                        : 'text-white'
                    }`}>
                      {s.label === isLang('GD', lang) && s.value > 0 ? '+' : ''}{formatNumber(s.value, lang)}
                    </div>
                    <div className="text-[9px] text-stadium-gray font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Form guide */}
              {formGuide.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stadium-gray mb-3">{t('Form Guide', lang)}</h3>
                  <div className="flex gap-2 flex-wrap">
                    {formGuide.map((f, i) => (
                      <div key={i} className="flex flex-col items-center gap-1" title={`${f.result} ${f.score} vs ${f.opponent.name}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                          f.result === 'W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                          f.result === 'L' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}>
                          {f.result}
                        </div>
                        <span className="text-[8px] text-stadium-gray/60">{f.opponent.flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Match history */}
              {matchHistory.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stadium-gray mb-3">{t('Match History', lang)}</h3>
                  <div className="space-y-2">
                    {matchHistory.map((fix) => {
                      const isHome = fix.teams.home.name.toLowerCase() === team.name.toLowerCase();
                      const opponent = isHome ? fix.teams.away : fix.teams.home;
                      const gFor = isHome ? (fix.goals.home ?? 0) : (fix.goals.away ?? 0);
                      const gAgainst = isHome ? (fix.goals.away ?? 0) : (fix.goals.home ?? 0);
                      const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(fix.status.short);
                      const resultColor = isLive ? 'text-rose-400' : gFor > gAgainst ? 'text-emerald-400' : gFor < gAgainst ? 'text-rose-400' : 'text-amber-400';

                      return (
                        <div key={fix.id} className="flex items-center gap-3 bg-stadium-indigo/50 border border-pitch-border/40 rounded-xl px-3 py-2">
                          <span className="text-sm">{opponent.flag}</span>
                          <span className="text-[11px] font-semibold text-white flex-1 truncate">
                            {isHome ? 'vs' : '@'} {translateTeam(opponent.name, lang)}
                          </span>
                          <span className={`text-xs font-black font-mono ${resultColor}`}>
                            {formatNumber(gFor, lang)}-{formatNumber(gAgainst, lang)}
                          </span>
                          <span className="text-[9px] text-stadium-gray font-bold">
                            {isLive ? fix.status.short : 'FT'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
