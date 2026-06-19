'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Group, StandingsResponse } from '@/types';
import GroupTable from '@/components/GroupTable';
import ThirdPlaceTable from '@/components/ThirdPlaceTable';
import LiveMatches from '@/components/LiveMatches';
import { 
  Trophy, 
  Search, 
  LayoutGrid, 
  Award, 
  Info, 
  Globe, 
  Play, 
  RefreshCw, 
  Users, 
  Tv 
} from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<StandingsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'groups' | 'third-place' | 'info'>('groups');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [nextRefreshSeconds, setNextRefreshSeconds] = useState<number>(15);

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/standings');
      if (!res.ok) {
        throw new Error('Failed to retrieve standings data');
      }
      const jsonData: StandingsResponse = await res.json();
      if (jsonData.success) {
        setData(jsonData);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'An error occurred while loading data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 15-second background auto-fetch timer
  useEffect(() => {
    const timer = setInterval(() => {
      setNextRefreshSeconds((prev) => {
        if (prev <= 1) {
          fetchData(true);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
    setNextRefreshSeconds(15);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 md:py-14 text-white font-sans">
      {/* Title Header */}
      <header className="mb-10 flex flex-col gap-6 md:flex-row md:justify-between md:items-end border-b border-pitch-border pb-8">
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] bg-electric-purple/10 text-cyber-orchid px-3.5 py-1 rounded-full border border-electric-purple/20 font-bold uppercase tracking-widest mb-3">
            <Globe size={11} className="shrink-0" />
            FIFA World Cup 2026
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white flex items-center gap-4">
            <img 
              src="/fifa-logo.png" 
              alt="FIFA World Cup 2026 Logo" 
              className="h-14 md:h-16 w-auto shrink-0 rounded-xl shadow-lg border border-pitch-border/50 bg-slate-950/20"
            />
            <span>World Cup Dashboard</span>
          </h1>
          <p className="text-stadium-gray text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Real-time standings, comparative metrics, and dynamic third-place wildcard calculations for the 48-team tournament.
          </p>
        </div>
        
        <div className="flex gap-3 items-center shrink-0">
          <button 
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-stadium-indigo border border-pitch-border text-stadium-gray hover:text-white hover:border-cyber-orchid/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            Sync
          </button>
          <div className="inline-flex items-center gap-2 text-xs bg-volt-yellow/10 text-volt-yellow px-3.5 py-2 rounded-full border border-volt-yellow/20 font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-volt-yellow animate-pulse"></span>
            Live Standings
          </div>
        </div>
      </header>

      {/* Live Matches & Scores Widget */}
      {data && data.fixtures && data.fixtures.length > 0 && (
        <LiveMatches fixtures={data.fixtures} nextRefreshSeconds={nextRefreshSeconds} />
      )}

      {/* Control Bar (Tabs & Search) */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-stadium-indigo border border-pitch-border p-3 rounded-2xl mb-8 backdrop-blur-md">
        <div className="flex gap-1.5">
          <button 
            className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'groups' 
                ? 'bg-electric-purple text-white border border-cyber-orchid/30' 
                : 'text-stadium-gray hover:bg-deep-navy hover:text-white border border-transparent'
            }`}
            onClick={() => setActiveTab('groups')}
          >
            <LayoutGrid size={14} />
            Groups Grid
          </button>
          <button 
            className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'third-place' 
                ? 'bg-electric-purple text-white border border-cyber-orchid/30' 
                : 'text-stadium-gray hover:bg-deep-navy hover:text-white border border-transparent'
            }`}
            onClick={() => setActiveTab('third-place')}
          >
            <Award size={14} />
            Third Place Wildcard
          </button>
          <button 
            className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'info' 
                ? 'bg-electric-purple text-white border border-cyber-orchid/30' 
                : 'text-stadium-gray hover:bg-deep-navy hover:text-white border border-transparent'
            }`}
            onClick={() => setActiveTab('info')}
          >
            <Info size={14} />
            Tournament Stats
          </button>
        </div>

        {activeTab !== 'info' && (
          <div className="relative w-full sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stadium-gray pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search team or code (e.g. USA, MEX)..." 
              className="w-full bg-deep-navy border border-pitch-border rounded-xl pl-9 pr-4 py-2.5 text-xs md:text-sm text-white placeholder-stadium-gray/50 focus:outline-none focus:border-cyber-orchid/50 focus:ring-1 focus:ring-cyber-orchid/30 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            className="flex flex-col items-center justify-center min-h-[400px] gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-12 h-12 border-4 border-electric-purple/20 border-t-electric-purple rounded-full animate-spin"></div>
            <div className="text-xs uppercase font-bold tracking-widest text-stadium-gray">RETRIEVING LIVE STANDINGS...</div>
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            className="flex flex-col items-center justify-center min-h-[400px] gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-rose-400 text-lg font-bold">Error Loading Dashboard</div>
            <p className="text-stadium-gray">{error}</p>
            <button 
              className="px-5 py-2.5 bg-electric-purple text-white border border-cyber-orchid/30 rounded-xl font-bold cursor-pointer transition-all hover:bg-cyber-orchid"
              onClick={() => fetchData()}
            >
              Try Again
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {activeTab === 'groups' && data && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.groups.map((group) => (
                  <GroupTable 
                    key={group.letter} 
                    group={group} 
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            )}

            {activeTab === 'third-place' && data && (
              <ThirdPlaceTable 
                groups={data.groups} 
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-stadium-indigo border border-pitch-border rounded-3xl p-6 shadow-2xl">
                  <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-pitch-border flex items-center gap-2">
                    <Users size={16} className="text-neon-teal" />
                    48-Team Format Rules
                  </h3>
                  <p className="text-stadium-gray text-xs md:text-sm leading-relaxed mb-4">
                    For the first time in history, the FIFA World Cup features 48 nations, increasing the matches played from 64 to 104 across 3 host nations.
                  </p>
                  <ul className="space-y-2.5 text-xs text-stadium-gray font-medium">
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> 12 groups of 4 teams each.</li>
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> Top 2 teams from each group automatically qualify.</li>
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> The 8 best third-placed teams qualify for the Round of 32 knockout stage.</li>
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> Group stage matches do not have extra time; draws award 1 point.</li>
                  </ul>
                </div>

                <div className="bg-stadium-indigo border border-pitch-border rounded-3xl p-6 shadow-2xl">
                  <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-pitch-border flex items-center gap-2">
                    <Tv size={16} className="text-neon-teal" />
                    Tournament Venues
                  </h3>
                  <p className="text-stadium-gray text-xs md:text-sm leading-relaxed mb-4">
                    Matches are being hosted across 16 world-class venues in Canada, Mexico, and the United States.
                  </p>
                  <ul className="space-y-2.5 text-xs text-stadium-gray font-medium">
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> <strong>United States:</strong> 11 cities including NY/NJ (Final), LA, Miami, and Dallas.</li>
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> <strong>Mexico:</strong> Mexico City (Estadio Azteca), Guadalajara, and Monterrey.</li>
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> <strong>Canada:</strong> Toronto and Vancouver.</li>
                  </ul>
                </div>

                <div className="bg-stadium-indigo border border-pitch-border rounded-3xl p-6 shadow-2xl">
                  <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-pitch-border flex items-center gap-2">
                    <Play size={16} className="text-neon-teal" />
                    Live Schedule Context
                  </h3>
                  <p className="text-stadium-gray text-xs md:text-sm leading-relaxed mb-4">
                    The tournament is currently active, with groups A-D concluding their final matches, groups E-H finishing matchday 2, and groups I-L in their initial matches.
                  </p>
                  <ul className="space-y-2.5 text-xs text-stadium-gray font-medium">
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> Group matches are played concurrently within groups for final matchday fairness.</li>
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> Standings update immediately in real-time as goals are scored.</li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
