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

export function GameweekResults({ initialData }: GameweekResultsProps) {
  return (
    <div style={{ width: '1000px', margin: '0 auto' }}>
      <table style={{ width: '100%', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '50px' }} />
          <col style={{ width: '400px' }} />
          <col style={{ width: '275px' }} />
          <col style={{ width: '275px' }} />
        </colgroup>
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>#</th>
            <th style={{ textAlign: 'left' }}>Name</th>
            <th style={{ textAlign: 'right' }}>Poeng</th>
            <th style={{ textAlign: 'right' }}>Meters</th>
          </tr>
        </thead>
        <tbody>
          {initialData.map((player) => (
            <tr key={player.position}>
              <td style={{ textAlign: 'center' }}>{player.position}</td>
              <td style={{ textAlign: 'left' }}>{player.name}</td>
              <td style={{ textAlign: 'right' }}>{player.points}</td>
              <td style={{ textAlign: 'right' }}>{player.penalty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 