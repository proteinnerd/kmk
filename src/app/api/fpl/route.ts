import { NextResponse } from 'next/server';
import { fetchLeagueStandings } from '@/services/fplApi';

async function fetchBootstrapData() {
  try {
    const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
    if (!response.ok) {
      throw new Error(`Failed to fetch bootstrap data: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching bootstrap data:', error);
    throw new Error('Failed to connect to Fantasy Premier League API. Please try again later.');
  }
}

async function fetchTeamData(teamId: string, gameweek?: string) {
  // Fetch basic team info
  const teamResponse = await fetch(`https://fantasy.premierleague.com/api/entry/${teamId}/`);
  if (!teamResponse.ok) {
    throw new Error('Failed to fetch team data');
  }
  const teamData = await teamResponse.json();

  // Fetch team picks for the specified gameweek or current gameweek
  const targetGameweek = gameweek || teamData.current_event;
  const picksResponse = await fetch(
    `https://fantasy.premierleague.com/api/entry/${teamId}/event/${targetGameweek}/picks/`
  );
  if (!picksResponse.ok) {
    throw new Error('Failed to fetch team picks');
  }
  const picksData = await picksResponse.json();

  // Fetch live gameweek data for current points
  const liveGameweekResponse = await fetch(
    `https://fantasy.premierleague.com/api/event/${targetGameweek}/live/`
  );
  if (!liveGameweekResponse.ok) {
    throw new Error('Failed to fetch live gameweek data');
  }
  const liveGameweekData = await liveGameweekResponse.json();

  // Fetch fixtures for the gameweek
  const fixturesResponse = await fetch(
    `https://fantasy.premierleague.com/api/fixtures/?event=${targetGameweek}`
  );
  if (!fixturesResponse.ok) {
    throw new Error('Failed to fetch fixtures data');
  }
  const fixturesData = await fixturesResponse.json();

  // Fetch bootstrap data for player information
  const bootstrapData = await fetchBootstrapData();
  const players = bootstrapData.elements;
  const teams = bootstrapData.teams;

  // Create a map of team ID to team info
  const teamMap = teams.reduce((acc: { [key: number]: any }, team: any) => {
    acc[team.id] = team;
    return acc;
  }, {});

  // Create a map of player ID to fixture
  const playerFixtureMap = players.reduce((acc: { [key: number]: any }, player: any) => {
    const fixture = fixturesData.find((f: any) => 
      f.team_h === player.team || f.team_a === player.team
    );
    if (fixture) {
      const isHome = fixture.team_h === player.team;
      const opposingTeamId = isHome ? fixture.team_a : fixture.team_h;
      acc[player.id] = {
        fixture,
        opposingTeam: teamMap[opposingTeamId],
        isHome
      };
    }
    return acc;
  }, {});

  // Enhance picks with player details and live points
  const enhancedPicks = picksData.picks.map((pick: any) => {
    const playerDetails = players.find((p: any) => p.id === pick.element);
    const liveData = liveGameweekData.elements.find((e: any) => e.id === pick.element);
    
    // Calculate raw points before multiplier
    const rawPoints = liveData ? liveData.stats.total_points : 0;
    
    // For bench players (multiplier = 0), we still want to show their actual points
    const points = pick.multiplier === 0 ? rawPoints : rawPoints * pick.multiplier;
    
    const fixtureInfo = playerFixtureMap[pick.element];

    // Get opponent team short name
    const opponentTeamShortName = fixtureInfo?.opposingTeam?.short_name || 'N/A';
    const homeOrAway = fixtureInfo ? (fixtureInfo.isHome ? '(H)' : '(A)') : '';
    const displayTeam = `${opponentTeamShortName}${homeOrAway}`;

    // Get player's actual team info
    const playerTeam = bootstrapData.teams.find((t: any) => t.code === playerDetails?.team_code);

    console.log(`Player: ${playerDetails?.web_name}, Raw Points: ${rawPoints}, Multiplier: ${pick.multiplier}, Final Points: ${points}, Position: ${pick.position}`);

    return {
      ...pick,
      player_name: playerDetails?.web_name || 'Unknown',
      team_code: playerDetails?.team_code,
      position: playerDetails?.element_type,
      team_short_name: displayTeam,
      player_team_short_name: playerTeam?.short_name || 'UNK',
      is_captain: pick.is_captain,
      is_vice_captain: pick.is_vice_captain,
      multiplier: pick.multiplier,
      points: points,
      raw_points: rawPoints
    };
  });

  // Define pick type
  interface Pick {
    multiplier: number;
    raw_points: number;
    [key: string]: any;
  }

  // Sort picks by position and then by player name
  const sortedPicks = enhancedPicks.sort((a: any, b: any) => {
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    return a.player_name.localeCompare(b.player_name);
  });

  // Calculate bench points by summing raw points of bench players
  const benchPoints = enhancedPicks
    .filter((pick: Pick) => pick.multiplier === 0)
    .reduce((sum: number, pick: Pick) => sum + pick.raw_points, 0);

  return {
    ...teamData,
    picks: sortedPicks,
    active_chip: picksData.active_chip,
    event_points: picksData.entry_history.points,
    event_transfers: picksData.entry_history.event_transfers,
    event_transfers_cost: picksData.entry_history.event_transfers_cost,
    points_on_bench: benchPoints,
    gameweek: parseInt(targetGameweek)
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const teamId = searchParams.get('teamId');
    const gameweek = searchParams.get('gameweek');
    
    if (!leagueId && !teamId) {
      return NextResponse.json({ error: 'League ID or Team ID is required' }, { status: 400 });
    }

    if (teamId) {
      try {
        const data = await fetchTeamData(teamId, gameweek || undefined);
        return NextResponse.json(data);
      } catch (error) {
        console.error('Error fetching team data:', error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Failed to fetch team data' },
          { status: 500 }
        );
      }
    }

    try {
      const data = await fetchLeagueStandings(parseInt(leagueId!));
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error fetching league standings:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch league standings' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in FPL API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 