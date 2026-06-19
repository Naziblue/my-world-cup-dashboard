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
import { t, translateTeam, formatNumber } from '@/utils/i18n';

export default function Home() {
  const [data, setData] = useState<StandingsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'groups' | 'third-place' | 'info'>('groups');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [nextRefreshSeconds, setNextRefreshSeconds] = useState<number>(15);
  const [lang, setLang] = useState<'en' | 'fa'>('en');

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

  // Set document dir & lang dynamically
  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
    setNextRefreshSeconds(15);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 md:py-14 text-white font-sans">
      {/* Title Header */}
      <header className="mb-10 flex flex-col gap-6 md:flex-row md:justify-between md:items-end border-b border-pitch-border pb-8 text-start">
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] bg-electric-purple/10 text-cyber-orchid px-3.5 py-1 rounded-full border border-electric-purple/20 font-bold uppercase tracking-widest mb-3">
            <Globe size={11} className="shrink-0" />
            {t('FIFA World Cup 2026', lang)}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white flex items-center gap-4">
            <img 
              src="/fifa-logo.png" 
              alt="FIFA World Cup 2026 Logo" 
              className="h-14 md:h-16 w-auto shrink-0 rounded-xl shadow-lg border border-pitch-border/50 bg-slate-950/20"
            />
            <span>{t('World Cup Dashboard', lang)}</span>
          </h1>
          <p className="text-stadium-gray text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            {t('Real-time standings, comparative metrics, and dynamic third-place wildcard calculations for the 48-team tournament.', lang)}
          </p>
        </div>
        
        <div className="flex gap-3 items-center shrink-0">
          <button 
            onClick={() => setLang(lang === 'en' ? 'fa' : 'en')}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-stadium-indigo border border-pitch-border text-stadium-gray hover:text-white hover:border-cyber-orchid/30 transition-colors cursor-pointer"
          >
            <Globe size={12} />
            {lang === 'en' ? 'فارسی' : 'English'}
          </button>

          <button 
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-stadium-indigo border border-pitch-border text-stadium-gray hover:text-white hover:border-cyber-orchid/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            {t('Sync', lang)}
          </button>
          
          <div className="inline-flex items-center gap-2 text-xs bg-volt-yellow/10 text-volt-yellow px-3.5 py-2 rounded-full border border-volt-yellow/20 font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-volt-yellow animate-pulse"></span>
            {t('Live Standings', lang)}
          </div>
        </div>
      </header>

      {/* Live Matches & Scores Widget */}
      {data && data.fixtures && data.fixtures.length > 0 && (
        <LiveMatches fixtures={data.fixtures} nextRefreshSeconds={nextRefreshSeconds} lang={lang} />
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
            {t('Groups Grid', lang)}
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
            {t('Third Place Wildcard', lang)}
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
            {t('Tournament Stats', lang)}
          </button>
        </div>

        {activeTab !== 'info' && (
          <div className="relative w-full sm:max-w-xs">
            <Search size={14} className={`absolute top-1/2 -translate-y-1/2 text-stadium-gray pointer-events-none ${lang === 'fa' ? 'right-3' : 'left-3'}`} />
            <input 
              type="text" 
              placeholder={t('Search team or code (e.g. USA, MEX)...', lang)} 
              className={`w-full bg-deep-navy border border-pitch-border rounded-xl py-2.5 text-xs md:text-sm text-white placeholder-stadium-gray/50 focus:outline-none focus:border-cyber-orchid/50 focus:ring-1 focus:ring-cyber-orchid/30 transition-all ${
                lang === 'fa' ? 'pr-9 pl-4 text-right' : 'pl-9 pr-4 text-left'
              }`}
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
            <div className="text-xs uppercase font-bold tracking-widest text-stadium-gray">{t('RETRIEVING LIVE STANDINGS...', lang)}</div>
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            className="flex flex-col items-center justify-center min-h-[400px] gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-rose-400 text-lg font-bold">{t('Error Loading Dashboard', lang)}</div>
            <p className="text-stadium-gray">{error}</p>
            <button 
              className="px-5 py-2.5 bg-electric-purple text-white border border-cyber-orchid/30 rounded-xl font-bold cursor-pointer transition-all hover:bg-cyber-orchid"
              onClick={() => fetchData()}
            >
              {t('Try Again', lang)}
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
                    fixtures={data.fixtures}
                    lang={lang}
                  />
                ))}
              </div>
            )}

            {activeTab === 'third-place' && data && (
              <ThirdPlaceTable 
                groups={data.groups} 
                searchQuery={searchQuery}
                lang={lang}
              />
            )}

            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-stadium-indigo border border-pitch-border rounded-3xl p-6 shadow-2xl text-start">
                  <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-pitch-border flex items-center gap-2">
                    <Users size={16} className="text-neon-teal" />
                    {t('48-Team Format Rules', lang)}
                  </h3>
                  <p className="text-stadium-gray text-xs md:text-sm leading-relaxed mb-4">
                    {t('For the first time in history, the FIFA World Cup features 48 nations, increasing the matches played from 64 to 104 across 3 host nations.', lang)}
                  </p>
                  <ul className="space-y-2.5 text-xs text-stadium-gray font-medium">
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> <span>{t('12 groups of 4 teams each.', lang)}</span></li>
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> <span>{t('Top 2 teams from each group automatically qualify.', lang)}</span></li>
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> <span>{t('The 8 best third-placed teams qualify for the Round of 32 knockout stage.', lang)}</span></li>
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> <span>{t('Group stage matches do not have extra time; draws award 1 point.', lang)}</span></li>
                  </ul>
                </div>

                <div className="bg-stadium-indigo border border-pitch-border rounded-3xl p-6 shadow-2xl text-start">
                  <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-pitch-border flex items-center gap-2">
                    <Tv size={16} className="text-neon-teal" />
                    {t('Tournament Venues', lang)}
                  </h3>
                  <p className="text-stadium-gray text-xs md:text-sm leading-relaxed mb-4">
                    {t('Matches are being hosted across 16 world-class venues in Canada, Mexico, and the United States.', lang)}
                  </p>
                  <ul className="space-y-2.5 text-xs text-stadium-gray font-medium">
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-neon-teal font-bold shrink-0">✓</span> 
                      <span>
                        <strong className="text-white">{t('United States:', lang)}</strong> {t('11 cities including NY/NJ (Final), LA, Miami, and Dallas.', lang)}
                      </span>
                    </li>
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-neon-teal font-bold shrink-0">✓</span> 
                      <span>
                        <strong className="text-white">{t('Mexico:', lang)}</strong> {t('Mexico City (Estadio Azteca), Guadalajara, and Monterrey.', lang)}
                      </span>
                    </li>
                    <li className="flex gap-2 leading-relaxed">
                      <span className="text-neon-teal font-bold shrink-0">✓</span> 
                      <span>
                        <strong className="text-white">{t('Canada:', lang)}</strong> {t('Toronto and Vancouver.', lang)}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-stadium-indigo border border-pitch-border rounded-3xl p-6 shadow-2xl text-start">
                  <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-pitch-border flex items-center gap-2">
                    <Play size={16} className="text-neon-teal" />
                    {t('Live Schedule Context', lang)}
                  </h3>
                  <p className="text-stadium-gray text-xs md:text-sm leading-relaxed mb-4">
                    {t('The tournament is currently active, with groups A-D concluding their final matches, groups E-H finishing matchday 2, and groups I-L in their initial matches.', lang)}
                  </p>
                  <ul className="space-y-2.5 text-xs text-stadium-gray font-medium">
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> <span>{t('Group matches are played concurrently within groups for final matchday fairness.', lang)}</span></li>
                    <li className="flex gap-2 leading-relaxed"><span className="text-neon-teal font-bold shrink-0">✓</span> <span>{t('Standings update immediately in real-time as goals are scored.', lang)}</span></li>
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

