/* =====================================================================
   SmartPath Student AI — script.js
   - Encuesta tipo wizard (25 preguntas)
   - Motor de recomendación con ponderación por carrera, habilidad y RIASEC
   - Gráfico radar (canvas) + constelación neural del hero
   - Modo oscuro, scroll reveal, contadores y navegación
   ===================================================================== */
"use strict";

/* ===================================================================
   1. CATÁLOGO DE CARRERAS
   =================================================================== */
const CAREERS = {
  sistemas:     { name: "Ingeniería de Sistemas", desc: "Diseñas, construyes y mantienes software y sistemas que resuelven problemas reales. Tu lógica y tu gusto por la tecnología encajan con el corazón de esta carrera." },
  datos:        { name: "Ciencia de Datos",       desc: "Conviertes datos en decisiones con estadística, machine learning y visualización. Tu mente analítica y curiosa es justo lo que esta disciplina demanda." },
  ciber:        { name: "Ciberseguridad",         desc: "Proteges la información y los sistemas frente a amenazas digitales. Tu pensamiento lógico y tu rigor son la base de la seguridad informática." },
  admin:        { name: "Administración",         desc: "Planificas, lideras y haces que las organizaciones funcionen. Tu visión estratégica y tu capacidad de coordinar personas brillan aquí." },
  marketing:    { name: "Marketing",              desc: "Conectas marcas con personas a través de ideas y datos. Tu creatividad y tu poder de comunicación son tu mayor activo." },
  psico:        { name: "Psicología",             desc: "Comprendes la mente y el comportamiento para ayudar a las personas. Tu empatía y tu escucha son el centro de esta vocación." },
  medicina:     { name: "Medicina",               desc: "Cuidas y mejoras la salud de las personas con ciencia y vocación de servicio. Tu interés por el bienestar humano te impulsa." },
  arq:          { name: "Arquitectura",           desc: "Diseñas espacios donde la estética se une a la función. Tu visión espacial y creativa te permite imaginar lo que otros habitarán." },
  diseno:       { name: "Diseño Gráfico",         desc: "Comunicas ideas a través de lo visual: identidad, interfaces y contenido. Tu creatividad y tu sensibilidad estética destacan." },
  derecho:      { name: "Derecho",                desc: "Interpretas y aplicas las normas para resolver conflictos y defender derechos. Tu capacidad de argumentar y debatir es clave." },
  economia:     { name: "Economía",               desc: "Analizas cómo se mueven los recursos en mercados y sociedades. Tu pensamiento cuantitativo y estratégico encaja a la perfección." },
  educacion:    { name: "Educación",              desc: "Formas a las próximas generaciones y transformas vidas a través del aprendizaje. Tu vocación de enseñar y tu empatía son tu fortaleza." },
  industrial:   { name: "Ingeniería Industrial",  desc: "Optimizas procesos, recursos y operaciones para que todo funcione mejor. Tu mente organizada y resolutiva es ideal para esto." },
  civil:        { name: "Ingeniería Civil",       desc: "Diseñas y construyes la infraestructura que sostiene a la sociedad. Tu precisión y tu gusto por lo tangible te definen." },
  comunicacion: { name: "Comunicación",           desc: "Cuentas historias e informas con impacto en medios y organizaciones. Tu expresividad y tu creatividad son tu sello." },
  contabilidad: { name: "Contabilidad",           desc: "Llevas el control financiero que toda organización necesita. Tu precisión, orden y rigor numérico son indispensables." }
};

const SKILL_LABELS = {
  problemas:   "Resolución de problemas",
  comunicacion:"Comunicación",
  matematicas: "Pensamiento matemático",
  creatividad: "Creatividad",
  liderazgo:   "Liderazgo",
  datos:       "Análisis de datos"
};

const RIASEC_LABELS = {
  R: "Realista", I: "Investigador", A: "Artístico",
  S: "Social",   E: "Emprendedor",  C: "Convencional"
};

/* ===================================================================
   2. BANCO DE PREGUNTAS (25)
   Cada opción otorga puntos a carreras, habilidades y un código RIASEC.
   =================================================================== */
