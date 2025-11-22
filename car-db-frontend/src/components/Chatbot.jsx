import { useRef, useState } from 'react';

function Chatbot() {
  const [open, setOpen] = useState(false);
  // store position as distance from right/bottom in pixels
  const [pos, setPos] = useState({ right: 24, bottom: 24 });
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0, right: 24, bottom: 24 });
  const moved = useRef(false);
  const btnRef = useRef(null);

  function onPointerDown(e) {
    // start dragging; use pointer events so it works with touch and mouse
    dragging.current = true;
    moved.current = false;
    try { btnRef.current.setPointerCapture(e.pointerId); } catch (err) {}
    // record button size so we can clamp movement inside the viewport
    const rect = btnRef.current?.getBoundingClientRect() || { width: 56, height: 56 };
    start.current = { x: e.clientX, y: e.clientY, right: pos.right, bottom: pos.bottom, btnW: rect.width, btnH: rect.height };
  }

  function onPointerMove(e) {
    if (!dragging.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    // mark as moved if movement exceeds a small threshold (to distinguish click vs drag)
    if (!moved.current && Math.hypot(dx, dy) > 6) moved.current = true;
    // moving to the right decreases the `right` value
    const minGap = 8; // min distance from edges
    const maxRight = Math.max(minGap, window.innerWidth - (start.current.btnW || 56) - minGap);
    const maxBottom = Math.max(minGap, window.innerHeight - (start.current.btnH || 56) - minGap);
    let newRight = start.current.right - dx;
    let newBottom = start.current.bottom - dy;
    // clamp within viewport (right and bottom are distances from the respective edges)
    newRight = Math.min(Math.max(minGap, newRight), maxRight);
    newBottom = Math.min(Math.max(minGap, newBottom), maxBottom);
    setPos({ right: newRight, bottom: newBottom });
  }

  function onPointerUp(e) {
    dragging.current = false;
    try { btnRef.current.releasePointerCapture(e.pointerId); } catch (err) {}
  }

  function toggle(e) {
    // If the pointer event involved movement (a drag), ignore the click
    if (moved.current) {
      // reset moved flag for next interaction
      moved.current = false;
      return;
    }
    setOpen((v) => !v);
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-pressed={open}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
        style={{ right: `${pos.right}px`, bottom: `${pos.bottom}px`, touchAction: 'none', zIndex: 99999 }}
        onClick={toggle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(v => !v); } }}    
      >
        {open ? (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7"/>
          </svg>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Chat window"
          className="fixed w-80 max-w-xs p-4 bg-white shadow-xl rounded-lg"
          style={{ right: `${pos.right}px`, bottom: `${pos.bottom + 82}px`, zIndex: 99998 }}
        >
          <div className="flex items-center justify-between mb-2">
            <strong>Chat</strong>
            <button aria-label="Close chat" onClick={() => setOpen(false)} className="text-gray-500">✕</button>
          </div>
          <div className="text-sm text-gray-600">This is a simple placeholder chat panel.</div>
        </div>
      )}
    </>
  );
}

export default Chatbot;