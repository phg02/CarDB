import { useState } from "react";

function PriceRange() {
  const MIN = 0;
  const MAX = 1_000_000_000;
  const STEP = 10000;

  const [min, setMin] = useState(0);
  const [max, setMax] = useState(500_000_000);

  // Format VND currency
  const formatVND = (v) =>
    v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " VND";

  // Normalize to percentage for UI bar width
  const pct = (value) => ((value - MIN) / (MAX - MIN)) * 100;

  const handleMin = (e) => {
    const v = Math.min(Number(e.target.value), max - STEP);
    setMin(v);
  };

  const handleMax = (e) => {
    const v = Math.max(Number(e.target.value), min + STEP);
    setMax(v);
  };

  return (
    <div className="w-full">
      <label className="block mb-2 text-sm font-medium text-white">
        Price Range
      </label>

      {/* Display values */}
      <div className="flex justify-between text-sm text-white mb-2">
        <span>{formatVND(min)}</span>
        <span>{formatVND(max)}</span>
      </div>

      <div className="relative w-full h-2">
        {/* Background track */}
        <div className="absolute w-full h-2 bg-neutral-700 rounded-full"></div>

        {/* Highlighted selected bar */}
        <div
          className="absolute h-2 bg-blue-400 rounded-full"
          style={{
            left: `${pct(min)}%`,
            width: `${pct(max) - pct(min)}%`,
          }}
        ></div>

        {/* MIN thumb */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={min}
          onChange={handleMin}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none
                     [&::-webkit-slider-thumb]:pointer-events-auto
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-blue-500"
        />

        {/* MAX thumb */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={max}
          onChange={handleMax}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none
                     [&::-webkit-slider-thumb]:pointer-events-auto
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-blue-500"
        />
      </div>
    </div>
  );
}

export default PriceRange;