const QUESTIONS = [
  /* ---------- INTERESES (7) ---------- */
  { cat: "Intereses", q: "¿Qué tipo de actividad disfrutas más en tu tiempo libre?", opts: [
    { t: "Programar, armar o reparar tecnología", s: { sistemas: 3, ciber: 2, datos: 1 }, sk: { problemas: 2 }, r: "I" },
    { t: "Dibujar, diseñar o crear contenido visual", s: { diseno: 3, arq: 2, comunicacion: 1 }, sk: { creatividad: 2 }, r: "A" },
    { t: "Ayudar o escuchar a las personas", s: { psico: 3, educacion: 2, medicina: 1 }, sk: { comunicacion: 2 }, r: "S" },
    { t: "Organizar, planificar o liderar grupos", s: { admin: 3, industrial: 1, derecho: 1 }, sk: { liderazgo: 2 }, r: "E" }
  ]},
  { cat: "Intereses", q: "Un documental que verías sin dudarlo trata sobre…", opts: [
    { t: "Avances de la IA y el software", s: { sistemas: 3, datos: 2 }, sk: { problemas: 1 }, r: "I" },
    { t: "El cuerpo humano y la salud", s: { medicina: 3, psico: 1 }, sk: {}, r: "I" },
    { t: "Grandes empresas y economía global", s: { economia: 3, admin: 2, contabilidad: 1 }, sk: {}, r: "E" },
    { t: "Arquitectura, arte y diseño", s: { arq: 3, diseno: 2 }, sk: { creatividad: 1 }, r: "A" }
  ]},
  { cat: "Intereses", q: "Te entregan un problema nuevo. Lo primero que haces es…", opts: [
    { t: "Buscar datos y analizarlos", s: { datos: 3, economia: 1, contabilidad: 1 }, sk: { datos: 2 }, r: "I" },
    { t: "Diseñar una solución creativa", s: { diseno: 2, arq: 2, marketing: 1 }, sk: { creatividad: 2 }, r: "A" },
    { t: "Hablar con la gente involucrada", s: { comunicacion: 2, psico: 2, admin: 1 }, sk: { comunicacion: 2 }, r: "S" },
    { t: "Descomponerlo paso a paso", s: { sistemas: 2, industrial: 2, civil: 1 }, sk: { problemas: 2 }, r: "R" }
  ]},
  { cat: "Intereses", q: "¿Cuál de estos temas te resulta más fascinante?", opts: [
    { t: "Ciberseguridad y protección de datos", s: { ciber: 3, sistemas: 1 }, sk: { problemas: 1 }, r: "R" },
    { t: "Salud, biología y bienestar", s: { medicina: 3, psico: 1 }, sk: {}, r: "I" },
    { t: "Leyes, justicia y debate", s: { derecho: 3, comunicacion: 1 }, sk: {}, r: "E" },
    { t: "Construcción e infraestructura", s: { civil: 3, arq: 1, industrial: 1 }, sk: {}, r: "R" }
  ]},
  { cat: "Intereses", q: "Si tuvieras que dar una charla, elegirías…", opts: [
    { t: "Cómo funciona un algoritmo", s: { sistemas: 2, datos: 2 }, sk: {}, r: "I" },
    { t: "Cómo emprender un negocio", s: { admin: 2, marketing: 2, economia: 1 }, sk: {}, r: "E" },
    { t: "Cómo cuidar la salud mental", s: { psico: 3, medicina: 1 }, sk: {}, r: "S" },
    { t: "Cómo comunicar una idea con impacto", s: { comunicacion: 3, marketing: 1 }, sk: { comunicacion: 2 }, r: "A" }
  ]},
  { cat: "Intereses", q: "¿Qué tipo de proyecto escolar disfrutaste más?", opts: [
    { t: "Una app o página web", s: { sistemas: 3, diseno: 1 }, sk: { problemas: 1 }, r: "I" },
    { t: "Una campaña o un video", s: { marketing: 2, comunicacion: 2, diseno: 1 }, sk: { creatividad: 1 }, r: "A" },
    { t: "Un experimento científico", s: { medicina: 2, datos: 2 }, sk: {}, r: "I" },
    { t: "Una maqueta o un plano", s: { arq: 3, civil: 2 }, sk: { creatividad: 1 }, r: "R" }
  ]},
  { cat: "Intereses", q: "¿Qué titular de noticia leerías primero?", opts: [
    { t: "“Nuevo modelo de IA bate récords”", s: { datos: 3, sistemas: 2 }, sk: {}, r: "I" },
    { t: "“Récord histórico en la bolsa de valores”", s: { economia: 3, contabilidad: 1, admin: 1 }, sk: {}, r: "C" },
    { t: "“Avance médico salva miles de vidas”", s: { medicina: 3, psico: 1 }, sk: {}, r: "S" },
    { t: "“Nueva ley transforma el país”", s: { derecho: 3, comunicacion: 1 }, sk: {}, r: "E" }
  ]},

  /* ---------- HABILIDADES (6) ---------- */
  { cat: "Habilidades", q: "¿En qué destacas frente a tus compañeros?", opts: [
    { t: "Resolver problemas lógicos", s: { sistemas: 2, ciber: 2, datos: 1 }, sk: { problemas: 3 }, r: "I" },
    { t: "Comunicarme y convencer", s: { comunicacion: 2, marketing: 2, derecho: 1 }, sk: { comunicacion: 3 }, r: "E" },
    { t: "Crear y diseñar cosas", s: { diseno: 3, arq: 1 }, sk: { creatividad: 3 }, r: "A" },
    { t: "Organizar y coordinar", s: { admin: 2, industrial: 2 }, sk: { liderazgo: 3 }, r: "C" }
  ]},
  { cat: "Habilidades", q: "Las matemáticas para ti son…", opts: [
    { t: "Mi materia favorita", s: { datos: 3, economia: 2, civil: 1, contabilidad: 1 }, sk: { matematicas: 3 }, r: "I" },
    { t: "Útiles, las manejo bien", s: { sistemas: 2, industrial: 2 }, sk: { matematicas: 2 }, r: "R" },
    { t: "Las uso solo si es necesario", s: { marketing: 1, comunicacion: 1, psico: 1 }, sk: {}, r: "S" },
    { t: "Prefiero evitarlas", s: { diseno: 2, comunicacion: 1, derecho: 1 }, sk: {}, r: "A" }
  ]},
  { cat: "Habilidades", q: "Trabajando en equipo, sueles ser quien…", opts: [
    { t: "Lidera y reparte las tareas", s: { admin: 3, industrial: 1, derecho: 1 }, sk: { liderazgo: 3 }, r: "E" },
    { t: "Aporta las ideas creativas", s: { diseno: 2, marketing: 2, arq: 1 }, sk: { creatividad: 2 }, r: "A" },
    { t: "Analiza y revisa los datos", s: { datos: 3, contabilidad: 1 }, sk: { datos: 3 }, r: "I" },
    { t: "Mantiene la armonía del grupo", s: { psico: 3, educacion: 2 }, sk: { comunicacion: 2 }, r: "S" }
  ]},
  { cat: "Habilidades", q: "¿Qué tan cómodo te sientes con la tecnología y los datos?", opts: [
    { t: "Aprendo herramientas nuevas rapidísimo", s: { sistemas: 3, datos: 2, ciber: 1 }, sk: { datos: 2 }, r: "I" },
    { t: "Me manejo bien con hojas de cálculo", s: { contabilidad: 2, economia: 2, admin: 1 }, sk: { datos: 2 }, r: "C" },
    { t: "Lo justo y necesario", s: { educacion: 1, comunicacion: 1, psico: 1 }, sk: {}, r: "S" },
    { t: "Prefiero lo visual y creativo", s: { diseno: 3, arq: 1 }, sk: { creatividad: 2 }, r: "A" }
  ]},
  { cat: "Habilidades", q: "Al escribir o expresarte, sientes que…", opts: [
    { t: "Argumento con claridad y estructura", s: { derecho: 3, comunicacion: 1 }, sk: { comunicacion: 2 }, r: "E" },
    { t: "Cuento historias que enganchan", s: { comunicacion: 3, marketing: 2 }, sk: { creatividad: 1 }, r: "A" },
    { t: "Explico conceptos para que otros aprendan", s: { educacion: 3, psico: 1 }, sk: { comunicacion: 2 }, r: "S" },
    { t: "Prefiero los números a las palabras", s: { datos: 2, contabilidad: 2, economia: 1 }, sk: { matematicas: 2 }, r: "C" }
  ]},
  { cat: "Habilidades", q: "Ante un reto difícil, tu mayor fortaleza es…", opts: [
    { t: "La persistencia analítica", s: { datos: 2, sistemas: 2, ciber: 1 }, sk: { problemas: 2 }, r: "I" },
    { t: "La empatía para entender a otros", s: { psico: 3, medicina: 1, educacion: 1 }, sk: {}, r: "S" },
    { t: "La visión estratégica", s: { admin: 2, economia: 2, marketing: 1 }, sk: { liderazgo: 2 }, r: "E" },
    { t: "La precisión y el detalle", s: { contabilidad: 2, civil: 2, arq: 1 }, sk: { matematicas: 1 }, r: "C" }
  ]},

  /* ---------- PERSONALIDAD (RIASEC / MBTI / Inteligencias) (6) ---------- */
  { cat: "Personalidad", q: "¿Cómo te describirías?", opts: [
    { t: "Curioso y analítico", s: { datos: 2, sistemas: 2, medicina: 1 }, sk: {}, r: "I" },
    { t: "Creativo e imaginativo", s: { diseno: 3, arq: 1, marketing: 1 }, sk: { creatividad: 2 }, r: "A" },
    { t: "Sociable y empático", s: { psico: 3, educacion: 1, comunicacion: 1 }, sk: {}, r: "S" },
    { t: "Decidido y emprendedor", s: { admin: 2, marketing: 1, derecho: 1 }, sk: { liderazgo: 2 }, r: "E" }
  ]},
  { cat: "Personalidad", q: "Tu entorno de estudio ideal es…", opts: [
    { t: "Silencioso, para concentrarme solo", s: { sistemas: 2, ciber: 2, contabilidad: 1 }, sk: {}, r: "I" },
    { t: "Un taller donde crear con las manos", s: { arq: 2, civil: 2, diseno: 1 }, sk: {}, r: "R" },
    { t: "Rodeado de gente con quien colaborar", s: { comunicacion: 2, admin: 1, marketing: 1 }, sk: {}, r: "S" },
    { t: "Un laboratorio para experimentar", s: { medicina: 2, datos: 2 }, sk: {}, r: "I" }
  ]},
  { cat: "Personalidad", q: "¿Qué te motiva más al elegir una carrera?", opts: [
    { t: "Innovar y crear lo que no existe", s: { sistemas: 2, diseno: 1, marketing: 1 }, sk: { creatividad: 1 }, r: "A" },
    { t: "Ayudar y mejorar vidas", s: { medicina: 3, psico: 2, educacion: 1 }, sk: {}, r: "S" },
    { t: "Construir cosas tangibles y duraderas", s: { civil: 3, arq: 2, industrial: 1 }, sk: {}, r: "R" },
    { t: "Crecer y generar impacto económico", s: { economia: 2, admin: 2, contabilidad: 1 }, sk: {}, r: "E" }
  ]},
  { cat: "Personalidad", q: "¿Cómo tomas decisiones importantes?", opts: [
    { t: "Con datos y lógica", s: { datos: 3, contabilidad: 1, economia: 1 }, sk: { datos: 2 }, r: "I" },
    { t: "Con intuición y valores", s: { psico: 2, educacion: 1, comunicacion: 1 }, sk: {}, r: "S" },
    { t: "Pesando costos y beneficios", s: { economia: 2, admin: 2 }, sk: {}, r: "E" },
    { t: "Consultando y debatiendo", s: { derecho: 2, comunicacion: 2 }, sk: { comunicacion: 1 }, r: "E" }
  ]},
  { cat: "Personalidad", q: "¿Qué inteligencia sientes más desarrollada?", opts: [
    { t: "Lógico-matemática", s: { datos: 3, sistemas: 1, economia: 1 }, sk: { matematicas: 2 }, r: "I" },
    { t: "Espacial y visual", s: { arq: 3, diseno: 2 }, sk: { creatividad: 2 }, r: "A" },
    { t: "Interpersonal", s: { psico: 3, educacion: 1, comunicacion: 1 }, sk: { comunicacion: 1 }, r: "S" },
    { t: "Lingüística", s: { derecho: 2, comunicacion: 2, educacion: 1 }, sk: { comunicacion: 2 }, r: "A" }
  ]},
  { cat: "Personalidad", q: "En un proyecto, prefieres encargarte de…", opts: [
    { t: "La parte técnica y el código", s: { sistemas: 3, ciber: 1 }, sk: { problemas: 1 }, r: "R" },
    { t: "El diseño y la estética", s: { diseno: 3, arq: 1 }, sk: { creatividad: 2 }, r: "A" },
    { t: "La planificación y los recursos", s: { industrial: 2, admin: 2, contabilidad: 1 }, sk: { liderazgo: 1 }, r: "C" },
    { t: "La presentación y el discurso", s: { comunicacion: 3, marketing: 1 }, sk: { comunicacion: 2 }, r: "E" }
  ]},

  /* ---------- PREFERENCIAS LABORALES (6) ---------- */
  { cat: "Preferencias", q: "Tu ambiente de trabajo ideal sería…", opts: [
    { t: "Remoto, con autonomía", s: { sistemas: 2, datos: 2, diseno: 1 }, sk: {}, r: "I" },
    { t: "Una oficina dinámica con equipo", s: { admin: 2, marketing: 2 }, sk: {}, r: "E" },
    { t: "En contacto directo con personas", s: { medicina: 2, psico: 2, educacion: 1 }, sk: {}, r: "S" },
    { t: "En campo o en obra", s: { civil: 3, industrial: 1, arq: 1 }, sk: {}, r: "R" }
  ]},
  { cat: "Preferencias", q: "¿Qué tipo de tareas te energizan?", opts: [
    { t: "Programar y automatizar", s: { sistemas: 3, ciber: 1, datos: 1 }, sk: { problemas: 2 }, r: "R" },
    { t: "Investigar y descubrir patrones", s: { datos: 3, medicina: 1, economia: 1 }, sk: { datos: 2 }, r: "I" },
    { t: "Atender y asesorar clientes", s: { marketing: 2, admin: 1, psico: 1 }, sk: { comunicacion: 1 }, r: "S" },
    { t: "Negociar y representar", s: { derecho: 3, admin: 1 }, sk: {}, r: "E" }
  ]},
  { cat: "Preferencias", q: "¿Qué valoras más en un empleo?", opts: [
    { t: "Innovación tecnológica constante", s: { sistemas: 2, datos: 2, ciber: 1 }, sk: {}, r: "I" },
    { t: "Estabilidad y orden", s: { contabilidad: 3, admin: 1, civil: 1 }, sk: {}, r: "C" },
    { t: "Impacto social directo", s: { psico: 2, educacion: 2, medicina: 1 }, sk: {}, r: "S" },
    { t: "Reconocimiento y liderazgo", s: { marketing: 2, admin: 2, derecho: 1 }, sk: { liderazgo: 2 }, r: "E" }
  ]},
  { cat: "Preferencias", q: "¿Cómo prefieres que se mida tu éxito?", opts: [
    { t: "Por la calidad técnica de mi trabajo", s: { sistemas: 2, ciber: 2, civil: 1 }, sk: {}, r: "R" },
    { t: "Por los resultados y los números", s: { economia: 2, contabilidad: 2, admin: 1 }, sk: { datos: 1 }, r: "C" },
    { t: "Por las personas a las que ayudo", s: { psico: 2, medicina: 2, educacion: 1 }, sk: {}, r: "S" },
    { t: "Por la creatividad de mis ideas", s: { diseno: 2, marketing: 2, comunicacion: 1 }, sk: { creatividad: 2 }, r: "A" }
  ]},
  { cat: "Preferencias", q: "De estos retos, ¿cuál te emociona más?", opts: [
    { t: "Proteger sistemas de ciberataques", s: { ciber: 3, sistemas: 1 }, sk: { problemas: 2 }, r: "I" },
    { t: "Diseñar un edificio o un espacio", s: { arq: 3, civil: 1 }, sk: { creatividad: 1 }, r: "A" },
    { t: "Lanzar una marca al mercado", s: { marketing: 3, admin: 1, comunicacion: 1 }, sk: {}, r: "E" },
    { t: "Optimizar los procesos de una fábrica", s: { industrial: 3, contabilidad: 1 }, sk: { problemas: 1 }, r: "C" }
  ]},
  { cat: "Preferencias", q: "Dentro de 10 años te imaginas…", opts: [
    { t: "Liderando proyectos de IA y datos", s: { datos: 2, sistemas: 2 }, sk: {}, r: "I" },
    { t: "Con tu propia empresa o consultora", s: { admin: 2, economia: 1, marketing: 1 }, sk: { liderazgo: 2 }, r: "E" },
    { t: "Cuidando la salud o educando", s: { medicina: 2, educacion: 2, psico: 1 }, sk: {}, r: "S" },
    { t: "Creando obras, diseños o espacios", s: { arq: 2, diseno: 2, comunicacion: 1 }, sk: { creatividad: 1 }, r: "A" }
  ]}
];

