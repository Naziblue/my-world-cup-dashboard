import { Group, Team } from '@/types';

export interface BracketMatch {
  id: number;
  home: Team;
  away: Team;
  homeLabel: string; // seed label (e.g. "Winner Group E" or "1E")
  awayLabel: string; // seed label (e.g. "Runner-up Group B" or "2B")
  homeScore?: number | null;
  awayScore?: number | null;
  isCompleted?: boolean;
}

export const TBD_TEAM: Team = {
  name: 'TBD',
  code: 'TBD',
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0,
  flag: '🏳️'
};

const THIRD_PLACE_SLOTS = [
  { id: 75, allowed: ['A', 'B', 'C', 'D', 'F'] }, // plays Winner E
  { id: 78, allowed: ['C', 'D', 'F', 'G', 'H'] }, // plays Winner I
  { id: 79, allowed: ['C', 'E', 'F', 'H', 'I'] }, // plays Winner A (Mexico)
  { id: 80, allowed: ['E', 'H', 'I', 'J', 'K'] }, // plays Winner L
  { id: 81, allowed: ['A', 'E', 'H', 'I', 'J'] }, // plays Winner G
  { id: 82, allowed: ['B', 'E', 'F', 'I', 'J'] }, // plays Winner D
  { id: 85, allowed: ['E', 'F', 'G', 'I', 'J'] }, // plays Winner B
  { id: 88, allowed: ['D', 'E', 'I', 'J', 'L'] }  // plays Winner K
];

export function getBestThirdPlacedTeams(groups: Group[]): { groupLetter: string; team: Team }[] {
  const thirdPlaceTeams = groups.map((g) => {
    const team = g.teams[2] || { ...TBD_TEAM, name: `3rd Group ${g.letter}`, code: `3${g.letter}` };
    return {
      groupLetter: g.letter,
      team: { ...team }
    };
  });

  // Sort by World Cup rules: Points, GD, GF
  thirdPlaceTeams.sort((a, b) => {
    if (b.team.points !== a.team.points) {
      return b.team.points - a.team.points;
    }
    if (b.team.goalDifference !== a.team.goalDifference) {
      return b.team.goalDifference - a.team.goalDifference;
    }
    return b.team.goalsFor - a.team.goalsFor;
  });

  return thirdPlaceTeams;
}

export function allocateThirdPlaceTeams(
  groups: Group[]
): Record<number, Team> {
  const bestThird = getBestThirdPlacedTeams(groups).slice(0, 8);
  const assignment: Record<number, Team> = {};
  const usedIndices = new Set<number>();

  // Backtracking DFS to find perfect bipartite matching matching FIFA constraints
  function dfs(slotIndex: number): boolean {
    if (slotIndex === THIRD_PLACE_SLOTS.length) {
      return true;
    }

    const slot = THIRD_PLACE_SLOTS[slotIndex];
    for (let i = 0; i < bestThird.length; i++) {
      if (usedIndices.has(i)) continue;
      
      const { groupLetter, team } = bestThird[i];
      if (slot.allowed.includes(groupLetter)) {
        usedIndices.add(i);
        assignment[slot.id] = team;
        
        if (dfs(slotIndex + 1)) {
          return true;
        }
        
        usedIndices.delete(i);
        delete assignment[slot.id];
      }
    }
    return false;
  }

  // Attempt DFS first. If it succeeds, return the perfect matching.
  if (dfs(0)) {
    return assignment;
  }

  // Fallback: Stable greedy matcher if DFS fails (e.g. edge cases with TBD teams)
  console.warn('[Bracket Logic]: Perfect bipartite matching failed, falling back to greedy allocation.');
  const fallbackAssignment: Record<number, Team> = {};
  const fallbackUsed = new Set<number>();

  for (const slot of THIRD_PLACE_SLOTS) {
    let matched = false;
    for (let i = 0; i < bestThird.length; i++) {
      if (!fallbackUsed.has(i) && slot.allowed.includes(bestThird[i].groupLetter)) {
        fallbackAssignment[slot.id] = bestThird[i].team;
        fallbackUsed.add(i);
        matched = true;
        break;
      }
    }
    if (!matched) {
      // If we couldn't match, take the first unused team to avoid empty slots
      for (let i = 0; i < bestThird.length; i++) {
        if (!fallbackUsed.has(i)) {
          fallbackAssignment[slot.id] = bestThird[i].team;
          fallbackUsed.add(i);
          break;
        }
      }
    }
  }

  return fallbackAssignment;
}

