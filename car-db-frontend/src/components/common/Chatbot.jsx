import { useRef, useState, useEffect } from 'react';

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ right: 24, bottom: 100 });
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0, right: 24, bottom: 100 });
  const moved = useRef(false);
  const btnRef = useRef(null);
  const messagesRef = useRef(null);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: "Hi! I'm your assistant. How can I help today?" },
  ]);

  function onPointerDown(e) {
    dragging.current = true;
    moved.current = false;
    try { btnRef.current.setPointerCapture(e.pointerId); } catch (err) {}
    const rect = btnRef.current?.getBoundingClientRect() || { width: 56, height: 56 };
    start.current = { x: e.clientX, y: e.clientY, right: pos.right, bottom: pos.bottom, btnW: rect.width, btnH: rect.height };
  }

  function onPointerMove(e) {
    if (!dragging.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (!moved.current && Math.hypot(dx, dy) > 6) moved.current = true;

    const minGap = 8;
    const maxRight = Math.max(minGap, window.innerWidth - (start.current.btnW || 56) - minGap);
    const maxBottom = Math.max(minGap, window.innerHeight - (start.current.btnH || 56) - minGap);

    let newRight = start.current.right - dx;
    let newBottom = start.current.bottom - dy;

    newRight = Math.min(Math.max(minGap, newRight), maxRight);
    newBottom = Math.min(Math.max(minGap, newBottom), maxBottom);
    setPos({ right: newRight, bottom: newBottom });
  }

  function onPointerUp(e) {
    dragging.current = false;
    try { btnRef.current.releasePointerCapture(e.pointerId); } catch (err) {}
  }

  function toggle(e) {
    if (moved.current) {
      moved.current = false;
      return;
    }
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open]);

  function sendMessage(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: Date.now(), from: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setInput('');

    setTimeout(() => {
      const botReply = { id: Date.now() + 1, from: 'bot', text: `Echo: ${text}` };
      setMessages((m) => [...m, botReply]);
    }, 600);
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
          <img src="/chatbot.png" alt="chatbot" className="w-8 h-8" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Chat window"
          className="fixed w-90 max-w-sm flex flex-col border border-gray-700 rounded-[3px]"
          style={{ right: `${pos.right}px`, bottom: `${pos.bottom + 65}px`, zIndex: 99998 }}
        >
          <div className="flex items-center justify-between px-3 py-2 bg-blue-400 rounded-[2px]">
            <div>
              <p className="text-gray-200">Chat with</p>
              <p className="font-semibold">Carlo</p>
            </div>
            <button aria-label="Close chat" onClick={() => setOpen(false)} className="text-white font-bold">✕</button>
          </div>

          <div ref={messagesRef} className="px-3 py-2 overflow-y-auto space-y-2 bg-gray-800" style={{ maxHeight: '400px' }}>
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.from === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} px-3 py-2 rounded-lg max-w-[80%] break-words`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="px-3 py-2 flex items-center gap-2 bg-gray-700 rounded-[2px]">
            <input
              aria-label="Type a message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-md px-2 py-1.5 text-sm bg-gray-600"
              placeholder="Type a message..."
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
            />
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded-md">Send</button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;
