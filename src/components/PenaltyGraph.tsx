'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PenaltyGraphProps {
  historicalGameweeks: {
    gameweek: number;
    standings: {
      entry_name: string;
      entry_id: number;
      position: number;
      event_total: number;
      penalty: number;
    }[];
  }[];
  selectedGameweek: number;
}

export default function PenaltyGraph({ historicalGameweeks, selectedGameweek }: PenaltyGraphProps) {
  // Sort gameweeks in ascending order and filter up to selected gameweek
  const sortedGameweeks = [...historicalGameweeks]
    .sort((a, b) => a.gameweek - b.gameweek)
    .filter(gw => gw.gameweek <= selectedGameweek);

  // Get unique team names from the first gameweek
  const teamNames = Array.from(
    new Set(
      sortedGameweeks[0].standings.map(standing => standing.entry_name)
    )
  );

  // Create datasets for each team
  const datasets = teamNames.map(teamName => {
    let accumulatedPenalty = 0;
    const data = sortedGameweeks.map(gw => {
      const teamStanding = gw.standings.find(s => s.entry_name === teamName);
      if (teamStanding) {
        accumulatedPenalty += teamStanding.penalty;
      }
      return accumulatedPenalty;
    });

    // Generate a random color for each team
    const hue = Math.random() * 360;
    const color = `hsl(${hue}, 70%, 50%)`;

    return {
      label: teamName,
      data,
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      tension: 0.3,
      fill: false,
    };
  });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white',
          padding: 20,
          font: {
            size: 12
          }
        },
      },
      title: {
        display: true,
        text: `Accumulated Penalties Up to GW${selectedGameweek}`,
        color: 'white',
        font: {
          size: 16,
        },
        padding: {
          bottom: 20
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Gameweek',
          color: 'white',
        },
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Total Penalties (meters)',
          color: 'white',
        },
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  const data = {
    labels: sortedGameweeks.map(gw => `GW${gw.gameweek}`),
    datasets,
  };

  return (
    <div className="w-full bg-white/5 rounded-lg p-6 mt-4">
      <Line options={options} data={data} />
    </div>
  );
} 