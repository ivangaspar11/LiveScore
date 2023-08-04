export interface MatchDetails {
    eventForMatches: EventForMatch[];
    matchId: number;
  }
  
  export interface EventForMatch {
    timeElapsed: number;
    teamName: string;
    playerName: string;
    type: string;
    detail: string;
  }