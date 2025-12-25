import { useState, useEffect, useRef } from "react";

function PriceRange({ onPriceChange, minProp = 0, maxProp = 20000000000, step = 10000, className = '' }) {
  const MIN = minProp;
  const MAX = maxProp;
  const STEP = step;

  const [min, setMin] = useState(MIN);
  const [max, setMax] = useState(MAX);
  const debounceRef = useRef(null);
  const pointerUpListenerRef = useRef(null);

  const formatVND = (v) => Number(v).toLocaleString('vi-VN') + ' đ';
  const pct = (value) => ((value - MIN) / (MAX - MIN)) * 100;

  const handleMin = (e) => setMin(Math.min(Number(e.target.value), max - STEP));
  const handleMax = (e) => setMax(Math.max(Number(e.target.value), min + STEP));

  const flushNow = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (typeof onPriceChange === 'function') {
      console.debug('PriceRange.flushNow', { min, max, immediate: true });
      onPriceChange(min, max, true);
    }
  };

  const onPointerDown = () => {
    if (pointerUpListenerRef.current) return;
    const handler = () => {
      flushNow();
      window.removeEventListener('pointerup', handler);
      pointerUpListenerRef.current = null;
    };
    pointerUpListenerRef.current = handler;
    window.addEventListener('pointerup', handler);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (typeof onPriceChange === 'function') {
        console.debug('PriceRange.debounced', { min, max, immediate: false });
        onPriceChange(min, max, false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (pointerUpListenerRef.current) {
        window.removeEventListener('pointerup', pointerUpListenerRef.current);
        pointerUpListenerRef.current = null;
      }
    };
  }, [min, max, onPriceChange]);

  return (
    <div className={"col-span-3 " + className}>
      <label className="block mb-2 text-sm font-medium text-white">Price Range</label>

      <div className="flex justify-between text-sm text-white mb-2">
        <span>{formatVND(min)}</span>
        <span>{formatVND(max)}</span>
      </div>

      <div className="relative w-full h-2">
        <div className="absolute w-full h-2 bg-neutral-700 rounded-full"></div>
        <div
          className="absolute h-2 bg-blue-400 rounded-full"
          style={{ left: `${pct(min)}%`, width: `${pct(max) - pct(min)}%` }}
        />

        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={min}
          onChange={handleMin}
          onPointerDown={onPointerDown}
          onMouseUp={flushNow}
          onTouchEnd={flushNow}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none
                     [&::-webkit-slider-thumb]:pointer-events-auto
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-blue-500"
        />

        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={max}
          onChange={handleMax}
          onPointerDown={onPointerDown}
          onMouseUp={flushNow}
          onTouchEnd={flushNow}
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
