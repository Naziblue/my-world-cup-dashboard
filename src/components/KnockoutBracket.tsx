'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Group, Team } from '@/types';
import { buildRoundOf32Matches, BracketMatch, TBD_TEAM } from '@/utils/bracket';
import { t, translateTeam } from '@/utils/i18n';
import { Trophy, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface KnockoutBracketProps {
  groups: Group[];
  lang: 'en' | 'fa';
}

type RoundName = 'r32' | 'r16' | 'qf' | 'sf' | 'final';

interface RoundMatch {
  id: string;
  home: Team;
  away: Team;
  homeLabel: string;
  awayLabel: string;
  winner?: Team;
}

// Round-of-16 pairings: winners of these R32 match IDs face each other
const R16_PAIRINGS: [number, number][] = [
  [73, 75],   // M89: W73 vs W75
  [74, 77],   // M90: W74 vs W77
  [76, 78],   // M91: W76 vs W78
  [79, 80],   // M92: W79 vs W80
  [83, 84],   // M93: W83 vs W84
  [81, 82],   // M94: W81 vs W82
  [86, 88],   // M95: W86 vs W88
  [85, 87],   // M96: W85 vs W87
];

// Quarterfinal pairings: winners of these R16 match indices (0-based) face each other
// R16 matches are indexed 0..7 in their creation order
const QF_PAIRINGS: [number, number][] = [
  [0, 1],  // QF1: M89w vs M90w
  [2, 3],  // QF2: M91w vs M92w
  [4, 5],  // QF3: M93w vs M94w
  [6, 7],  // QF4: M95w vs M96w
];

// Semifinal pairings: winners of these QF indices face each other
const SF_PAIRINGS: [number, number][] = [
  [0, 1],  // SF1: QF1w vs QF2w
  [1, 2],  // SF2: QF3w vs QF4w - but corrected:
];
// Correct SF pairings (QF index pairs)
const SF_CORRECT_PAIRINGS: [number, number][] = [
  [0, 1],  // SF1: QF1w vs QF2w
  [2, 3],  // SF2: QF3w vs QF4w
];

function makeTeamId(team: Team): string {
  return team.code === 'TBD' ? `tbd-${Math.random()}` : team.code;
}

const TeamCard: React.FC<{
  team: Team;
  label: string;
  isWinner?: boolean;
  isHighlighted?: boolean;
  isTBD?: boolean;
  onClick?: () => void;
  onHover?: (code: string | null) => void;
  side: 'home' | 'away';
  lang: 'en' | 'fa';
}> = ({ team, label, isWinner, isHighlighted, isTBD, onClick, onHover, side, lang }) => {
  const isTbd = isTBD || team.code === 'TBD';

  return (
    <motion.div
      className={`
        flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer
        transition-all duration-200 select-none min-w-0
        ${isWinner
          ? 'bg-magenta/20 border border-magenta/70 shadow-[0_0_10px_rgba(255,0,184,0.35)]'
          : isHighlighted
            ? 'bg-magenta/10 border border-magenta/40'
            : isTbd
              ? 'bg-deep-navy/40 border border-magenta/15 opacity-50'
              : 'bg-deep-navy/60 border border-magenta/30 hover:border-magenta/60 hover:bg-magenta/8'
        }
      `}
      whileHover={!isTbd ? { scale: 1.03 } : {}}
      whileTap={!isTbd ? { scale: 0.97 } : {}}
      onClick={!isTbd ? onClick : undefined}
      onMouseEnter={() => !isTbd && onHover?.(team.code)}
      onMouseLeave={() => onHover?.(null)}
      title={isTbd ? label : (lang === 'en' ? `Click to predict: ${team.name}` : `کلیک برای پیش‌بینی: ${translateTeam(team.name, lang)}`)}
    >
      <span className="text-sm leading-none shrink-0">{isTbd ? '🏳️' : team.flag}</span>
      <div className="flex flex-col min-w-0">
        <span className={`text-[10px] font-bold truncate leading-tight ${
          isWinner ? 'text-magenta' : isTbd ? 'text-stadium-gray/50' : 'text-white'
        }`}>
          {isTbd
            ? (lang === 'fa' ? t('TBD', lang) : label.replace('Winner Group ', '1').replace('Runner-up Group ', '2').split('/')[0])
            : translateTeam(team.name, lang)
          }
        </span>
        {!isTbd && (
          <span className="text-[9px] text-stadium-gray/70 font-mono">{team.code}</span>
        )}
      </div>
      {isWinner && (
        <div className="ml-auto shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-magenta animate-pulse" />
        </div>
      )}
    </motion.div>
  );
};

const MatchCard: React.FC<{
  match: RoundMatch;
  size?: 'sm' | 'md' | 'lg';
  highlightedTeam: string | null;
  onSelectWinner: (matchId: string, winner: Team) => void;
  onHoverTeam: (code: string | null) => void;
  lang: 'en' | 'fa';
}> = ({ match, size = 'md', highlightedTeam, onSelectWinner, onHoverTeam, lang }) => {
  const isTbdHome = match.home.code === 'TBD';
  const isTbdAway = match.away.code === 'TBD';

  const cardWidth = size === 'sm' ? 'w-[130px]' : size === 'lg' ? 'w-[170px]' : 'w-[148px]';

  return (
    <div className={`${cardWidth} flex flex-col gap-0.5 rounded-xl overflow-hidden border border-magenta/40 bg-stadium-indigo shadow-lg shadow-magenta/5`} style={{boxShadow:'0 0 12px rgba(255,0,184,0.08)'}}>
      {/* Match label */}
      <div className="text-[8px] text-magenta/50 uppercase tracking-wider font-bold text-center py-1 border-b border-magenta/20">
        M{match.id.replace('r16-', '').replace('qf-', '').replace('sf-', '').replace('final-', '')}
      </div>

      {/* Home team */}
      <div className="px-1.5 py-1">
        <TeamCard
          team={match.home}
          label={match.homeLabel}
          isWinner={match.winner?.code === match.home.code && !isTbdHome}
          isHighlighted={highlightedTeam === match.home.code && highlightedTeam !== 'TBD'}
          isTBD={isTbdHome}
          onClick={() => !isTbdHome && !isTbdAway && onSelectWinner(match.id, match.home)}
          onHover={onHoverTeam}
          side="home"
          lang={lang}
        />
      </div>

      {/* VS divider */}
      <div className="flex items-center gap-1 px-2">
        <div className="flex-1 h-px bg-magenta/25" />
        <span className="text-[8px] font-bold text-magenta/40 uppercase">vs</span>
        <div className="flex-1 h-px bg-magenta/25" />
      </div>

      {/* Away team */}
      <div className="px-1.5 py-1">
        <TeamCard
          team={match.away}
          label={match.awayLabel}
          isWinner={match.winner?.code === match.away.code && !isTbdAway}
          isHighlighted={highlightedTeam === match.away.code && highlightedTeam !== 'TBD'}
          isTBD={isTbdAway}
          onClick={() => !isTbdHome && !isTbdAway && onSelectWinner(match.id, match.away)}
          onHover={onHoverTeam}
          side="away"
          lang={lang}
        />
      </div>
    </div>
  );
};

// A column of matches with a label on top
const BracketColumn: React.FC<{
  label: string;
  matches: RoundMatch[];
  highlightedTeam: string | null;
  onSelectWinner: (matchId: string, winner: Team) => void;
  onHoverTeam: (code: string | null) => void;
  lang: 'en' | 'fa';
  cardSize?: 'sm' | 'md' | 'lg';
  matchSpacing?: string;
}> = ({ label, matches, highlightedTeam, onSelectWinner, onHoverTeam, lang, cardSize = 'md', matchSpacing = 'gap-4' }) => (
  <div className="flex flex-col items-center shrink-0">
    {/* Round header */}
    <div className="text-[10px] font-bold text-magenta/80 uppercase tracking-widest mb-3 whitespace-nowrap px-2 py-1 rounded-full border border-magenta/40 bg-magenta/5">
      {label}
    </div>
    <div className={`flex flex-col ${matchSpacing} items-center justify-around flex-1`}>
      {matches.map((match) => (
        <div key={match.id} className="flex items-center">
          <MatchCard
            match={match}
            size={cardSize}
            highlightedTeam={highlightedTeam}
            onSelectWinner={onSelectWinner}
            onHoverTeam={onHoverTeam}
            lang={lang}
          />
        </div>
      ))}
    </div>
  </div>
);

// Connector lines between columns
const Connector: React.FC<{ count: number; side: 'left' | 'right' }> = ({ count, side }) => {
  const lines = Array.from({ length: count });
  return (
    <div className="flex flex-col justify-around flex-1 h-full py-6 shrink-0 w-6">
      {lines.map((_, i) => (
        <div key={i} className="flex-1 flex items-center">
          <div
            className="w-full h-px bg-magenta/30"
            style={{ boxShadow: '0 0 4px rgba(255,0,184,0.2)' }}
          />
        </div>
      ))}
    </div>
  );
};

export default function KnockoutBracket({ groups, lang }: KnockoutBracketProps) {
  // Build base R32 matches from live standings
  const baseR32 = useMemo(() => buildRoundOf32Matches(groups), [groups]);

  // State: winners chosen per match id
  const [winners, setWinners] = useState<Record<string, Team>>({});
  const [highlightedTeam, setHighlightedTeam] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const handleSelectWinner = useCallback((matchId: string, winner: Team) => {
    setWinners((prev) => {
      const next = { ...prev };
      next[matchId] = winner;

      // Clear all downstream predictions when a match is re-decided
      // We need to cascade clearing: if this match feeds into later matches,
      // clear those later match winners too.
      // The cascade logic runs in building derived rounds below,
      // but we also clear manually to trigger re-render.
      // Find all downstream match IDs and clear them:
      const allR16Ids = R16_PAIRINGS.map((_, i) => `r16-${i}`);
      const allQFIds = QF_PAIRINGS.map((_, i) => `qf-${i}`);
      const allSFIds = SF_CORRECT_PAIRINGS.map((_, i) => `sf-${i}`);
      const finalId = 'final-0';

      if (matchId.startsWith('r32-') || /^\d+$/.test(matchId)) {
        // Changed an R32 match: clear everything downstream
        allR16Ids.forEach((id) => delete next[id]);
        allQFIds.forEach((id) => delete next[id]);
        allSFIds.forEach((id) => delete next[id]);
        delete next[finalId];
      } else if (matchId.startsWith('r16-')) {
        // Changed an R16 match: clear QF, SF, Final downstream
        const r16idx = parseInt(matchId.replace('r16-', ''));
        const affectedQF = QF_PAIRINGS.findIndex((p) => p[0] === r16idx || p[1] === r16idx);
        if (affectedQF >= 0) {
          delete next[`qf-${affectedQF}`];
          const affectedSF = SF_CORRECT_PAIRINGS.findIndex((p) => p[0] === affectedQF || p[1] === affectedQF);
          if (affectedSF >= 0) {
            delete next[`sf-${affectedSF}`];
            delete next[finalId];
          }
        }
      } else if (matchId.startsWith('qf-')) {
        const qfIdx = parseInt(matchId.replace('qf-', ''));
        const affectedSF = SF_CORRECT_PAIRINGS.findIndex((p) => p[0] === qfIdx || p[1] === qfIdx);
        if (affectedSF >= 0) {
          delete next[`sf-${affectedSF}`];
          delete next[finalId];
        }
      } else if (matchId.startsWith('sf-')) {
        delete next[finalId];
      }

      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setWinners({});
    setHighlightedTeam(null);
  }, []);

  // Build R32 rounds as RoundMatch
  const r32Matches: RoundMatch[] = useMemo(() =>
    baseR32.map((m) => ({
      id: String(m.id),
      home: m.home,
      away: m.away,
      homeLabel: m.homeLabel,
      awayLabel: m.awayLabel,
      winner: winners[String(m.id)]
    })),
    [baseR32, winners]
  );

  // Build R16 from R32 winners
  const r16Matches: RoundMatch[] = useMemo(() =>
    R16_PAIRINGS.map(([aId, bId], i) => {
      const matchA = r32Matches.find((m) => m.id === String(aId));
      const matchB = r32Matches.find((m) => m.id === String(bId));
      const home = matchA?.winner || { ...TBD_TEAM };
      const away = matchB?.winner || { ...TBD_TEAM };
      return {
        id: `r16-${i}`,
        home,
        away,
        homeLabel: `Winner M${aId}`,
        awayLabel: `Winner M${bId}`,
        winner: home.code !== 'TBD' && away.code !== 'TBD' ? winners[`r16-${i}`] : undefined
      };
    }),
    [r32Matches, winners]
  );

  // Build QF from R16 winners
  const qfMatches: RoundMatch[] = useMemo(() =>
    QF_PAIRINGS.map(([aIdx, bIdx], i) => {
      const home = r16Matches[aIdx]?.winner || { ...TBD_TEAM };
      const away = r16Matches[bIdx]?.winner || { ...TBD_TEAM };
      return {
        id: `qf-${i}`,
        home,
        away,
        homeLabel: `Winner R16-${aIdx + 1}`,
        awayLabel: `Winner R16-${bIdx + 1}`,
        winner: home.code !== 'TBD' && away.code !== 'TBD' ? winners[`qf-${i}`] : undefined
      };
    }),
    [r16Matches, winners]
  );

  // Build SF from QF winners
  const sfMatches: RoundMatch[] = useMemo(() =>
    SF_CORRECT_PAIRINGS.map(([aIdx, bIdx], i) => {
      const home = qfMatches[aIdx]?.winner || { ...TBD_TEAM };
      const away = qfMatches[bIdx]?.winner || { ...TBD_TEAM };
      return {
        id: `sf-${i}`,
        home,
        away,
        homeLabel: `Winner QF${aIdx + 1}`,
        awayLabel: `Winner QF${bIdx + 1}`,
        winner: home.code !== 'TBD' && away.code !== 'TBD' ? winners[`sf-${i}`] : undefined
      };
    }),
    [qfMatches, winners]
  );

  // Final
  const finalMatch: RoundMatch = useMemo(() => {
    const home = sfMatches[0]?.winner || { ...TBD_TEAM };
    const away = sfMatches[1]?.winner || { ...TBD_TEAM };
    return {
      id: 'final-0',
      home,
      away,
      homeLabel: 'Winner SF1',
      awayLabel: 'Winner SF2',
      winner: home.code !== 'TBD' && away.code !== 'TBD' ? winners['final-0'] : undefined
    };
  }, [sfMatches, winners]);

  const champion = finalMatch.winner;
  const hasPredictions = Object.keys(winners).length > 0;

  // Split R32 into left (first 8) and right (last 8)
  const r32Left = r32Matches.slice(0, 8);
  const r32Right = r32Matches.slice(8, 16);
  const r16Left = r16Matches.slice(0, 4);
  const r16Right = r16Matches.slice(4, 8);
  const qfLeft = qfMatches.slice(0, 2);
  const qfRight = qfMatches.slice(2, 4);
  const sfLeft = sfMatches.slice(0, 1);
  const sfRight = sfMatches.slice(1, 2);

  const getRoundLabel = (key: string): string => {
    const labels: Record<string, { en: string; fa: string }> = {
      r32: { en: 'Round of 32', fa: 'یک‌شانزدهم' },
      r16: { en: 'Round of 16', fa: 'یک‌هشتم' },
      qf:  { en: 'Quarter Final', fa: 'یک‌چهارم' },
      sf:  { en: 'Semi Final', fa: 'نیمه‌نهایی' },
      final: { en: 'Final', fa: 'فینال' },
    };
    return labels[key]?.[lang] ?? key;
  };

  // Drag-to-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onDown = (e: MouseEvent) => {
      isDragging.current = true;
      dragStartX.current = e.pageX - el.offsetLeft;
      dragScrollLeft.current = el.scrollLeft;
      el.style.cursor = 'grabbing';
    };
    const onUp = () => {
      isDragging.current = false;
      el.style.cursor = 'grab';
    };
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const dist = x - dragStartX.current;
      el.scrollLeft = dragScrollLeft.current - dist;
    };
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    el.addEventListener('mousemove', onMove);
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      el.removeEventListener('mousemove', onMove);
    };
  }, []);

  const scrollTo = (pos: 'left' | 'center' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    if (pos === 'left') el.scrollLeft = 0;
    else if (pos === 'center') el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    else el.scrollLeft = el.scrollWidth;
  };

  const isRTL = lang === 'fa';

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stadium-indigo border border-magenta/40 p-5 rounded-3xl shadow-2xl" style={{boxShadow:'0 0 20px rgba(255,0,184,0.08)'}}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={18} className="text-volt-yellow" />
            <h2 className="text-lg md:text-xl font-black text-white">
              {t('Interactive Knockout Bracket', lang)}
            </h2>
          </div>
          <p className="text-stadium-gray text-xs">
            {t('Based on current standings. Click a team to predict the winner.', lang)}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {/* Scroll nav buttons */}
          <button onClick={() => scrollTo('left')} className="inline-flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-deep-navy border border-magenta/40 text-magenta/80 hover:text-white hover:border-magenta hover:bg-magenta/10 transition-colors cursor-pointer">
            <ChevronLeft size={12} />{t('Left', lang)}
          </button>
          <button onClick={() => scrollTo('center')} className="inline-flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-deep-navy border border-magenta/40 text-magenta/80 hover:text-white hover:border-magenta hover:bg-magenta/10 transition-colors cursor-pointer">
            {t('Center', lang)}
          </button>
          <button onClick={() => scrollTo('right')} className="inline-flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-deep-navy border border-magenta/40 text-magenta/80 hover:text-white hover:border-magenta hover:bg-magenta/10 transition-colors cursor-pointer">
            {t('Right', lang)}<ChevronRight size={12} />
          </button>
          {hasPredictions && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              {t('Reset Predictions', lang)}
            </button>
          )}
        </div>
      </div>

      {/* Champion banner */}
      <AnimatePresence>
        {champion && champion.code !== 'TBD' && (
          <motion.div
            key="champion"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center gap-4 py-5 bg-gradient-to-r from-volt-yellow/10 via-electric-purple/20 to-volt-yellow/10 border border-volt-yellow/30 rounded-3xl shadow-[0_0_40px_rgba(204,255,0,0.1)]"
          >
            <Trophy size={24} className="text-volt-yellow" />
            <div className="text-center">
              <div className="text-xs text-volt-yellow font-bold uppercase tracking-widest mb-1">
                {t('Your Predicted Champion', lang)}
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-3xl">{champion.flag}</span>
                <span className="text-2xl font-black text-white">
                  {translateTeam(champion.name, lang)}
                </span>
                <span className="text-stadium-gray font-mono text-sm">{champion.code}</span>
              </div>
            </div>
            <Trophy size={24} className="text-volt-yellow" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bracket scroll area */}
      <div className="bg-stadium-indigo border border-magenta/40 rounded-3xl p-4 shadow-2xl overflow-hidden" style={{boxShadow:'0 0 30px rgba(255,0,184,0.07)'}}>
        <div
          ref={scrollRef}
          className="overflow-x-auto pb-4"
          style={{ cursor: 'grab', userSelect: 'none' }}
        >
          {/* The full bracket is a horizontal flex container */}
          <div className="flex items-stretch gap-0 min-w-max py-4 px-2">

            {/* === LEFT SIDE: R32 → R16 → QF → SF === */}

            {/* R32 Left */}
            <div className="flex flex-col gap-3 justify-around shrink-0">
              <div className="text-[10px] font-bold text-stadium-gray uppercase tracking-widest text-center mb-1 px-2 py-1 rounded-full border border-magenta/40 bg-magenta/5 whitespace-nowrap self-center">
                {getRoundLabel('r32')}
              </div>
              <div className="flex flex-col gap-3">
                {r32Left.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    size="sm"
                    highlightedTeam={highlightedTeam}
                    onSelectWinner={handleSelectWinner}
                    onHoverTeam={setHighlightedTeam}
                    lang={lang}
                  />
                ))}
              </div>
            </div>

            {/* Connector R32→R16 left */}
            <div className="flex flex-col gap-3 justify-around shrink-0 w-5 mt-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col justify-around">
                  <div className="h-px bg-magenta/30 w-full" style={{boxShadow:'0 0 4px rgba(255,0,184,0.2)'}} />
                  <div className="h-px bg-magenta/30 w-full" style={{boxShadow:'0 0 4px rgba(255,0,184,0.2)'}} />
                </div>
              ))}
            </div>

            {/* R16 Left */}
            <div className="flex flex-col gap-6 justify-around shrink-0 mt-8">
              <div className="text-[10px] font-bold text-stadium-gray uppercase tracking-widest text-center mb-1 px-2 py-1 rounded-full border border-magenta/40 bg-magenta/5 whitespace-nowrap self-center">
                {getRoundLabel('r16')}
              </div>
              <div className="flex flex-col gap-6">
                {r16Left.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    size="md"
                    highlightedTeam={highlightedTeam}
                    onSelectWinner={handleSelectWinner}
                    onHoverTeam={setHighlightedTeam}
                    lang={lang}
                  />
                ))}
              </div>
            </div>

            {/* Connector R16→QF left */}
            <div className="flex flex-col gap-6 justify-around shrink-0 w-5 mt-12">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col justify-around">
                  <div className="h-px bg-magenta/30 w-full" style={{boxShadow:'0 0 4px rgba(255,0,184,0.2)'}} />
                  <div className="h-px bg-magenta/30 w-full" style={{boxShadow:'0 0 4px rgba(255,0,184,0.2)'}} />
                </div>
              ))}
            </div>

            {/* QF Left */}
            <div className="flex flex-col gap-16 justify-around shrink-0 mt-16">
              <div className="text-[10px] font-bold text-stadium-gray uppercase tracking-widest text-center mb-1 px-2 py-1 rounded-full border border-magenta/40 bg-magenta/5 whitespace-nowrap self-center">
                {getRoundLabel('qf')}
              </div>
              <div className="flex flex-col gap-16">
                {qfLeft.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    size="md"
                    highlightedTeam={highlightedTeam}
                    onSelectWinner={handleSelectWinner}
                    onHoverTeam={setHighlightedTeam}
                    lang={lang}
                  />
                ))}
              </div>
            </div>

            {/* Connector QF→SF left */}
            <div className="flex flex-col justify-around shrink-0 w-5 mt-20">
              <div className="flex-1 flex flex-col justify-around">
                <div className="h-px bg-magenta/30 w-full" style={{boxShadow:'0 0 4px rgba(255,0,184,0.2)'}} />
                <div className="h-px bg-magenta/30 w-full" style={{boxShadow:'0 0 4px rgba(255,0,184,0.2)'}} />
              </div>
            </div>

            {/* SF Left */}
            <div className="flex flex-col justify-around shrink-0 mt-32">
              <div className="text-[10px] font-bold text-stadium-gray uppercase tracking-widest text-center mb-1 px-2 py-1 rounded-full border border-magenta/40 bg-magenta/5 whitespace-nowrap self-center">
                {getRoundLabel('sf')}
              </div>
              <div className="flex flex-col justify-center flex-1">
                {sfLeft.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    size="lg"
                    highlightedTeam={highlightedTeam}
                    onSelectWinner={handleSelectWinner}
                    onHoverTeam={setHighlightedTeam}
                    lang={lang}
                  />
                ))}
              </div>
            </div>

            {/* Connector SF→Final left */}
            <div className="flex items-center shrink-0 w-5 mt-40">
              <div className="h-px bg-magenta/30 w-full" style={{boxShadow:'0 0 4px rgba(255,0,184,0.2)'}} />
            </div>

            {/* === CENTER: FINAL === */}
            <div className="flex flex-col items-center justify-center shrink-0 gap-4 px-4">
              {/* Final header */}
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-volt-yellow" />
                <span className="text-[11px] font-black text-volt-yellow uppercase tracking-widest">
                  {getRoundLabel('final')}
                </span>
                <Trophy size={14} className="text-volt-yellow" />
              </div>

              {/* Final match card - special styling */}
              <div className="w-[180px] flex flex-col gap-0.5 rounded-2xl overflow-hidden border-2 border-volt-yellow/30 bg-gradient-to-b from-stadium-indigo to-deep-navy shadow-[0_0_30px_rgba(204,255,0,0.1)]">
                <div className="text-[9px] text-volt-yellow/70 uppercase tracking-wider font-bold text-center py-1.5 border-b border-volt-yellow/20">
                  🏆 {lang === 'en' ? 'Grand Final' : 'فینال بزرگ'}
                </div>
                <div className="px-2 py-1.5">
                  <TeamCard
                    team={finalMatch.home}
                    label={finalMatch.homeLabel}
                    isWinner={finalMatch.winner?.code === finalMatch.home.code && finalMatch.home.code !== 'TBD'}
                    isHighlighted={highlightedTeam === finalMatch.home.code && highlightedTeam !== 'TBD'}
                    isTBD={finalMatch.home.code === 'TBD'}
                    onClick={() => finalMatch.home.code !== 'TBD' && finalMatch.away.code !== 'TBD' && handleSelectWinner('final-0', finalMatch.home)}
                    onHover={setHighlightedTeam}
                    side="home"
                    lang={lang}
                  />
                </div>
                <div className="flex items-center gap-1 px-3">
                  <div className="flex-1 h-px bg-volt-yellow/20" />
                  <span className="text-[9px] font-black text-volt-yellow/50">vs</span>
                  <div className="flex-1 h-px bg-volt-yellow/20" />
                </div>
                <div className="px-2 py-1.5">
                  <TeamCard
                    team={finalMatch.away}
                    label={finalMatch.awayLabel}
                    isWinner={finalMatch.winner?.code === finalMatch.away.code && finalMatch.away.code !== 'TBD'}
                    isHighlighted={highlightedTeam === finalMatch.away.code && highlightedTeam !== 'TBD'}
                    isTBD={finalMatch.away.code === 'TBD'}
                    onClick={() => finalMatch.home.code !== 'TBD' && finalMatch.away.code !== 'TBD' && handleSelectWinner('final-0', finalMatch.away)}
                    onHover={setHighlightedTeam}
                    side="away"
                    lang={lang}
                  />
                </div>
                {finalMatch.winner && finalMatch.winner.code !== 'TBD' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-2 text-center border-t border-volt-yellow/20 bg-volt-yellow/5"
                  >
                    <div className="text-[9px] text-volt-yellow uppercase tracking-widest font-bold">
                      🏆 {lang === 'en' ? 'Champion' : 'قهرمان'}
                    </div>
                    <div className="text-sm font-black text-white mt-0.5">
                      {finalMatch.winner.flag} {translateTeam(finalMatch.winner.name, lang)}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Connector Final→SF right */}
            <div className="flex items-center shrink-0 w-5 mt-40">
              <div className="h-px bg-magenta/30 w-full" style={{boxShadow:'0 0 4px rgba(255,0,184,0.2)'}} />
            </div>

            {/* === RIGHT SIDE: SF → QF → R16 → R32 (mirror) === */}

            {/* SF Right */}
            <div className="flex flex-col justify-around shrink-0 mt-32">
              <div className="text-[10px] font-bold text-stadium-gray uppercase tracking-widest text-center mb-1 px-2 py-1 rounded-full border border-magenta/40 bg-magenta/5 whitespace-nowrap self-center">
                {getRoundLabel('sf')}
              </div>
              <div className="flex flex-col justify-center flex-1">
                {sfRight.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    size="lg"
                    highlightedTeam={highlightedTeam}
                    onSelectWinner={handleSelectWinner}
                    onHoverTeam={setHighlightedTeam}
                    lang={lang}
                  />
                ))}
              </div>
            </div>

            {/* Connector SF←QF right */}
            <div className="flex items-center shrink-0 w-5 mt-40">
              <div className="h-px bg-magenta/30 w-full" style={{boxShadow:'0 0 4px rgba(255,0,184,0.2)'}} />
            </div>

            {/* QF Right */}
            <div className="flex flex-col gap-16 justify-around shrink-0 mt-16">
              <div className="text-[10px] font-bold text-stadium-gray uppercase tracking-widest text-center mb-1 px-2 py-1 rounded-full border border-magenta/40 bg-magenta/5 whitespace-nowrap self-center">
                {getRoundLabel('qf')}
              </div>
              <div className="flex flex-col gap-16">
                {qfRight.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    size="md"
                    highlightedTeam={highlightedTeam}
                    onSelectWinner={handleSelectWinner}
                    onHoverTeam={setHighlightedTeam}
                    lang={lang}
                  />
                ))}
              </div>
            </div>

            {/* Connector QF←R16 right */}
            <div className="flex flex-col justify-around shrink-0 w-5 mt-20">
              <div className="flex-1 flex flex-col justify-around">
                <div className="h-px bg-magenta/30 w-full" style={{boxShadow:'0 0 4px rgba(255,0,184,0.2)'}} />
                <div className="h-px bg-magenta/30 w-full" style={{boxShadow:'0 0 4px rgba(255,0,184,0.2)'}} />
              </div>
            </div>

            {/* R16 Right */}
            <div className="flex flex-col gap-6 justify-around shrink-0 mt-8">
              <div className="text-[10px] font-bold text-stadium-gray uppercase tracking-widest text-center mb-1 px-2 py-1 rounded-full border border-magenta/40 bg-magenta/5 whitespace-nowrap self-center">
                {getRoundLabel('r16')}
              </div>
              <div className="flex flex-col gap-6">
                {r16Right.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    size="md"
                    highlightedTeam={highlightedTeam}
                    onSelectWinner={handleSelectWinner}
                    onHoverTeam={setHighlightedTeam}
                    lang={lang}
                  />
                ))}
              </div>
            </div>

            {/* Connector R16←R32 right */}
            <div className="flex flex-col gap-6 justify-around shrink-0 w-5 mt-12">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col justify-around">
                  <div className="h-px bg-magenta/30 w-full" style={{boxShadow:'0 0 4px rgba(255,0,184,0.2)'}} />
                  <div className="h-px bg-magenta/30 w-full" style={{boxShadow:'0 0 4px rgba(255,0,184,0.2)'}} />
                </div>
              ))}
            </div>

            {/* R32 Right */}
            <div className="flex flex-col gap-3 justify-around shrink-0">
              <div className="text-[10px] font-bold text-stadium-gray uppercase tracking-widest text-center mb-1 px-2 py-1 rounded-full border border-magenta/40 bg-magenta/5 whitespace-nowrap self-center">
                {getRoundLabel('r32')}
              </div>
              <div className="flex flex-col gap-3">
                {r32Right.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    size="sm"
                    highlightedTeam={highlightedTeam}
                    onSelectWinner={handleSelectWinner}
                    onHoverTeam={setHighlightedTeam}
                    lang={lang}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Scroll hint */}
        <p className="text-center text-[10px] text-stadium-gray/40 mt-1 italic">
          ← {t('Scroll to navigate', lang)} →
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center text-[10px] text-stadium-gray">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-magenta/20 border border-magenta/70" />
          <span>{lang === 'en' ? 'Predicted winner' : 'برنده پیش‌بینی شده'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-magenta/10 border border-magenta/40" />
          <span>{lang === 'en' ? 'Highlighted team' : 'تیم هایلایت شده'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-deep-navy/40 border border-magenta/15 opacity-50" />
          <span>{lang === 'en' ? 'To be determined' : 'مشخص نشده'}</span>
        </div>
      </div>
    </motion.div>
  );
}
