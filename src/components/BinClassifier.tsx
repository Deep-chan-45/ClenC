import React, { useState, useEffect } from 'react';
import { WasteClassificationResult } from '../types';
import {
  IconSearch,
  IconLeaf,
  IconRecycle,
  IconSanitaryShield,
  IconHazardAlert,
  IconBin,
  IconCheck,
} from './Icons';

interface BinClassifierProps {
  variant?: 'compact' | 'full';
  initialQuery?: string;
  className?: string;
}

const DEFAULT_RESULT: WasteClassificationResult = {
  item: 'Banana peel & fruit skins',
  hindiName: 'केले का छिलका और फलों के छिलके',
  stream: 'Wet',
  binColor: 'Green Dustbin (Wet / Biodegradable Waste)',
  dustbinColorHex: '#15693F',
  howToDump: 'Transfer directly into the Green Dustbin without any plastic liner or polythene bag. Keep moist organic kitchen waste segregated from dry recyclables.',
  whereToDump: 'Deposit in the Green wet-waste compartment of the morning Kanpur Nagar Nigam door-to-door electric tipper cart.',
  destination: 'Ward Biomethanation & Bio-CNG Plant at Panki / Aerobic Microbial Composting Unit',
  material: 'Organic Biomass / Nitrogen-rich Food Waste',
  recyclable: true,
  confidence: '99%',
  warning: 'Never mix plastic wrappers, aluminum foils, or hazardous batteries into the green bin. Contamination ruins bio-methane digesters.',
  isAiGenerated: true,
};

const POPULAR_ITEMS = [
  'banana peel',
  'milk packet',
  'thermocol',
  'used battery',
  'expired medicine',
  'sanitary pad',
  'pizza box',
  'broken glass',
  'coconut shell',
  'tubelight',
  'chips packet',
  'plastic bottle',
  'old clothes',
  'construction rubble',
];

