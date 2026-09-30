import React from 'react';

interface ClenCLogoProps {
  variant?: 'header' | 'full' | 'mark';
  className?: string;
}

export const ClenCLogo: React.FC<ClenCLogoProps> = ({
  variant = 'header',
  className = '',
}) => {
  const emblem = (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={variant === 'full' ? 'w-16 h-16 shrink-0' : 'w-9 h-9 shrink-0'}
      aria-hidden="true"
    >
      {/* Outer C-shaped leaf wrapping from bottom-left over top-right */}
      <path
        d="M62 106C31 103 12 79 14 49C16 21 41 8 73 11C80 11.6 88 13.5 94 15C83 27 70 36 52 40C38 43 29 49 24 59C29 44 43 32 63 26C51 25 36 31 28 43C20 55 21 73 31 86C40 97 51 102 62 106Z"
        fill="#166E3D"
      />
      <path
        d="M28 34C38 18 61 11 89 14C78 26 64 34 46 38C36 40 28 45 23 53C23 46 25 39 28 34Z"
        fill="#5DA72B"
      />
      {/* Central vein of top leaf */}
      <path
        d="M24 52C36 35 56 24 82 17"
        stroke="#F4F6F2"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* City Skyline Silhouette + Tree in center */}
      <path
        d="M35 66V54L41 51V66H43V46L49 44V66H52V37L61 32V66H64V48L69 45V66H75V55C70 54 67 50 67 45C67 42 69 39 71 38C71 34 74 31 78 31C82 31 85 34 85 38C88 39 90 42 90 45C90 50 86 54 81 55V66H88V71C74 67 62 68 52 73C45 67 39 65 35 66Z"
        fill="#1E7E45"
      />
      {/* Building windows */}
      <rect x="54.5" y="39" width="2.2" height="3" fill="#F4F6F2" />
      <rect x="58" y="39" width="2.2" height="3" fill="#F4F6F2" />
      <rect x="54.5" y="44.5" width="2.2" height="3" fill="#F4F6F2" />
      <rect x="58" y="44.5" width="2.2" height="3" fill="#F4F6F2" />
      <rect x="54.5" y="50" width="2.2" height="3" fill="#F4F6F2" />
      <rect x="58" y="50" width="2.2" height="3" fill="#F4F6F2" />
      {/* Tree trunk */}
      <path d="M78 46V66M78 53L74 49" stroke="#F4F6F2" strokeWidth="2" strokeLinecap="round" />

      {/* Green Hill Slope */}
      <path
        d="M27 68C38 68 48 72 55 78C46 82 36 80 27 68Z"
        fill="#62AC2D"
      />

      {/* Segregated Waste Bin on the right */}
      <path
        d="M91 51H109L107.5 72C107.3 73.5 106 74.5 104.5 74.5H95.5C94 74.5 92.7 73.5 92.5 72L91 51Z"
        fill="#0F6336"
      />
      {/* Bin Lid */}
      <rect x="89.5" y="47" width="21" height="3" rx="1.2" fill="#0F6336" />
      <rect x="97" y="44.5" width="6" height="2.5" rx="1" fill="#0F6336" />
      {/* Bin Vertical Ribs */}
      <rect x="95" y="55" width="2" height="14" rx="1" fill="#F4F6F2" />
      <rect x="99" y="55" width="2" height="14" rx="1" fill="#F4F6F2" />
      <rect x="103" y="55" width="2" height="14" rx="1" fill="#F4F6F2" />

      {/* Caring Blue Hand cradling the city and bin */}
      <path
        d="M42 85C52 86 60 80 68 75C74 72 81 71 84 74C85 75.5 83.5 78 78 80L72 82C79 82 88 78 94 74C96.5 72.5 99 73 99.5 75C100 77 97 80 92 84C97 81 102 77 105 75C107 73.8 109 75 108.5 77.5C107 83 97 92 85 97C71 103 55 100 42 85Z"
        fill="#0A74BA"
      />
    </svg>
  );

  if (variant === 'mark') {
    return emblem;
  }

  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center gap-3.5 ${className}`}>
        {emblem}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tracking-tight text-[#0F6336] dark:text-[#58B978]">
              Clen<span className="text-[#5DA72B]">C</span>
            </span>
          </div>
          <span className="text-xs font-medium text-[#465A4E] dark:text-[#9AB0A2]">
            Cleaner Society · Safer Tomorrow
          </span>
        </div>
      </div>
    );
  }

  // Strictly single-element wordmark + emblem for Top Bar Contract
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {emblem}
      <span className="font-display text-lg font-bold tracking-tight text-[#0F6336] dark:text-[#62C384] whitespace-nowrap">
        Clen<span className="text-[#5DA72B]">C</span>
      </span>
    </span>
  );
};
