'use client';

import { useState } from 'react';
import type { Player } from '../types/fpl';

interface GameweekResultsProps {
  initialData: Array<{
    position: number;
    name: string;
    points: number;
    penalty: number;
  }>;
}

export function NewGameweekResults({ initialData }: GameweekResultsProps) {
  // Mock data for the third table
  const mockHistoricalData = [
    { gameweek: 'GW34', winner: 'Jeg Viste det!', points: 95, totalPenalty: 8200 },
    { gameweek: 'GW33', winner: 'Nosevalley', points: 83, totalPenalty: 9700 },
    { gameweek: 'GW32', winner: 'Testosquad', points: 87, totalPenalty: 9900 },
    { gameweek: 'GW31', winner: 'Nosevalley', points: 75, totalPenalty: 9600 },
    { gameweek: 'GW30', winner: 'Jeg Viste det!', points: 66, totalPenalty: 7600 },
  ];

  return (
    <div className="flex gap-8 px-4">
      {/* Historical Winners Table */}
      <div className="w-[400px]">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[100px]" />
            <col className="w-[180px]" />
            <col className="w-[120px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-3 text-left">GW</th>
              <th className="p-3 text-left">Winner</th>
              <th className="p-3 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {mockHistoricalData.map((gw) => (
              <tr key={gw.gameweek} className="border-b border-gray-700">
                <td className="p-3">{gw.gameweek}</td>
                <td className="p-3 truncate">{gw.winner}</td>
                <td className="p-3 text-right">{gw.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Original Tables */}
      <div className="w-[1000px]">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[80px]" />
            <col className="w-[400px]" />
            <col className="w-[260px]" />
            <col className="w-[260px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-3 text-center">#</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-right">Poeng</th>
              <th className="p-3 text-right">Meters</th>
            </tr>
          </thead>
          <tbody>
            {initialData.map((player) => (
              <tr key={player.position} className="border-b border-gray-700">
                <td className="p-3 text-center">{player.position}</td>
                <td className="p-3 text-left truncate">{player.name}</td>
                <td className="p-3 text-right">{player.points}</td>
                <td className="p-3 text-right">{player.penalty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 