/* ===================================================================
   3. BENEFICIOS (tarjetas de la landing)
   =================================================================== */
const BENEFITS = [
  { icon: "spark",  title: "Evaluación Inteligente",        text: "Un modelo que pondera intereses, habilidades y personalidad en cada respuesta." },
  { icon: "user",   title: "Recomendaciones Personalizadas", text: "No hay dos perfiles iguales: tu resultado se construye solo para ti." },
  { icon: "compass",title: "Orientación Profesional",       text: "Descripciones claras de cada carrera y de por qué encaja contigo." },
  { icon: "bolt",   title: "Resultados Instantáneos",       text: "Sin esperas: tu informe aparece apenas terminas el test." },
  { icon: "ai",     title: "Basado en IA",                  text: "Inspirado en marcos como RIASEC, MBTI e inteligencias múltiples." },
  { icon: "smile",  title: "Fácil de Usar",                 text: "Una interfaz limpia, guiada y pensada para estudiantes." }
];

const ICONS = {
  spark:  '<path d="M12 3v6M12 15v6M3 12h6M15 12h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5L12 8Z" fill="currentColor"/>',
  user:   '<circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  compass:'<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M15.5 8.5 13 13l-4.5 2.5L11 11l4.5-2.5Z" fill="currentColor"/>',
  bolt:   '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="none"/>',
  ai:     '<rect x="4" y="6" width="16" height="13" rx="3" stroke="currentColor" stroke-width="2"/><path d="M9 3v3M15 3v3M9 12v3M15 12v3M2 11h2M2 14h2M20 11h2M20 14h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="9.5" cy="11.5" r="1.3" fill="currentColor"/><circle cx="14.5" cy="11.5" r="1.3" fill="currentColor"/>',
  smile:  '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M8 14c1 1.4 2.4 2 4 2s3-.6 4-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="10" r="1.2" fill="currentColor"/><circle cx="15" cy="10" r="1.2" fill="currentColor"/>'
};