export function buildRoundOf32Matches(groups: Group[]): BracketMatch[] {
  // Helpers to safely get 1st, 2nd, 3rd from groups
  const get1st = (letter: string) => {
    const g = groups.find((grp) => grp.letter === letter);
    return g?.teams[0] ? { ...g.teams[0] } : { ...TBD_TEAM, name: `Winner Group ${letter}`, code: `1${letter}` };
  };

  const get2nd = (letter: string) => {
    const g = groups.find((grp) => grp.letter === letter);
    return g?.teams[1] ? { ...g.teams[1] } : { ...TBD_TEAM, name: `Runner-up Group ${letter}`, code: `2${letter}` };
  };

  // Get allocated third placed teams
  const thirdPlaceAllocation = allocateThirdPlaceTeams(groups);

  // Matchups according to 2026 World Cup Bracket
  return [
    {
      id: 73,
      home: get2nd('A'),
      away: get2nd('B'),
      homeLabel: 'Runner-up Group A',
      awayLabel: 'Runner-up Group B'
    },
    {
      id: 74,
      home: get1st('C'),
      away: get2nd('F'),
      homeLabel: 'Winner Group C',
      awayLabel: 'Runner-up Group F'
    },
    {
      id: 75,
      home: get1st('E'),
      away: thirdPlaceAllocation[75] || { ...TBD_TEAM, name: '3rd Group A/B/C/D/F', code: '3rd' },
      homeLabel: 'Winner Group E',
      awayLabel: '3rd Group A/B/C/D/F'
    },
    {
      id: 76,
      home: get1st('F'),
      away: get2nd('C'),
      homeLabel: 'Winner Group F',
      awayLabel: 'Runner-up Group C'
    },
    {
      id: 77,
      home: get2nd('E'),
      away: get2nd('I'),
      homeLabel: 'Runner-up Group E',
      awayLabel: 'Runner-up Group I'
    },
    {
      id: 78,
      home: get1st('I'),
      away: thirdPlaceAllocation[78] || { ...TBD_TEAM, name: '3rd Group C/D/F/G/H', code: '3rd' },
      homeLabel: 'Winner Group I',
      awayLabel: '3rd Group C/D/F/G/H'
    },
    {
      id: 79,
      home: get1st('A'),
      away: thirdPlaceAllocation[79] || { ...TBD_TEAM, name: '3rd Group C/E/F/H/I', code: '3rd' },
      homeLabel: 'Winner Group A',
      awayLabel: '3rd Group C/E/F/H/I'
    },
    {
      id: 80,
      home: get1st('L'),
      away: thirdPlaceAllocation[80] || { ...TBD_TEAM, name: '3rd Group E/H/I/J/K', code: '3rd' },
      homeLabel: 'Winner Group L',
      awayLabel: '3rd Group E/H/I/J/K'
    },
    {
      id: 81,
      home: get1st('G'),
      away: thirdPlaceAllocation[81] || { ...TBD_TEAM, name: '3rd Group A/E/H/I/J', code: '3rd' },
      homeLabel: 'Winner Group G',
      awayLabel: '3rd Group A/E/H/I/J'
    },
    {
      id: 82,
      home: get1st('D'),
      away: thirdPlaceAllocation[82] || { ...TBD_TEAM, name: '3rd Group B/E/F/I/J', code: '3rd' },
      homeLabel: 'Winner Group D',
      awayLabel: '3rd Group B/E/F/I/J'
    },
    {
      id: 83,
      home: get1st('H'),
      away: get2nd('J'),
      homeLabel: 'Winner Group H',
      awayLabel: 'Runner-up Group J'
    },
    {
      id: 84,
      home: get2nd('K'),
      away: get2nd('L'),
      homeLabel: 'Runner-up Group K',
      awayLabel: 'Runner-up Group L'
    },
    {
      id: 85,
      home: get1st('B'),
      away: thirdPlaceAllocation[85] || { ...TBD_TEAM, name: '3rd Group E/F/G/I/J', code: '3rd' },
      homeLabel: 'Winner Group B',
      awayLabel: '3rd Group E/F/G/I/J'
    },
    {
      id: 86,
      home: get2nd('D'),
      away: get2nd('G'),
      homeLabel: 'Runner-up Group D',
      awayLabel: 'Runner-up Group G'
    },
    {
      id: 87,
      home: get1st('J'),
      away: get2nd('H'),
      homeLabel: 'Winner Group J',
      awayLabel: 'Runner-up Group H'
    },
    {
      id: 88,
      home: get1st('K'),
      away: thirdPlaceAllocation[88] || { ...TBD_TEAM, name: '3rd Group D/E/I/J/L', code: '3rd' },
      homeLabel: 'Winner Group K',
      awayLabel: '3rd Group D/E/I/J/L'
    }
  ];
}
