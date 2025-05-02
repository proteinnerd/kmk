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

interface TeamPenaltyGraphProps {
  teamName: string;
  gameweeks: {
    gameweek: number;
    standings: {
      entry_name: string;
      position: number;
      event_total: number;
      penalty: number;
    }[];
  }[];
  selectedGameweek: number;
}

interface PenaltyDataPoint {
  gameweek: number;
  penalty: number;
  cumulativePenalty: number;
  position: number;
}

export default function TeamPenaltyGraph({ teamName, gameweeks, selectedGameweek }: TeamPenaltyGraphProps) {
  // Sort gameweeks in ascending order and filter up to selected gameweek
  const sortedGameweeks = [...gameweeks]
    .sort((a, b) => a.gameweek - b.gameweek)
    .filter(gw => gw.gameweek <= selectedGameweek);

  // Calculate cumulative penalties
  let cumulativePenalty = 0;
  const penaltyData: PenaltyDataPoint[] = sortedGameweeks
    .map(gw => {
      const teamStanding = gw.standings.find(s => s.entry_name === teamName);
      if (teamStanding) {
        cumulativePenalty += teamStanding.penalty;
        return {
          gameweek: gw.gameweek,
          penalty: teamStanding.penalty,
          cumulativePenalty,
          position: teamStanding.position
        };
      }
      return null;
    })
    .filter((item): item is PenaltyDataPoint => item !== null);

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
        text: `Penalty Progression Up to GW${selectedGameweek}`,
        color: 'white',
        font: {
          size: 16,
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const dataPoint = penaltyData[context.dataIndex];
            return [
              `Position: ${dataPoint.position}`,
              `Gameweek Penalty: ${dataPoint.penalty}m`,
              `Total Penalties: ${dataPoint.cumulativePenalty}m`
            ];
          }
        }
      }
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
    labels: penaltyData.map(d => `GW${d.gameweek}`),
    datasets: [
      {
        label: 'Total Penalties',
        data: penaltyData.map(d => d.cumulativePenalty),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 2,
        tension: 0.3,
      },
      {
        label: 'Gameweek Penalty',
        data: penaltyData.map(d => d.penalty),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 2,
        tension: 0.3,
      }
    ],
  };

  return (
    <div className="bg-white/5 p-4 rounded mb-6">
      <Line options={options} data={data} />
    </div>
  );
} 