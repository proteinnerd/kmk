const FPL_BASE_URL = 'https://fantasy.premierleague.com/api';

interface FplTeam {
  entry_name: string;
  entry_id: number;
}

interface FplGameweekHistory {
  event: number;
  points: number;
  total_points: number;
  rank: number;
  rank_sort: number;
  overall_rank: number;
  bank: number;
  value: number;
  event_transfers: number;
  event_transfers_cost: number;
  points_on_bench: number;
}

interface TeamHistory {
  entry_name: string;
  history: FplGameweekHistory[];
}

export interface FplLeagueStanding {
  entry_name: string;
  player_name: string;
  rank: number;
  last_rank: number;
  total: number;
  entry: number;
  event_total: number;
}

export interface ProcessedStanding {
  position: number;
  name: string;
  points: number;
  penalty: number;
}

export interface ProcessedTotalPenalties {
  name: string;
  totalPoints: number;
  totalPenalty: number;
  entry_id: number;
}

export interface HistoricalStanding {
  position: number;
  entry_name: string;
  event_total: number;
  penalty: number;
  entry_id: number;
}

export interface GameweekData {
  gameweek: number;
  standings: HistoricalStanding[];
}

const calculatePenalty = (position: number): number => {
  switch (position) {
    case 1: return 0;
    case 2: return 100;
    case 3: return 200;
    default: return 400;
  }
};

async function fetchHistoricalGameweeks(leagueId: number, startGw: number, currentGw: number): Promise<GameweekData[]> {
  const gameweeks = [];
  
  // First, get the league details to get team IDs
  const leagueResponse = await fetch(`${FPL_BASE_URL}/leagues-classic/${leagueId}/standings/`);
  const leagueData = await leagueResponse.json();
  const teams: FplTeam[] = leagueData.standings.results.map((team: any) => ({
    entry_name: team.entry_name,
    entry_id: team.entry
  }));

  // For each team, fetch their history
  const teamHistories = await Promise.all(teams.map(async (team: FplTeam) => {
    try {
      const historyResponse = await fetch(`${FPL_BASE_URL}/entry/${team.entry_id}/history/`);
      const historyData = await historyResponse.json();
      return {
        entry_name: team.entry_name,
        history: historyData.current as FplGameweekHistory[]
      };
    } catch (error) {
      console.error(`Error fetching history for team ${team.entry_name}:`, error);
      return null;
    }
  }));

  // Process each gameweek
  for (let gw = startGw; gw <= currentGw; gw++) {
    const gwResults = teamHistories
      .filter((th): th is TeamHistory => th !== null)
      .map(team => {
        const gwData = team.history.find(h => h.event === gw);
        return {
          entry_name: team.entry_name,
          event_total: gwData?.points || 0,
          rank: gwData?.rank || 0,
          entry_id: teams.find(t => t.entry_name === team.entry_name)?.entry_id || 0
        };
      });

    // Sort by points for this gameweek
    const sortedResults = [...gwResults].sort((a, b) => b.event_total - a.event_total);
    
    // Add position and penalty based on sorted order
    const standingsWithPosition = sortedResults.map((result, index) => ({
      position: index + 1,
      entry_name: result.entry_name,
      event_total: result.event_total,
      penalty: calculatePenalty(index + 1),
      entry_id: result.entry_id
    }));

    gameweeks.push({
      gameweek: gw,
      standings: standingsWithPosition
    });
  }
  
  return gameweeks;
}

export const fetchLeagueStandings = async (leagueId: number): Promise<{
  leagueName: string;
  gameweekNumber: number;
  currentGameweek: ProcessedStanding[];
  totalPenalties: ProcessedTotalPenalties[];
  historicalGameweeks: GameweekData[];
}> => {
  try {
    // Get current gameweek
    const bootstrapResponse = await fetch(`${FPL_BASE_URL}/bootstrap-static/`);
    const bootstrapData = await bootstrapResponse.json();
    const currentGameweek = bootstrapData.events.find((event: any) => event.is_current)?.id;

    // Fetch league standings
    const response = await fetch(`${FPL_BASE_URL}/leagues-classic/${leagueId}/standings/`);
    const data = await response.json();
    
    const standings = data.standings.results as FplLeagueStanding[];
    const leagueName = data.league.name;
    
    // Process current gameweek data
    const currentGameweekData = standings.map((standing, index) => ({
      position: index + 1,
      name: standing.entry_name,
      points: standing.event_total,
      penalty: calculatePenalty(index + 1)
    }));

    // Fetch historical gameweeks
    const START_GAMEWEEK = 1;
    const historicalGameweeks = await fetchHistoricalGameweeks(leagueId, START_GAMEWEEK, currentGameweek);

    // Calculate accumulated penalties
    const penaltiesByManager: { [key: string]: { penalties: number; points: number; entry_id: number } } = {};

    // Initialize managers
    standings.forEach(standing => {
      penaltiesByManager[standing.entry_name] = {
        penalties: 0,
        points: standing.total,
        entry_id: standing.entry
      };
    });

    // Calculate penalties for each historical gameweek
    historicalGameweeks.forEach(gw => {
      gw.standings.forEach(standing => {
        const penalty = calculatePenalty(standing.position);
        if (penaltiesByManager[standing.entry_name] !== undefined) {
          penaltiesByManager[standing.entry_name].penalties += penalty;
        }
      });
    });

    // Create total penalties data
    const totalPenaltiesData = Object.entries(penaltiesByManager).map(([name, data]) => ({
      name,
      totalPoints: data.points,
      totalPenalty: data.penalties,
      entry_id: data.entry_id
    }));

    // Sort by total penalties (highest to lowest)
    totalPenaltiesData.sort((a, b) => b.totalPenalty - a.totalPenalty);

    // Add entry_id to historical gameweek standings
    const historicalGameweeksWithEntryIds = historicalGameweeks.map(gw => ({
      ...gw,
      standings: gw.standings.map(standing => ({
        ...standing,
        entry_id: penaltiesByManager[standing.entry_name].entry_id
      }))
    }));

    return {
      leagueName,
      gameweekNumber: currentGameweek,
      currentGameweek: currentGameweekData,
      totalPenalties: totalPenaltiesData,
      historicalGameweeks: historicalGameweeksWithEntryIds
    };
  } catch (error) {
    console.error('Error fetching FPL data:', error);
    throw error;
  }
}; 