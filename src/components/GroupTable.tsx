'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Group, Team, Fixture } from '@/types';
import { Trophy } from 'lucide-react';

interface GroupTableProps {
  group: Group;
  searchQuery: string;
  fixtures: Fixture[];
}

export default function GroupTable({ group, searchQuery, fixtures }: GroupTableProps) {
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
              <span>Group {group.letter}</span>
              <div className="flex gap-1.5 items-center">
                {hasMatchingTeam && searchQuery !== '' && (
                  <span className="text-[9px] bg-neon-teal/10 text-neon-teal px-2 py-0.5 rounded-full border border-neon-teal/20 font-bold uppercase tracking-wider">
                    Match
                  </span>
                )}
                <span className="text-[9px] bg-pitch-border text-stadium-gray px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  View Games
                </span>
              </div>
            </div>
            
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-stadium-gray font-semibold uppercase tracking-wider border-b border-pitch-border/50">
                  <th className="py-1.5 px-1 text-center w-8">#</th>
                  <th className="py-1.5 px-1">Team</th>
                  <th className="py-1.5 px-1 text-center w-7">P</th>
                  <th className="py-1.5 px-1 text-center w-7">W</th>
                  <th className="py-1.5 px-1 text-center w-7">D</th>
                  <th className="py-1.5 px-1 text-center w-7">L</th>
                  <th className="py-1.5 px-1 text-center w-9">GD</th>
                  <th className="py-1.5 px-1 text-center w-9 font-bold text-white">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pitch-border/30">
                {group.teams.map((team, idx) => {
                  const rank = idx + 1;
                  let rankColor = 'text-stadium-gray';
                  
                  if (rank <= 2) {
                    rankColor = 'text-neon-teal';
                  } else if (rank === 3) {
                    rankColor = 'text-volt-yellow';
                  }

                  const isSearched = searchQuery !== '' && (
                    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    team.code.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  return (
                    <motion.tr 
                      key={team.code} 
                      className="transition-colors hover:bg-slate-800/10"
                      custom={idx}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      style={{
                        backgroundColor: isSearched ? 'rgba(106, 13, 173, 0.15)' : undefined,
                        borderLeft: isSearched ? '3px solid var(--color-electric-purple)' : undefined,
                      }}
                    >
                      <td className={`py-2 px-1 text-center font-bold font-mono ${rankColor}`}>
                        {rank}
                      </td>
                      <td className="py-2 px-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-100">
                          <span className="text-base leading-none" role="img" aria-label={`${team.name} Flag`}>
                            {team.flag}
                          </span>
                          <span className="truncate max-w-[105px]">{team.name}</span>
                          <span className="text-[9px] text-stadium-gray/80 font-normal">{team.code}</span>
                          {rank === 1 && <Trophy size={10} className="text-volt-yellow ml-0.5 shrink-0" />}
                        </div>
                      </td>
                      <td className="py-2 px-1 text-center font-mono text-stadium-gray">{team.played}</td>
                      <td className="py-2 px-1 text-center font-mono text-stadium-gray">{team.won}</td>
                      <td className="py-2 px-1 text-center font-mono text-stadium-gray">{team.drawn}</td>
                      <td className="py-2 px-1 text-center font-mono text-stadium-gray">{team.lost}</td>
                      <td className={`py-2 px-1 text-center font-mono font-semibold ${
                        team.goalDifference > 0 ? 'text-neon-teal' : team.goalDifference < 0 ? 'text-rose-400' : 'text-stadium-gray'
                      }`}>
                        {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                      </td>
                      <td className="py-2 px-1 text-center font-mono font-bold text-white">{team.points}</td>
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
                Group {group.letter} Schedule
              </span>
              <span className="text-[9px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                View Tables
              </span>
            </div>

            {/* Fixtures List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
              {groupFixtures.length === 0 ? (
                <div className="text-center py-10 text-[11px] text-rose-300/40 font-medium">
                  No fixtures loaded for this group.
                </div>
              ) : (
                groupFixtures.map((fix) => {
                  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(fix.status.short);
                  const isFinished = fix.status.short === 'FT';
                  
                  const matchDate = new Date(fix.date);
                  const formattedTime = isMounted 
                    ? matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }) 
                    : '';
                  const formattedDate = isMounted 
                    ? matchDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) 
                    : '';

                  return (
                    <div 
                      key={fix.id}
                      className="bg-rose-950/10 border border-rose-500/10 rounded-xl p-2 flex items-center justify-between gap-2 hover:bg-rose-950/25 transition-colors"
                    >
                      {/* Teams column */}
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        {/* Home team */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs shrink-0">{fix.teams.home.flag}</span>
                          <span className={`text-[11px] font-bold truncate text-rose-100 ${
                            searchQuery && fix.teams.home.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 'text-volt-yellow font-black' : ''
                          }`}>
                            {fix.teams.home.name}
                          </span>
                        </div>
                        {/* Away team */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs shrink-0">{fix.teams.away.flag}</span>
                          <span className={`text-[11px] font-bold truncate text-rose-100 ${
                            searchQuery && fix.teams.away.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 'text-volt-yellow font-black' : ''
                          }`}>
                            {fix.teams.away.name}
                          </span>
                        </div>
                      </div>

                      {/* Score / Time Badge */}
                      <div className="text-right shrink-0 flex flex-col items-end justify-center min-w-[75px]">
                        {isLive ? (
                          <div className="flex flex-col items-end">
                            <span className="text-[11px] font-black text-rose-400 font-mono">
                              {fix.goals.home} - {fix.goals.away}
                            </span>
                            <span className="text-[8px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1 rounded font-black tracking-widest animate-pulse mt-0.5">
                              {fix.status.short === 'HT' ? 'HT' : `${fix.status.elapsed}'`}
                            </span>
                          </div>
                        ) : isFinished ? (
                          <div className="flex flex-col items-end">
                            <span className="text-[11px] font-bold text-slate-100 font-mono">
                              {fix.goals.home} - {fix.goals.away}
                            </span>
                            <span className="text-[8px] text-rose-300/40 font-bold mt-0.5">
                              FINAL
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-neon-teal font-mono truncate max-w-[70px]">
                              {formattedTime.replace(' ' + formattedTime.split(' ').pop(), '')}
                            </span>
                            <span className="text-[8px] text-rose-300/50 font-semibold mt-0.5">
                              {formattedDate}
                            </span>
                          </div>
                        )}
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
