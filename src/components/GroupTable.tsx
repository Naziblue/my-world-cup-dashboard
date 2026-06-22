'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Group, Team, Fixture } from '@/types';
import { Trophy, Star } from 'lucide-react';
import { t, translateTeam, formatNumber } from '@/utils/i18n';

interface GroupTableProps {
  group: Group;
  searchQuery: string;
  fixtures: Fixture[];
  lang: 'en' | 'fa';
  pinnedTeams?: string[];
  onTogglePin?: (code: string) => void;
  onTeamClick?: (team: Team) => void;
  onMatchClick?: (fixture: Fixture) => void;
  qualifiedThirdCodes?: Set<string>;
}

export default function GroupTable({ group, searchQuery, fixtures, lang, pinnedTeams = [], onTogglePin, onTeamClick, onMatchClick, qualifiedThirdCodes }: GroupTableProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter fixtures to only those that belong to this group's teams
  const groupTeams = useMemo(() => group.teams.map((t) => t.name.toLowerCase()), [group.teams]);
  
  const groupFixtures = useMemo(() => {
    return fixtures
      .filter((f) =>
        groupTeams.includes(f.teams.home.name.toLowerCase()) &&
        groupTeams.includes(f.teams.away.name.toLowerCase())
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [fixtures, groupTeams]);

  // Check if any team in this group matches the search query
  const hasMatchingTeam = group.teams.some((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If a search query is active and this group has no matching teams, fade it slightly
  const isFilteredOut = searchQuery !== '' && !hasMatchingTeam;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' as const }
    }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.04,
        duration: 0.25,
        ease: 'easeOut' as const
      }
    })
  };

  const isRTL = lang === 'fa';

  return (
    <motion.div 
      className="h-[310px] w-full relative cursor-pointer select-none"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      style={{ 
        perspective: '1200px',
        opacity: isFilteredOut ? 0.35 : 1,
        transition: 'opacity 0.3s ease'
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* ==================== FRONT FACE: STANDINGS ==================== */}
        <div 
          className="absolute inset-0 w-full h-full bg-stadium-indigo border border-pitch-border rounded-2xl p-5 shadow-2xl flex flex-col justify-between hover:border-cyber-orchid/30 transition-colors"
          style={{ 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Visual Accent Top Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-electric-purple to-transparent opacity-50" />

          <div>
            <div className="text-base font-bold pb-2.5 mb-3 text-white border-b border-pitch-border flex justify-between items-center">
              <span>{t('Group', lang)} {group.letter}</span>
              <div className="flex gap-1.5 items-center">
                {hasMatchingTeam && searchQuery !== '' && (
                  <span className="text-[9px] bg-neon-teal/10 text-neon-teal px-2 py-0.5 rounded-full border border-neon-teal/20 font-bold uppercase tracking-wider">
                    {t('Match', lang)}
                  </span>
                )}
                <span className="text-[9px] bg-pitch-border text-stadium-gray px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {t('View Games', lang)}
                </span>
              </div>
            </div>
            
            <table className="w-full text-xs border-collapse text-start">
              <thead>
                <tr className="text-stadium-gray font-semibold uppercase tracking-wider border-b border-pitch-border/50 text-start">
                  <th className="py-1.5 px-1 text-center w-7">#</th>
                  <th className="py-1.5 px-1 text-start">{t('Team', lang)}</th>
                  <th className="py-1.5 px-1 text-center w-7">{isRTL ? 'ب' : 'P'}</th>
                  <th className="py-1.5 px-1 text-center w-7">{isRTL ? 'بر' : 'W'}</th>
                  <th className="py-1.5 px-1 text-center w-7">{isRTL ? 'م' : 'D'}</th>
                  <th className="py-1.5 px-1 text-center w-7">{isRTL ? 'با' : 'L'}</th>
                  <th className="py-1.5 px-1 text-center w-8">{isRTL ? 'ت‌گ' : 'GD'}</th>
                  <th className="py-1.5 px-1 text-center w-8 font-bold text-white">{isRTL ? 'ام' : 'Pts'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pitch-border/30">
                {group.teams.map((team, idx) => {
                  const rank = idx + 1;
                  const isThirdQualifiedForColor = rank === 3 && qualifiedThirdCodes?.has(team.code);
                  let rankColor = 'text-stadium-gray';

                  if (rank <= 2) {
                    rankColor = 'text-neon-teal';
                  } else if (rank === 3) {
                    rankColor = isThirdQualifiedForColor ? 'text-neon-teal' : 'text-rose-400';
                  } else if (rank === 4) {
                    rankColor = 'text-rose-400';
                  }

                  const isSearched = searchQuery !== '' && (
                    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    team.code.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  const isPinned = pinnedTeams.includes(team.code);

                  const isThirdQualified = rank === 3 && qualifiedThirdCodes?.has(team.code);
                  const zoneBg = rank <= 2
                    ? 'rgba(16, 185, 129, 0.08)'
                    : rank === 3
                    ? isThirdQualified
                      ? 'rgba(16, 185, 129, 0.08)'
                      : 'rgba(239, 68, 68, 0.07)'
                    : rank === 4
                    ? 'rgba(239, 68, 68, 0.07)'
                    : undefined;

                  return (
                    <motion.tr
                      key={team.code}
                      className="transition-colors hover:bg-slate-800/10"
                      custom={idx}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      style={{
                        backgroundColor: isSearched
                          ? 'rgba(106, 13, 173, 0.15)'
                          : isPinned
                          ? 'rgba(234, 179, 8, 0.06)'
                          : zoneBg,
                      }}
                    >
                      <td className={`py-2 px-1 text-center font-bold font-mono ${rankColor}`}>
                        {formatNumber(rank, lang)}
                      </td>
                      <td className="py-2 px-1 text-start">
                        <div className="flex items-center gap-1.5 font-bold text-slate-100">
                          <span
                            className={`text-base leading-none ${onTeamClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                            role="img"
                            aria-label={`${team.name} Flag`}
                            onClick={onTeamClick ? (e) => { e.stopPropagation(); onTeamClick(team); } : undefined}
                          >
                            {team.flag}
                          </span>
                          <span
                            className={`truncate max-w-[90px] ${onTeamClick ? 'cursor-pointer hover:text-cyber-orchid transition-colors' : ''}`}
                            onClick={onTeamClick ? (e) => { e.stopPropagation(); onTeamClick(team); } : undefined}
                          >
                            {translateTeam(team.name, lang)}
                          </span>
                          <span className="text-[9px] text-stadium-gray/80 font-normal">{team.code}</span>
                          {rank === 1 && <Trophy size={10} className="text-volt-yellow shrink-0" />}
                          {onTogglePin && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onTogglePin(team.code); }}
                              className="shrink-0 ml-auto cursor-pointer hover:scale-110 transition-transform"
                              title={isPinned ? 'Unpin team' : 'Pin team'}
                            >
                              <Star
                                size={11}
                                className={isPinned ? 'text-volt-yellow fill-volt-yellow' : 'text-stadium-gray/40 hover:text-volt-yellow/60'}
                              />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-1 text-center font-mono text-stadium-gray">{formatNumber(team.played, lang)}</td>
                      <td className="py-2 px-1 text-center font-mono text-stadium-gray">{formatNumber(team.won, lang)}</td>
                      <td className="py-2 px-1 text-center font-mono text-stadium-gray">{formatNumber(team.drawn, lang)}</td>
                      <td className="py-2 px-1 text-center font-mono text-stadium-gray">{formatNumber(team.lost, lang)}</td>
                      <td className={`py-2 px-1 text-center font-mono font-semibold ${
                        team.goalDifference > 0 ? 'text-neon-teal' : team.goalDifference < 0 ? 'text-rose-400' : 'text-stadium-gray'
                      }`}>
                        {team.goalDifference > 0 ? `+${formatNumber(team.goalDifference, lang)}` : formatNumber(team.goalDifference, lang)}
                      </td>
                      <td className="py-2 px-1 text-center font-mono font-bold text-white">{formatNumber(team.points, lang)}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ==================== BACK FACE: MAGENTA SCHEDULE ==================== */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl p-5 shadow-2xl flex flex-col justify-between overflow-hidden"
          style={{ 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #3D0027 0%, #1D0212 55%, #0B0006 100%)',
            border: '1px solid rgba(255, 0, 127, 0.45)',
            boxShadow: '0 10px 25px -5px rgba(255, 0, 127, 0.25)'
          }}
        >
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="text-xs font-bold pb-2.5 mb-2.5 border-b border-rose-500/20 flex justify-between items-center text-white">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                {t('Group', lang)} {group.letter} {t('Schedule', lang)}
              </span>
              <span className="text-[9px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                {t('View Tables', lang)}
              </span>
            </div>

            {/* Fixtures List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
              {groupFixtures.length === 0 ? (
                <div className="text-center py-10 text-[11px] text-rose-300/40 font-medium">
                  {t('No fixtures loaded for this group.', lang)}
                </div>
              ) : (
                groupFixtures.map((fix) => {
                  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(fix.status.short);
                  const isFinished = fix.status.short === 'FT';
                  
                  const matchDate = new Date(fix.date);
                  const locale = lang === 'fa' ? 'fa-IR' : 'en-US';
                  
                  const formattedTime = isMounted 
                    ? matchDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }) 
                    : '';
                  const formattedDate = isMounted 
                    ? matchDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' }) 
                    : '';

                  return (
                    <div
                      key={fix.id}
                      className={`bg-rose-950/10 border border-rose-500/10 rounded-xl p-2 flex items-center justify-between gap-1 hover:bg-rose-950/25 transition-colors text-xs font-semibold text-rose-100 ${onMatchClick ? 'cursor-pointer' : ''}`}
                      onClick={onMatchClick ? (e) => { e.stopPropagation(); onMatchClick(fix); } : undefined}
                    >
                      {/* Home Team */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-start text-start">
                        <span className="text-xs shrink-0">{fix.teams.home.flag}</span>
                        <span className={`text-[10px] font-bold truncate ${
                          searchQuery && fix.teams.home.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 'text-volt-yellow font-black' : ''
                        }`}>
                          {translateTeam(fix.teams.home.name, lang)}
                        </span>
                      </div>

                      {/* Score / Center Info */}
                      <div className="shrink-0 flex flex-col items-center justify-center min-w-[60px] text-center px-1">
                        {isLive ? (
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-rose-400 font-mono bg-rose-500/15 px-1.5 py-0.5 rounded border border-rose-500/20">
                              {formatNumber(fix.goals.home, lang)} - {formatNumber(fix.goals.away, lang)}
                            </span>
                            <span className="text-[7px] text-rose-400 font-bold animate-pulse mt-0.5 uppercase tracking-wide">
                              {fix.status.short === 'HT' ? t('HT', lang) : formatNumber(fix.status.elapsed, lang) + '\''}
                            </span>
                          </div>
                        ) : isFinished ? (
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-100 font-mono bg-pitch-border/30 px-1.5 py-0.5 rounded">
                              {formatNumber(fix.goals.home, lang)} - {formatNumber(fix.goals.away, lang)}
                            </span>
                            <span className="text-[7px] text-rose-300/40 font-bold mt-0.5 uppercase">
                              {t('FINAL', lang)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] font-bold text-neon-teal font-mono">
                              {formattedTime.replace(' ' + formattedTime.split(' ').pop(), '')}
                            </span>
                            <span className="text-[7px] text-rose-300/50 font-semibold mt-0.5">
                              {formattedDate}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end text-end">
                        <span className={`text-[10px] font-bold truncate ${
                          searchQuery && fix.teams.away.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 'text-volt-yellow font-black' : ''
                        }`}>
                          {translateTeam(fix.teams.away.name, lang)}
                        </span>
                        <span className="text-xs shrink-0">{fix.teams.away.flag}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
