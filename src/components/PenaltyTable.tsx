'use client';

import { useState } from 'react';
import type { Player } from '../types/fpl';

export function PenaltyTable() {
  const [players, setPlayers] = useState<Player[]>([]);
  
  // This will be replaced with actual accumulated data
  const dummyData = [
    { id: 1, position: 1, name: 'Stabello Hotspur', totalPoints: 1002, totalPenalties: 400 },
    { id: 2, position: 2, name: 'Testosquad', totalPoints: 2040, totalPenalties: 400 },
    { id: 3, position: 3, name: 'Ompalompas', totalPoints: 2122, totalPenalties: 400 },
    { id: 4, position: 4, name: 'DrivzFC', totalPoints: 2044, totalPenalties: 400 },
    { id: 5, position: 5, name: 'Nosevalley', totalPoints: 2161, totalPenalties: 200 },
    { id: 6, position: 6, name: 'Longfields', totalPoints: 1903, totalPenalties: 400 },
    { id: 7, position: 7, name: 'Jeg Viste det!', totalPoints: 2197, totalPenalties: 100 },
    { id: 8, position: 8, name: 'Shawshank Redemption', totalPoints: 2315, totalPenalties: 0 },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="table-container">
        <thead>
          <tr>
            <th className="px-4 py-3 text-center w-[60px]">#</th>
            <th className="px-4 py-3 text-left w-[220px]">Name</th>
            <th className="px-4 py-3 text-right w-[100px]">Total Points</th>
            <th className="px-4 py-3 text-right w-[120px]">Total Penal</th>
          </tr>
        </thead>
        <tbody>
          {dummyData.map((player) => (
            <tr key={player.id} className="hover:bg-white/5">
              <td className="px-4 py-3 text-center">{player.position}</td>
              <td className="px-4 py-3 text-left truncate">{player.name}</td>
              <td className="px-4 py-3 text-right">{player.totalPoints}</td>
              <td className="px-4 py-3 text-right">{player.totalPenalties}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 