import { NextResponse } from 'next/server';
import { Group, Team, Fixture } from '@/types';

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
  {
    id: 1489390,
    date: '2026-06-19T22:00:00+00:00',
    status: {
      long: 'Halftime',
      short: 'HT',
      elapsed: 45
    },
    teams: {
      home: { name: 'Scotland', code: 'SCO', flag: '🏴\uDB40\uDC67\uDB40\uDC62\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74\uDB40\uDC7F', logo: 'https://media.api-sports.io/football/teams/1533.png' },
      away: { name: 'Morocco', code: 'MAR', flag: '🇲🇦', logo: 'https://media.api-sports.io/football/teams/23.png' }
    },
    goals: { home: 0, away: 1 }
  },
  {
    id: 1489391,
    date: '2026-06-19T19:00:00+00:00',
    status: {
      long: 'Match Finished',
      short: 'FT',
      elapsed: 90
    },
    teams: {
      home: { name: 'United States', code: 'USA', flag: '🇺🇸', logo: 'https://media.api-sports.io/football/teams/32.png' },
      away: { name: 'Australia', code: 'AUS', flag: '🇦🇺', logo: 'https://media.api-sports.io/football/teams/22.png' }
    },
    goals: { home: 2, away: 0 }
  },
  {
    id: 1489388,
    date: '2026-06-19T01:00:00+00:00',
    status: {
      long: 'Match Finished',
      short: 'FT',
      elapsed: 90
    },
    teams: {
      home: { name: 'Mexico', code: 'MEX', flag: '🇲🇽', logo: 'https://media.api-sports.io/football/teams/1533.png' },
      away: { name: 'Korea Republic', code: 'KOR', flag: '🇰🇷', logo: 'https://media.api-sports.io/football/teams/23.png' }
    },
    goals: { home: 1, away: 0 }
  },
  {
    id: 1489389,
    date: '2026-06-20T00:30:00+00:00',
    status: {
      long: 'Not Started',
      short: 'NS',
      elapsed: null
    },
    teams: {
      home: { name: 'Brazil', code: 'BRA', flag: '🇧🇷', logo: 'https://media.api-sports.io/football/teams/1.png' },
      away: { name: 'Haiti', code: 'HAI', flag: '🇭🇹', logo: 'https://media.api-sports.io/football/teams/4673.png' }
    },
    goals: { home: null, away: null }
  },
  {
    id: 1539006,
    date: '2026-06-20T03:00:00+00:00',
    status: {
      long: 'Not Started',
      short: 'NS',
      elapsed: null
    },
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
              flag: metadata.flag
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
        .filter((fix: Fixture) => {
          // Keep active live games (1H, 2H, HT, ET, P, etc.)
          const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(fix.status.short);
          if (isLive) return true;
          
          // Keep matches close to June 19, 2026 (June 17 to 22, to cover all timezone offsets)
          const matchDate = fix.date.substring(0, 10);
          return ['2026-06-17', '2026-06-18', '2026-06-19', '2026-06-20', '2026-06-21', '2026-06-22'].includes(matchDate);
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
