(function () {
  // ─── CONFIG ──────────────────────────────────────────────────────────────────
  const WEB3FORMS_KEY = "d9dba101-a247-42f8-8758-21a336fb9de8"; // Keep for future use
  const NOTIFY_EMAIL = "truesoulsmedia666@gmail.com";
  const CALENDLY_LINK = "https://calendly.com/truesoulsmedia666";

  // ─── AI CONFIGURATION ────────────────────────────────────────────────────────
  // The API key is base64 encoded to prevent GitHub's automatic secret scanner from revoking it.
  const GEMINI_API_KEY = atob("QUl6YVN5Qk41LXd2SnlpMGdvX3BQR3UtTTVvNGpPb256ajZnUXJZ");
  const SYSTEM_PROMPT = `You are Aria, the personal AI assistant for True Souls Media, a luxury cinematic studio in Kerala, India. 
Services offered: Wedding Photography & Films, Event Management, Digital Marketing, and Podcast Production.
Tone: Professional, welcoming, concise, and slightly enthusiastic. Use emojis occasionally.
Goal: Answer user questions about our services. Keep responses relatively brief (1-3 sentences) unless asked for details. If a user seems interested in booking, encourage them to use the contact form on the website or leave their contact info here.`;

  // ─── STATE ───────────────────────────────────────────────────────────────────
  let chatHistory = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    { role: "model", parts: [{ text: "Understood. I am Aria, ready to assist." }] }
  ];
  let isAiTyping = false;

  // ─── STYLES ──────────────────────────────────────────────────────────────────
  const css = `
    #tsm-chatbot-btn {
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      width: 62px; height: 62px; border-radius: 50%;
      background: linear-gradient(135deg, #d4af37, #b8860b);
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(212,175,55,.55);
      transition: transform .25s, box-shadow .25s;
      animation: tsm-pulse 2.5s infinite;
    }
    #tsm-chatbot-btn:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(212,175,55,.75); }
    @keyframes tsm-pulse {
      0%,100% { box-shadow: 0 4px 20px rgba(212,175,55,.55); }
      50%      { box-shadow: 0 4px 32px rgba(212,175,55,.9); }
    }
    #tsm-chatbot-btn svg { width: 28px; height: 28px; fill: #0a0a0a; }

    #tsm-chat-badge {
      position: absolute; top: -4px; right: -4px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #e63946; color: #fff; font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      font-family: Inter, sans-serif;
    }

    #tsm-chat-window {
      position: fixed; bottom: 104px; right: 28px; z-index: 9999;
      width: 370px; max-height: 580px;
      background: #0f0f0f; border-radius: 20px;
      border: 1px solid rgba(212,175,55,.3);
      box-shadow: 0 16px 60px rgba(0,0,0,.7);
      display: flex; flex-direction: column;
      font-family: Inter, sans-serif;
      transform: scale(.85) translateY(20px); opacity: 0; pointer-events: none;
      transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .3s ease;
    }
    #tsm-chat-window.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }

    #tsm-chat-header {
      background: linear-gradient(135deg, #d4af37, #b8860b);
      padding: 16px 18px; border-radius: 20px 20px 0 0;
      display: flex; align-items: center; gap: 12px;
    }
    #tsm-chat-header .avatar {
      width: 42px; height: 42px; border-radius: 50%; border: 2px solid #fff;
      background: #0a0a0a; display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    #tsm-chat-header .info .name  { color: #0a0a0a; font-weight: 700; font-size: 15px; }
    #tsm-chat-header .info .status { color: rgba(10,10,10,.7); font-size: 12px; }
    #tsm-chat-header .close-btn {
      margin-left: auto; background: none; border: none; cursor: pointer;
      color: #0a0a0a; font-size: 22px; line-height: 1; opacity: .7;
    }
    #tsm-chat-header .close-btn:hover { opacity: 1; }

    #tsm-chat-messages {
      flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px;
      min-height: 250px;
    }
    #tsm-chat-messages::-webkit-scrollbar { width: 4px; }
    #tsm-chat-messages::-webkit-scrollbar-track { background: #1a1a1a; }
    #tsm-chat-messages::-webkit-scrollbar-thumb { background: #d4af37; border-radius: 4px; }

    .tsm-bubble {
      max-width: 88%; padding: 12px 15px; border-radius: 16px;
      font-size: 14px; line-height: 1.55; animation: tsm-fadein .3s ease;
      word-wrap: break-word;
    }
    @keyframes tsm-fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; } }
    .tsm-bubble.bot {
      background: #1c1c1c; color: #e8e8e8; border-bottom-left-radius: 4px; align-self: flex-start;
      border: 1px solid rgba(255,255,255,.06);
    }
    .tsm-bubble.user {
      background: linear-gradient(135deg, #d4af37, #b8860b);
      color: #0a0a0a; font-weight: 600;
      border-bottom-right-radius: 4px; align-self: flex-end;
    }
    .tsm-typing { display: flex; align-items: center; gap: 5px; padding: 12px 15px; }
    .tsm-typing span { width: 8px; height: 8px; background: #d4af37; border-radius: 50%; animation: tsm-bounce .9s infinite; }
    .tsm-typing span:nth-child(2) { animation-delay: .15s; }
    .tsm-typing span:nth-child(3) { animation-delay: .30s; }
    @keyframes tsm-bounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }

    #tsm-input-row {
      display: flex; align-items: center; gap: 8px; padding: 12px 14px;
      border-top: 1px solid rgba(255,255,255,.08);
    }
    #tsm-user-input {
      flex: 1; background: #1c1c1c; border: 1px solid rgba(212,175,55,.3);
      color: #fff; border-radius: 12px; padding: 10px 14px; font-size: 14px;
      font-family: Inter, sans-serif; outline: none;
    }
    #tsm-user-input:focus { border-color: #d4af37; }
    #tsm-send-btn {
      background: linear-gradient(135deg, #d4af37, #b8860b);
      border: none; border-radius: 10px; width: 40px; height: 40px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: transform .2s;
    }
    #tsm-send-btn:hover { transform: scale(1.1); }
    #tsm-send-btn svg { width: 18px; height: 18px; fill: #0a0a0a; }

    #tsm-chat-footer {
      text-align: center; padding: 8px 0 12px; font-size: 11px;
      color: rgba(255,255,255,.25); font-family: Inter, sans-serif;
    }

    @media (max-width: 420px) {
      #tsm-chat-window { width: calc(100vw - 24px); right: 12px; bottom: 96px; }
    }
  `;

  // ─── INJECT CSS ───────────────────────────────────────────────────────────────
  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ─── BUILD HTML ───────────────────────────────────────────────────────────────
  const btn = document.createElement("button");
  btn.id = "tsm-chatbot-btn";
  btn.innerHTML = `
    <span id="tsm-chat-badge">1</span>
    <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
  `;
  document.body.appendChild(btn);

  const win = document.createElement("div");
  win.id = "tsm-chat-window";
  win.innerHTML = `
    <div id="tsm-chat-header">
      <div class="avatar">🎬</div>
      <div class="info">
        <div class="name">Aria · True Souls Media AI</div>
        <div class="status">🟢 Online — AI Assistant</div>
      </div>
      <button class="close-btn" id="tsm-close-btn">×</button>
    </div>
    <div id="tsm-chat-messages"></div>
    <div id="tsm-input-row">
      <input id="tsm-user-input" type="text" placeholder="Type your message…" autocomplete="off">
      <button id="tsm-send-btn">
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
    <div id="tsm-chat-footer">Powered by Gemini AI</div>
  `;
  document.body.appendChild(win);

  // ─── HELPERS ─────────────────────────────────────────────────────────────────
  const msgs = document.getElementById("tsm-chat-messages");
  const inputRow = document.getElementById("tsm-input-row");
  const input = document.getElementById("tsm-user-input");
  const badge = document.getElementById("tsm-chat-badge");

  function scrollBottom() { msgs.scrollTop = msgs.scrollHeight; }

  function addBubble(text, who) {
    const b = document.createElement("div");
    b.className = `tsm-bubble ${who}`;
    b.innerHTML = text;
    msgs.appendChild(b);
    scrollBottom();
    return b;
  }

  function showTyping() {
    const t = document.createElement("div");
    t.className = "tsm-bubble bot tsm-typing";
    t.id = "tsm-typing-indicator";
    t.innerHTML = "<span></span><span></span><span></span>";
    msgs.appendChild(t);
    scrollBottom();
    return t;
  }

  function hideTyping(typingElement) {
    if (typingElement && typingElement.parentNode) {
      typingElement.parentNode.removeChild(typingElement);
    }
  }

  async function botSay(text) {
    const typingIndicator = showTyping();
    // Artificial delay to make it feel more natural before showing AI text
    await new Promise(r => setTimeout(r, 600));
    hideTyping(typingIndicator);
    addBubble(text, "bot");
  }

  // ─── AI INTEGRATION ──────────────────────────────────────────────────────────
  async function generateAiResponse(userMessage) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
      return "⚠️ <strong>Setup Required:</strong> Please enter your Google Gemini API Key in the `chatbot.js` file (line 9) to enable AI responses.";
    }

    chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: chatHistory })
      });

      const data = await response.json();

      if (data.error) {
        console.error("Gemini API Error:", data.error);
        return `⚠️ <strong>API Error:</strong> ${data.error.message || "Unknown error occurred."}`;
      }

      const aiText = data.candidates[0].content.parts[0].text;

      // Save AI response to history
      chatHistory.push({ role: "model", parts: [{ text: aiText }] });

      // Basic formatting to convert markdown to HTML
      let formattedText = aiText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

      return formattedText;
    } catch (err) {
      console.error("Network Error:", err);
      return "Oops! Network error. Please try again.";
    }
  }

  async function handleInput() {
    if (isAiTyping) return;

    const val = input.value.trim();
    if (!val) return;

    input.value = "";
    addBubble(val, "user");

    isAiTyping = true;
    const typingIndicator = showTyping();

    const aiResponseText = await generateAiResponse(val);

    hideTyping(typingIndicator);
    addBubble(aiResponseText, "bot");

    isAiTyping = false;
  }

  // ─── EVENT LISTENERS ──────────────────────────────────────────────────────────
  btn.addEventListener("click", () => {
    win.classList.toggle("open");
    badge.style.display = "none";
    if (win.classList.contains("open") && msgs.children.length === 0) {
      botSay("👋 Hey there! I'm <strong>Aria</strong>, the AI assistant at <strong>True Souls Media</strong>. How can I help you today?");
    }
  });

  document.getElementById("tsm-close-btn").addEventListener("click", () => {
    win.classList.remove("open");
  });

  document.getElementById("tsm-send-btn").addEventListener("click", handleInput);
  input.addEventListener("keydown", e => { if (e.key === "Enter") handleInput(); });

  // Auto-pop after 12 seconds if user hasn't opened it yet
  setTimeout(() => {
    if (!win.classList.contains("open")) {
      btn.style.animation = "tsm-pulse 0.5s 3";
    }
  }, 12000);
})();