/* ===================================================================
   4. UTILIDADES
   =================================================================== */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function cssColor(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
// Lectura/escritura segura de preferencias (no rompe en entornos sin storage)
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* noop */ } }
};

/* ===================================================================
   5. TEMA (claro / oscuro)
   =================================================================== */
function initTheme() {
  const saved = store.get("smartpath-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);

  $("#themeToggle").addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    store.set("smartpath-theme", next);
    // Redibujar lienzos con la nueva paleta
    drawNeural();
    if (lastResult) drawRadar(lastResult.radar);
  });
}

/* ===================================================================
   6. RENDER DE LANDING (beneficios, año, navbar, reveal, contadores)
   =================================================================== */
function renderBenefits() {
  $("#benefits").innerHTML = BENEFITS.map((b, i) => `
    <article class="benefit reveal" style="--d:${(i % 3) * 0.08}s">
      <span class="benefit__icon"><svg viewBox="0 0 24 24" width="24" height="24">${ICONS[b.icon]}</svg></span>
      <h3>${b.title}</h3>
      <p>${b.text}</p>
    </article>`).join("");
}

function initNavbar() {
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initReveal() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("is-in");
        if (en.target.classList.contains("stat")) animateCount(en.target.querySelector(".stat__num"));
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.2 });
  els.forEach(e => io.observe(e));
}

