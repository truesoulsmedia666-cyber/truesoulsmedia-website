
(function () {
  // ─── CONFIG ──────────────────────────────────────────────────────────────────
  const WEB3FORMS_KEY = "d9dba101-a247-42f8-8758-21a336fb9de8"; // ← already set in contact form
  const NOTIFY_EMAIL  = "truesoulsmedia666@gmail.com";
  const CALENDLY_LINK = "https://calendly.com/truesoulsmedia666"; // update if you have Calendly

  // ─── CONVERSATION FLOW ───────────────────────────────────────────────────────
  const flow = {
    welcome: {
      msg: "👋 Hey there! I'm <strong>Aria</strong>, your personal assistant at <strong>True Souls Media</strong>. What brings you here today?",
      choices: [
        { label: "💍 Wedding Photography / Film",   next: "wedding"   },
        { label: "🎉 Event Management",              next: "event"     },
        { label: "📣 Digital Marketing",             next: "digital"   },
        { label: "🎙️ Podcast Production",            next: "podcast"   },
        { label: "🤔 Just Browsing",                 next: "browse"    },
      ],
    },
    wedding: {
      msg: "Congratulations on your upcoming wedding! 🎊 We shoot destination weddings worldwide — UK, UAE, USA, and more. When is your big day?",
      choices: [
        { label: "Within 3 months",  next: "urgent"  },
        { label: "3 – 6 months",     next: "capture" },
        { label: "6+ months away",   next: "capture" },
        { label: "Just exploring",   next: "capture" },
      ],
    },
    urgent: {
      msg: "Oh wow, that's soon! We'd love to fit you in. 🚀 Let me grab your details and our lead producer will call you within <strong>2 hours</strong>.",
      next: "lead",
    },
    event: {
      msg: "Amazing! We handle corporate conferences, luxury parties, brand launches — fully managed end-to-end. What type of event do you have in mind?",
      choices: [
        { label: "🏢 Corporate Conference",   next: "capture" },
        { label: "🎂 Private / Social Event", next: "capture" },
        { label: "🚀 Brand Launch",           next: "capture" },
        { label: "🎓 Other",                  next: "capture" },
      ],
    },
    digital: {
      msg: "Great choice! We help businesses grow globally with SEO, social media, video content & more. What's your biggest challenge right now?",
      choices: [
        { label: "📉 Not enough online leads",    next: "capture" },
        { label: "📱 Weak social media presence", next: "capture" },
        { label: "🔍 Low Google ranking",         next: "capture" },
        { label: "🌐 Need a full strategy",       next: "capture" },
      ],
    },
    podcast: {
      msg: "Podcasts are the #1 trust-builder for brands right now! 🎤 We handle everything from recording to publishing on Spotify & Apple. How many episodes are you thinking?",
      choices: [
        { label: "6 Episodes / month  — ₹35,000",  next: "capture" },
        { label: "10 Episodes / month — ₹75,000",  next: "capture" },
        { label: "One-time pilot episode",          next: "capture" },
        { label: "Not sure yet",                   next: "capture" },
      ],
    },
    browse: {
      msg: "No problem at all! 😊 Feel free to look around. If you have any questions about our services, I'm right here. Can I share a quick overview of what we offer?",
      choices: [
        { label: "Yes, show me!",  next: "overview" },
        { label: "Maybe later",    next: "bye"      },
      ],
    },
    overview: {
      msg: "We are a <strong>luxury cinematic studio</strong> based in Kerala, India. We offer:<br>💍 Wedding Photography & Films<br>🎉 Event Management<br>📣 Digital Marketing<br>🎙️ Podcast Production<br><br>All services available globally for English-speaking clients. Want to chat with our team?",
      choices: [
        { label: "Yes, book a free call!",  next: "capture" },
        { label: "Maybe later",             next: "bye"     },
      ],
    },
    capture: {
      msg: "Perfect! Let me connect you with Abin J Antony and Noel Raju, our Lead Producers. Drop your name and WhatsApp / email below and we'll reach out within 24 hours! 🙌",
      next: "lead",
    },
    bye: {
      msg: "No problem! If you ever need us, just click the chat button again. Have an amazing day! ✨",
    },
  };

  // ─── STATE ───────────────────────────────────────────────────────────────────
  let state          = "welcome";
  let selectedService = "";
  let leadStep       = 0; // 0=idle, 1=waiting name, 2=waiting contact
  let leadName       = "";

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
    }
    #tsm-chat-messages::-webkit-scrollbar { width: 4px; }
    #tsm-chat-messages::-webkit-scrollbar-track { background: #1a1a1a; }
    #tsm-chat-messages::-webkit-scrollbar-thumb { background: #d4af37; border-radius: 4px; }

    .tsm-bubble {
      max-width: 88%; padding: 12px 15px; border-radius: 16px;
      font-size: 14px; line-height: 1.55; animation: tsm-fadein .3s ease;
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

    #tsm-choices { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 16px 14px; }
    .tsm-choice {
      background: rgba(212,175,55,.1); border: 1px solid rgba(212,175,55,.35);
      color: #d4af37; font-size: 13px; font-weight: 500; border-radius: 20px;
      padding: 8px 14px; cursor: pointer; transition: background .2s, transform .15s;
      font-family: Inter, sans-serif;
    }
    .tsm-choice:hover { background: rgba(212,175,55,.22); transform: translateY(-2px); }

    #tsm-input-row {
      display: none; align-items: center; gap: 8px; padding: 12px 14px;
      border-top: 1px solid rgba(255,255,255,.08);
    }
    #tsm-input-row.visible { display: flex; }
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
        <div class="name">Aria · True Souls Media</div>
        <div class="status">🟢 Online — Usually replies instantly</div>
      </div>
      <button class="close-btn" id="tsm-close-btn">×</button>
    </div>
    <div id="tsm-chat-messages"></div>
    <div id="tsm-choices"></div>
    <div id="tsm-input-row">
      <input id="tsm-user-input" type="text" placeholder="Type your answer…" autocomplete="off">
      <button id="tsm-send-btn">
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
    <div id="tsm-chat-footer">Powered by True Souls Media AI</div>
  `;
  document.body.appendChild(win);

  // ─── HELPERS ─────────────────────────────────────────────────────────────────
  const msgs    = document.getElementById("tsm-chat-messages");
  const choices = document.getElementById("tsm-choices");
  const inputRow = document.getElementById("tsm-input-row");
  const input   = document.getElementById("tsm-user-input");
  const badge   = document.getElementById("tsm-chat-badge");

  function scrollBottom() { msgs.scrollTop = msgs.scrollHeight; }

  function addBubble(text, who) {
    const b = document.createElement("div");
    b.className = `tsm-bubble ${who}`;
    b.innerHTML = text;
    msgs.appendChild(b);
    scrollBottom();
    return b;
  }

  function showTyping(ms = 900) {
    return new Promise(resolve => {
      const t = document.createElement("div");
      t.className = "tsm-bubble bot tsm-typing";
      t.innerHTML = "<span></span><span></span><span></span>";
      msgs.appendChild(t);
      scrollBottom();
      setTimeout(() => { msgs.removeChild(t); resolve(); }, ms);
    });
  }

  function clearChoices() { choices.innerHTML = ""; }

  function renderChoices(list) {
    clearChoices();
    inputRow.classList.remove("visible");
    list.forEach(c => {
      const btn = document.createElement("button");
      btn.className = "tsm-choice";
      btn.textContent = c.label;
      btn.addEventListener("click", () => handleChoice(c));
      choices.appendChild(btn);
    });
  }

  async function botSay(text, delay = 900) {
    await showTyping(delay);
    addBubble(text, "bot");
    scrollBottom();
  }

  async function goToState(s) {
    state = s;
    const node = flow[s];
    if (!node) return;

    if (s === "lead") { await startLeadCapture(); return; }

    await botSay(node.msg);

    if (node.choices) {
      renderChoices(node.choices);
    } else if (node.next) {
      setTimeout(() => goToState(node.next), 400);
    }
  }

  async function handleChoice(choice) {
    clearChoices();
    addBubble(choice.label, "user");
    // track service for lead email
    if (["wedding","event","digital","podcast"].includes(choice.next)) {
      selectedService = choice.label;
    }
    await goToState(choice.next);
  }

  // ─── LEAD CAPTURE FLOW ───────────────────────────────────────────────────────
  async function startLeadCapture() {
    leadStep = 1;
    await botSay("What's your <strong>name</strong>? 😊", 700);
    clearChoices();
    inputRow.classList.add("visible");
    input.focus();
  }

  async function handleInput() {
    const val = input.value.trim();
    if (!val) return;
    input.value = "";
    addBubble(val, "user");

    if (leadStep === 1) {
      leadName = val;
      leadStep = 2;
      await botSay(`Great to meet you, <strong>${leadName}</strong>! 🙌 Now drop your <strong>WhatsApp number or email</strong> and we'll be in touch within 24 hours!`, 900);
    } else if (leadStep === 2) {
      leadStep = 0;
      inputRow.classList.remove("visible");
      await botSay("✅ Got it! Sending your details to our team now...", 600);
      await submitLead(leadName, val);
    }
  }

  async function submitLead(name, contact) {
    const body = {
      access_key: WEB3FORMS_KEY,
      subject: `🤖 NEW CHATBOT LEAD — ${name}`,
      from_name: "True Souls Media AI Chatbot",
      to: NOTIFY_EMAIL,
      message: `New lead from website chatbot!\n\nName: ${name}\nContact: ${contact}\nService Interest: ${selectedService || "Not specified"}\n\nReply to this lead ASAP!`,
    };

    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await botSay(`🎉 You're all set, <strong>${name}</strong>! <strong>Abin J Antony</strong> will personally reach out to you very soon.<br><br>Want to book a free 15-min Zoom call right now?`, 1000);
      renderChoices([
        { label: "📅 Book a Zoom call now", next: "_calendly" },
        { label: "I'll wait for the call",  next: "bye"       },
      ]);
    } catch {
      await botSay("All done! We'll be in touch soon. Have a great day! ✨");
    }
  }

  // ─── EVENT LISTENERS ──────────────────────────────────────────────────────────
  btn.addEventListener("click", () => {
    win.classList.toggle("open");
    badge.style.display = "none";
    if (win.classList.contains("open") && msgs.children.length === 0) {
      setTimeout(() => goToState("welcome"), 400);
    }
  });

  document.getElementById("tsm-close-btn").addEventListener("click", () => {
    win.classList.remove("open");
  });

  document.getElementById("tsm-send-btn").addEventListener("click", handleInput);
  input.addEventListener("keydown", e => { if (e.key === "Enter") handleInput(); });

  // Special choice handler for Calendly
  document.addEventListener("click", e => {
    if (e.target.classList.contains("tsm-choice") && e.target.dataset.next === "_calendly") return;
    if (e.target.dataset.calendly) window.open(CALENDLY_LINK, "_blank");
  });

  // Override renderChoices to handle special _calendly action
  const origRender = renderChoices;
  function renderChoices(list) {
    clearChoices();
    inputRow.classList.remove("visible");
    list.forEach(c => {
      const btn = document.createElement("button");
      btn.className = "tsm-choice";
      btn.textContent = c.label;
      btn.addEventListener("click", () => {
        if (c.next === "_calendly") {
          window.open(CALENDLY_LINK, "_blank");
          clearChoices();
          addBubble("📅 Book a Zoom call now", "user");
          botSay("Perfect! We'll see you on the call. Talk soon! 🎬✨").then(() => goToState("bye"));
        } else {
          handleChoice(c);
        }
      });
      choices.appendChild(btn);
    });
  }

  // Auto-pop after 12 seconds if user hasn't opened it yet
  setTimeout(() => {
    if (!win.classList.contains("open")) {
      btn.style.animation = "tsm-pulse 0.5s 3";
    }
  }, 12000);
})();
