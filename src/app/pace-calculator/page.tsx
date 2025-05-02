'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PaceCalculatorPage() {
  const [distance, setDistance] = useState<string>('400');
  const [minutesPerKm, setMinutesPerKm] = useState<string>('5');
  const [secondsPerKm, setSecondsPerKm] = useState<string>('00');

  // Calculate total time based on pace
  const calculateTime = () => {
    const distanceInMeters = Number(distance);
    // Convert pace to seconds per meter
    const secondsPerMeter = (Number(minutesPerKm) * 60 + Number(secondsPerKm)) / 1000;
    
    // Calculate total seconds for the full distance
    const totalSeconds = distanceInMeters * secondsPerMeter;
    
    // Calculate time for one lap (400m)
    const secondsPerLap = 400 * secondsPerMeter;
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
            <h1 className="text-2xl font-bold text-white mb-6">Pace Calculator</h1>
            
            <div className="bg-white/5 p-6 rounded-lg space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">Distance (meters)</label>
                  <input
                    type="number"
                    min="0"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">Minutes per km</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutesPerKm}
                    onChange={(e) => setMinutesPerKm(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">Seconds per km</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={secondsPerKm}
                    onChange={(e) => setSecondsPerKm(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="mt-8 space-y-4 text-lg text-white">
                <div className="bg-white/5 p-4 rounded">
                  <h2 className="text-sm text-gray-400 mb-1">Your Pace</h2>
                  <div className="font-bold">
                    {timeEstimate.paceMinutes}:{timeEstimate.paceSeconds.toString().padStart(2, '0')} min/km
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded">
                  <h2 className="text-sm text-gray-400 mb-1">Time per Lap (400m)</h2>
                  <div className="font-bold">
                    {timeEstimate.lapMinutes}:{timeEstimate.lapSeconds.toString().padStart(2, '0')}
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded">
                  <h2 className="text-sm text-gray-400 mb-1">Estimated Completion Time</h2>
                  <div className="font-bold">
                    {timeEstimate.hours}h {timeEstimate.minutes}m {timeEstimate.seconds}s
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded">
                  <h2 className="text-sm text-gray-400 mb-1">Distance</h2>
                  <div className="font-bold">
                    {(Number(distance) / 1000).toFixed(2)} kilometers ({distance} meters)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 