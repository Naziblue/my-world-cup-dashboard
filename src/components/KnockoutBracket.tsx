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
 * Visual left-to-right order of R32 match IDs.
 * Adjacent pairs [2i, 2i+1] feed into R16[i].
 * This aligns perfectly with the sequential parent→child relationship
 * used by the build logic below.
 */
const R32_VISUAL_ORDER = [73, 75, 74, 77, 76, 78, 79, 80, 83, 84, 81, 82, 86, 88, 85, 87];

// ─────────────────────────────────────────────────────────────────
//  BracketConnector  – draws ∪-shaped bracket lines between rounds
// ─────────────────────────────────────────────────────────────────
function BracketConnector({ numPairs }: { numPairs: number }) {
  const colsPerPair = 16 / numPairs;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(16, 1fr)',
        height: '14px',
      }}
    >
      {Array.from({ length: numPairs }).map((_, i) => (
        <div
          key={i}
          style={{
            gridColumn: `${i * colsPerPair + 1} / span ${colsPerPair}`,
            borderLeft: '1px solid rgba(255,0,184,0.4)',
            borderRight: '1px solid rgba(255,0,184,0.4)',
            borderBottom: '1px solid rgba(255,0,184,0.4)',
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  RoundLabel – row header above each round
// ─────────────────────────────────────────────────────────────────
function RoundLabel({ label, gold = false }: { label: string; gold?: boolean }) {
  return (
    <div
      className={`text-center text-[10px] font-black uppercase tracking-widest pt-1 pb-0.5 ${
        gold ? 'text-volt-yellow' : 'text-magenta/70'
      }`}
    >
      {label}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  TeamSlot – single team row inside a match card
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

  const cls = [
    'flex items-center gap-1 w-full rounded px-1 transition-all',
    compact ? 'py-px' : 'py-0.5',
    isWinner
      ? 'bg-magenta/20 border border-magenta/60'
      : isHighlighted
        ? 'bg-magenta/10 border border-magenta/30'
        : isTbd
          ? 'opacity-40 border border-transparent cursor-default'
          : 'border border-transparent hover:border-magenta/30 hover:bg-magenta/8 cursor-pointer',
  ].join(' ');

  const displayName = isTbd
    ? '?'
    : compact
      ? team.code
      : translateTeam(team.name, lang).length > 13
        ? team.code
        : translateTeam(team.name, lang);

  return (
    <div
      className={cls}
      onClick={isTbd ? undefined : onClick}
      onMouseEnter={() => !isTbd && onHover(team.code)}
      onMouseLeave={() => onHover(null)}
      title={isTbd ? '' : `${lang === 'en' ? 'Click to predict' : 'کلیک برای پیش‌بینی'}: ${team.name}`}
    >
      <span className={compact ? 'text-[11px] leading-none' : 'text-sm leading-none shrink-0'}>
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
//  MatchCard – the card showing two teams
// ─────────────────────────────────────────────────────────────────
function MatchCard({
  match,
  highlighted,
  onSelect,
  onHover,
  compact,
  lang,
  label,
}: {
  match: RoundMatch;
  highlighted: string | null;
  onSelect: (id: string, team: Team) => void;
  onHover: (c: string | null) => void;
  compact: boolean;
  lang: 'en' | 'fa';
  label?: string;
}) {
  const bothReady = match.home.code !== 'TBD' && match.away.code !== 'TBD';

  return (
    <div
      className="flex flex-col h-full rounded-lg overflow-hidden border border-magenta/40 bg-stadium-indigo select-none"
      style={{ boxShadow: '0 0 8px rgba(255,0,184,0.07)' }}
    >
      {/* Match header */}
      <div
        className={[
          'text-center border-b border-magenta/20 text-magenta/50 font-mono font-bold truncate px-0.5',
          compact ? 'text-[7px] py-px' : 'text-[8px] py-px',
        ].join(' ')}
      >
        {label ?? (compact ? `M${match.id}` : `Match ${match.id}`)}
      </div>

      {/* Teams */}
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
        <div
          className={[
            'text-center text-magenta/35 font-bold',
            compact ? 'text-[6px]' : 'text-[7px]',
          ].join(' ')}
        >
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

  // ── Winner selection with cascade-clear ────────────────────────
  const handleSelect = useCallback((matchId: string, winner: Team) => {
    setWinners((prev) => {
      const next = { ...prev, [matchId]: winner };

      const isR32 = /^\d+$/.test(matchId);
      const r16Idx = matchId.startsWith('r16-') ? parseInt(matchId.replace('r16-', '')) : -1;
      const qfIdx = matchId.startsWith('qf-') ? parseInt(matchId.replace('qf-', '')) : -1;
      const sfIdx = matchId.startsWith('sf-') ? parseInt(matchId.replace('sf-', '')) : -1;

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

  // ── Build rounds ───────────────────────────────────────────────
  // R32: reorder baseR32 matches into the visual bracket order
  const r32Visual: RoundMatch[] = useMemo(
    () =>
      R32_VISUAL_ORDER.map((id) => {
        const base = baseR32.find((m) => m.id === id);
        if (!base) return { id: String(id), home: { ...TBD_TEAM }, away: { ...TBD_TEAM }, homeLabel: '', awayLabel: '' };
        return {
          id: String(id),
          home: base.home,
          away: base.away,
          homeLabel: base.homeLabel,
          awayLabel: base.awayLabel,
          winner: winners[String(id)],
        };
      }),
    [baseR32, winners]
  );

  // R16: pair[2i] and pair[2i+1] from r32Visual feed r16[i]
  const r16Matches: RoundMatch[] = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const home = r32Visual[i * 2]?.winner ?? { ...TBD_TEAM };
        const away = r32Visual[i * 2 + 1]?.winner ?? { ...TBD_TEAM };
        const bothReady = home.code !== 'TBD' && away.code !== 'TBD';
        return {
          id: `r16-${i}`,
          home,
          away,
          homeLabel: `W M${R32_VISUAL_ORDER[i * 2]}`,
          awayLabel: `W M${R32_VISUAL_ORDER[i * 2 + 1]}`,
          winner: bothReady ? winners[`r16-${i}`] : undefined,
        };
      }),
    [r32Visual, winners]
  );

  // QF
  const qfMatches: RoundMatch[] = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => {
        const home = r16Matches[i * 2]?.winner ?? { ...TBD_TEAM };
        const away = r16Matches[i * 2 + 1]?.winner ?? { ...TBD_TEAM };
        const bothReady = home.code !== 'TBD' && away.code !== 'TBD';
        return {
          id: `qf-${i}`,
          home,
          away,
          homeLabel: `W R16 #${i * 2 + 1}`,
          awayLabel: `W R16 #${i * 2 + 2}`,
          winner: bothReady ? winners[`qf-${i}`] : undefined,
        };
      }),
    [r16Matches, winners]
  );

  // SF
  const sfMatches: RoundMatch[] = useMemo(
    () =>
      Array.from({ length: 2 }, (_, i) => {
        const home = qfMatches[i * 2]?.winner ?? { ...TBD_TEAM };
        const away = qfMatches[i * 2 + 1]?.winner ?? { ...TBD_TEAM };
        const bothReady = home.code !== 'TBD' && away.code !== 'TBD';
        return {
          id: `sf-${i}`,
          home,
          away,
          homeLabel: `W QF ${i * 2 + 1}`,
          awayLabel: `W QF ${i * 2 + 2}`,
          winner: bothReady ? winners[`sf-${i}`] : undefined,
        };
      }),
    [qfMatches, winners]
  );

  // Final
  const finalMatch: RoundMatch = useMemo(() => {
    const home = sfMatches[0]?.winner ?? { ...TBD_TEAM };
    const away = sfMatches[1]?.winner ?? { ...TBD_TEAM };
    const bothReady = home.code !== 'TBD' && away.code !== 'TBD';
    return {
      id: 'final',
      home,
      away,
      homeLabel: 'Winner SF 1',
      awayLabel: 'Winner SF 2',
      winner: bothReady ? winners['final'] : undefined,
    };
  }, [sfMatches, winners]);

  const champion = finalMatch.winner;
  const hasPredictions = Object.keys(winners).length > 0;

  const getLbl = (key: string) => {
    const map: Record<string, Record<'en' | 'fa', string>> = {
      r32:   { en: 'Round of 32',   fa: 'یک‌شانزدهم نهایی' },
      r16:   { en: 'Round of 16',   fa: 'یک‌هشتم نهایی' },
      qf:    { en: 'Quarter Final', fa: 'یک‌چهارم نهایی' },
      sf:    { en: 'Semi Final',    fa: 'نیمه‌نهایی' },
      final: { en: '🏆 Final',      fa: '🏆 فینال' },
    };
    return map[key]?.[lang] ?? key;
  };

  // Shared grid style – 16 equal columns
  const grid16: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(16, 1fr)',
    gap: '3px',
  };

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between gap-4 bg-stadium-indigo border border-magenta/40 px-5 py-4 rounded-3xl"
        style={{ boxShadow: '0 0 20px rgba(255,0,184,0.07)' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Trophy size={16} className="text-volt-yellow" />
            <h2 className="text-base font-black text-white">{t('Interactive Knockout Bracket', lang)}</h2>
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

      {/* ── Champion banner ── */}
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

      {/* ── Bracket ── */}
      <div
        className="bg-stadium-indigo border border-magenta/40 rounded-3xl px-4 pt-2 pb-4"
        style={{ boxShadow: '0 0 30px rgba(255,0,184,0.07)' }}
      >
        {/* scroll wrapper for very small screens */}
        <div className="overflow-x-auto">
          <div style={{ minWidth: '860px' }}>

            {/* ── Round of 32 ── */}
            <RoundLabel label={getLbl('r32')} />
            <div style={{ ...grid16, height: '62px' }}>
              {r32Visual.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  highlighted={highlighted}
                  onSelect={handleSelect}
                  onHover={setHighlighted}
                  compact
                  lang={lang}
                />
              ))}
            </div>

            <BracketConnector numPairs={8} />

            {/* ── Round of 16 ── */}
            <RoundLabel label={getLbl('r16')} />
            <div style={{ ...grid16, height: '66px' }}>
              {r16Matches.map((match, i) => (
                <div key={match.id} style={{ gridColumn: `${i * 2 + 1} / span 2` }}>
                  <MatchCard
                    match={match}
                    highlighted={highlighted}
                    onSelect={handleSelect}
                    onHover={setHighlighted}
                    compact={false}
                    lang={lang}
                  />
                </div>
              ))}
            </div>

            <BracketConnector numPairs={4} />

            {/* ── Quarter Final ── */}
            <RoundLabel label={getLbl('qf')} />
            <div style={{ ...grid16, height: '70px' }}>
              {qfMatches.map((match, i) => (
                <div key={match.id} style={{ gridColumn: `${i * 4 + 1} / span 4` }}>
                  <MatchCard
                    match={match}
                    highlighted={highlighted}
                    onSelect={handleSelect}
                    onHover={setHighlighted}
                    compact={false}
                    lang={lang}
                  />
                </div>
              ))}
            </div>

            <BracketConnector numPairs={2} />

            {/* ── Semi Final ── */}
            <RoundLabel label={getLbl('sf')} />
            <div style={{ ...grid16, height: '74px' }}>
              {sfMatches.map((match, i) => (
                <div key={match.id} style={{ gridColumn: `${i * 8 + 1} / span 8` }}>
                  <MatchCard
                    match={match}
                    highlighted={highlighted}
                    onSelect={handleSelect}
                    onHover={setHighlighted}
                    compact={false}
                    lang={lang}
                  />
                </div>
              ))}
            </div>

            <BracketConnector numPairs={1} />

            {/* ── Final ── */}
            <RoundLabel label={getLbl('final')} gold />
            <div
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <div style={{ width: '37.5%', height: '82px' }}>
                <div
                  className="flex flex-col h-full rounded-xl overflow-hidden bg-stadium-indigo"
                  style={{
                    border: '2px solid rgba(255,0,184,0.6)',
                    boxShadow: '0 0 24px rgba(255,0,184,0.18), 0 0 60px rgba(204,255,0,0.06)',
                  }}
                >
                  <div className="text-center border-b border-magenta/30 text-magenta/70 font-black text-[9px] py-0.5 uppercase tracking-wider">
                    {lang === 'en' ? '🏆 Grand Final' : '🏆 فینال بزرگ'}
                  </div>
                  <div className="flex-1 flex flex-col justify-around px-1 py-px gap-px">
                    <TeamSlot
                      team={finalMatch.home}
                      isWinner={
                        finalMatch.home.code !== 'TBD' &&
                        finalMatch.away.code !== 'TBD' &&
                        finalMatch.winner?.code === finalMatch.home.code
                      }
                      isHighlighted={highlighted === finalMatch.home.code && highlighted !== 'TBD'}
                      onClick={() =>
                        finalMatch.home.code !== 'TBD' &&
                        finalMatch.away.code !== 'TBD' &&
                        handleSelect('final', finalMatch.home)
                      }
                      onHover={setHighlighted}
                      compact={false}
                      lang={lang}
                    />
                    <div className="text-[7px] text-magenta/35 font-bold text-center">vs</div>
                    <TeamSlot
                      team={finalMatch.away}
                      isWinner={
                        finalMatch.home.code !== 'TBD' &&
                        finalMatch.away.code !== 'TBD' &&
                        finalMatch.winner?.code === finalMatch.away.code
                      }
                      isHighlighted={highlighted === finalMatch.away.code && highlighted !== 'TBD'}
                      onClick={() =>
                        finalMatch.home.code !== 'TBD' &&
                        finalMatch.away.code !== 'TBD' &&
                        handleSelect('final', finalMatch.away)
                      }
                      onHover={setHighlighted}
                      compact={false}
                      lang={lang}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-3 justify-center text-[10px] text-stadium-gray">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-magenta/20 border border-magenta/70" />
          <span>{lang === 'en' ? 'Predicted winner (click to select)' : 'برنده پیش‌بینی شده (کلیک کنید)'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-magenta/10 border border-magenta/40" />
          <span>{lang === 'en' ? 'Highlighted team (hover)' : 'تیم هایلایت‌شده (هاور کنید)'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-deep-navy/40 border border-magenta/15 opacity-50" />
          <span>{lang === 'en' ? 'To be determined' : 'مشخص نشده'}</span>
        </div>
      </div>
    </motion.div>
  );
}
