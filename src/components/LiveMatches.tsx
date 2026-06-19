'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Fixture } from '@/types';
import { Radio } from 'lucide-react';

interface LiveMatchesProps {
  fixtures: Fixture[];
  nextRefreshSeconds: number;
}

export default function LiveMatches({ fixtures, nextRefreshSeconds }: LiveMatchesProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helpers to check status
  const isMatchLive = (statusShort: string) => {
    return ['1H', '2H', 'HT', 'ET', 'P'].includes(statusShort);
  };

  const isMatchFinished = (statusShort: string) => {
    return statusShort === 'FT';
  };

  // Format kickoff time in user's local timezone with timezone abbreviation
  const formatKickoff = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
  };

  // Filter fixtures to only today's games in the user's local timezone
  // Fall back to showing the first 6 fixtures if no games occur today (e.g. off-season testing)
  const displayedFixtures = useMemo(() => {
    if (!isMounted) return [];

    const localToday = new Date().toDateString();
    
    const todays = fixtures.filter(f => {
      // Keep if live
      if (isMatchLive(f.status.short)) return true;
      // Or if it falls on user's local date
      const matchLocal = new Date(f.date).toDateString();
      return matchLocal === localToday;
    });

    const sortMatches = (list: Fixture[]) => {
      return [...list].sort((a, b) => {
        const aLive = isMatchLive(a.status.short);
        const bLive = isMatchLive(b.status.short);
        if (aLive && !bLive) return -1;
        if (!aLive && bLive) return 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    };

    if (todays.length > 0) {
      return sortMatches(todays);
    }

    // Fallback: show the next 6 games from the whole schedule
    const chronological = [...fixtures].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sortMatches(chronological.slice(0, 6));
  }, [fixtures, isMounted]);

  // SSR Loading Skeleton - prevents hydration text mismatches by rendering identical HTML on server & client
  if (!isMounted) {
    return (
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 w-36 bg-pitch-border/50 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-pitch-border/50 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shrink-0 w-[280px] md:w-[310px] bg-stadium-indigo/40 border border-pitch-border/50 rounded-2xl p-4 h-[130px] animate-pulse flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="h-2.5 w-16 bg-pitch-border/50 rounded"></div>
                <div className="h-2.5 w-8 bg-pitch-border/50 rounded"></div>
              </div>
              <div className="space-y-2 my-2">
                <div className="h-3 w-3/4 bg-pitch-border/50 rounded"></div>
                <div className="h-3 w-2/3 bg-pitch-border/50 rounded"></div>
              </div>
              <div className="h-2.5 w-12 bg-pitch-border/50 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Radio className="text-rose-500 animate-pulse" size={18} />
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-white flex items-center gap-2">
            Live &amp; Today's Matches
            {displayedFixtures.some(f => isMatchLive(f.status.short)) && (
              <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase animate-pulse">
                LIVE NOW
              </span>
            )}
          </h2>
        </div>
        <div className="text-[10px] text-stadium-gray font-bold tracking-wider uppercase bg-pitch-border/30 px-3 py-1 rounded-lg border border-pitch-border/50 flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-teal opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-teal"></span>
          </span>
          Auto-sync: {nextRefreshSeconds}s
        </div>
      </div>

      {displayedFixtures.length === 0 ? (
        <div className="bg-stadium-indigo border border-pitch-border p-6 rounded-2xl text-center text-xs text-stadium-gray">
          No matches scheduled for today.
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
          {displayedFixtures.map((fixture) => {
            const live = isMatchLive(fixture.status.short);
            const finished = isMatchFinished(fixture.status.short);
            
            return (
              <motion.div
                key={fixture.id}
                className={`snap-center shrink-0 w-[280px] md:w-[310px] bg-stadium-indigo/90 border rounded-2xl p-4 backdrop-blur-md transition-all shadow-xl ${
                  live 
                    ? 'border-rose-500/30 shadow-rose-950/10 hover:border-rose-500/60' 
                    : 'border-pitch-border hover:border-cyber-orchid/30'
                }`}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header: Status / Stage */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-bold text-stadium-gray tracking-wider uppercase">
                    Group Stage
                  </span>
                  
                  {live ? (
                    <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                      {fixture.status.short === 'HT' ? 'HT' : `${fixture.status.elapsed}'`}
                    </span>
                  ) : finished ? (
                    <span className="bg-pitch-border text-stadium-gray border border-pitch-border/50 text-[9px] px-2 py-0.5 rounded-full font-black">
                      FT
                    </span>
                  ) : (
                    <span className="bg-deep-navy text-neon-teal border border-neon-teal/10 text-[9px] px-2 py-0.5 rounded-full font-bold">
                      {formatKickoff(fixture.date)}
                    </span>
                  )}
                </div>

                {/* Teams & Score Grid */}
                <div className="flex flex-col gap-2.5">
                  {/* Home Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base shrink-0">{fixture.teams.home.flag}</span>
                      <span className="text-xs md:text-sm font-semibold tracking-tight text-white line-clamp-1">
                        {fixture.teams.home.name}
                      </span>
                    </div>
                    {(live || finished) && (
                      <span className={`text-base font-extrabold ${live ? 'text-rose-400' : 'text-white'}`}>
                        {fixture.goals.home}
                      </span>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base shrink-0">{fixture.teams.away.flag}</span>
                      <span className="text-xs md:text-sm font-semibold tracking-tight text-white line-clamp-1">
                        {fixture.teams.away.name}
                      </span>
                    </div>
                    {(live || finished) && (
                      <span className={`text-base font-extrabold ${live ? 'text-rose-400' : 'text-white'}`}>
                        {fixture.goals.away}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer details */}
                {!live && !finished && (
                  <div className="mt-3.5 pt-2 border-t border-pitch-border/30 flex justify-between items-center text-[9px] text-stadium-gray font-bold">
                    <span>MATCHDAY 2</span>
                    <span>16 Venues</span>
                  </div>
                )}
                {live && (
                  <div className="mt-3.5 pt-2 border-t border-rose-950/20 flex justify-between items-center text-[9px] text-rose-400/80 font-bold animate-pulse">
                    <span>LIVE IN PROGRESS</span>
                    <span>{fixture.status.long}</span>
                  </div>
                )}
                {finished && (
                  <div className="mt-3.5 pt-2 border-t border-pitch-border/30 flex justify-between items-center text-[9px] text-stadium-gray font-medium">
                    <span>COMPLETED MATCH</span>
                    <span className="text-neon-teal">FINAL</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
