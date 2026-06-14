/* =====================================================================
   SmartPath Student AI — chatbot.js  ("Pathy", asistente vocacional)
   Widget autocontenido: inyecta su propio HTML + CSS y conoce el producto.
   Integración: añade <script src="chatbot.js"></script> antes de </body>
   (después de script.js). No requiere backend ni claves.

   ── ¿Quieres IA real más adelante? ──────────────────────────────────
   Reemplaza el cuerpo de getBotReply() por una llamada a TU endpoint
   serverless (Vercel/Netlify/Cloudflare) que guarde la API key en el
   servidor. La key NUNCA debe ir en este archivo (es público).
   ===================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     1. ESTILOS (usan las mismas variables de styles.css → tema + dark)
     ------------------------------------------------------------------ */
  const css = `
  #sp-chat-root { position: fixed; right: clamp(14px, 3vw, 26px); bottom: clamp(14px, 3vw, 26px); z-index: 90; font-family: var(--font-body, "Inter", system-ui, sans-serif); }
  body.app-open #sp-chat-root { display: none; } /* oculto durante el test */

  #sp-chat-fab {
    display: flex; align-items: center; gap: .55rem; padding: 0 18px 0 16px; height: 56px;
    border-radius: 999px; color: #fff; font-weight: 600; font-size: .95rem; cursor: pointer;
    background: var(--grad, linear-gradient(120deg,#6C63FF,#8B5CF6,#22D3EE));
    box-shadow: 0 12px 30px rgba(108,99,255,.42); transition: transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s, opacity .2s;
  }
  #sp-chat-fab:hover { transform: translateY(-3px); box-shadow: 0 18px 42px rgba(108,99,255,.5); }
  #sp-chat-fab svg { flex: none; }
  #sp-chat-fab .sp-fab-label { white-space: nowrap; }
  #sp-chat-root.is-open #sp-chat-fab { opacity: 0; pointer-events: none; transform: scale(.6); }
  #sp-chat-fab .sp-dot { position: absolute; top: -3px; right: -3px; width: 14px; height: 14px; border-radius: 50%; background: #22D3EE; border: 2px solid var(--bg, #fff); animation: sp-pulse 2s infinite; }
  @keyframes sp-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.25); } }

  #sp-chat-panel {
    position: absolute; right: 0; bottom: 0; width: min(92vw, 380px); height: min(76vh, 600px);
    display: flex; flex-direction: column; overflow: hidden;
    background: var(--surface, #fff); color: var(--text, #0F172A);
    border: 1px solid var(--border, #E2E8F0); border-radius: 22px;
    box-shadow: 0 30px 70px rgba(15,23,42,.28);
    opacity: 0; visibility: hidden; transform: translateY(18px) scale(.96); transform-origin: bottom right;
    transition: opacity .28s cubic-bezier(.22,1,.36,1), transform .28s cubic-bezier(.22,1,.36,1), visibility .28s;
  }
  #sp-chat-root.is-open #sp-chat-panel { opacity: 1; visibility: visible; transform: none; }

  .sp-head { display: flex; align-items: center; gap: .7rem; padding: 14px 14px 14px 16px; background: var(--grad, linear-gradient(120deg,#6C63FF,#8B5CF6,#22D3EE)); color: #fff; }
  .sp-head__avatar { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 12px; background: rgba(255,255,255,.18); }
  .sp-head__name { font-family: var(--font-display, "Sora", sans-serif); font-weight: 700; font-size: 1rem; line-height: 1.1; }
  .sp-head__status { font-size: .76rem; opacity: .9; display: flex; align-items: center; gap: .35rem; }
  .sp-head__status::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: #4ADE80; box-shadow: 0 0 0 3px rgba(74,222,128,.35); }
  .sp-head__close { margin-left: auto; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; color: #fff; cursor: pointer; transition: background .2s; }
  .sp-head__close:hover { background: rgba(255,255,255,.18); }

  .sp-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: var(--bg, #F8FAFC); scroll-behavior: smooth; }
  .sp-body::-webkit-scrollbar { width: 8px; }
  .sp-body::-webkit-scrollbar-thumb { background: var(--border-strong, #CBD5E1); border-radius: 8px; }

  .sp-msg { max-width: 84%; display: flex; gap: 8px; align-items: flex-end; animation: sp-rise .3s cubic-bezier(.22,1,.36,1) both; }
  .sp-msg__avatar { flex: none; width: 26px; height: 26px; border-radius: 8px; display: grid; place-items: center; background: var(--grad, linear-gradient(120deg,#6C63FF,#22D3EE)); color: #fff; }
  .sp-msg__bubble { padding: 10px 13px; border-radius: 16px; font-size: .92rem; line-height: 1.5; box-shadow: var(--shadow-sm, 0 1px 2px rgba(15,23,42,.06)); }
  .sp-msg__bubble strong { font-weight: 700; }
  .sp-msg__bubble a { color: var(--primary, #6C63FF); font-weight: 600; }

  .sp-msg--bot { align-self: flex-start; }
  .sp-msg--bot .sp-msg__bubble { background: var(--surface, #fff); border: 1px solid var(--border, #E2E8F0); border-bottom-left-radius: 5px; }
  .sp-msg--user { align-self: flex-end; flex-direction: row-reverse; }
  .sp-msg--user .sp-msg__bubble { background: var(--grad, linear-gradient(120deg,#6C63FF,#8B5CF6)); color: #fff; border-bottom-right-radius: 5px; }
  .sp-msg--user .sp-msg__avatar { display: none; }

  .sp-cta { margin-top: 9px; display: inline-flex; align-items: center; gap: .4rem; padding: 9px 15px; border-radius: 999px; font-weight: 600; font-size: .88rem; color: #fff; cursor: pointer; background: var(--grad, linear-gradient(120deg,#6C63FF,#22D3EE)); box-shadow: 0 8px 20px rgba(108,99,255,.32); transition: transform .2s; }
  .sp-cta:hover { transform: translateY(-2px); }

  .sp-chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 16px 14px; background: var(--bg, #F8FAFC); }
  .sp-chip { padding: 8px 13px; border-radius: 999px; font-size: .82rem; font-weight: 500; cursor: pointer; color: var(--text, #0F172A); background: var(--surface, #fff); border: 1px solid var(--border-strong, #CBD5E1); transition: border-color .2s, color .2s, transform .15s; }
  .sp-chip:hover { border-color: var(--primary, #6C63FF); color: var(--primary, #6C63FF); transform: translateY(-1px); }

  .sp-foot { display: flex; align-items: center; gap: 8px; padding: 12px; border-top: 1px solid var(--border, #E2E8F0); background: var(--surface, #fff); }
  .sp-foot input { flex: 1; border: 1px solid var(--border-strong, #CBD5E1); background: var(--bg, #F8FAFC); color: var(--text, #0F172A); border-radius: 999px; padding: 11px 15px; font-size: .92rem; outline: none; transition: border-color .2s, box-shadow .2s; }
  .sp-foot input:focus { border-color: var(--primary, #6C63FF); box-shadow: 0 0 0 4px rgba(108,99,255,.18); }
  .sp-foot__send { flex: none; display: grid; place-items: center; width: 42px; height: 42px; border-radius: 50%; color: #fff; cursor: pointer; background: var(--grad, linear-gradient(120deg,#6C63FF,#22D3EE)); transition: transform .2s, opacity .2s; }
  .sp-foot__send:hover { transform: scale(1.06); }

  .sp-typing { display: flex; gap: 4px; padding: 12px 14px; align-self: flex-start; background: var(--surface, #fff); border: 1px solid var(--border, #E2E8F0); border-radius: 16px; border-bottom-left-radius: 5px; }
  .sp-typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--muted, #475569); opacity: .5; animation: sp-bounce 1.2s infinite; }
  .sp-typing span:nth-child(2) { animation-delay: .15s; }
  .sp-typing span:nth-child(3) { animation-delay: .3s; }

  @keyframes sp-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @keyframes sp-bounce { 0%,60%,100% { transform: translateY(0); opacity: .4; } 30% { transform: translateY(-5px); opacity: 1; } }

  @media (max-width: 480px) {
    #sp-chat-panel { width: calc(100vw - 24px); height: 72vh; }
    #sp-chat-fab .sp-fab-label { display: none; }
    #sp-chat-fab { padding: 0; width: 56px; justify-content: center; }
  }
  @media (prefers-reduced-motion: reduce) {
    #sp-chat-panel, .sp-msg, #sp-chat-fab, .sp-cta, .sp-chip { transition: none !important; animation: none !important; }
    .sp-typing span { animation: none !important; }
  }`;

  /* ------------------------------------------------------------------
     2. BASE DE CONOCIMIENTO
     ------------------------------------------------------------------ */
  // Carreras: lee de script.js si está disponible; si no, usa estos blurbs.
  const CAREER_INFO = {
    sistemas:    { name: "Ingeniería de Sistemas", kw: ["sistemas","software","programar","programacion","codigo","desarrollo","developer","informatica","computacion"] },
    datos:       { name: "Ciencia de Datos", kw: ["datos","data","machine learning","analitica","estadistica","cientifico de datos"] },
    ciber:       { name: "Ciberseguridad", kw: ["ciberseguridad","seguridad","hacking","hacker","ciber"] },
    admin:       { name: "Administración", kw: ["administracion","administrar","negocios","gestion","management","empresas"] },
    marketing:   { name: "Marketing", kw: ["marketing","publicidad","marca","ventas","mercadeo"] },
    psico:       { name: "Psicología", kw: ["psicologia","psicologo","mente","emociones","terapia"] },
    medicina:    { name: "Medicina", kw: ["medicina","medico","salud","doctor","enfermeria"] },
    arq:         { name: "Arquitectura", kw: ["arquitectura","arquitecto","edificios","planos"] },
    diseno:      { name: "Diseño Gráfico", kw: ["diseno","grafico","ilustracion","ux","ui","branding"] },
    derecho:     { name: "Derecho", kw: ["derecho","abogado","leyes","juridico","justicia"] },
    economia:    { name: "Economía", kw: ["economia","economista","mercado","macroeconomia"] },
    educacion:   { name: "Educación", kw: ["educacion","docente","profesor","maestro","ensenar","pedagogia"] },
    industrial:  { name: "Ingeniería Industrial", kw: ["industrial","procesos","produccion","operaciones","logistica"] },
    civil:       { name: "Ingeniería Civil", kw: ["civil","construccion","infraestructura","obras"] },
    comunicacion:{ name: "Comunicación", kw: ["comunicacion","periodismo","medios","periodista","audiovisual"] },
    contabilidad:{ name: "Contabilidad", kw: ["contabilidad","contador","contable","impuestos","finanzas"] }
  };

  function careerDesc(key) {
    // Preferimos la descripción rica de script.js si existe
    try { if (typeof CAREERS !== "undefined" && CAREERS[key]) return CAREERS[key].desc; } catch (e) {}
    return "Es una de las 16 carreras que analiza el test. Hazlo para ver cuánto encaja contigo.";
  }

  // Intenciones por palabras clave (orden = prioridad)
  const INTENTS = [
    { id: "saludo", kw: ["hola","buenas","hey","que tal","saludos","holi"],
      reply: () => ({ text: "¡Hola! 👋 Soy **Pathy**, tu guía vocacional. Puedo contarte cómo funciona el test, hablarte de cualquier carrera o ayudarte a empezar. ¿Qué te gustaría saber?", chips: ["¿Cómo funciona?", "Ver las carreras", "Empezar el test"] }) },

    { id: "empezar", kw: ["empezar","iniciar","comenzar","realizar test","hacer test","hacer el test","arrancar","quiero el test"],
      reply: () => ({ text: "¡Genial! El test toma menos de **5 minutos** (25 preguntas). Al final verás tu carrera ideal, tu % de afinidad y 3 alternativas. ¿Listo?", cta: true }) },

    { id: "como", kw: ["como funciona","funciona","proceso","como es","en que consiste","metodologia"],
      reply: () => ({ text: "Funciona en 3 pasos:\n\n**1.** Respondes 25 preguntas sobre intereses, habilidades y personalidad.\n**2.** Mi motor pondera cada respuesta sobre 16 carreras usando un modelo **RIASEC + habilidades**.\n**3.** Recibes tu carrera con mayor afinidad, 3 alternativas y un mapa visual.", chips: ["¿Cuánto dura?", "¿Qué es RIASEC?", "Empezar el test"] }) },

    { id: "duracion", kw: ["cuanto dura","cuanto tiempo","tiempo","minutos","cuantas preguntas","demora","tarda"],
      reply: () => ({ text: "Son **25 preguntas** y se completa en **menos de 5 minutos**. Puedes ir y volver entre preguntas antes de enviar.", chips: ["Empezar el test", "¿Cómo funciona?"] }) },

    { id: "gratis", kw: ["gratis","precio","costo","cuesta","pagar","registro","registrarme","cuenta"],
      reply: () => ({ text: "Es **100% gratis** y sin registro. No pedimos correo ni datos personales: solo respondes y ves tu resultado al instante.", chips: ["Empezar el test"] }) },

    { id: "precision", kw: ["preciso","confiable","exacto","seguro","cientifico","real","funciona de verdad","acertado"],
      reply: () => ({ text: "El test es **orientativo**, no determinista: te muestra hacia dónde se inclina tu perfil según marcos reconocidos (**RIASEC**, MBTI simplificado e inteligencias múltiples). Es una excelente brújula para investigar carreras, no un veredicto final. 😊", chips: ["¿Qué es RIASEC?", "Empezar el test"] }) },

    { id: "riasec", kw: ["riasec","holland","personalidad","mbti","inteligencias multiples","test de personalidad"],
      reply: () => ({ text: "**RIASEC** (de John Holland) clasifica perfiles en 6 tipos: **R**ealista, **I**nvestigador, **A**rtístico, **S**ocial, **E**mprendedor y **C**onvencional. Tus respuestas suman a estos tipos y a 6 habilidades clave; con eso calculo qué carreras encajan mejor contigo.", chips: ["Ver las carreras", "Empezar el test"] }) },

    { id: "resultados", kw: ["resultado","recomendacion","afinidad","compatibilidad","que obtengo","que me dan"],
      reply: () => ({ text: "Al terminar verás: tu **carrera recomendada**, el **% de compatibilidad**, por qué encaja contigo, tus **fortalezas detectadas**, **3 carreras alternativas** y un **gráfico radar** con tu mapa de afinidad.", cta: true }) },

    { id: "carreras", kw: ["carreras","que carreras","lista de carreras","cuales carreras","opciones","cuantas carreras"],
      reply: () => ({ text: "Analizo **16 carreras**: Ing. de Sistemas, Ciencia de Datos, Ciberseguridad, Administración, Marketing, Psicología, Medicina, Arquitectura, Diseño Gráfico, Derecho, Economía, Educación, Ing. Industrial, Ing. Civil, Comunicación y Contabilidad.\n\nEscríbeme el nombre de cualquiera y te cuento de qué trata.", chips: ["Ciencia de Datos", "Psicología", "Empezar el test"] }) },

    { id: "privacidad", kw: ["privacidad","mis datos","guardan","almacenan","informacion personal","datos personales"],
      reply: () => ({ text: "Todo se procesa **en tu navegador**. No se envía nada a ningún servidor ni se guardan tus respuestas; lo único que recordamos es tu preferencia de tema (claro/oscuro). 🔒", chips: ["Empezar el test"] }) },

    { id: "quien", kw: ["quien eres","que eres","tu nombre","como te llamas","eres un bot","ayuda","ayudame"],
      reply: () => ({ text: "Soy **Pathy** 🧭, el asistente de SmartPath Student AI. Te ayudo a entender el test y a explorar las carreras. ¿Por dónde empezamos?", chips: ["¿Cómo funciona?", "Ver las carreras", "Empezar el test"] }) },

    { id: "gracias", kw: ["gracias","genial","perfecto","excelente","buenisimo","muchas gracias"],
      reply: () => ({ text: "¡Con gusto! 💜 Cuando quieras, haz el test y descubre tu carrera ideal.", cta: true }) },

    { id: "despedida", kw: ["adios","chau","bye","nos vemos","hasta luego","me voy"],
      reply: () => ({ text: "¡Hasta pronto! 👋 Aquí estaré si necesitas orientación. Mucho éxito.", chips: ["Empezar el test"] }) }
  ];

  /* ------------------------------------------------------------------
     3. MOTOR DE RESPUESTA  ← reemplaza este cuerpo por una API real
        si algún día agregas un backend serverless.
     ------------------------------------------------------------------ */
  function normalize(s) {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  function getBotReply(raw) {
    const t = normalize(raw);

    // 1) ¿Menciona una carrera concreta?
    for (const key in CAREER_INFO) {
      if (CAREER_INFO[key].kw.some(k => t.includes(k))) {
        return {
          text: `**${CAREER_INFO[key].name}** — ${careerDesc(key)}\n\n¿Quieres ver si es tu mejor opción?`,
          cta: true
        };
      }
    }
    // 2) ¿Coincide con una intención?
    for (const intent of INTENTS) {
      if (intent.kw.some(k => t.includes(k))) return intent.reply();
    }
    // 3) Fallback
    return {
      text: "Hmm, no estoy seguro de haber entendido. 🤔 Puedo ayudarte con esto:",
      chips: ["¿Cómo funciona?", "Ver las carreras", "¿Es gratis?", "Empezar el test"]
    };
  }

  /* ------------------------------------------------------------------
     4. CONSTRUCCIÓN DEL WIDGET
     ------------------------------------------------------------------ */
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.id = "sp-chat-root";
  root.innerHTML = `
    <button id="sp-chat-fab" aria-label="Abrir asistente Pathy">
      <span class="sp-dot" aria-hidden="true"></span>
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 3c5 0 9 3.4 9 7.6 0 4.2-4 7.6-9 7.6-1 0-2-.13-2.9-.38L4 19.5l1.1-3.2C3.8 15 3 12.9 3 10.6 3 6.4 7 3 12 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="8.5" cy="10.6" r="1.2" fill="currentColor"/><circle cx="12" cy="10.6" r="1.2" fill="currentColor"/><circle cx="15.5" cy="10.6" r="1.2" fill="currentColor"/></svg>
      <span class="sp-fab-label">Pregúntale a Pathy</span>
    </button>

    <section id="sp-chat-panel" role="dialog" aria-label="Asistente Pathy" aria-modal="false">
      <header class="sp-head">
        <span class="sp-head__avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-4Z" fill="rgba(255,255,255,.25)" stroke="#fff" stroke-width="2"/><path d="M9 12.5l2 2 4-4.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <div>
          <div class="sp-head__name">Pathy</div>
          <div class="sp-head__status">En línea · Asistente vocacional</div>
        </div>
        <button class="sp-head__close" id="sp-chat-close" aria-label="Cerrar chat">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </header>

      <div class="sp-body" id="sp-chat-body" aria-live="polite"></div>
      <div class="sp-chips" id="sp-chat-chips"></div>

      <div class="sp-foot">
        <input id="sp-chat-input" type="text" placeholder="Escribe tu pregunta…" autocomplete="off" aria-label="Mensaje" />
        <button class="sp-foot__send" id="sp-chat-send" aria-label="Enviar">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 12 20 4l-6 16-3-7-7-1Z" fill="currentColor"/></svg>
        </button>
      </div>
    </section>`;
  document.body.appendChild(root);

  /* ------------------------------------------------------------------
     5. LÓGICA / EVENTOS
     ------------------------------------------------------------------ */
  const fab    = root.querySelector("#sp-chat-fab");
  const panel  = root.querySelector("#sp-chat-panel");
  const body   = root.querySelector("#sp-chat-body");
  const chips  = root.querySelector("#sp-chat-chips");
  const input  = root.querySelector("#sp-chat-input");
  const sendBtn= root.querySelector("#sp-chat-send");
  let greeted = false;

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Formato ligero seguro: **negrita**, saltos de línea (texto ya escapado)
  const fmt = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");

  function scrollDown() { body.scrollTop = body.scrollHeight; }

  function addUser(text) {
    const el = document.createElement("div");
    el.className = "sp-msg sp-msg--user";
    el.innerHTML = `<div class="sp-msg__bubble">${esc(text)}</div>`;
    body.appendChild(el); scrollDown();
  }

  function addBot(payload) {
    const el = document.createElement("div");
    el.className = "sp-msg sp-msg--bot";
    let html = `<span class="sp-msg__avatar" aria-hidden="true"><svg viewBox="0 0 24 24" width="15" height="15"><path d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-4Z" fill="none" stroke="#fff" stroke-width="2"/></svg></span><div class="sp-msg__bubble">${fmt(payload.text)}`;
    if (payload.cta) html += `<br><span class="sp-cta" data-sp-start>Realizar Test <svg viewBox="0 0 24 24" width="15" height="15" style="vertical-align:-2px"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
    html += `</div>`;
    el.innerHTML = html;
    body.appendChild(el);
    if (payload.cta) el.querySelector("[data-sp-start]").addEventListener("click", startTest);
    renderChips(payload.chips || []);
    scrollDown();
  }

  function renderChips(list) {
    chips.innerHTML = "";
    list.forEach(label => {
      const c = document.createElement("button");
      c.className = "sp-chip"; c.type = "button"; c.textContent = label;
      c.addEventListener("click", () => handleSend(label));
      chips.appendChild(c);
    });
  }

  function showTyping() {
    const t = document.createElement("div");
    t.className = "sp-typing"; t.id = "sp-typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(t); scrollDown();
  }
  function hideTyping() { const t = body.querySelector("#sp-typing"); if (t) t.remove(); }

  function handleSend(textFromChip) {
    const text = (textFromChip != null ? textFromChip : input.value).trim();
    if (!text) return;
    addUser(text);
    input.value = "";
    chips.innerHTML = "";
    showTyping();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => { hideTyping(); addBot(getBotReply(text)); }, reduce ? 120 : 600 + Math.random() * 400);
  }

  function startTest() {
    if (typeof window.openApp === "function") { window.openApp(); }
    else { const b = document.querySelector('[data-action="start-test"]'); if (b) b.click(); }
    closePanel();
  }

  function openPanel() {
    root.classList.add("is-open");
    if (!greeted) {
      greeted = true;
      showTyping();
      setTimeout(() => { hideTyping(); addBot(INTENTS[0].reply()); }, 500);
    }
    setTimeout(() => input.focus(), 320);
  }
  function closePanel() { root.classList.remove("is-open"); }

  fab.addEventListener("click", openPanel);
  root.querySelector("#sp-chat-close").addEventListener("click", closePanel);
  sendBtn.addEventListener("click", () => handleSend());
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") handleSend(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && root.classList.contains("is-open")) closePanel(); });
})();