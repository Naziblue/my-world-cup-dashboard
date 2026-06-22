import { NextResponse } from 'next/server';
import { Group, Team, Fixture, MatchEvent, MatchStatistic } from '@/types';

// Mock World Cup 2026 Standings Data (serving as high-quality fallback)
const mockWorldCupGroups: Group[] = [
  {
    letter: 'A',
    teams: [
      { name: 'Mexico', code: 'MEX', played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 5, goalsAgainst: 2, goalDifference: 3, points: 7, flag: '🇲🇽' },
      { name: 'Korea Republic', code: 'KOR', played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 4, goalsAgainst: 4, goalDifference: 0, points: 4, flag: '🇰🇷' },
      { name: 'Czechia', code: 'CZE', played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 3, goalsAgainst: 4, goalDifference: -1, points: 3, flag: '🇨🇿' },
      { name: 'South Africa', code: 'RSA', played: 3, won: 0, drawn: 2, lost: 1, goalsFor: 2, goalsAgainst: 4, goalDifference: -2, points: 2, flag: '🇿🇦' }
    ]
  },
  {
    letter: 'B',
    teams: [
      { name: 'Switzerland', code: 'SUI', played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 6, goalsAgainst: 3, goalDifference: 3, points: 6, flag: '🇨🇭' },
      { name: 'Canada', code: 'CAN', played: 3, won: 1, drawn: 2, lost: 0, goalsFor: 4, goalsAgainst: 3, goalDifference: 1, points: 5, flag: '🇨🇦' },
      { name: 'Qatar', code: 'QAT', played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 3, goalsAgainst: 4, goalDifference: -1, points: 4, flag: '🇶🇦' },
      { name: 'Bosnia and Herzegovina', code: 'BIH', played: 3, won: 0, drawn: 1, lost: 2, goalsFor: 2, goalsAgainst: 5, goalDifference: -3, points: 1, flag: '🇧🇦' }
    ]
  },
  {
    letter: 'C',
    teams: [
      { name: 'Brazil', code: 'BRA', played: 3, won: 3, drawn: 0, lost: 0, goalsFor: 8, goalsAgainst: 1, goalDifference: 7, points: 9, flag: '🇧🇷' },
      { name: 'Morocco', code: 'MAR', played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 5, goalsAgainst: 4, goalDifference: 1, points: 6, flag: '🇲🇦' },
      { name: 'Scotland', code: 'SCO', played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 3, goalsAgainst: 6, goalDifference: -3, points: 3, flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
      { name: 'Haiti', code: 'HAI', played: 3, won: 0, drawn: 0, lost: 3, goalsFor: 2, goalsAgainst: 7, goalDifference: -5, points: 0, flag: '🇭🇹' }
    ]
  },
  {
    letter: 'D',
    teams: [
      { name: 'United States', code: 'USA', played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 6, goalsAgainst: 2, goalDifference: 4, points: 7, flag: '🇺🇸' },
      { name: 'Türkiye', code: 'TUR', played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 4, goalsAgainst: 4, goalDifference: 0, points: 4, flag: '🇹🇷' },
      { name: 'Australia', code: 'AUS', played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 3, goalsAgainst: 4, goalDifference: -1, points: 4, flag: '🇦🇺' },
      { name: 'Paraguay', code: 'PAR', played: 3, won: 0, drawn: 1, lost: 2, goalsFor: 2, goalsAgainst: 5, goalDifference: -3, points: 1, flag: '🇵🇾' }
    ]
  },
  {
    letter: 'E',
    teams: [
      { name: 'Germany', code: 'GER', played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 5, goalsAgainst: 1, goalDifference: 4, points: 6, flag: '🇩🇪' },
      { name: 'Ecuador', code: 'ECU', played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 3, goalsAgainst: 3, goalDifference: 0, points: 3, flag: '🇪🇨' },
      { name: "Côte d'Ivoire", code: 'CIV', played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 3, goalDifference: -1, points: 3, flag: '🇨🇮' },
      { name: 'Curaçao', code: 'CUW', played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 1, goalsAgainst: 4, goalDifference: -3, points: 0, flag: '🇨🇼' }
    ]
  },
  {
    letter: 'F',
    teams: [
      { name: 'Netherlands', code: 'NED', played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 4, goalsAgainst: 2, goalDifference: 2, points: 4, flag: '🇳🇱' },
      { name: 'Japan', code: 'JPN', played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 3, goalsAgainst: 2, goalDifference: 1, points: 4, flag: '🇯🇵' },
      { name: 'Sweden', code: 'SWE', played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 3, goalDifference: -1, points: 3, flag: '🇸🇪' },
      { name: 'Tunisia', code: 'TUN', played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 1, goalsAgainst: 3, goalDifference: -2, points: 0, flag: '🇹🇳' }
    ]
  },
  {
    letter: 'G',
    teams: [
      { name: 'Belgium', code: 'BEL', played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 2, goalDifference: 4, points: 6, flag: '🇧🇪' },
      { name: 'Egypt', code: 'EGY', played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 3, goalsAgainst: 3, goalDifference: 0, points: 3, flag: '🇪🇬' },
      { name: 'Iran', code: 'IRN', played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 4, goalDifference: -2, points: 3, flag: '🇮🇷' },
      { name: 'New Zealand', code: 'NZL', played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 1, goalsAgainst: 3, goalDifference: -2, points: 0, flag: '🇳🇿' }
    ]
  },
  {
    letter: 'H',
    teams: [
      { name: 'Spain', code: 'ESP', played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 3, goalsAgainst: 1, goalDifference: 2, points: 4, flag: '🇪🇸' },
      { name: 'Uruguay', code: 'URU', played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 2, goalsAgainst: 1, goalDifference: 1, points: 4, flag: '🇺🇾' },
      { name: 'Saudi Arabia', code: 'KSA', played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 3, goalDifference: -1, points: 3, flag: '🇸🇦' },
      { name: 'Cabo Verde', code: 'CPV', played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 1, goalsAgainst: 3, goalDifference: -2, points: 0, flag: '🇨🇻' }
    ]
  },
  {
    letter: 'I',
    teams: [
      { name: 'France', code: 'FRA', played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 3, goalsAgainst: 1, goalDifference: 2, points: 3, flag: '🇫🇷' },
      { name: 'Norway', code: 'NOR', played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 2, goalsAgainst: 1, goalDifference: 1, points: 3, flag: '🇳🇴' },
      { name: 'Senegal', code: 'SEN', played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 1, goalsAgainst: 2, goalDifference: -1, points: 0, flag: '🇸🇳' },
      { name: 'Iraq', code: 'IRQ', played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 1, goalsAgainst: 3, goalDifference: -2, points: 0, flag: '🇮🇶' }
    ]
  },
  {
    letter: 'J',
    teams: [
      { name: 'Argentina', code: 'ARG', played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 4, goalsAgainst: 0, goalDifference: 4, points: 3, flag: '🇦🇷' },
      { name: 'Austria', code: 'AUT', played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 2, goalsAgainst: 1, goalDifference: 1, points: 3, flag: '🇦🇹' },
      { name: 'Algeria', code: 'ALG', played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 1, goalsAgainst: 2, goalDifference: -1, points: 0, flag: '🇩🇿' },
      { name: 'Jordan', code: 'JOR', played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 0, goalsAgainst: 4, goalDifference: -4, points: 0, flag: '🇯🇴' }
    ]
  },
  {
    letter: 'K',
    teams: [
      { name: 'Portugal', code: 'POR', played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 3, goalsAgainst: 0, goalDifference: 3, points: 3, flag: '🇵🇹' },
      { name: 'Colombia', code: 'COL', played: 1, won: 0, drawn: 1, lost: 0, goalsFor: 1, goalsAgainst: 1, goalDifference: 0, points: 1, flag: '🇨🇴' },
      { name: 'Uzbekistan', code: 'UZB', played: 1, won: 0, drawn: 1, lost: 0, goalsFor: 1, goalsAgainst: 1, goalDifference: 0, points: 1, flag: '🇺🇿' },
      { name: 'Congo DR', code: 'COD', played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 0, goalsAgainst: 3, goalDifference: -3, points: 0, flag: '🇨🇩' }
    ]
  },
  {
    letter: 'L',
    teams: [
      { name: 'England', code: 'ENG', played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 2, goalsAgainst: 0, goalDifference: 2, points: 3, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      { name: 'Croatia', code: 'CRO', played: 1, won: 0, drawn: 1, lost: 0, goalsFor: 1, goalsAgainst: 1, goalDifference: 0, points: 1, flag: '🇭🇷' },
      { name: 'Panama', code: 'PAN', played: 1, won: 0, drawn: 1, lost: 0, goalsFor: 1, goalsAgainst: 1, goalDifference: 0, points: 1, flag: '🇵🇦' },
      { name: 'Ghana', code: 'GHA', played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 0, goalsAgainst: 2, goalDifference: -2, points: 0, flag: '🇬🇭' }
    ]
  }
];

// Mapping dictionary to add flags and 3-letter codes to API-Sports team names
const teamMetadata: Record<string, { code: string; flag: string }> = {
  'mexico': { code: 'MEX', flag: '🇲🇽' },
  'south africa': { code: 'RSA', flag: '🇿🇦' },
  'korea republic': { code: 'KOR', flag: '🇰🇷' },
  'south korea': { code: 'KOR', flag: '🇰🇷' },
  'czechia': { code: 'CZE', flag: '🇨🇿' },
  'czech republic': { code: 'CZE', flag: '🇨🇿' },
  'canada': { code: 'CAN', flag: '🇨🇦' },
  'switzerland': { code: 'SUI', flag: '🇨🇭' },
  'qatar': { code: 'QAT', flag: '🇶🇦' },
  'bosnia and herzegovina': { code: 'BIH', flag: '🇧🇦' },
  'brazil': { code: 'BRA', flag: '🇧🇷' },
  'morocco': { code: 'MAR', flag: '🇲🇦' },
  'haiti': { code: 'HAI', flag: '🇭🇹' },
  'scotland': { code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  'united states': { code: 'USA', flag: '🇺🇸' },
  'usa': { code: 'USA', flag: '🇺🇸' },
  'paraguay': { code: 'PAR', flag: '🇵🇾' },
  'australia': { code: 'AUS', flag: '🇦🇺' },
  'türkiye': { code: 'TUR', flag: '🇹🇷' },
  'turkey': { code: 'TUR', flag: '🇹🇷' },
  'germany': { code: 'GER', flag: '🇩🇪' },
  'curaçao': { code: 'CUW', flag: '🇨🇼' },
  'curacao': { code: 'CUW', flag: '🇨🇼' },
  'côte d\'ivoire': { code: 'CIV', flag: '🇨🇮' },
  'cote d\'ivoire': { code: 'CIV', flag: '🇨🇮' },
  'ivory coast': { code: 'CIV', flag: '🇨🇮' },
  'ecuador': { code: 'ECU', flag: '🇪🇨' },
  'netherlands': { code: 'NED', flag: '🇳🇱' },
  'japan': { code: 'JPN', flag: '🇯🇵' },
  'tunisia': { code: 'TUN', flag: '🇹🇳' },
  'sweden': { code: 'SWE', flag: '🇸🇪' },
  'belgium': { code: 'BEL', flag: '🇧🇪' },
  'egypt': { code: 'EGY', flag: '🇪🇬' },
  'iran': { code: 'IRN', flag: '🇮🇷' },
  'new zealand': { code: 'NZL', flag: '🇳🇿' },
  'spain': { code: 'ESP', flag: '🇪🇸' },
  'cabo verde': { code: 'CPV', flag: '🇨🇻' },
  'cape verde': { code: 'CPV', flag: '🇨🇻' },
  'saudi arabia': { code: 'KSA', flag: '🇸🇦' },
  'uruguay': { code: 'URU', flag: '🇺🇾' },
  'france': { code: 'FRA', flag: '🇫🇷' },
  'senegal': { code: 'SEN', flag: '🇸🇳' },
  'norway': { code: 'NOR', flag: '🇳🇴' },
  'iraq': { code: 'IRQ', flag: '🇮🇶' },
  'argentina': { code: 'ARG', flag: '🇦🇷' },
  'algeria': { code: 'ALG', flag: '🇩🇿' },
  'austria': { code: 'AUT', flag: '🇦🇹' },
  'jordan': { code: 'JOR', flag: '🇯🇴' },
  'portugal': { code: 'POR', flag: '🇵🇹' },
  'uzbekistan': { code: 'UZB', flag: '🇺🇿' },
  'colombia': { code: 'COL', flag: '🇨🇴' },
  'congo dr': { code: 'COD', flag: '🇨🇩' },
  'dr congo': { code: 'COD', flag: '🇨🇩' },
  'england': { code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  'croatia': { code: 'CRO', flag: '🇭🇷' },
  'ghana': { code: 'GHA', flag: '🇬🇭' },
  'panama': { code: 'PAN', flag: '🇵🇦' },
  'cape verde islands': { code: 'CPV', flag: '🇨🇻' },
  'bosnia & herzegovina': { code: 'BIH', flag: '🇧🇦' }
};

// Mock World Cup 2026 Fixtures Data (serving as high-quality fallback)
const mockWorldCupFixtures: Fixture[] = [
  // --- Group A matches ---
  {
    id: 1001,
    date: '2026-06-11T19:00:00+00:00',
    status: { long: 'Match Finished', short: 'FT', elapsed: 90 },
    teams: {
      home: { name: 'Mexico', code: 'MEX', flag: '🇲🇽', logo: 'https://media.api-sports.io/football/teams/1533.png' },
      away: { name: 'South Africa', code: 'RSA', flag: '🇿🇦', logo: 'https://media.api-sports.io/football/teams/23.png' }
    },
    goals: { home: 1, away: 1 }
  },
  {
    id: 1002,
    date: '2026-06-12T15:00:00+00:00',
    status: { long: 'Match Finished', short: 'FT', elapsed: 90 },
    teams: {
      home: { name: 'Korea Republic', code: 'KOR', flag: '🇰🇷', logo: 'https://media.api-sports.io/football/teams/1533.png' },
      away: { name: 'Czechia', code: 'CZE', flag: '🇨🇿', logo: 'https://media.api-sports.io/football/teams/23.png' }
    },
    goals: { home: 1, away: 2 }
  },
  {
    id: 1539004,
    date: '2026-06-18T16:00:00+00:00',
    status: { long: 'Match Finished', short: 'FT', elapsed: 90 },
    teams: {
      home: { name: 'Czechia', code: 'CZE', flag: '🇨🇿', logo: 'https://media.api-sports.io/football/teams/1533.png' },
      away: { name: 'South Africa', code: 'RSA', flag: '🇿🇦', logo: 'https://media.api-sports.io/football/teams/23.png' }
    },
    goals: { home: 1, away: 1 }
  },
  {
    id: 1489388,
    date: '2026-06-19T01:00:00+00:00',
    status: { long: 'Match Finished', short: 'FT', elapsed: 90 },
    teams: {
      home: { name: 'Mexico', code: 'MEX', flag: '🇲🇽', logo: 'https://media.api-sports.io/football/teams/1533.png' },
      away: { name: 'Korea Republic', code: 'KOR', flag: '🇰🇷', logo: 'https://media.api-sports.io/football/teams/23.png' }
    },
    goals: { home: 1, away: 0 }
  },
  {
    id: 1003,
    date: '2026-06-24T18:00:00+00:00',
    status: { long: 'Not Started', short: 'NS', elapsed: null },
    teams: {
      home: { name: 'South Africa', code: 'RSA', flag: '🇿🇦', logo: 'https://media.api-sports.io/football/teams/1533.png' },
      away: { name: 'Korea Republic', code: 'KOR', flag: '🇰🇷', logo: 'https://media.api-sports.io/football/teams/23.png' }
    },
    goals: { home: null, away: null }
  },
  {
    id: 1004,
    date: '2026-06-24T21:00:00+00:00',
    status: { long: 'Not Started', short: 'NS', elapsed: null },
    teams: {
      home: { name: 'Czechia', code: 'CZE', flag: '🇨🇿', logo: 'https://media.api-sports.io/football/teams/1533.png' },
      away: { name: 'Mexico', code: 'MEX', flag: '🇲🇽', logo: 'https://media.api-sports.io/football/teams/23.png' }
    },
    goals: { home: null, away: null }
  },
  // --- Group B matches ---
  {
    id: 2001,
    date: '2026-06-12T18:00:00+00:00',
    status: { long: 'Match Finished', short: 'FT', elapsed: 90 },
    teams: {
      home: { name: 'Switzerland', code: 'SUI', flag: '🇨🇭', logo: 'https://media.api-sports.io/football/teams/1533.png' },
      away: { name: 'Qatar', code: 'QAT', flag: '🇶🇦', logo: 'https://media.api-sports.io/football/teams/23.png' }
    },
    goals: { home: 2, away: 1 }
  },
  {
    id: 2002,
    date: '2026-06-13T21:00:00+00:00',
    status: { long: 'Match Finished', short: 'FT', elapsed: 90 },
    teams: {
      home: { name: 'Canada', code: 'CAN', flag: '🇨🇦', logo: 'https://media.api-sports.io/football/teams/1533.png' },
      away: { name: 'Bosnia & Herzegovina', code: 'BIH', flag: '🇧🇦', logo: 'https://media.api-sports.io/football/teams/23.png' }
    },
    goals: { home: 2, away: 2 }
  },
  {
    id: 1539005,
    date: '2026-06-18T19:00:00+00:00',
    status: { long: 'Match Finished', short: 'FT', elapsed: 90 },
    teams: {
      home: { name: 'Switzerland', code: 'SUI', flag: '🇨🇭', logo: 'https://media.api-sports.io/football/teams/1533.png' },
      away: { name: 'Bosnia & Herzegovina', code: 'BIH', flag: '🇧🇦', logo: 'https://media.api-sports.io/football/teams/23.png' }
    },
    goals: { home: 4, away: 1 }
  },
  {
    id: 1489387,
    date: '2026-06-18T22:00:00+00:00',
    status: { long: 'Match Finished', short: 'FT', elapsed: 90 },
    teams: {
      home: { name: 'Canada', code: 'CAN', flag: '🇨🇦', logo: 'https://media.api-sports.io/football/teams/1533.png' },
      away: { name: 'Qatar', code: 'QAT', flag: '🇶🇦', logo: 'https://media.api-sports.io/football/teams/23.png' }
    },
    goals: { home: 6, away: 0 }
  },
  {
    id: 2003,
    date: '2026-06-24T18:00:00+00:00',
    status: { long: 'Not Started', short: 'NS', elapsed: null },
    teams: {
      home: { name: 'Qatar', code: 'QAT', flag: '🇶🇦', logo: 'https://media.api-sports.io/football/teams/1533.png' },
      away: { name: 'Bosnia & Herzegovina', code: 'BIH', flag: '🇧🇦', logo: 'https://media.api-sports.io/football/teams/23.png' }
    },
    goals: { home: null, away: null }
  },
  {
    id: 2004,
    date: '2026-06-24T21:00:00+00:00',
    status: { long: 'Not Started', short: 'NS', elapsed: null },
    teams: {
      home: { name: 'Switzerland', code: 'SUI', flag: '🇨🇭', logo: 'https://media.api-sports.io/football/teams/1533.png' },
      away: { name: 'Canada', code: 'CAN', flag: '🇨🇦', logo: 'https://media.api-sports.io/football/teams/23.png' }
    },
    goals: { home: null, away: null }
  },
  // --- Live & other matches ---
  {
    id: 1489390,
    date: '2026-06-19T22:00:00+00:00',
    status: { long: 'Halftime', short: 'HT', elapsed: 45 },
    teams: {
      home: { name: 'Scotland', code: 'SCO', flag: '🏴\uDB40\uDC67\uDB40\uDC62\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74\uDB40\uDC7F', logo: 'https://media.api-sports.io/football/teams/1533.png' },
      away: { name: 'Morocco', code: 'MAR', flag: '🇲🇦', logo: 'https://media.api-sports.io/football/teams/23.png' }
    },
    goals: { home: 0, away: 1 },
    events: [
      { minute: 12, team: 'home', type: 'yellow-card', player: 'S. McTominay' },
      { minute: 34, team: 'away', type: 'goal', player: 'Y. En-Nesyri', assist: 'H. Ziyech' },
      { minute: 41, team: 'home', type: 'red-card', player: 'A. Robertson' },
    ],
    statistics: [
      { label: 'Possession', home: 38, away: 62 },
      { label: 'Shots on Target', home: 2, away: 5 },
      { label: 'Total Shots', home: 4, away: 9 },
      { label: 'Fouls', home: 8, away: 4 },
      { label: 'Corners', home: 1, away: 6 },
    ],
    substitutions: [
      { minute: 42, team: 'home', playerIn: 'L. Cooper', playerOut: 'A. Robertson' },
    ],
  },
  {
    id: 1489391,
    date: '2026-06-19T19:00:00+00:00',
    status: { long: 'Match Finished', short: 'FT', elapsed: 90 },
    teams: {
      home: { name: 'United States', code: 'USA', flag: '🇺🇸', logo: 'https://media.api-sports.io/football/teams/32.png' },
      away: { name: 'Australia', code: 'AUS', flag: '🇦🇺', logo: 'https://media.api-sports.io/football/teams/22.png' }
    },
    goals: { home: 2, away: 0 }
  },
  {
    id: 1489389,
    date: '2026-06-20T00:30:00+00:00',
    status: { long: 'Not Started', short: 'NS', elapsed: null },
    teams: {
      home: { name: 'Brazil', code: 'BRA', flag: '🇧🇷', logo: 'https://media.api-sports.io/football/teams/1.png' },
      away: { name: 'Haiti', code: 'HAI', flag: '🇭🇹', logo: 'https://media.api-sports.io/football/teams/4673.png' }
    },
    goals: { home: null, away: null }
  },
  {
    id: 1539006,
    date: '2026-06-20T03:00:00+00:00',
    status: { long: 'Not Started', short: 'NS', elapsed: null },
    teams: {
      home: { name: 'Türkiye', code: 'TUR', flag: '🇹🇷', logo: 'https://media.api-sports.io/football/teams/1533.png' },
      away: { name: 'Paraguay', code: 'PAR', flag: '🇵🇾', logo: 'https://media.api-sports.io/football/teams/23.png' }
    },
    goals: { home: null, away: null }
  }
];

function getTeamMetadata(name: string) {
  const normalized = name.toLowerCase().trim();
  if (teamMetadata[normalized]) return teamMetadata[normalized];
  
  // Fallback to name-based initials
  const initials = normalized
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase();
  const code = initials.length >= 3 ? initials.slice(0, 3) : (normalized.slice(0, 3).toUpperCase());
  return { code, flag: '🏳️' };
}

// Persistent event cache for finished matches (events never change once FT)
const eventCache: Record<number, { events: any[]; statistics: any[]; substitutions: any[] }> = {};

// Shared in-memory cache for all requests (15s duration) to protect external API rate limits
let cachedResponse: {
  timestamp: number;
  data: any;
} | null = null;
const CACHE_TTL_MS = 15000; // 15 seconds

export async function GET(request: Request) {
  try {
    const now = Date.now();
    if (cachedResponse && (now - cachedResponse.timestamp < CACHE_TTL_MS)) {
      console.log(`[API Secure Cache]: Serving shared server cache. TTL remaining: ${CACHE_TTL_MS - (now - cachedResponse.timestamp)}ms.`);
      return NextResponse.json(cachedResponse.data);
    }

    const apiKey = process.env.WORLD_CUP_API_KEY;
    const standingsUrl = 'https://v3.football.api-sports.io/standings?league=1&season=2026';
    const fixturesUrl = 'https://v3.football.api-sports.io/fixtures?league=1&season=2026';
    
    // Check if key is mock key placeholder or not configured
    const isMockKey = !apiKey || apiKey.startsWith('mock_key');
    
    if (isMockKey) {
      console.log(`[API Secure Backend]: Serving local pre-populated 2026 World Cup mock standings and fixtures.`);
      return NextResponse.json({
        success: true,
        lastUpdated: new Date().toISOString(),
        groups: mockWorldCupGroups,
        fixtures: mockWorldCupFixtures
      });
    }

    console.log(`[API Secure Backend]: Concurrently fetching standings & fixtures from v3.football.api-sports.io...`);
    
    const [standingsRes, fixturesRes] = await Promise.all([
      fetch(standingsUrl, {
        headers: { 'x-apisports-key': apiKey },
        next: { revalidate: 15 } // Cache standings for 15 seconds
      }),
      fetch(fixturesUrl, {
        headers: { 'x-apisports-key': apiKey },
        next: { revalidate: 15 } // Cache fixtures for 15 seconds
      })
    ]);

    if (!standingsRes.ok || !fixturesRes.ok) {
      throw new Error(`API returned HTTP statuses: Standings: ${standingsRes.status}, Fixtures: ${fixturesRes.status}`);
    }

    const [standingsData, fixturesData] = await Promise.all([
      standingsRes.json(),
      fixturesRes.json()
    ]);
    
    // Check API errors
    if (standingsData.errors && Object.keys(standingsData.errors).length > 0) {
      throw new Error(`Standings API error: ${JSON.stringify(standingsData.errors)}`);
    }
    if (fixturesData.errors && Object.keys(fixturesData.errors).length > 0) {
      throw new Error(`Fixtures API error: ${JSON.stringify(fixturesData.errors)}`);
    }

    // Parse Standings
    let groups: Group[] = [];
    const apiStandingsResponse = standingsData.response;
    
    if (apiStandingsResponse && apiStandingsResponse.length > 0) {
      const apiGroups = apiStandingsResponse[0].league.standings;
      groups = apiGroups
        .map((apiGroup: any[]) => {
          const groupName = apiGroup[0]?.group || 'Group A';
          const letter = groupName.replace('Group ', '').trim();
          
          const teams: Team[] = apiGroup.map((item: any) => {
            const metadata = getTeamMetadata(item.team.name);
            return {
              name: item.team.name,
              code: metadata.code,
              played: item.all.played,
              won: item.all.win,
              drawn: item.all.draw,
              lost: item.all.lose,
              goalsFor: item.all.goals.for,
              goalsAgainst: item.all.goals.against,
              goalDifference: item.goalsDiff,
              points: item.points,
              flag: metadata.flag,
              apiId: item.team.id
            };
          });

          teams.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);

          return { letter, teams };
        })
        .filter((g: Group) => g.letter.length === 1 && g.letter >= 'A' && g.letter <= 'L');

      groups.sort((a, b) => a.letter.localeCompare(b.letter));
    } else {
      groups = mockWorldCupGroups;
    }

    // Parse Fixtures
    let fixtures: Fixture[] = [];
    const apiFixturesResponse = fixturesData.response;

    if (apiFixturesResponse && apiFixturesResponse.length > 0) {
      fixtures = apiFixturesResponse
        .map((item: any) => {
          const homeMeta = getTeamMetadata(item.teams.home.name);
          const awayMeta = getTeamMetadata(item.teams.away.name);
          return {
            id: item.fixture.id,
            date: item.fixture.date,
            status: {
              long: item.fixture.status.long,
              short: item.fixture.status.short,
              elapsed: item.fixture.status.elapsed
            },
            teams: {
              home: {
                name: item.teams.home.name,
                code: homeMeta.code,
                flag: homeMeta.flag,
                logo: item.teams.home.logo
              },
              away: {
                name: item.teams.away.name,
                code: awayMeta.code,
                flag: awayMeta.flag,
                logo: item.teams.away.logo
              }
            },
            goals: {
              home: item.goals.home,
              away: item.goals.away
            }
          };
        })
        .sort((a: Fixture, b: Fixture) => {
          const isALive = ['1H', '2H', 'HT', 'ET', 'P'].includes(a.status.short);
          const isBLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(b.status.short);
          if (isALive && !isBLive) return -1;
          if (!isALive && isBLive) return 1;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
    } else {
      fixtures = mockWorldCupFixtures;
    }

    // Pre-fetch events for all started matches. Uses persistent cache for FT matches.
    if (!isMockKey && fixtures.length > 0) {
      const isLive = (s: string) => ['1H', '2H', 'HT', 'ET', 'P'].includes(s);
      const allStarted = fixtures.filter(f => f.status.short === 'FT' || isLive(f.status.short));

      // Apply cached data for FT matches; live matches always re-fetch
      const uncached: Fixture[] = [];
      for (const fix of allStarted) {
        if (isLive(fix.status.short)) {
          uncached.push(fix);
          delete eventCache[fix.id]; // clear stale live data
        } else if (eventCache[fix.id]) {
          const cached = eventCache[fix.id];
          if (cached.events.length > 0) fix.events = cached.events;
          if (cached.statistics.length > 0) fix.statistics = cached.statistics;
          if (cached.substitutions.length > 0) fix.substitutions = cached.substitutions;
        } else {
          uncached.push(fix);
        }
      }

      // Fetch up to 5 uncached per request (most recent first). Builds up over auto-refreshes.
      if (uncached.length > 0) {
        uncached.sort((a, b) => {
          const aLive = isLive(a.status.short) ? 0 : 1;
          const bLive = isLive(b.status.short) ? 0 : 1;
          if (aLive !== bLive) return aLive - bLive;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        const batch = uncached.slice(0, 10);
        console.log(`[API]: Fetching events for ${batch.length}/${uncached.length} uncached matches (${Object.keys(eventCache).length} cached).`);
        {
          const results = await Promise.allSettled(
            batch.map(async (fix) => {
              const [eventsRes, statsRes] = await Promise.all([
                fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${fix.id}`, {
                  headers: { 'x-apisports-key': apiKey! },
                }),
                fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${fix.id}`, {
                  headers: { 'x-apisports-key': apiKey! },
                }),
              ]);
              const [eventsData, statsData] = await Promise.all([
                eventsRes.ok ? eventsRes.json() : null,
                statsRes.ok ? statsRes.json() : null,
              ]);

              const homeTeamId = apiFixturesResponse?.find((a: any) => a.fixture.id === fix.id)?.teams?.home?.id;
              const events: MatchEvent[] = [];
              const substitutions: { minute: number; team: 'home' | 'away'; playerIn: string; playerOut: string }[] = [];

              if (eventsData?.response) {
                for (const ev of eventsData.response) {
                  const side: 'home' | 'away' = ev.team.id === homeTeamId ? 'home' : 'away';
                  const evType = ev.type?.toLowerCase() ?? '';
                  const detail = ev.detail?.toLowerCase() ?? '';
                  if (evType === 'goal' || detail.includes('goal')) {
                    events.push({ minute: ev.time.elapsed ?? 0, team: side, type: 'goal', player: ev.player?.name ?? '?', assist: ev.assist?.name || undefined });
                  } else if (evType === 'card' && detail.includes('red')) {
                    events.push({ minute: ev.time.elapsed ?? 0, team: side, type: 'red-card', player: ev.player?.name ?? '?' });
                  } else if (evType === 'card' && detail.includes('yellow')) {
                    events.push({ minute: ev.time.elapsed ?? 0, team: side, type: 'yellow-card', player: ev.player?.name ?? '?' });
                  } else if (evType === 'subst') {
                    substitutions.push({ minute: ev.time.elapsed ?? 0, team: side, playerIn: ev.assist?.name ?? '?', playerOut: ev.player?.name ?? '?' });
                  }
                }
              }

              const statistics: MatchStatistic[] = [];
              if (statsData?.response && statsData.response.length >= 2) {
                const homeStats = statsData.response[0]?.statistics ?? [];
                const awayStats = statsData.response[1]?.statistics ?? [];
                for (const label of ['Ball Possession', 'Shots on Goal', 'Total Shots', 'Fouls', 'Corner Kicks']) {
                  const hStat = homeStats.find((s: any) => s.type === label);
                  const aStat = awayStats.find((s: any) => s.type === label);
                  if (hStat && aStat) {
                    statistics.push({
                      label: label === 'Ball Possession' ? 'Possession' : label === 'Shots on Goal' ? 'Shots on Target' : label,
                      home: parseInt(String(hStat.value ?? '0').replace('%', '')) || 0,
                      away: parseInt(String(aStat.value ?? '0').replace('%', '')) || 0,
                    });
                  }
                }
              }

              return { fixtureId: fix.id, events, statistics, substitutions };
            })
          );

          for (const result of results) {
            if (result.status === 'fulfilled') {
              const { fixtureId, events, statistics, substitutions } = result.value;
              // Persist in cache (FT events never change)
              eventCache[fixtureId] = { events, statistics, substitutions };
              const fix = fixtures.find(f => f.id === fixtureId);
              if (fix) {
                if (events.length > 0) fix.events = events;
                if (statistics.length > 0) fix.statistics = statistics;
                if (substitutions.length > 0) fix.substitutions = substitutions;
              }
            }
          }
        }
      }
    }

    // Dynamic standings adjustment based on live or recently-finished matches
    if (groups.length > 0 && fixtures.length > 0) {
      groups.forEach((group) => {
        group.teams.forEach((team) => {
          const teamNameLower = team.name.toLowerCase().trim();
          
          // Get all matches for this team that have started (live or finished)
          const teamFixtures = fixtures.filter(f => {
            const homeName = f.teams.home.name.toLowerCase().trim();
            const awayName = f.teams.away.name.toLowerCase().trim();
            const isHome = homeName === teamNameLower;
            const isAway = awayName === teamNameLower;
            const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(f.status.short);
            const isFinished = f.status.short === 'FT';
            return (isHome || isAway) && (isLive || isFinished);
          });

          // Sort chronologically
          teamFixtures.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          const standingsPlayed = team.played;

          // Apply adjustment for any match at index i >= standingsPlayed
          for (let i = standingsPlayed; i < teamFixtures.length; i++) {
            const fix = teamFixtures[i];
            const isHome = fix.teams.home.name.toLowerCase().trim() === teamNameLower;
            
            const gHome = fix.goals.home ?? 0;
            const gAway = fix.goals.away ?? 0;

            team.played += 1;
            if (isHome) {
              team.goalsFor += gHome;
              team.goalsAgainst += gAway;
              if (gHome > gAway) {
                team.won += 1;
                team.points += 3;
              } else if (gHome < gAway) {
                team.lost += 1;
              } else {
                team.drawn += 1;
                team.points += 1;
              }
            } else {
              team.goalsFor += gAway;
              team.goalsAgainst += gHome;
              if (gAway > gHome) {
                team.won += 1;
                team.points += 3;
              } else if (gAway < gHome) {
                team.lost += 1;
              } else {
                team.drawn += 1;
                team.points += 1;
              }
            }
            team.goalDifference = team.goalsFor - team.goalsAgainst;
          }
        });

        // Re-sort the group's teams array according to 2026 World Cup rules:
        // 1. Points (descending)
        // 2. Goal Difference (descending)
        // 3. Goals Scored (descending)
        group.teams.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
      });
    }

    const responsePayload = {
      success: true,
      lastUpdated: new Date().toISOString(),
      groups,
      fixtures
    };

    // Cache the response globally
    cachedResponse = {
      timestamp: Date.now(),
      data: responsePayload
    };

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error(`[API Secure Backend Error]:`, error);

    // Serve stale cache if available when an error happens
    if (cachedResponse) {
      console.log(`[API Secure Cache]: Serving stale cache on request failure.`);
      return NextResponse.json({
        ...cachedResponse.data,
        warning: `API connection issue (${error.message || 'fetch error'}). Serving stale cache.`
      });
    }

    return NextResponse.json({
      success: true,
      lastUpdated: new Date().toISOString(),
      groups: mockWorldCupGroups,
      fixtures: mockWorldCupFixtures,
      warning: `Failed to fetch live API data (${error.message || 'API connection issue'}). Displaying pre-cached mock data.`
    });
  }
}
