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
  apiId?: number;
}

export interface SquadPlayer {
  name: string;
  age: number | null;
  number: number | null;
  position: string;
  photo: string;
}

export interface Coach {
  name: string;
  photo: string;
  nationality: string;
}

export interface TeamSquadData {
  coach: Coach | null;
  players: SquadPlayer[];
}

export interface Group {
  letter: string; // 'A' through 'L'
  teams: Team[];
}

export interface MatchEvent {
  minute: number;
  team: 'home' | 'away';
  type: 'goal' | 'red-card' | 'yellow-card';
  player: string;
  assist?: string;
}

export interface MatchStatistic {
  label: string;
  home: number;
  away: number;
}

export interface Substitution {
  minute: number;
  team: 'home' | 'away';
  playerIn: string;
  playerOut: string;
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
  events?: MatchEvent[];
  statistics?: MatchStatistic[];
  substitutions?: Substitution[];
}

export interface StandingsResponse {
  success: boolean;
  lastUpdated: string;
  groups: Group[];
  fixtures: Fixture[];
}

