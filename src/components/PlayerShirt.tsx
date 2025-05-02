import React from 'react';

interface PlayerShirtProps {
  primaryColor: string;
  secondaryColor: string;
  name: string;
  points?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  teamShortName: string;
}

export default function PlayerShirt({ 
  primaryColor, 
  secondaryColor, 
  name, 
  points = 0,
  isCaptain, 
  isViceCaptain,
  teamShortName 
}: PlayerShirtProps) {
  // Calculate font size based on name length
  const getFontSize = (nameLength: number) => {
    if (nameLength <= 5) return 'text-sm';
    if (nameLength <= 8) return 'text-xs';
    return 'text-[10px]';
  };

  const fontSize = getFontSize(name.length);

  return (
    <div className="relative flex flex-col items-center gap-1">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{
            filter: 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.2))'
          }}
        >
          {/* Main shirt body */}
          <path
            d={`
              M 20,20
              L 40,10 
              L 60,10 
              L 80,20
              L 80,90
              L 20,90
              Z
            `}
            fill={primaryColor}
            stroke={secondaryColor}
            strokeWidth="2"
          />
          {/* Collar */}
          <path
            d={`
              M 40,10
              L 50,25
              L 60,10
            `}
            fill={secondaryColor}
            stroke={secondaryColor}
            strokeWidth="2"
          />
          {/* Sleeves */}
          <path
            d={`
              M 20,20
              L 5,40
              L 15,45
              L 30,25
            `}
            fill={primaryColor}
            stroke={secondaryColor}
            strokeWidth="2"
          />
          <path
            d={`
              M 80,20
              L 95,40
              L 85,45
              L 70,25
            `}
            fill={primaryColor}
            stroke={secondaryColor}
            strokeWidth="2"
          />
        </svg>

        {/* Points inside jersey */}
        <span 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-lg"
          style={{ 
            color: secondaryColor,
            textShadow: '1px 1px 1px rgba(0,0,0,0.5)'
          }}
        >
          {points}
        </span>
      </div>

      {/* Captain/Vice-captain indicator */}
      {isCaptain && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-black text-xs font-bold">C</span>
        </div>
      )}
      {isViceCaptain && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500/50 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-black text-xs font-bold">V</span>
        </div>
      )}

      {/* Player name below jersey */}
      <span 
        className={`font-bold ${fontSize} whitespace-nowrap px-1 text-center`}
        style={{ 
          color: '#FFFFFF',
          textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {name}
      </span>

      {/* Team name */}
      <div className="bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] text-white font-medium">
        {teamShortName}
      </div>
    </div>
  );
} 