import { useRef, useState } from 'react';

function Chatbot() {
  const [open, setOpen] = useState(false);
  // store position as distance from right/bottom in pixels
  const [pos, setPos] = useState({ right: 24, bottom: 24 });
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0, right: 24, bottom: 24 });
  const btnRef = useRef(null);

  function onPointerDown(e) {
    // start dragging; use pointer events so it works with touch and mouse
    dragging.current = true;
    try { btnRef.current.setPointerCapture(e.pointerId); } catch (err) {}
    start.current = { x: e.clientX, y: e.clientY, right: pos.right, bottom: pos.bottom };
  }

  function onPointerMove(e) {
    if (!dragging.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    // moving to the right decreases the `right` value
    let newRight = Math.max(8, start.current.right - dx);
    let newBottom = Math.max(8, start.current.bottom - dy);
    setPos({ right: newRight, bottom: newBottom });
  }

  function onPointerUp(e) {
    dragging.current = false;
    try { btnRef.current.releasePointerCapture(e.pointerId); } catch (err) {}
  }

  function toggle(e) {
    // If the pointer event is part of a drag, ignore the click
    if (dragging.current) return;
    setOpen((v) => !v);
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-pressed={open}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
        style={{ right: `${pos.right}px`, bottom: `${pos.bottom}px`, touchAction: 'none' }}
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
          <svg className="w-6 h-6 text-gray-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7"/>
          </svg>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Chat window"
          className="fixed w-80 max-w-xs p-4 bg-white shadow-xl rounded-lg"
          style={{ right: `${pos.right}px`, bottom: `${pos.bottom + 82}px` }}
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