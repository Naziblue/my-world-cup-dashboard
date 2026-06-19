'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Group, Team } from '@/types';
import { ShieldCheck, ShieldAlert, Award } from 'lucide-react';
import { t, translateTeam, formatNumber } from '@/utils/i18n';

interface ThirdPlaceTableProps {
  groups: Group[];
  searchQuery: string;
  lang: 'en' | 'fa';
}

interface RankedThirdPlaceTeam extends Team {
  groupLetter: string;
}

export default function ThirdPlaceTable({ groups, searchQuery, lang }: ThirdPlaceTableProps) {
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

  const isRTL = lang === 'fa';

  return (
    <motion.div 
      className="bg-stadium-indigo border border-pitch-border rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-start md:items-center gap-6 flex-wrap pb-6 border-b border-pitch-border">
        <div className="flex-1 min-w-[280px]">
          <h3 className="text-xl md:text-2xl font-black text-white text-start">
            {t('Best Third-Placed Teams Standings', lang)}
          </h3>
          <p className="text-stadium-gray text-sm mt-1.5 leading-relaxed text-start">
            {lang === 'fa' ? (
              <>
                در ساختار جدید ۴۸ تیمی، <strong className="text-white">۸ تیم برتر</strong> رتبه سوم از ۱۲ گروه به مرحله یک‌شانزدهم نهایی صعود می‌کنند. ملاک انتخاب: ۱) امتیاز، ۲) تفاضل گل، ۳) گل‌های زده.
              </>
            ) : (
              <>
                With the new 48-team tournament structure, the <strong className="text-white">top 8</strong> third-placed teams from the 12 groups advance to the Round of 32. 
                Tie-breakers applied: 1) Points, 2) Goal Difference, 3) Goals Scored.
              </>
            )}
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="bg-deep-navy border border-pitch-border rounded-2xl p-4 text-center min-w-[110px]">
            <div className="text-2xl font-black text-volt-yellow font-mono">{formatNumber(qualifyingLimit, lang)}</div>
            <div className="text-[10px] text-stadium-gray uppercase tracking-widest mt-1 font-semibold">{t('Qualify Spots', lang)}</div>
          </div>
          <div className="bg-deep-navy border border-pitch-border rounded-2xl p-4 text-center min-w-[110px]">
            <div className="text-2xl font-black text-neon-teal font-mono">{formatNumber(qualifyingCount, lang)}</div>
            <div className="text-[10px] text-stadium-gray uppercase tracking-widest mt-1 font-semibold">{t('Teams Safe', lang)}</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse text-start">
          <thead>
            <tr className="text-stadium-gray font-semibold uppercase tracking-wider bg-deep-navy/30 text-start">
              <th className="py-3 px-4 border-b border-pitch-border text-center w-16">{t('Rank', lang)}</th>
              <th className="py-3 px-4 border-b border-pitch-border w-24">{t('Group', lang)}</th>
              <th className="py-3 px-4 border-b border-pitch-border">{t('Team', lang)}</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-12">{isRTL ? 'بازی' : 'P'}</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-12">{isRTL ? 'برد' : 'W'}</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-12">{isRTL ? 'مساوی' : 'D'}</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-12">{isRTL ? 'باخت' : 'L'}</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-12">{isRTL ? 'زده' : 'GF'}</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-12">{isRTL ? 'خورده' : 'GA'}</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-14">{isRTL ? 'تفاضل' : 'GD'}</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-14 font-bold text-white">{isRTL ? 'امتیاز' : 'Pts'}</th>
              <th className="py-3 px-4 border-b border-pitch-border text-center w-36">{t('Status', lang)}</th>
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
                    borderLeft: isRTL ? undefined : (isSearched 
                      ? '3px solid var(--color-electric-purple)' 
                      : qualifies 
                        ? '3px solid rgba(0, 245, 212, 0.3)' 
                        : '3px solid rgba(239, 68, 68, 0.3)'),
                    borderRight: isRTL ? (isSearched 
                      ? '3px solid var(--color-electric-purple)' 
                      : qualifies 
                        ? '3px solid rgba(0, 245, 212, 0.3)' 
                        : '3px solid rgba(239, 68, 68, 0.3)') : undefined,
                  }}
                >
                  <td className={`py-4 px-4 text-center font-bold font-mono text-sm ${qualifies ? 'text-neon-teal' : 'text-rose-400'}`}>
                    {formatNumber(rank, lang)}
                  </td>
                  <td className="py-4 px-4 font-bold text-stadium-gray">
                    {t('Group', lang)} {team.groupLetter}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 font-bold text-slate-100">
                      <span className="text-base leading-none" role="img" aria-label={`${team.name} Flag`}>
                        {team.flag}
                      </span>
                      <span>{translateTeam(team.name, lang)}</span>
                      <span className="text-[10px] text-stadium-gray/80 font-normal">{team.code}</span>
                      {rank <= 3 && <Award size={13} className="text-volt-yellow shrink-0" />}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-stadium-gray">{formatNumber(team.played, lang)}</td>
                  <td className="py-4 px-4 text-center font-mono text-stadium-gray">{formatNumber(team.won, lang)}</td>
                  <td className="py-4 px-4 text-center font-mono text-stadium-gray">{formatNumber(team.drawn, lang)}</td>
                  <td className="py-4 px-4 text-center font-mono text-stadium-gray">{formatNumber(team.lost, lang)}</td>
                  <td className="py-4 px-4 text-center font-mono text-stadium-gray">{formatNumber(team.goalsFor, lang)}</td>
                  <td className="py-4 px-4 text-center font-mono text-stadium-gray">{formatNumber(team.goalsAgainst, lang)}</td>
                  <td className={`py-4 px-4 text-center font-mono font-semibold ${
                    team.goalDifference > 0 ? 'text-neon-teal' : team.goalDifference < 0 ? 'text-rose-400' : 'text-stadium-gray'
                  }`}>
                    {team.goalDifference > 0 ? `+${formatNumber(team.goalDifference, lang)}` : formatNumber(team.goalDifference, lang)}
                  </td>
                  <td className={`py-4 px-4 text-center font-mono font-bold text-sm ${qualifies ? 'text-neon-teal' : 'text-rose-400'}`}>
                    {formatNumber(team.points, lang)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {qualifies ? (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-neon-teal/10 text-neon-teal px-3 py-1 rounded-full border border-neon-teal/20 font-bold uppercase tracking-wider">
                        <ShieldCheck size={11} className="shrink-0" />
                        {t('Qualified', lang)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full border border-rose-500/20 font-bold uppercase tracking-wider">
                        <ShieldAlert size={11} className="shrink-0" />
                        {t('Eliminated', lang)}
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