function animateCount(el) {
  if (!el || el.dataset.done) return;
  el.dataset.done = "1";
  const target = +el.dataset.count;
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const dur = 1400, t0 = performance.now();
  const fmt = (n) => prefix + Math.round(n).toLocaleString("en-US") + suffix;
  const tick = (now) => {
    const p = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(target * eased);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ===================================================================
   7. CONSTELACIÓN NEURAL DEL HERO (canvas)
   =================================================================== */
let neuralRAF = null;
function setupCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || canvas.width, h = rect.height || canvas.height;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

function drawNeural() {
  const canvas = $("#neuralCanvas");
  if (!canvas) return;
  if (neuralRAF) cancelAnimationFrame(neuralRAF);

  const { ctx, w, h } = setupCanvas(canvas);
  const cx = w / 2, cy = h / 2;
  const primary = cssColor("--primary", "#6C63FF");
  const accent  = cssColor("--accent", "#22D3EE");
  const secondary = cssColor("--secondary", "#8B5CF6");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ringR = Math.min(w, h) * 0.36;
  const nodes = 9;
  const pts = Array.from({ length: nodes }, (_, i) => ({
    a: (i / nodes) * Math.PI * 2,
    r: ringR * (0.78 + (i % 3) * 0.12),
    size: 4 + (i % 3)
  }));

  const render = (time) => {
    const t = reduce ? 0 : time * 0.00025;
    ctx.clearRect(0, 0, w, h);

    // Líneas perfil → carreras
    pts.forEach((p, i) => {
      const x = cx + Math.cos(p.a + t) * p.r;
      const y = cy + Math.sin(p.a + t) * p.r;
      const g = ctx.createLinearGradient(cx, cy, x, y);
      g.addColorStop(0, primary + "88");
      g.addColorStop(1, accent + "22");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
      // Conexión al vecino (malla)
      const n = pts[(i + 1) % pts.length];
      const nx = cx + Math.cos(n.a + t) * n.r;
      const ny = cy + Math.sin(n.a + t) * n.r;
      ctx.strokeStyle = secondary + "1f";
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny); ctx.stroke();
    });

    // Nodos exteriores
    pts.forEach((p, i) => {
      const pulse = reduce ? 0 : Math.sin(time * 0.002 + i) * 1.2;
      const x = cx + Math.cos(p.a + t) * p.r;
      const y = cy + Math.sin(p.a + t) * p.r;
      ctx.beginPath();
      ctx.arc(x, y, p.size + pulse, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 ? accent : secondary;
      ctx.shadowColor = i % 2 ? accent : secondary;
      ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;
    });

    // Núcleo (perfil del estudiante)
    const corePulse = reduce ? 16 : 16 + Math.sin(time * 0.003) * 3;
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, corePulse + 8);
    grad.addColorStop(0, primary);
    grad.addColorStop(1, primary + "00");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, corePulse + 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();

    if (!reduce) neuralRAF = requestAnimationFrame(render);
  };
  render(0);
}

/* ===================================================================
   8. ESTADO DEL WIZARD
   =================================================================== */
const state = { step: 0, answers: new Array(QUESTIONS.length).fill(null) };
let lastResult = null;

const app = $("#app");
const quizEl = $("#quiz");
const analyzingEl = $("#analyzing");
const resultsEl = $("#results");

function openApp() {
  state.step = 0;
  state.answers.fill(null);
  lastResult = null;
  quizEl.hidden = false; analyzingEl.hidden = true; resultsEl.hidden = true;
  app.classList.add("is-open");
  app.setAttribute("aria-hidden", "false");
  document.body.classList.add("app-open");
  renderQuestion();
}

function closeApp() {
  app.classList.remove("is-open");
  app.setAttribute("aria-hidden", "true");
  document.body.classList.remove("app-open");
}

/* ----------------------- Render de pregunta ----------------------- */
function renderQuestion() {
  const i = state.step;
  const Q = QUESTIONS[i];

  $("#quizCategory").textContent = Q.cat;
  $("#quizQuestion").textContent = Q.q;
  $("#quizHint").textContent = "";

  $("#quizOptions").innerHTML = Q.opts.map((o, idx) => {
    const selected = state.answers[i] === idx;
    return `
      <button class="option ${selected ? "is-selected" : ""}" role="radio"
              aria-checked="${selected}" data-idx="${idx}">
        <span class="option__mark">
          <svg viewBox="0 0 24 24" width="15" height="15"><path d="M5 12.5l4 4 10-10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <span class="option__text">${o.t}</span>
      </button>`;
  }).join("");

  $$("#quizOptions .option").forEach(btn => {
    btn.addEventListener("click", () => {
      state.answers[i] = +btn.dataset.idx;
      $$("#quizOptions .option").forEach(b => {
        const on = b === btn;
        b.classList.toggle("is-selected", on);
        b.setAttribute("aria-checked", on);
      });
      $("#quizHint").textContent = "";
      $("#btnNext").disabled = false;
    });
  });

  // Progreso
  const pct = ((i) / QUESTIONS.length) * 100;
  $("#progressBar").style.width = Math.max(4, pct + 100 / QUESTIONS.length) + "%";
  $("#progressLabel").textContent = `Pregunta ${i + 1} de ${QUESTIONS.length}`;

  // Navegación
  $("#btnBack").disabled = i === 0;
  $("#btnNext").disabled = state.answers[i] === null;
  $("#btnNext").innerHTML = (i === QUESTIONS.length - 1)
    ? 'Ver mi resultado <svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    : 'Siguiente <svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  quizEl.style.animation = "none";
  void quizEl.offsetWidth;          // reinicia la animación de entrada
  quizEl.style.animation = "";
}

function next() {
  if (state.answers[state.step] === null) {
    $("#quizHint").textContent = "Elige una opción para continuar.";
    return;
  }
  if (state.step < QUESTIONS.length - 1) {
    state.step++;
    renderQuestion();
    app.querySelector(".app__stage").scrollTop = 0;
  } else {
    finish();
  }
}

function back() {
  if (state.step > 0) { state.step--; renderQuestion(); }
}

/* ===================================================================
   9. MOTOR DE RECOMENDACIÓN
   =================================================================== */
function computeResult() {
  const scores = {};   // puntos por carrera
  const maxScores = {}; // máximo alcanzable por carrera
  const skills = {};   // habilidades acumuladas
  const riasec = {};   // conteo RIASEC

  Object.keys(CAREERS).forEach(k => { scores[k] = 0; maxScores[k] = 0; });
  Object.keys(SKILL_LABELS).forEach(k => { skills[k] = 0; });
  Object.keys(RIASEC_LABELS).forEach(k => { riasec[k] = 0; });

  QUESTIONS.forEach((Q, qi) => {
    // Máximo posible por carrera en esta pregunta
    const perCareerMax = {};
    Q.opts.forEach(o => {
      for (const c in o.s) perCareerMax[c] = Math.max(perCareerMax[c] || 0, o.s[c]);
    });
    for (const c in perCareerMax) maxScores[c] += perCareerMax[c];

    // Respuesta elegida
    const sel = state.answers[qi];
    if (sel == null) return;
    const o = Q.opts[sel];
    for (const c in o.s) scores[c] += o.s[c];
    for (const s in o.sk) skills[s] += o.sk[s];
    if (o.r) riasec[o.r] += 1;
  });

  // Afinidad normalizada (0–1) por carrera
  const ranked = Object.keys(CAREERS).map(k => ({
    key: k,
    name: CAREERS[k].name,
    desc: CAREERS[k].desc,
    norm: maxScores[k] ? scores[k] / maxScores[k] : 0
  })).sort((a, b) => b.norm - a.norm);

  // Fortalezas: top habilidades con puntaje > 0
  const topSkills = Object.keys(skills)
    .filter(s => skills[s] > 0)
    .sort((a, b) => skills[b] - skills[a])
    .slice(0, 4)
    .map(s => SKILL_LABELS[s]);

  // Tipo RIASEC dominante
  const topRiasec = Object.keys(riasec).sort((a, b) => riasec[b] - riasec[a])[0];

  // Porcentaje de compatibilidad (con suavizado para presentación)
  const toPct = (norm) => Math.round(Math.min(0.98, 0.45 + norm * 0.55) * 100);

  const top = ranked[0];
  const alternatives = ranked.slice(1, 4);
  const radar = ranked.slice(0, 6).map(r => ({ label: r.name, value: r.norm }));

  return {
    top: { ...top, pct: toPct(top.norm) },
    alternatives: alternatives.map(a => ({ ...a, pct: toPct(a.norm) })),
    strengths: topSkills.length ? topSkills : ["Curiosidad", "Adaptabilidad"],
    riasec: RIASEC_LABELS[topRiasec],
    radar
  };
}

/* ----------------------- Secuencia de cierre ---------------------- */
function finish() {
  quizEl.hidden = true;
  resultsEl.hidden = true;
  analyzingEl.hidden = false;
  $("#progressBar").style.width = "100%";
  $("#progressLabel").textContent = "Analizando…";

  const steps = ["Procesando tus respuestas", "Cruzando intereses y habilidades", "Aplicando el modelo RIASEC", "Generando tu recomendación"];
  let s = 0;
  const stepEl = $("#analyzingStep");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const iv = setInterval(() => {
    s = (s + 1) % steps.length;
    stepEl.textContent = steps[s];
  }, 520);

  setTimeout(() => {
    clearInterval(iv);
    lastResult = computeResult();
    renderResults(lastResult);
  }, reduce ? 300 : 2100);
}

/* ===================================================================
   10. RENDER DE RESULTADOS
   =================================================================== */
function renderResults(R) {
  analyzingEl.hidden = true;
  resultsEl.hidden = false;
  $("#progressLabel").textContent = "¡Resultado listo!";

  resultsEl.innerHTML = `
    <div class="results__head">
      <p class="results__eyebrow">Tu carrera recomendada</p>
      <h2 class="results__career"><span>${R.top.name}</span></h2>
      <div class="match">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 21s-7-4.5-9.5-9C.7 8.6 2.2 5 5.6 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.4-4 3.4 0 4.9 3.6 3.1 7-2.5 4.5-9.5 9-9.5 9Z" fill="currentColor"/></svg>
        Compatibilidad <strong>${R.top.pct}%</strong>
      </div>
      <p style="margin-top:.7rem;color:var(--muted)">Perfil dominante: <strong style="color:var(--text)">${R.riasec}</strong></p>
    </div>

    <div class="results__grid">
      <div class="card">
        <h3><svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v4l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> ¿Por qué encaja contigo?</h3>
        <p>${R.top.desc}</p>
        <h3 style="margin-top:1.3rem"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg> Fortalezas detectadas</h3>
        <div class="strengths">${R.strengths.map(s => `<span class="tag">${s}</span>`).join("")}</div>
      </div>

      <div class="card">
        <h3><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 3v18M3 12h18" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".4"/><path d="M12 4l7 4v8l-7 4-7-4V8l7-4Z" fill="none" stroke="currentColor" stroke-width="2"/></svg> Tu mapa de afinidad</h3>
        <div class="chart-wrap"><canvas id="radarCanvas" width="360" height="360" role="img" aria-label="Gráfico radar de compatibilidad por carrera"></canvas></div>
      </div>
    </div>

    <div class="card">
      <h3><svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Carreras alternativas para ti</h3>
      <div class="alts">
        ${R.alternatives.map(a => `
          <div class="alt">
            <div class="alt__name">${a.name}</div>
            <div class="alt__bar"><div class="alt__fill" data-pct="${a.pct}"></div></div>
            <span class="alt__pct">${a.pct}% de afinidad</span>
          </div>`).join("")}
      </div>
    </div>

    <div class="results__actions">
      <button class="btn btn--primary btn--lg" id="btnRestart">Repetir el test</button>
      <button class="btn btn--ghost btn--lg" id="btnCloseResults">Volver al inicio</button>
    </div>
  `;

  // Animar barras de alternativas
  requestAnimationFrame(() => {
    $$("#results .alt__fill").forEach(f => { f.style.width = f.dataset.pct + "%"; });
  });

  // Dibujar radar (animado)
  drawRadar(R.radar, true);

  $("#btnRestart").addEventListener("click", openApp);
  $("#btnCloseResults").addEventListener("click", () => { closeApp(); window.scrollTo({ top: 0, behavior: "smooth" }); });
  app.querySelector(".app__stage").scrollTop = 0;
}

/* ----------------------- Gráfico radar (canvas) ------------------- */
function drawRadar(data, animate = false) {
  const canvas = $("#radarCanvas");
  if (!canvas || !data) return;
  const { ctx, w, h } = setupCanvas(canvas);
  const cx = w / 2, cy = h / 2;
  const R = Math.min(w, h) * 0.34;
  const N = data.length;
  const primary = cssColor("--primary", "#6C63FF");
  const accent  = cssColor("--accent", "#22D3EE");
  const grid    = cssColor("--border-strong", "#CBD5E1");
  const muted   = cssColor("--muted", "#475569");
  const reduce  = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const angle = (i) => -Math.PI / 2 + (i / N) * Math.PI * 2;
  const shortName = (n) => n.replace("Ingeniería de ", "Ing. ").replace("Ingeniería ", "Ing. ").replace("Ciencia de ", "");

  const paint = (k) => {
    ctx.clearRect(0, 0, w, h);

    // Rejilla concéntrica
    for (let ring = 1; ring <= 4; ring++) {
      const rr = (R * ring) / 4;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const a = angle(i % N);
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = grid + "55"; ctx.lineWidth = 1; ctx.stroke();
    }

    // Ejes y etiquetas
    ctx.font = "600 11px Inter, sans-serif";
    ctx.fillStyle = muted;
    for (let i = 0; i < N; i++) {
      const a = angle(i);
      const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      ctx.strokeStyle = grid + "55"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();

      const lx = cx + Math.cos(a) * (R + 18), ly = cy + Math.sin(a) * (R + 16);
      ctx.textAlign = Math.abs(Math.cos(a)) < 0.3 ? "center" : (Math.cos(a) > 0 ? "left" : "right");
      ctx.textBaseline = "middle";
      ctx.fillText(shortName(data[i].label), lx, ly);
    }

    // Polígono de afinidad
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const idx = i % N;
      const a = angle(idx);
      const val = Math.max(0.08, data[idx].value) * k;
      const x = cx + Math.cos(a) * R * val, y = cy + Math.sin(a) * R * val;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    const fill = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    fill.addColorStop(0, primary + "66");
    fill.addColorStop(1, accent + "55");
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = primary; ctx.lineWidth = 2.4; ctx.stroke();

    // Vértices
    for (let i = 0; i < N; i++) {
      const a = angle(i);
      const val = Math.max(0.08, data[i].value) * k;
      const x = cx + Math.cos(a) * R * val, y = cy + Math.sin(a) * R * val;
      ctx.beginPath(); ctx.arc(x, y, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? accent : primary; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
    }
  };

  if (animate && !reduce) {
    const t0 = performance.now(), dur = 850;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      paint(1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  } else {
    paint(1);
  }
}

/* ===================================================================
   11. EVENTOS GLOBALES
   =================================================================== */
function bindGlobal() {
  $$('[data-action="start-test"]').forEach(b => b.addEventListener("click", openApp));
  $("#appClose").addEventListener("click", closeApp);
  $("#btnNext").addEventListener("click", next);
  $("#btnBack").addEventListener("click", back);

  document.addEventListener("keydown", (e) => {
    if (!app.classList.contains("is-open")) return;
    if (e.key === "Escape") closeApp();
    if (quizEl.hidden) return;
    if (e.key === "Enter" && !$("#btnNext").disabled) next();
    // Selección rápida con teclas 1–4
    if (/^[1-4]$/.test(e.key)) {
      const btn = $$("#quizOptions .option")[+e.key - 1];
      if (btn) btn.click();
    }
  });

  // Reajustar lienzos al cambiar tamaño
  let rT;
  window.addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(() => { drawNeural(); if (lastResult && !resultsEl.hidden) drawRadar(lastResult.radar); }, 200);
  });
}

/* ===================================================================
   12. INIT
   =================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  initTheme();
  renderBenefits();
  initNavbar();
  initReveal();
  bindGlobal();
  drawNeural();
});
