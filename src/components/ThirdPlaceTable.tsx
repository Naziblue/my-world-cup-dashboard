'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Group, Team } from '@/types';
import { ShieldCheck, ShieldAlert, Award } from 'lucide-react';

interface ThirdPlaceTableProps {
  groups: Group[];
  searchQuery: string;
}

interface RankedThirdPlaceTeam extends Team {
  groupLetter: string;
}

export default function ThirdPlaceTable({ groups, searchQuery }: ThirdPlaceTableProps) {
  // Extract third-placed teams (index 2 in each group's sorted teams array)
  const thirdPlaceTeams: RankedThirdPlaceTeam[] = groups.map((group) => {
    const team = group.teams[2] || group.teams[0];
    return {
      ...team,
      groupLetter: group.letter
    };
  });

  // Sort according to 2026 World Cup rules:
  // 1. Points (descending)
  // 2. Goal Difference (descending)
  // 3. Goals Scored (descending)
  thirdPlaceTeams.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    return b.goalsFor - a.goalsFor;
  });

  const qualifyingLimit = 8;
  const qualifyingCount = thirdPlaceTeams.filter((_, idx) => idx < qualifyingLimit).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' as const }
    }
  };

  return (
    <motion.div 
      className="bg-stadium-indigo border border-pitch-border rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-start md:items-center gap-6 flex-wrap pb-6 border-b border-pitch-border">
        <div className="flex-1 min-w-[280px]">
          <h3 className="text-xl md:text-2xl font-black text-white">
            Best Third-Placed Teams Standings
          </h3>
          <p className="text-stadium-gray text-sm mt-1.5 leading-relaxed">
            With the new 48-team tournament structure, the <strong className="text-white">top 8</strong> third-placed teams from the 12 groups advance to the Round of 32. 
            Tie-breakers applied: 1) Points, 2) Goal Difference, 3) Goals Scored.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="bg-deep-navy border border-pitch-border rounded-2xl p-4 text-center min-w-[110px]">
            <div className="text-2xl font-black text-volt-yellow font-mono">{qualifyingLimit}</div>
            <div className="text-[10px] text-stadium-gray uppercase tracking-widest mt-1 font-semibold">Qualify Spots</div>
          </div>
          <div className="bg-deep-navy border border-pitch-border rounded-2xl p-4 text-center min-w-[110px]">
            <div className="text-2xl font-black text-neon-teal font-mono">{qualifyingCount}</div>
            <div className="text-[10px] text-stadium-gray uppercase tracking-widest mt-1 font-semibold">Teams Safe</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-stadium-gray font-semibold uppercase tracking-wider bg-deep-navy/30">
              <th className="py-3 px-4 border-b border-pitch-border text-center w-16">Rank</th>
              <th className="py-3 px-4 border-b border-pitch-border w-24">Group</th>
              <th className="py-3 px-4 border-b border-pitch-border">Team</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-12">P</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-12">W</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-12">D</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-12">L</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-12">GF</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-12">GA</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-14">GD</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-14 font-bold text-white">Pts</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-36">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pitch-border/30">
            {thirdPlaceTeams.map((team, idx) => {
              const rank = idx + 1;
              const qualifies = rank <= qualifyingLimit;
              
              const isSearched = searchQuery !== '' && (
                team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                team.code.toLowerCase().includes(searchQuery.toLowerCase())
              );

              return (
                <motion.tr 
                  key={team.code}
                  variants={rowVariants}
                  className="transition-colors hover:bg-slate-800/10"
                  style={{
                    backgroundColor: isSearched 
                      ? 'rgba(106, 13, 173, 0.15)' 
                      : qualifies 
                        ? 'rgba(0, 245, 212, 0.01)' 
                        : 'rgba(239, 68, 68, 0.01)',
                    borderLeft: isSearched 
                      ? '3px solid var(--color-electric-purple)' 
                      : qualifies 
                        ? '3px solid rgba(0, 245, 212, 0.3)' 
                        : '3px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <td className={`py-4 px-4 text-center font-bold font-mono text-sm ${qualifies ? 'text-neon-teal' : 'text-rose-400'}`}>
                    {rank}
                  </td>
                  <td className="py-4 px-4 font-bold text-stadium-gray">
                    Group {team.groupLetter}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 font-bold text-slate-100">
                      <span className="text-base leading-none" role="img" aria-label={`${team.name} Flag`}>
                        {team.flag}
                      </span>
                      <span>{team.name}</span>
                      <span className="text-[10px] text-stadium-gray/80 font-normal">{team.code}</span>
                      {rank <= 3 && <Award size={13} className="text-volt-yellow shrink-0 ml-0.5" />}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-stadium-gray">{team.played}</td>
                  <td className="py-4 px-4 text-center font-mono text-stadium-gray">{team.won}</td>
                  <td className="py-4 px-4 text-center font-mono text-stadium-gray">{team.drawn}</td>
                  <td className="py-4 px-4 text-center font-mono text-stadium-gray">{team.lost}</td>
                  <td className="py-4 px-4 text-center font-mono text-stadium-gray">{team.goalsFor}</td>
                  <td className="py-4 px-4 text-center font-mono text-stadium-gray">{team.goalsAgainst}</td>
                  <td className={`py-4 px-4 text-center font-mono font-semibold ${
                    team.goalDifference > 0 ? 'text-neon-teal' : team.goalDifference < 0 ? 'text-rose-400' : 'text-stadium-gray'
                  }`}>
                    {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                  </td>
                  <td className={`py-4 px-4 text-center font-mono font-bold text-sm ${qualifies ? 'text-neon-teal' : 'text-rose-400'}`}>
                    {team.points}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {qualifies ? (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-neon-teal/10 text-neon-teal px-3 py-1 rounded-full border border-neon-teal/20 font-bold uppercase tracking-wider">
                        <ShieldCheck size={11} className="shrink-0" />
                        Qualified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full border border-rose-500/20 font-bold uppercase tracking-wider">
                        <ShieldAlert size={11} className="shrink-0" />
                        Eliminated
                      </span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
