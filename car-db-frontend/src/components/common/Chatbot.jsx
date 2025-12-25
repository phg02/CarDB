import { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const STORAGE_KEY = 'chatbot_responses_cache';

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
  const [loading, setLoading] = useState(false);

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

  // Get cached response from local storage
  const getCachedResponse = (message) => {
    try {
      const cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const cacheEntry = cache[message];
      
      if (cacheEntry) {
        const age = Date.now() - cacheEntry.timestamp;
        if (age < CACHE_TTL) {
          return cacheEntry.reply;
        } else {
          // Cache expired, remove it
          delete cache[message];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
        }
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
    }
    return null;
  };

  // Store response in local storage
  const setCachedResponse = (message, reply) => {
    try {
      const cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      cache[message] = {
        reply,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  };

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function sendMessage(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), from: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Check cache first
      const cachedReply = getCachedResponse(text);
      if (cachedReply) {
        const botReply = { id: Date.now() + 1, from: 'bot', text: cachedReply };
        setMessages((m) => [...m, botReply]);
        setLoading(false);
        return;
      }

      // Call chatbot API
      const response = await axios.post('/api/chatbot/chat', 
        { message: text },
        { withCredentials: true }
      );

      const botReply = response.data.reply || 'Sorry, I could not process your request.';
      
      // Cache the response
      setCachedResponse(text, botReply);

      const botMsg = { id: Date.now() + 1, from: 'bot', text: botReply };
      setMessages((m) => [...m, botMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorReply = error.response?.data?.error || 'Sorry, something went wrong. Please try again.';
      const botMsg = { id: Date.now() + 1, from: 'bot', text: errorReply };
      setMessages((m) => [...m, botMsg]);
    } finally {
      setLoading(false);
    }
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
          className="fixed w-[calc(100vw-2rem)] sm:w-96 max-w-sm flex flex-col border border-gray-700 rounded-[3px]"
          style={{ right: `${pos.right}px`, bottom: `${pos.bottom + 65}px`, zIndex: 99998 }}
        >
          <div className="flex items-center justify-between px-3 py-2 bg-blue-400 rounded-[2px]">
            <div>
              <p className="text-sm text-gray-200">Chat with</p>
              <p className="font-semibold">Carlo</p>
            </div>
            <button aria-label="Close chat" onClick={() => setOpen(false)} className="text-white font-bold text-xl">✕</button>
          </div>

          <div ref={messagesRef} className="px-3 py-2 overflow-y-auto space-y-2 bg-gray-800 h-64 sm:h-80" style={{ maxHeight: '400px' }}>
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.from === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} px-3 py-2 rounded-lg max-w-[80%] break-words text-sm`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="px-2 sm:px-3 py-2 flex items-center gap-2 bg-gray-700 rounded-[2px]">
            <input
              aria-label="Type a message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 rounded-md px-2 py-1.5 text-sm bg-gray-600 text-white disabled:opacity-50"
              placeholder="Type a message..."
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-md text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;
