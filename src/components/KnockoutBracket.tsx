'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Group, Team } from '@/types';
import { buildRoundOf32Matches, TBD_TEAM } from '@/utils/bracket';
import { t, translateTeam } from '@/utils/i18n';
import { Trophy, RotateCcw } from 'lucide-react';

interface KnockoutBracketProps {
  groups: Group[];
  lang: 'en' | 'fa';
}

interface RoundMatch {
  id: string;
  home: Team;
  away: Team;
  homeLabel: string;
  awayLabel: string;
  winner?: Team;
}

/**
 * Visual left→right order of all 16 R32 match IDs.
 * Adjacent pairs [2i, 2i+1] feed R16[i].
 * First 8 IDs → top half; last 8 IDs → bottom half.
 */
const R32_VISUAL_ORDER = [73, 75, 74, 77, 76, 78, 79, 80, 83, 84, 81, 82, 86, 88, 85, 87];

// ─────────────────────────────────────────────────────────────────
//  BracketConnector
//  direction='down' → ∪ arches (arch at bottom, legs up)
//  direction='up'   → ∩ arches (arch at top,    legs down)
// ─────────────────────────────────────────────────────────────────
function BracketConnector({
  numPairs,
  direction = 'down',
}: {
  numPairs: number;
  direction?: 'down' | 'up';
}) {
  const colsPerPair = 8 / numPairs;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', height: '13px' }}>
      {Array.from({ length: numPairs }).map((_, i) => (
        <div
          key={i}
          style={{
            gridColumn: `${i * colsPerPair + 1} / span ${colsPerPair}`,
            borderLeft: '1px solid rgba(255,0,184,0.4)',
            borderRight: '1px solid rgba(255,0,184,0.4)',
            ...(direction === 'down'
              ? { borderBottom: '1px solid rgba(255,0,184,0.4)' }
              : { borderTop: '1px solid rgba(255,0,184,0.4)' }),
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  VerticalCenterLine  – connects SF card to the Final card
// ─────────────────────────────────────────────────────────────────
function VerticalCenterLine() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', height: '12px' }}>
      <div
        style={{
          width: '1px',
          background: 'rgba(255,0,184,0.55)',
          boxShadow: '0 0 5px rgba(255,0,184,0.35)',
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  RoundLabel
// ─────────────────────────────────────────────────────────────────
function RoundLabel({ label, gold = false }: { label: string; gold?: boolean }) {
  return (
    <div
      className={`text-center text-[10px] font-black uppercase tracking-widest py-0.5 ${
        gold ? 'text-volt-yellow' : 'text-magenta/70'
      }`}
    >
      {label}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  TeamSlot
// ─────────────────────────────────────────────────────────────────
function TeamSlot({
  team,
  isWinner,
  isHighlighted,
  onClick,
  onHover,
  compact,
  lang,
}: {
  team: Team;
  isWinner: boolean;
  isHighlighted: boolean;
  onClick: () => void;
  onHover: (c: string | null) => void;
  compact: boolean;
  lang: 'en' | 'fa';
}) {
  const isTbd = team.code === 'TBD';
  const displayName = isTbd
    ? '?'
    : compact
    ? team.code
    : translateTeam(team.name, lang).length > 13
    ? team.code
    : translateTeam(team.name, lang);

  return (
    <div
      className={[
        'flex items-center gap-1 w-full rounded px-1 transition-all',
        compact ? 'py-px' : 'py-0.5',
        isWinner
          ? 'bg-magenta/20 border border-magenta/60'
          : isHighlighted
          ? 'bg-magenta/10 border border-magenta/30'
          : isTbd
          ? 'opacity-40 border border-transparent cursor-default'
          : 'border border-transparent hover:border-magenta/30 hover:bg-magenta/8 cursor-pointer',
      ].join(' ')}
      onClick={isTbd ? undefined : onClick}
      onMouseEnter={() => !isTbd && onHover(team.code)}
      onMouseLeave={() => onHover(null)}
      title={isTbd ? undefined : `${lang === 'en' ? 'Click to predict' : 'کلیک برای پیش‌بینی'}: ${team.name}`}
    >
      <span className={compact ? 'text-[10px] leading-none' : 'text-sm leading-none shrink-0'}>
        {isTbd ? '🏳️' : team.flag}
      </span>
      <span
        className={[
          'truncate font-bold leading-tight',
          compact ? 'text-[8px] font-mono' : 'text-[10px]',
          isWinner ? 'text-magenta' : isTbd ? 'text-stadium-gray/50' : 'text-white',
        ].join(' ')}
      >
        {displayName}
      </span>
      {isWinner && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-magenta animate-pulse shrink-0" />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  MatchCard
// ─────────────────────────────────────────────────────────────────
function MatchCard({
  match,
  highlighted,
  onSelect,
  onHover,
  compact,
  lang,
  headerLabel,
}: {
  match: RoundMatch;
  highlighted: string | null;
  onSelect: (id: string, team: Team) => void;
  onHover: (c: string | null) => void;
  compact: boolean;
  lang: 'en' | 'fa';
  headerLabel?: string;
}) {
  const bothReady = match.home.code !== 'TBD' && match.away.code !== 'TBD';

  return (
    <div
      className="flex flex-col h-full rounded-lg overflow-hidden border border-magenta/40 bg-stadium-indigo select-none"
      style={{ boxShadow: '0 0 8px rgba(255,0,184,0.07)' }}
    >
      <div
        className={[
          'text-center border-b border-magenta/20 text-magenta/50 font-mono font-bold truncate px-0.5',
          compact ? 'text-[7px] py-px' : 'text-[8px] py-px',
        ].join(' ')}
      >
        {headerLabel ?? (compact ? `M${match.id}` : `M${match.id}`)}
      </div>
      <div className="flex-1 flex flex-col justify-around px-0.5 py-px gap-px">
        <TeamSlot
          team={match.home}
          isWinner={bothReady && match.winner?.code === match.home.code}
          isHighlighted={highlighted === match.home.code && highlighted !== 'TBD'}
          onClick={() => bothReady && onSelect(match.id, match.home)}
          onHover={onHover}
          compact={compact}
          lang={lang}
        />
        <div className={['text-center text-magenta/35 font-bold', compact ? 'text-[6px]' : 'text-[7px]'].join(' ')}>
          vs
        </div>
        <TeamSlot
          team={match.away}
          isWinner={bothReady && match.winner?.code === match.away.code}
          isHighlighted={highlighted === match.away.code && highlighted !== 'TBD'}
          onClick={() => bothReady && onSelect(match.id, match.away)}
          onHover={onHover}
          compact={compact}
          lang={lang}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────────────
export default function KnockoutBracket({ groups, lang }: KnockoutBracketProps) {
  const baseR32 = useMemo(() => buildRoundOf32Matches(groups), [groups]);
  const [winners, setWinners] = useState<Record<string, Team>>({});
  const [highlighted, setHighlighted] = useState<string | null>(null);

  // ── Winner selection with cascade-clear ──────────────────────
  const handleSelect = useCallback((matchId: string, winner: Team) => {
    setWinners((prev) => {
      const next = { ...prev, [matchId]: winner };
      const isR32 = /^\d+$/.test(matchId);
      const r16Idx = matchId.startsWith('r16-') ? parseInt(matchId.replace('r16-', '')) : -1;
      const qfIdx  = matchId.startsWith('qf-')  ? parseInt(matchId.replace('qf-', ''))  : -1;
      const sfIdx  = matchId.startsWith('sf-')  ? parseInt(matchId.replace('sf-', ''))  : -1;

      if (isR32) {
        for (let i = 0; i < 8; i++) delete next[`r16-${i}`];
        for (let i = 0; i < 4; i++) delete next[`qf-${i}`];
        for (let i = 0; i < 2; i++) delete next[`sf-${i}`];
        delete next['final'];
      } else if (r16Idx >= 0) {
        const qf = Math.floor(r16Idx / 2);
        delete next[`qf-${qf}`];
        delete next[`sf-${Math.floor(qf / 2)}`];
        delete next['final'];
      } else if (qfIdx >= 0) {
        delete next[`sf-${Math.floor(qfIdx / 2)}`];
        delete next['final'];
      } else if (sfIdx >= 0) {
        delete next['final'];
      }

      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setWinners({});
    setHighlighted(null);
  }, []);

  // ── Build all rounds ─────────────────────────────────────────
  const r32Visual: RoundMatch[] = useMemo(
    () =>
      R32_VISUAL_ORDER.map((id) => {
        const base = baseR32.find((m) => m.id === id);
        if (!base) return { id: String(id), home: { ...TBD_TEAM }, away: { ...TBD_TEAM }, homeLabel: '', awayLabel: '' };
        return { id: String(id), home: base.home, away: base.away, homeLabel: base.homeLabel, awayLabel: base.awayLabel, winner: winners[String(id)] };
      }),
    [baseR32, winners]
  );

  const r16Matches: RoundMatch[] = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const home = r32Visual[i * 2]?.winner ?? { ...TBD_TEAM };
        const away = r32Visual[i * 2 + 1]?.winner ?? { ...TBD_TEAM };
        const bothReady = home.code !== 'TBD' && away.code !== 'TBD';
        return { id: `r16-${i}`, home, away, homeLabel: `W M${R32_VISUAL_ORDER[i * 2]}`, awayLabel: `W M${R32_VISUAL_ORDER[i * 2 + 1]}`, winner: bothReady ? winners[`r16-${i}`] : undefined };
      }),
    [r32Visual, winners]
  );

  const qfMatches: RoundMatch[] = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => {
        const home = r16Matches[i * 2]?.winner ?? { ...TBD_TEAM };
        const away = r16Matches[i * 2 + 1]?.winner ?? { ...TBD_TEAM };
        const bothReady = home.code !== 'TBD' && away.code !== 'TBD';
        return { id: `qf-${i}`, home, away, homeLabel: `W R16 #${i * 2 + 1}`, awayLabel: `W R16 #${i * 2 + 2}`, winner: bothReady ? winners[`qf-${i}`] : undefined };
      }),
    [r16Matches, winners]
  );

  const sfMatches: RoundMatch[] = useMemo(
    () =>
      Array.from({ length: 2 }, (_, i) => {
        const home = qfMatches[i * 2]?.winner ?? { ...TBD_TEAM };
        const away = qfMatches[i * 2 + 1]?.winner ?? { ...TBD_TEAM };
        const bothReady = home.code !== 'TBD' && away.code !== 'TBD';
        return { id: `sf-${i}`, home, away, homeLabel: `W QF ${i * 2 + 1}`, awayLabel: `W QF ${i * 2 + 2}`, winner: bothReady ? winners[`sf-${i}`] : undefined };
      }),
    [qfMatches, winners]
  );

  const finalMatch: RoundMatch = useMemo(() => {
    const home = sfMatches[0]?.winner ?? { ...TBD_TEAM };
    const away = sfMatches[1]?.winner ?? { ...TBD_TEAM };
    const bothReady = home.code !== 'TBD' && away.code !== 'TBD';
    return { id: 'final', home, away, homeLabel: 'Winner SF 1', awayLabel: 'Winner SF 2', winner: bothReady ? winners['final'] : undefined };
  }, [sfMatches, winners]);

  const champion = finalMatch.winner;
  const hasPredictions = Object.keys(winners).length > 0;

  const getLbl = (key: string) => {
    const map: Record<string, Record<'en' | 'fa', string>> = {
      r32:   { en: 'Round of 32',   fa: 'یک‌شانزدهم' },
      r16:   { en: 'Round of 16',   fa: 'یک‌هشتم' },
      qf:    { en: 'Quarter Final', fa: 'یک‌چهارم' },
      sf:    { en: 'Semi Final',    fa: 'نیمه‌نهایی' },
      final: { en: '🏆 Final',      fa: '🏆 فینال' },
    };
    return map[key]?.[lang] ?? key;
  };

  // Slices for top / bottom halves
  const r32Top = r32Visual.slice(0, 8);
  const r32Bot = r32Visual.slice(8, 16);
  const r16Top = r16Matches.slice(0, 4);
  const r16Bot = r16Matches.slice(4, 8);
  const qfTop  = qfMatches.slice(0, 2);
  const qfBot  = qfMatches.slice(2, 4);
  const sfTop  = sfMatches[0];
  const sfBot  = sfMatches[1];

  // Shared 8-col grid style
  const G8: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '3px' };

  // Inline grid row renderer – each card is centered at 1-col width regardless of colSpan
  // so all boxes look identical in size (same as R32 compact cards).
  const gridRow = (
    matches: RoundMatch[],
    colSpan: number,
    heightPx: number
  ) => (
    <div style={{ ...G8, height: `${heightPx}px` }}>
      {matches.map((match, i) => (
        <div
          key={match.id}
          style={{
            gridColumn: `${i * colSpan + 1} / span ${colSpan}`,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {/* width = 1/colSpan of parent → same pixel width as one R32 card */}
          <div style={{ width: `${100 / colSpan}%` }}>
            <MatchCard
              match={match}
              highlighted={highlighted}
              onSelect={handleSelect}
              onHover={setHighlighted}
              compact
              lang={lang}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-4 bg-stadium-indigo border border-magenta/40 px-5 py-4 rounded-3xl"
        style={{ boxShadow: '0 0 20px rgba(255,0,184,0.07)' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Trophy size={16} className="text-volt-yellow" />
            <h2 className="text-base font-black text-white">
              {t('Interactive Knockout Bracket', lang)}
            </h2>
          </div>
          <p className="text-stadium-gray text-xs">
            {t('Based on current standings. Click a team to predict the winner.', lang)}
          </p>
        </div>
        {hasPredictions && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw size={12} />
            {t('Reset Predictions', lang)}
          </button>
        )}
      </div>

      {/* ── Champion banner ───────────────────────────────────── */}
      <AnimatePresence>
        {champion && champion.code !== 'TBD' && (
          <motion.div
            key="champion"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center gap-4 py-4 bg-gradient-to-r from-volt-yellow/10 via-magenta/10 to-volt-yellow/10 border border-volt-yellow/30 rounded-3xl"
            style={{ boxShadow: '0 0 30px rgba(204,255,0,0.08)' }}
          >
            <Trophy size={22} className="text-volt-yellow" />
            <div className="text-center">
              <div className="text-xs text-volt-yellow font-bold uppercase tracking-widest mb-1">
                {t('Your Predicted Champion', lang)}
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-3xl">{champion.flag}</span>
                <span className="text-2xl font-black text-white">{translateTeam(champion.name, lang)}</span>
                <span className="text-stadium-gray font-mono text-sm">{champion.code}</span>
              </div>
            </div>
            <Trophy size={22} className="text-volt-yellow" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bracket ──────────────────────────────────────────── */}
      <div
        className="bg-stadium-indigo border border-magenta/40 rounded-3xl px-4 pt-3 pb-4"
        style={{ boxShadow: '0 0 30px rgba(255,0,184,0.07)' }}
      >
        <div className="overflow-x-auto">
          <div style={{ minWidth: '720px' }}>

            {/* ════ TOP HALF — converging toward Final ════ */}

            <RoundLabel label={getLbl('r32')} />
            {gridRow(r32Top, 1, 60)}
            <BracketConnector numPairs={4} direction="down" />

            <RoundLabel label={getLbl('r16')} />
            {gridRow(r16Top, 2, 60)}
            <BracketConnector numPairs={2} direction="down" />

            <RoundLabel label={getLbl('qf')} />
            {gridRow(qfTop,  4, 60)}
            <BracketConnector numPairs={1} direction="down" />

            <RoundLabel label={getLbl('sf')} />
            {gridRow([sfTop], 8, 60)}

            {/* SF → Final connector */}
            <VerticalCenterLine />

            {/* ════ CENTER — Final ════ */}
            <RoundLabel label={getLbl('final')} gold />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 'calc(100% / 8)', height: '60px' }}>
                <div
                  className="flex flex-col h-full rounded-lg overflow-hidden"
                  style={{
                    border: '2px solid rgba(255,0,184,0.65)',
                    background: 'var(--color-stadium-indigo)',
                    boxShadow: '0 0 24px rgba(255,0,184,0.25), 0 0 48px rgba(204,255,0,0.05)',
                  }}
                >
                  <div className="text-center border-b border-magenta/30 text-magenta/70 font-black text-[7px] py-px uppercase tracking-wider">
                    {lang === 'en' ? '🏆 Final' : '🏆 فینال'}
                  </div>
                  <div className="flex-1 flex flex-col justify-around px-0.5 py-px gap-px">
                    <TeamSlot
                      team={finalMatch.home}
                      isWinner={finalMatch.home.code !== 'TBD' && finalMatch.away.code !== 'TBD' && finalMatch.winner?.code === finalMatch.home.code}
                      isHighlighted={highlighted === finalMatch.home.code && highlighted !== 'TBD'}
                      onClick={() => finalMatch.home.code !== 'TBD' && finalMatch.away.code !== 'TBD' && handleSelect('final', finalMatch.home)}
                      onHover={setHighlighted}
                      compact
                      lang={lang}
                    />
                    <div className="text-[6px] text-magenta/35 font-bold text-center">vs</div>
                    <TeamSlot
                      team={finalMatch.away}
                      isWinner={finalMatch.home.code !== 'TBD' && finalMatch.away.code !== 'TBD' && finalMatch.winner?.code === finalMatch.away.code}
                      isHighlighted={highlighted === finalMatch.away.code && highlighted !== 'TBD'}
                      onClick={() => finalMatch.home.code !== 'TBD' && finalMatch.away.code !== 'TBD' && handleSelect('final', finalMatch.away)}
                      onHover={setHighlighted}
                      compact
                      lang={lang}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Final → SF connector */}
            <VerticalCenterLine />

            {/* ════ BOTTOM HALF — expanding from Final ════ */}

            <RoundLabel label={getLbl('sf')} />
            {gridRow([sfBot], 8, 60)}
            <BracketConnector numPairs={1} direction="up" />

            <RoundLabel label={getLbl('qf')} />
            {gridRow(qfBot,  4, 60)}
            <BracketConnector numPairs={2} direction="up" />

            <RoundLabel label={getLbl('r16')} />
            {gridRow(r16Bot, 2, 60)}
            <BracketConnector numPairs={4} direction="up" />

            <RoundLabel label={getLbl('r32')} />
            {gridRow(r32Bot, 1, 60)}

          </div>
        </div>
      </div>

      {/* ── Legend ───────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 justify-center text-[10px] text-stadium-gray">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-magenta/20 border border-magenta/70" />
          <span>{lang === 'en' ? 'Predicted winner (click to select)' : 'برنده پیش‌بینی شده'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-magenta/10 border border-magenta/40" />
          <span>{lang === 'en' ? 'Highlighted (hover)' : 'هایلایت‌شده'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-deep-navy/40 border border-magenta/15 opacity-50" />
          <span>{lang === 'en' ? 'To be determined' : 'مشخص نشده'}</span>
        </div>
      </div>
    </motion.div>
  );
}
