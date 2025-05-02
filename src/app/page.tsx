'use client';

import { ProcessedStanding, ProcessedTotalPenalties, GameweekData } from '../services/fplApi';
import styles from './table.module.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PenaltyGraph from '@/components/PenaltyGraph';
import { useRouter, useSearchParams } from 'next/navigation';
import TrackVisualization from '@/components/TrackVisualization';

async function getLeagueData(leagueId: number) {
  const response = await fetch(`/api/fpl?leagueId=${leagueId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch league data');
  }
  return response.json();
}

const TeamLink = ({ name, entryId, gameweek }: { name: string; entryId: number; gameweek: number }) => (
  <Link
    href={`/team/${entryId}?gameweek=${gameweek}`}
    className="text-blue-400 hover:text-blue-300 hover:underline"
  >
    {name}
  </Link>
);

export default function Home() {
  const LEAGUE_ID = 4154;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<{
    leagueName: string;
    gameweekNumber: number;
    currentGameweek: ProcessedStanding[];
    totalPenalties: ProcessedTotalPenalties[];
    historicalGameweeks: GameweekData[];
  } | null>(null);
  const [selectedGameweek, setSelectedGameweek] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getLeagueData(LEAGUE_ID);
        setData(result);
        // Set initial gameweek from URL or latest available
        const gwFromUrl = searchParams.get('gameweek');
        const maxGw = Math.max(...result.historicalGameweeks.map((gw: GameweekData) => gw.gameweek));
        setSelectedGameweek(gwFromUrl ? parseInt(gwFromUrl) : maxGw);
        setError(null);
      } catch (err) {
        setError('Failed to fetch league data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Only run on mount

  if (loading) {
    return (
      <div className="bg-[#1a1d24] min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !data || selectedGameweek === null) {
    return (
      <div className="bg-[#1a1d24] min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || 'Something went wrong'}</div>
      </div>
    );
  }

  const sortedHistoricalGameweeks = [...data.historicalGameweeks].sort((a, b) => b.gameweek - a.gameweek);
  const currentHistoricalGameweek = sortedHistoricalGameweeks.find(gw => gw.gameweek === selectedGameweek);
  const maxGw = Math.max(...sortedHistoricalGameweeks.map(gw => gw.gameweek));
  const minGw = Math.min(...sortedHistoricalGameweeks.map(gw => gw.gameweek));

  const handlePrevGw = () => {
    if (selectedGameweek > minGw) {
      const newGameweek = selectedGameweek - 1;
      setSelectedGameweek(newGameweek);
      
      // Update URL without navigation
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('gameweek', newGameweek.toString());
      router.push(`/?${newSearchParams.toString()}`);
    }
  };

  const handleNextGw = () => {
    if (selectedGameweek < maxGw) {
      const newGameweek = selectedGameweek + 1;
      setSelectedGameweek(newGameweek);
      
      // Update URL without navigation
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('gameweek', newGameweek.toString());
      router.push(`/?${newSearchParams.toString()}`);
    }
  };

  return (
    <div className="bg-[#1a1d24] min-h-screen">
      <div className="max-w-[1200px] mx-auto p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-full flex justify-start mb-2">
            <Link
              href="/pace-calculator"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <span>⏱️</span>
              <span>PaceCalc</span>
            </Link>
          </div>

          <h1 className="text-lg font-bold text-white text-center">{data.leagueName}</h1>

          {/* Track Visualization */}
          <div className="w-full">
            <TrackVisualization 
              totalPenalties={data.historicalGameweeks
                .filter(gw => gw.gameweek <= selectedGameweek)
                .reduce((total, gw) => {
                  return total + gw.standings.reduce((gwTotal, standing) => gwTotal + standing.penalty, 0);
                }, 0)
              }
              runners={data.historicalGameweeks
                .filter(gw => gw.gameweek === selectedGameweek)
                .flatMap(gw => gw.standings)
                .map(standing => ({
                  name: standing.entry_name,
                  entry_id: standing.entry_id,
                  penalty: data.historicalGameweeks
                    .filter(gw => gw.gameweek <= selectedGameweek)
                    .reduce((total, gw) => {
                      const playerStanding = gw.standings.find(s => s.entry_name === standing.entry_name);
                      return total + (playerStanding?.penalty || 0);
                    }, 0)
                }))
              }
            />
          </div>

          {/* Total Penalties Table */}
          <div className="table-container w-full">
            <div className="table-header flex justify-between items-center">
              <h2 className="text-white">Penalty Table</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevGw}
                  disabled={selectedGameweek <= minGw}
                  className={`text-white px-4 py-2 rounded ${
                    selectedGameweek <= minGw 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  ←
                </button>
                <span className="text-white font-medium">
                  Up to GW {selectedGameweek}
                </span>
                <button
                  onClick={handleNextGw}
                  disabled={selectedGameweek >= maxGw}
                  className={`text-white px-4 py-2 rounded ${
                    selectedGameweek >= maxGw 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  →
                </button>
              </div>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.col1}>#</th>
                  <th className={styles.col2}>Name</th>
                  <th className={styles.col3}>Total Points</th>
                  <th className={styles.col4}>Total Penalty (meters)</th>
                </tr>
              </thead>
              <tbody>
                {data.historicalGameweeks
                  .filter(gw => gw.gameweek <= selectedGameweek)
                  .reduce((acc, gw) => {
                    gw.standings.forEach(standing => {
                      const existingManager = acc.find(m => m.entry_id === standing.entry_id);
                      if (existingManager) {
                        existingManager.totalPenalty += standing.penalty;
                      } else {
                        acc.push({
                          entry_id: standing.entry_id,
                          name: standing.entry_name,
                          totalPenalty: standing.penalty,
                          totalPoints: 0 // We'll update this in the next pass
                        });
                      }
                    });
                    return acc;
                  }, [] as Array<{entry_id: number; name: string; totalPenalty: number; totalPoints: number}>)
                  .sort((a, b) => b.totalPenalty - a.totalPenalty)
                  .map((standing, index) => (
                    <tr key={standing.name}>
                      <td className={styles.col1}>{index + 1}</td>
                      <td className={styles.col2}>
                        <TeamLink 
                          name={standing.name} 
                          entryId={standing.entry_id} 
                          gameweek={selectedGameweek}
                        />
                      </td>
                      <td className={styles.col3}>
                        {data.historicalGameweeks
                          .filter(gw => gw.gameweek <= selectedGameweek)
                          .reduce((total, gw) => {
                            const managerStanding = gw.standings.find(s => s.entry_id === standing.entry_id);
                            return total + (managerStanding?.event_total || 0);
                          }, 0)}
                      </td>
                      <td className={styles.col4}>{standing.totalPenalty}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Penalty Graph */}
          <PenaltyGraph 
            historicalGameweeks={data.historicalGameweeks} 
            selectedGameweek={selectedGameweek}
          />

          {/* Gameweek Table */}
          <div className="table-container w-full">
            <div className="table-header flex items-center justify-between px-4 py-2">
              <h2 className="text-white">Gameweek {selectedGameweek}</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevGw}
                  disabled={selectedGameweek <= minGw}
                  className={`text-white p-2 rounded ${
                    selectedGameweek <= minGw ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'
                  }`}
                >
                  ←
                </button>
                <button
                  onClick={handleNextGw}
                  disabled={selectedGameweek >= maxGw}
                  className={`text-white p-2 rounded ${
                    selectedGameweek >= maxGw ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'
                  }`}
                >
                  →
                </button>
              </div>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.col1}>#</th>
                  <th className={styles.col2}>Name</th>
                  <th className={styles.col3}>Points</th>
                  <th className={styles.col4}>Penalty (meters)</th>
                </tr>
              </thead>
              <tbody>
                {currentHistoricalGameweek?.standings.map((standing) => (
                  <tr key={standing.entry_name}>
                    <td className={styles.col1}>{standing.position}</td>
                    <td className={styles.col2}>
                      <TeamLink 
                        name={standing.entry_name} 
                        entryId={standing.entry_id} 
                        gameweek={selectedGameweek}
                      />
                    </td>
                    <td className={styles.col3}>{standing.event_total}</td>
                    <td className={styles.col4}>{standing.penalty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 