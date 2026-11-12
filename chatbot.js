(function () {
  // ─── CONFIG ──────────────────────────────────────────────────────────────────
  const WEB3FORMS_KEY = "d9dba101-a247-42f8-8758-21a336fb9de8"; // Keep for future use
  const NOTIFY_EMAIL = "truesoulsmedia666@gmail.com";
  const CALENDLY_LINK = "https://calendly.com/truesoulsmedia666";

  // ─── AI CONFIGURATION (MULTI-PROVIDER AUTOMATIC FALLBACK) ───────────────────
  // Primary: Gemini AI. Automatic Fallback when quota/usage finishes: OpenAI (ChatGPT) -> Anthropic (Claude).
  // You can set keys below or dynamically via localStorage.setItem("TSM_OPENAI_API_KEY", "sk-...") / localStorage.setItem("TSM_ANTHROPIC_API_KEY", "sk-ant-...")
  const GEMINI_API_KEY = window.TSM_GEMINI_API_KEY || localStorage.getItem("TSM_GEMINI_API_KEY") || "AIzaSyDSJiV2ZIo2tQfldJS6ks3cE9b-EHGTXu0";
  const OPENAI_API_KEY = window.TSM_OPENAI_API_KEY || localStorage.getItem("TSM_OPENAI_API_KEY") || ""; // Paste ChatGPT API key (sk-...) here for automatic quota fallback
  const ANTHROPIC_API_KEY = window.TSM_ANTHROPIC_API_KEY || localStorage.getItem("TSM_ANTHROPIC_API_KEY") || ""; // Paste Claude API key (sk-ant-...) here for automatic quota fallback

  const SYSTEM_PROMPT = `You are Aria, the personal AI assistant for True Souls Media LLP (LLPIN: ACX-5488 | GSTIN: 32AAZFT9777C1ZF), Kerala's premier Website Development, Digital Marketing, Creative Production & Event Agency based in Pala, Kottayam, Kerala, India (Registered Address: Njondimakkal Jn, Pala-Thodupuzha Rd, Pala, Kerala 686575).
Services & Approved 2026–2027 Starting Prices (+ 18% GST):
1. Website Design & Development (website-development.html): Starter Business Website ₹14,999, Professional Business Website ₹29,999, Premium Business Website ₹49,999, E-Commerce Website ₹69,999, Custom Web App (Custom Quote).
2. Digital Marketing Monthly Retainers (digital-marketing.html): Starter Growth ₹14,999/mo, Business Growth ₹24,999/mo, Performance Growth ₹39,999/mo, Enterprise (Custom Quote).
3. SEO Packages: Local SEO ₹9,999/mo, Regional Kerala SEO ₹17,999/mo, National/E-Commerce SEO ₹29,999/mo.
4. Social Media Management: Basic ₹11,999/mo, Growth ₹19,999/mo, Reels & Content Studio ₹32,999/mo.
5. AI & Marketing Automation: WhatsApp Setup ₹9,999, Lead Funnel + CRM ₹18,999, AI Chatbot + CRM ₹24,999.
6. Branding & Commercial Shoots (branding.html): Logo Starter ₹9,999, Brand Identity ₹24,999, Brand Launch Kit ₹44,999, Product Shoot ₹9,999, Reels Batch ₹21,999.
7. Wedding Photography & Planning (photography.html / wedding-planner.html): Essential Coverage ₹65,000, Signature ₹80,000, Royal ₹1,35,000, Luxury ₹2,75,000; Wedding Planning from ₹75,000.
8. Event Management (events.html): Social Events from ₹45,000, Grand Receptions & Corporate Events from ₹85,000 to ₹2,25,000+.
9. Podcast Production (podcast.html): Walk-In Studio ₹3,999/session, Single Episode ₹6,999, Monthly Packages ₹18,000 / ₹35,000 / ₹75,000.
Instagram Channels: @truesoulsads (Digital Marketing & Ads), @truesoulsstudio (Studio & Commercial Production), @truesoulsmedia (Wedding Media).
Careers: Direct job/internship/freelance crew inquiries to https://www.truesoulsmedia.com/careers (careers.html).
Full Pricing Hub: https://www.truesoulsmedia.com/pricing (pricing.html).
Booking Guidance: Direct ready clients to WhatsApp https://wa.me/919061286660 (or call +91 90612 86660) or the consultation form at index.html#contact.`;

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
    }
    #tsm-chatbot-btn:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(212,175,55,.75); }
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

    @media (max-width: 768px) {
      #tsm-chatbot-btn {
        bottom: 84px;
        right: 14px;
        width: 44px;
        height: 44px;
      }
      #tsm-chatbot-btn svg {
        width: 20px;
        height: 20px;
      }
      #tsm-chat-window {
        width: calc(100vw - 24px);
        right: 12px;
        bottom: 140px;
        max-height: calc(100dvh - 160px);
      }
    }
  `;

  // ─── INJECT CSS ───────────────────────────────────────────────────────────────
  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ─── BUILD HTML ───────────────────────────────────────────────────────────────
  const btn = document.createElement("button");
  btn.id = "tsm-chatbot-btn";
  btn.setAttribute("aria-label", "Open Chatbot");
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
      <button class="close-btn" id="tsm-close-btn" aria-label="Close Chatbot">×</button>
    </div>
    <div id="tsm-chat-messages"></div>
    <div id="tsm-input-row">
      <input id="tsm-user-input" type="text" placeholder="Type your message…" autocomplete="off">
      <button id="tsm-send-btn" aria-label="Send Message">
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
  const FALLBACK_MSG = "🙏 Our Gemini AI assistant is taking a short break! For instant help, please <strong><a href='https://wa.me/919061286660' target='_blank' style='color:#25d366;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:0.3rem;'><svg class='icon bxl-whatsapp' viewBox='0 0 24 24' width='15' height='15' style='vertical-align:middle;display:inline-block;' fill='currentColor' aria-hidden='true'><path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'/></svg> WhatsApp us here</a></strong> or call <strong>+91 90612 86660</strong>. We'd love to help plan your dream wedding! 💍";

  function formatAiText(aiText) {
    // Convert markdown links and plain URLs to clickable HTML links safely
    let links = [];
    let formattedText = aiText;

    // 1. Extract markdown links [text](url)
    formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const placeholder = `__MD_LINK_${links.length}__`;
      const isExternal = url.startsWith("http://") || url.startsWith("https://");
      const targetAttr = isExternal ? 'target="_blank"' : '';
      links.push(`<a href="${url}" ${targetAttr} style="color:#d4af37;text-decoration:underline;">${text}</a>`);
      return placeholder;
    });

    // 2. Extract plain URLs (http:// or https://)
    formattedText = formattedText.replace(/(https?:\/\/[^\s<]+)/g, (match) => {
      let cleanUrl = match;
      let suffix = "";
      const trailingPunct = /[.,!?;:]+$/;
      if (trailingPunct.test(cleanUrl)) {
        const matchPunct = cleanUrl.match(trailingPunct);
        suffix = matchPunct[0];
        cleanUrl = cleanUrl.slice(0, -suffix.length);
      }
      const placeholder = `__MD_LINK_${links.length}__`;
      links.push(`<a href="${cleanUrl}" target="_blank" style="color:#d4af37;text-decoration:underline;">${cleanUrl}</a>`);
      return placeholder + suffix;
    });

    // 3. Restore all links
    links.forEach((linkHtml, index) => {
      formattedText = formattedText.replace(`__MD_LINK_${index}__`, linkHtml);
    });

    // 4. Convert double asterisks to strong tags
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 5. Convert newlines to break tags
    formattedText = formattedText.replace(/\n/g, '<br>');

    return formattedText;
  }

  async function callGeminiProvider() {
    if (!GEMINI_API_KEY) throw new Error("No Gemini API key configured");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory })
    });
    const data = await response.json();
    if (data.error || !data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error(data.error ? data.error.message : "Empty Gemini response");
    }
    return data.candidates[0].content.parts[0].text;
  }

  async function callOpenAIProvider() {
    if (!OPENAI_API_KEY) throw new Error("No OpenAI API key configured");
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...chatHistory.slice(2).map(msg => ({
        role: msg.role === "model" ? "assistant" : "user",
        content: msg.parts[0].text
      }))
    ];
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7
      })
    });
    const data = await response.json();
    if (data.error || !data.choices || !data.choices[0]?.message?.content) {
      throw new Error(data.error ? data.error.message : "Empty OpenAI response");
    }
    return data.choices[0].message.content;
  }

  async function callClaudeProvider() {
    if (!ANTHROPIC_API_KEY) throw new Error("No Anthropic Claude API key configured");
    const messages = chatHistory.slice(2).map(msg => ({
      role: msg.role === "model" ? "assistant" : "user",
      content: msg.parts[0].text
    }));
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-latest",
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });
    const data = await response.json();
    if (data.error || !data.content || !data.content[0]?.text) {
      throw new Error(data.error ? data.error.message : "Empty Claude response");
    }
    return data.content[0].text;
  }

  async function generateAiResponse(userMessage) {
    chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

    const providers = [
      { name: "Gemini AI", fn: callGeminiProvider },
      { name: "ChatGPT (OpenAI)", fn: callOpenAIProvider },
      { name: "Claude (Anthropic)", fn: callClaudeProvider }
    ];

    for (const provider of providers) {
      try {
        const aiText = await provider.fn();
        chatHistory.push({ role: "model", parts: [{ text: aiText }] });
        const footerEl = document.getElementById("tsm-chat-footer");
        if (footerEl) footerEl.textContent = `Powered by ${provider.name}`;
        return formatAiText(aiText);
      } catch (err) {
        console.warn(`[Aria AI] ${provider.name} unavailable or quota reached:`, err.message);
      }
    }

    // Remove the unanswered user message so retry stays clean
    chatHistory.pop();
    return FALLBACK_MSG;
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
      botSay("👋 Hey there! I'm <strong>Aria</strong>, the AI assistant (powered by Gemini AI) at <strong>True Souls Media</strong>. How can I help you today?");
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
