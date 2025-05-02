'use client';

import PlayerShirt from './PlayerShirt';

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

interface TeamSheetProps {
  players: Player[];
  points_on_bench: number;
}

// Premier League team colors for 2023/24 season
const teamColors: { [key: string]: { primary: string; secondary: string } } = {
  ARS: { primary: '#EF0107', secondary: '#FFFFFF' }, // Arsenal
  AVL: { primary: '#95BFE5', secondary: '#670E36' }, // Aston Villa
  BOU: { primary: '#DA291C', secondary: '#000000' }, // Bournemouth
  BRE: { primary: '#e30613', secondary: '#FFFFFF' }, // Brentford
  BHA: { primary: '#0057B8', secondary: '#FFFFFF' }, // Brighton
  BUR: { primary: '#6C1D45', secondary: '#99D6EA' }, // Burnley
  CHE: { primary: '#034694', secondary: '#FFFFFF' }, // Chelsea
  CRY: { primary: '#1B458F', secondary: '#C4122E' }, // Crystal Palace
  EVE: { primary: '#003399', secondary: '#FFFFFF' }, // Everton
  FUL: { primary: '#FFFFFF', secondary: '#000000' }, // Fulham
  LIV: { primary: '#C8102E', secondary: '#FFFFFF' }, // Liverpool
  LUT: { primary: '#F78F1E', secondary: '#FFFFFF' }, // Luton
  MCI: { primary: '#6CABDD', secondary: '#FFFFFF' }, // Manchester City
  MUN: { primary: '#DA291C', secondary: '#000000' }, // Manchester United
  NEW: { primary: '#241F20', secondary: '#FFFFFF' }, // Newcastle
  NFO: { primary: '#DD0000', secondary: '#FFFFFF' }, // Nottingham Forest
  SHU: { primary: '#EE2737', secondary: '#000000' }, // Sheffield United
  TOT: { primary: '#FFFFFF', secondary: '#132257' }, // Tottenham
  WHU: { primary: '#7A263A', secondary: '#1BB1E7' }, // West Ham
  WOL: { primary: '#FDB913', secondary: '#000000' }, // Wolves
};

export default function TeamSheet({ players, points_on_bench }: TeamSheetProps) {
  // Filter starting players (multiplier > 0) and sort by position
  const startingPlayers = players
    .filter(player => player.multiplier > 0)
    .sort((a, b) => a.position - b.position);

  // Calculate total points for starting XI
  const totalPoints = startingPlayers.reduce((sum, player) => sum + player.points, 0);

  // Group players by position
  const gks = startingPlayers.filter(p => p.position === 1);
  const defs = startingPlayers.filter(p => p.position === 2);
  const mids = startingPlayers.filter(p => p.position === 3);
  const fwds = startingPlayers.filter(p => p.position === 4);

  // Get bench players
  const benchPlayers = players
    .filter(player => player.multiplier === 0)
    .sort((a, b) => a.position - b.position);

  // Verify bench points calculation
  console.log('Bench players points:', benchPlayers.map(p => ({ name: p.player_name, points: p.raw_points })));
  console.log('Total bench points from API:', points_on_bench);

  const PlayerCard = ({ player }: { player: Player }) => {
    const teamStyle = teamColors[player.player_team_short_name] || { primary: '#666666', secondary: '#FFFFFF' };
    const lastName = player.player_name.split(' ').pop() || '';

    return (
      <PlayerShirt
        primaryColor={teamStyle.primary}
        secondaryColor={teamStyle.secondary}
        name={lastName.toUpperCase()}
        points={player.multiplier === 0 ? player.raw_points : player.points}
        isCaptain={player.is_captain}
        isViceCaptain={player.is_vice_captain}
        teamShortName={player.team_short_name}
      />
    );
  };

  return (
    <div className="bg-[#1a1d24] rounded-lg p-6 relative">
      {/* Total Points Display */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full text-white font-bold text-lg z-10">
        Starting XI: {totalPoints} pts
      </div>

      {/* Football pitch background */}
      <div className="relative w-full aspect-[16/10] bg-[#2d4f25] rounded-lg overflow-hidden mt-14">
        {/* Field markings */}
        <div className="absolute inset-0 border-2 border-white/20 m-4 rounded" />
        <div className="absolute top-4 left-4 right-4 h-1/5 border-2 border-white/20" />
        <div className="absolute bottom-4 left-4 right-4 h-1/5 border-2 border-white/20" />
        <div className="absolute left-1/2 top-4 bottom-4 w-0 border-l-2 border-white/20 -translate-x-1/2" />
        <div className="absolute left-1/2 top-1/2 w-[60px] h-[60px] border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* Players positioning */}
        <div className="absolute inset-0 flex flex-col">
          {/* Goalkeeper */}
          <div className="flex-1 flex justify-center items-end pb-[5%]">
            {gks.map(player => (
              <PlayerCard key={player.element} player={player} />
            ))}
          </div>

          {/* Defenders */}
          <div className="flex-1 flex justify-evenly items-center">
            {defs.map(player => (
              <PlayerCard key={player.element} player={player} />
            ))}
          </div>

          {/* Midfielders */}
          <div className="flex-1 flex justify-evenly items-center">
            {mids.map(player => (
              <PlayerCard key={player.element} player={player} />
            ))}
          </div>

          {/* Forwards */}
          <div className="flex-1 flex justify-evenly items-start pt-[5%]">
            {fwds.map(player => (
              <PlayerCard key={player.element} player={player} />
            ))}
          </div>
        </div>
      </div>

      {/* Bench */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white text-lg">Bench</h3>
          <span className="text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm">
            Bench Points: {points_on_bench}
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {benchPlayers.map(player => (
            <PlayerCard key={player.element} player={player} />
          ))}
        </div>
      </div>
    </div>
  );
} 