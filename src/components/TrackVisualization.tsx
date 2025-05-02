'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TrackVisualizationProps {
  totalPenalties: number;
  runners?: Array<{
    name: string;
    penalty: number;
    entry_id: number;
  }>;
}

const RunnerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-8 h-8"
  >
    <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 5.28c-1.23-.37-2.22-1.17-2.8-2.18l-1-1.6c-.41-.65-1.11-1-1.84-1-.78 0-1.59.5-1.78 1.44S7 23 7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3c1 1.15 2.41 2.01 4 2.34V23H19V9h-1.5v1.78zM7.43 13.13l-2.12-.41c-.54-.11-.9-.63-.79-1.17l.76-3.93c.21-1.08 1.26-1.79 2.34-1.58l1.16.23-1.35 6.86z" />
  </svg>
);

export default function TrackVisualization({ totalPenalties, runners = [] }: TrackVisualizationProps) {
  const METERS_PER_LAP = 400;
  const totalLaps = Math.ceil(totalPenalties / METERS_PER_LAP);
  const remainingMeters = totalPenalties % METERS_PER_LAP;

  // State for pace calculator (default 5:00 min/km)
  const [minutesPerKm, setMinutesPerKm] = useState<string>('5');
  const [secondsPerKm, setSecondsPerKm] = useState<string>('00');

  // Calculate total time based on pace
  const calculateTime = () => {
    // Convert pace to seconds per meter
    const secondsPerMeter = (Number(minutesPerKm) * 60 + Number(secondsPerKm)) / 1000;
    
    // Calculate total seconds for the full distance
    const totalSeconds = totalPenalties * secondsPerMeter;
    
    // Calculate time for one lap (400m)
    const secondsPerLap = METERS_PER_LAP * secondsPerMeter;
    const lapMinutes = Math.floor(secondsPerLap / 60);
    const lapSeconds = Math.round(secondsPerLap % 60);
    
    // Convert to hours, minutes, seconds for total time
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.round(totalSeconds % 60);

    // Calculate pace per km for display
    const paceMinutes = Number(minutesPerKm);
    const paceSeconds = Number(secondsPerKm);

    return {
      hours,
      minutes,
      seconds,
      paceMinutes,
      paceSeconds,
      lapMinutes,
      lapSeconds
    };
  };

  const timeEstimate = calculateTime();

  // Calculate runner position
  const calculateRunnerPosition = (penalty: number, index: number, totalRunners: number) => {
    const centerY = 500;  // Center of track (SVG height / 2)
    const lineStart = 200;  // Start position of the line
    const lineEnd = 1800;   // End position of the line
    const lineLength = lineEnd - lineStart;
    
    // Calculate x position evenly spaced along the line
    const spacing = lineLength / (totalRunners - 1 || 1); // Avoid division by zero
    const x = lineStart + (index * spacing);
    const y = centerY;

    return { x, y };
  };

  // Sort runners by penalty to show highest penalties first
  const sortedRunners = [...runners].sort((a, b) => b.penalty - a.penalty);

  return (
    <div className="bg-white/5 p-6 rounded-lg">
      <h3 className="text-white text-lg mb-4">Track Visualization</h3>
      <div className="flex items-center gap-4 mb-6">
        <div className="text-white">
          <div className="text-3xl font-bold">{totalLaps}</div>
          <div className="text-sm text-gray-400">Full Laps</div>
        </div>
        <div className="text-white">
          <div className="text-3xl font-bold">{remainingMeters}</div>
          <div className="text-sm text-gray-400">Extra Meters</div>
        </div>
        <div className="text-white">
          <div className="text-3xl font-bold">{totalPenalties}</div>
          <div className="text-sm text-gray-400">Total Meters</div>
        </div>
      </div>

      {/* Track Visualization */}
      <div className="relative w-full aspect-[2/1] mb-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-800 to-red-700">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 2000 1000" preserveAspectRatio="xMidYMid slice">
            {/* Track texture */}
            <defs>
              <pattern id="trackTexture" patternUnits="userSpaceOnUse" width="40" height="40">
                <path d="M0 0h40v40H0z" fill="rgba(0,0,0,0.05)" />
                <path d="M0 0h20v20H0z" fill="rgba(255,255,255,0.02)" />
              </pattern>
            </defs>
            <rect width="2000" height="1000" fill="url(#trackTexture)" />

            {/* Create paths for each lane */}
            {[...Array(8)].map((_, i) => {
              const laneWidth = 35;
              const offset = i * laneWidth;
              const radius = 300;
              return (
                <path
                  key={`lane-${i}`}
                  d={`
                    M ${radius + offset} ${offset}
                    H ${2000 - radius - offset}
                    A ${radius - offset} ${radius - offset} 0 0 1 ${2000 - radius - offset} ${1000 - offset}
                    H ${radius + offset}
                    A ${radius - offset} ${radius - offset} 0 0 1 ${radius + offset} ${offset}
                    Z
                  `}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.6)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Lane numbers */}
            {[...Array(8)].map((_, i) => (
              <text
                key={`number-${i}`}
                x="1000"
                y={i * 35 + 22}
                fill="rgba(255, 255, 255, 0.4)"
                fontSize="16"
                textAnchor="middle"
              >
                {i === 7 ? '' : 7 - i}
              </text>
            ))}

            {/* Add staggered start lines */}
            {[...Array(8)].map((_, i) => {
              const laneWidth = 35;
              const staggerOffset = i * 15;
              return (
                <g key={`start-${i}`}>
                  <line
                    x1={1500 - staggerOffset}
                    y1={i * laneWidth}
                    x2={1500 - staggerOffset}
                    y2={(i + 1) * laneWidth}
                    stroke="rgba(255, 255, 255, 0.6)"
                    strokeWidth="1"
                  />
                  {/* Small dash marks */}
                  <line
                    x1={1500 - staggerOffset - 2}
                    y1={i * laneWidth}
                    x2={1500 - staggerOffset + 2}
                    y2={i * laneWidth}
                    stroke="rgba(255, 255, 255, 0.6)"
                    strokeWidth="1"
                  />
                </g>
              );
            })}

            {/* Runner indicators */}
            {sortedRunners.map((runner, index) => {
              const position = calculateRunnerPosition(runner.penalty, index, runners.length);
              const color = `hsl(${(index * 360) / runners.length}, 70%, 50%)`;
              const runnerLaps = Math.floor(runner.penalty / METERS_PER_LAP);
              return (
                <g 
                  key={`runner-${index}`} 
                  transform={`translate(${position.x}, ${position.y})`}
                >
                  {/* Background for text */}
                  <rect
                    x="-100"
                    y="-65"
                    width="200"
                    height="30"
                    rx="6"
                    fill="rgba(0, 0, 0, 0.8)"
                  />
                  {/* Runner circle with lap count */}
                  <circle r="25" fill={color} stroke="white" strokeWidth="3" />
                  <text
                    x="0"
                    y="7"
                    fill="white"
                    fontSize="20"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {runnerLaps}
                  </text>
                  {/* Runner name as clickable link */}
                  <Link 
                    href={`/team/${runner.entry_id}`}
                    className="hover:text-blue-300 transition-colors"
                  >
                    <text
                      x="0"
                      y="-45"
                      fill="currentColor"
                      fontSize="20"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="cursor-pointer text-white hover:text-blue-300"
                    >
                      {runner.name}
                    </text>
                  </Link>
                  {/* Runner penalty */}
                  <text
                    x="0"
                    y="55"
                    fill="white"
                    fontSize="18"
                    fontWeight="500"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {runner.penalty}m
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Track details */}
      <div className="text-center text-sm text-gray-400 mb-6">
        1 lap = 400 meters | Total distance: {(totalPenalties / 1000).toFixed(2)} km
      </div>
    </div>
  );
} 