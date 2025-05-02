'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TeamPenaltyGraph from '@/components/TeamPenaltyGraph';
import TeamSheet from '@/components/TeamSheet';

interface Player {
  element: number;
  player_name: string;
  position: number;
  team_short_name: string;
  player_team_short_name: string;
  is_captain: boolean;
  is_vice_captain: boolean;
  multiplier: number;
  points: number;
  raw_points: number;
}

interface TeamData {
  id: number;
  name: string;
  player_first_name: string;
  player_last_name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  current_event: number;
  picks: Player[];
  active_chip: string | null;
  event_points: number;
  event_transfers: number;
  event_transfers_cost: number;
  gameweek: number;
  points_on_bench: number;
}

interface GameweekStanding {
  entry_name: string;
  position: number;
  event_total: number;
  penalty: number;
}

interface GameweekData {
  gameweek: number;
  standings: GameweekStanding[];
}

const positionMap = {
  1: 'GK',
  2: 'DEF',
  3: 'MID',
  4: 'FWD'
};

async function getTeamData(teamId: string, gameweek?: string | null) {
  try {
    const url = gameweek 
      ? `/api/fpl?teamId=${teamId}&gameweek=${gameweek}`
      : `/api/fpl?teamId=${teamId}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch team data');
    }
    return response.json();
  } catch (err) {
    console.error('Error fetching team data:', err);
    throw new Error('Failed to load team data');
  }
}

async function getLeagueData() {
  try {
    const response = await fetch(`/api/fpl?leagueId=4154`);
    if (!response.ok) {
      throw new Error('Failed to fetch league data');
    }
    return response.json();
  } catch (err) {
    console.error('Error fetching league data:', err);
    throw new Error('Failed to load league data');
  }
}

export default function TeamPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [leagueData, setLeagueData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current gameweek from search params or team data
  const currentGameweek = searchParams.get('gameweek') 
    ? parseInt(searchParams.get('gameweek')!) 
    : teamData?.gameweek || 0;

  const handleGameweekChange = async (direction: 'prev' | 'next') => {
    if (!teamData) return;
    
    const newGameweek = direction === 'prev' ? currentGameweek - 1 : currentGameweek + 1;
    
    // Ensure gameweek is within valid range (1 to 38)
    if (newGameweek >= 1 && newGameweek <= 38) {
      try {
        setLoading(true);
        const newTeamData = await getTeamData(params.id as string, newGameweek.toString());
        setTeamData(newTeamData);
        
        // Create new URLSearchParams
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('gameweek', newGameweek.toString());
        
        // Update URL without navigation
        router.push(`/team/${params.id}?${newSearchParams.toString()}`);
      } catch (err) {
        console.error('Error updating gameweek:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Effect to handle initial data load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const gameweek = searchParams.get('gameweek');
        const [team, league] = await Promise.all([
          getTeamData(params.id as string, gameweek),
          getLeagueData()
        ]);
        setTeamData(team);
        setLeagueData(league);
        setError(null);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]); // Only re-run if team ID changes

  // Calculate total penalties up to current gameweek
  const calculateTotalPenalties = () => {
    if (!leagueData?.historicalGameweeks || !teamData) return 0;
    
    return leagueData.historicalGameweeks
      .filter((gw: GameweekData) => gw.gameweek <= currentGameweek)
      .reduce((total: number, gw: GameweekData) => {
        const teamStanding = gw.standings.find((s: GameweekStanding) => s.entry_name === teamData.name);
        return total + (teamStanding?.penalty || 0);
      }, 0);
  };

  if (loading) {
    return (
      <div className="bg-[#1a1d24] min-h-screen flex items-center justify-center">
        <div className="text-white">Loading team data...</div>
      </div>
    );
  }

  if (error || !teamData || !leagueData) {
    return (
      <div className="bg-[#1a1d24] min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || 'Failed to load data'}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1d24] min-h-screen">
      <div className="max-w-[1200px] mx-auto p-4">
        <div className="flex flex-col gap-4">
          <Link 
            href="/"
            className="text-blue-400 hover:text-blue-300 mb-4 self-start"
          >
            ← Back to League
          </Link>

          <div className="bg-white/5 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-white mb-4">{teamData.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 p-4 rounded">
                <h2 className="text-lg text-white mb-2">Manager</h2>
                <p className="text-gray-300">
                  {teamData.player_first_name} {teamData.player_last_name}
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded">
                <h2 className="text-lg text-white mb-2">Overall</h2>
                <div className="flex flex-col gap-2">
                  <p className="text-gray-300">
                    Points: {teamData.summary_overall_points}
                  </p>
                  <p className="text-gray-300">
                    Rank: {teamData.summary_overall_rank.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <TeamPenaltyGraph 
              teamName={teamData.name}
              gameweeks={leagueData.historicalGameweeks}
              selectedGameweek={currentGameweek}
            />

            <div className="bg-white/5 p-4 rounded mb-6">
              <h2 className="text-lg text-white mb-2">Gameweek {teamData.gameweek}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <p className="text-gray-300">Points: {teamData.event_points}</p>
                <p className="text-gray-300">Transfers: {teamData.event_transfers}</p>
                <p className="text-gray-300">Transfer Cost: {teamData.event_transfers_cost}</p>
              </div>
              {teamData.active_chip && (
                <p className="text-blue-400 mt-2">Active Chip: {teamData.active_chip}</p>
              )}
            </div>

            <div className="bg-white/5 p-4 rounded">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleGameweekChange('prev')}
                    disabled={currentGameweek <= 1}
                    className={`text-white px-4 py-2 rounded ${
                      currentGameweek <= 1 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-white/10'
                    }`}
                  >
                    ←
                  </button>
                  <h2 className="text-lg text-white">Team for Gameweek {currentGameweek}</h2>
                  <button
                    onClick={() => handleGameweekChange('next')}
                    disabled={currentGameweek >= 38}
                    className={`text-white px-4 py-2 rounded ${
                      currentGameweek >= 38 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-white/10'
                    }`}
                  >
                    →
                  </button>
                </div>
              </div>
              <TeamSheet 
                players={teamData.picks} 
                points_on_bench={teamData.points_on_bench} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 