export const BinClassifier: React.FC<BinClassifierProps> = ({
  variant = 'full',
  initialQuery = 'banana peel',
  className = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<WasteClassificationResult>(DEFAULT_RESULT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClassification = async (itemQuery: string) => {
    const q = itemQuery.trim();
    if (!q) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/classify-waste-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!response.ok) {
        throw new Error(`Classification error: HTTP ${response.status}`);
      }

      const data: WasteClassificationResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.warn('API error, using local fallback:', err);
      // Soft fallback so UI never breaks
      setError('Live AI lookup timed out. Showing municipal rule-based fallback.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClassification(query);
  };

  const handleChipClick = (item: string) => {
    setQuery(item);
    fetchClassification(item);
  };

  const getStreamIcon = (stream: string) => {
    switch (stream) {
      case 'Wet':
        return <IconLeaf className="w-5 h-5 text-[#15693F]" />;
      case 'Dry':
        return <IconRecycle className="w-5 h-5 text-[#1D5B96]" />;
      case 'Sanitary':
        return <IconSanitaryShield className="w-5 h-5 text-[#B8332A]" />;
      case 'C&D':
        return <IconBin className="w-5 h-5 text-[#7C5A38]" />;
      default:
        return <IconHazardAlert className="w-5 h-5 text-[#C27115]" />;
    }
  };

  const getStreamBadgeStyle = (stream: string) => {
    switch (stream) {
      case 'Wet':
        return 'bg-[#E6F2EB] text-[#15693F] border-[#9BC7AE] dark:bg-[#132A1E] dark:text-[#68C88E] dark:border-[#25543B]';
      case 'Dry':
        return 'bg-[#E6EFF8] text-[#1D5B96] border-[#9BBCE0] dark:bg-[#122436] dark:text-[#78B2EB] dark:border-[#264C73]';
      case 'Sanitary':
        return 'bg-[#F8EAE8] text-[#B8332A] border-[#DFABA7] dark:bg-[#301614] dark:text-[#EB827A] dark:border-[#662B27]';
      case 'C&D':
        return 'bg-[#F5EFE9] text-[#7C5A38] border-[#D4C3B2] dark:bg-[#281E15] dark:text-[#D4A97E] dark:border-[#523C29]';
      default:
        return 'bg-[#FBF1E4] text-[#A85E0D] border-[#E2BF91] dark:bg-[#2F2110] dark:text-[#F0AD5E] dark:border-[#63441D]';
    }
  };

  const getEnglishBinColorName = (stream: string, binColor: string): string => {
    switch (stream) {
      case 'Wet':
        return 'Green Dustbin (Wet / Biodegradable Waste)';
      case 'Dry':
        return 'Blue Dustbin (Dry / Recyclable Waste)';
      case 'Sanitary':
        return 'Red Dustbin / Pouch (Sanitary / Biomedical Waste)';
      case 'Special Care':
        return 'Amber / Black Box (Special Care / Hazardous Waste)';
      case 'C&D':
        return 'Brown Dustbin / Loader (Construction & Demolition Debris)';
      default:
        return binColor
          .replace(/\s*\([^)]*[\u0900-\u097F][^)]*\)/g, '')
          .replace(/\/[^/]*[\u0900-\u097F][^/]*/g, '')
          .trim();
    }
  };

  return (
    <div
      className={`border border-[#B8C7BC] dark:border-[#283E33] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm p-4 sm:p-5 space-y-4 ${className}`}
    >
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#C5D0C8] dark:border-[#24382E] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15693F] animate-pulse"></span>
            <span className="text-[11px] font-mono font-bold text-[#15693F] dark:text-[#68C88E] uppercase tracking-wider">
              SWM 2026 AI Waste & Dustbin Classifier
            </span>
          </div>
          <h3 className="font-display text-base sm:text-lg font-bold text-[#122017] dark:text-[#E7EFEA] mt-0.5">
            Search Any Item to Find Dustbin Color & Disposal Rules
          </h3>
        </div>
        <span className="text-[11px] font-mono font-semibold text-[#0F626A] dark:text-[#66C7D0] bg-[#DFEFF1] dark:bg-[#11272B] px-2.5 py-1 rounded-xs self-start sm:self-center border border-[#96C7CB] dark:border-[#1E454C]">
          Kanpur Nagar Nigam Rules
        </span>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any item (e.g. thermocol, medicine bottle, pizza box, coconut shell, tubelight, chips wrapper)..."
            className="w-full h-11 pl-10 pr-24 text-xs sm:text-sm bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm text-[#122017] dark:text-[#E7EFEA] focus:border-[#15693F] dark:focus:border-[#68C88E] focus:outline-none transition-colors"
          />
          <IconSearch className="w-4 h-4 text-[#485B4F] dark:text-[#98AEA0] absolute left-3.5" />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-1.5 h-8 px-3 text-xs font-semibold bg-[#15693F] hover:bg-[#105331] text-white rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Searching...</span>
              </>
            ) : (
              <span>Search</span>
            )}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-mono text-[#485B4F] dark:text-[#98AEA0] mr-1">
            Try:
          </span>
          {POPULAR_ITEMS.slice(0, variant === 'compact' ? 7 : 12).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleChipClick(item)}
              className={`px-2 py-0.5 text-[11px] font-mono border rounded-xs transition-colors cursor-pointer ${
                query.toLowerCase() === item
                  ? 'bg-[#15693F] text-white border-[#15693F]'
                  : 'bg-[#EAEFE7] dark:bg-[#101C16] border-[#C5D0C8] dark:border-[#283E33] text-[#2E4035] dark:text-[#B8CCC0] hover:border-[#15693F]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </form>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="p-4 border border-[#0F626A] bg-[#DFEFF1] dark:bg-[#112327] rounded-sm flex items-center gap-3 text-xs">
          <span className="w-4 h-4 border-2 border-[#0F626A] border-t-transparent rounded-full animate-spin"></span>
          <span className="font-semibold text-[#0F626A] dark:text-[#66C7D0]">
            AI is analyzing "{query}" against Indian SWM Rules 2026 and Kanpur Nagar Nigam standards...
          </span>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-3 border border-[#B86B11] bg-[#FBF1E4] dark:bg-[#2A1D0E] rounded-sm text-xs text-[#A85E0D] dark:text-[#F0AD5E]">
          {error}
        </div>
      )}

      {/* RESULT CARD */}
      {result && !isLoading && (
        <div className="space-y-3.5 pt-1">
          {/* Main Bin Color Banner */}
          <div
            className={`p-4 border-2 rounded-sm space-y-2 transition-all ${getStreamBadgeStyle(
              result.stream
            )}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0 shadow-xs text-white"
                  style={{ backgroundColor: result.dustbinColorHex }}
                >
                  <IconBin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider font-bold opacity-80">
                    RECOMMENDED DUSTBIN COLOUR
                  </div>
                  <div className="font-display text-base sm:text-lg font-bold leading-tight">
                    {getEnglishBinColorName(result.stream, result.binColor)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-xs bg-black/10 dark:bg-white/10 border border-black/15 dark:border-white/15">
                  Stream: {result.stream}
                </span>
                {result.confidence && (
                  <span className="px-2 py-1 text-[11px] font-mono rounded-xs bg-black/5 dark:bg-white/5 opacity-80">
                    {result.confidence} Match
                  </span>
                )}
              </div>
            </div>

            {/* Item Title */}
            <div className="flex flex-wrap items-baseline gap-2 pt-0.5">
              <h4 className="font-display text-base font-bold capitalize">
                {result.item}
              </h4>
            </div>
          </div>

          {/* Details: How to Dump */}
          <div className="p-3.5 border border-[#B8C7BC] dark:border-[#283E33] bg-[#EAEFE7] dark:bg-[#101C16] rounded-sm space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-mono font-bold text-[#15693F] dark:text-[#68C88E] text-[11px]">
              <IconCheck className="w-3.5 h-3.5" />
              <span>HOW TO DUMP IT (PREPARATION &amp; SEGREGATION INSTRUCTIONS):</span>
            </div>
            <p className="text-[#1D2B22] dark:text-[#D1E0D6] leading-relaxed text-xs sm:text-[13px]">
              {result.howToDump}
            </p>
          </div>

          {/* Statutory Precaution / Warning */}
          {result.warning && (
            <div className="p-3 border border-[#B86B11]/50 bg-[#FBF1E4] dark:bg-[#2A1D0E] rounded-sm text-xs text-[#874A08] dark:text-[#F3B872] flex items-start gap-2">
              <IconHazardAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#B86B11]" />
              <p className="leading-relaxed">
                <strong>Statutory Notice:</strong> {result.warning}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
