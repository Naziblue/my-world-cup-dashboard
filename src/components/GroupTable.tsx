'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Group, Team } from '@/types';
import { Trophy } from 'lucide-react';

interface GroupTableProps {
  group: Group;
  searchQuery: string;
}

export default function GroupTable({ group, searchQuery }: GroupTableProps) {
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
        delay: i * 0.05,
        duration: 0.3,
        ease: 'easeOut' as const
      }
    })
  };

  return (
    <motion.div 
      className="bg-stadium-indigo border border-pitch-border rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-cyber-orchid/30 hover:shadow-electric-purple/5 relative overflow-hidden"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      style={{ 
        opacity: isFilteredOut ? 0.3 : 1,
        transition: 'opacity 0.3s ease'
      }}
    >
      {/* Visual Purple Border Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-electric-purple to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />

      <div className="text-lg font-bold pb-3 mb-4 text-white border-b border-pitch-border flex justify-between items-center">
        <span>Group {group.letter}</span>
        {hasMatchingTeam && searchQuery !== '' && (
          <span className="text-[10px] bg-neon-teal/10 text-neon-teal px-2.5 py-0.5 rounded-full border border-neon-teal/20 font-bold uppercase tracking-wider">
            Match
          </span>
        )}
      </div>
      
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="text-stadium-gray font-semibold uppercase tracking-wider border-b border-pitch-border">
            <th className="py-2 px-1 text-center w-8">#</th>
            <th className="py-2 px-1">Team</th>
            <th className="py-2 px-1 text-center w-8">P</th>
            <th className="py-2 px-1 text-center w-8">W</th>
            <th className="py-2 px-1 text-center w-8">D</th>
            <th className="py-2 px-1 text-center w-8">L</th>
            <th className="py-2 px-1 text-center w-10">GD</th>
            <th className="py-2 px-1 text-center w-10 font-bold text-white">Pts</th>
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
                <td className={`py-3 px-1 text-center font-bold font-mono ${rankColor}`}>
                  {rank}
                </td>
                <td className="py-3 px-1">
                  <div className="flex items-center gap-2 font-bold text-slate-100">
                    <span className="text-base leading-none" role="img" aria-label={`${team.name} Flag`}>
                      {team.flag}
                    </span>
                    <span className="truncate max-w-[120px]">{team.name}</span>
                    <span className="text-[10px] text-stadium-gray/80 font-normal">{team.code}</span>
                    {rank === 1 && <Trophy size={11} className="text-volt-yellow ml-0.5 shrink-0" />}
                  </div>
                </td>
                <td className="py-3 px-1 text-center font-mono text-stadium-gray">{team.played}</td>
                <td className="py-3 px-1 text-center font-mono text-stadium-gray">{team.won}</td>
                <td className="py-3 px-1 text-center font-mono text-stadium-gray">{team.drawn}</td>
                <td className="py-3 px-1 text-center font-mono text-stadium-gray">{team.lost}</td>
                <td className={`py-3 px-1 text-center font-mono font-semibold ${
                  team.goalDifference > 0 ? 'text-neon-teal' : team.goalDifference < 0 ? 'text-rose-400' : 'text-stadium-gray'
                }`}>
                  {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                </td>
                <td className="py-3 px-1 text-center font-mono font-bold text-white text-sm">{team.points}</td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </motion.div>
  );
}
