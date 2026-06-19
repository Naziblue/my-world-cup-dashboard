export interface Team {
  name: string;
  code: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  flag: string;
}

export interface Group {
  letter: string; // 'A' through 'L'
  teams: Team[];
}

export interface Fixture {
  id: number;
  date: string;
  status: {
    long: string;
    short: string;
    elapsed: number | null;
  };
  teams: {
    home: {
      name: string;
      code: string;
      flag: string;
      logo: string;
    };
    away: {
      name: string;
      code: string;
      flag: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

export interface StandingsResponse {
  success: boolean;
  lastUpdated: string;
  groups: Group[];
  fixtures: Fixture[];
}

