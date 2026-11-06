
const places = [
  {
    n: "Saint-Laurent",
    x: 114,
    y: 46,
    c: "Le trésor",
    e: [
      { q: "Quel fleuve sépare la Guyane du Suriname ?", o: ["L’Oyapock", "Le Maroni", "L’Approuague"], a: 1 },
      { q: "Quelle était la fonction de Saint-Laurent-du-Maroni à l’époque du bagne ?", o: ["Port d’arrivée des bagnards", "Base de lancement de fusées", "Capitale d’un royaume"], a: 0 },
      { q: "Quel bateau long et étroit, creusé dans un tronc, circule sur les fleuves de Guyane ?", o: ["Un drakkar", "Une pirogue", "Une gondole"], a: 1 },
    ],
  },
  {
    n: "Kourou",
    x: 388,
    y: 88,
    c: "dort au cœur",
    e: [
      { q: "Quel engin décolle du centre spatial de Kourou ?", o: ["Des fusées", "Des montgolfières", "Des avions de ligne"], a: 0 },
      { q: "Quelle fusée européenne décolle de Kourou ?", o: ["Apollo", "Ariane", "Saturn V"], a: 1 },
      { q: "Pourquoi construit-on une base spatiale près de l’équateur ?", o: ["La rotation de la Terre aide les fusées à décoller", "Il n’y pleut jamais", "Il n’y a aucun oiseau"], a: 0 },
    ],
  },
  {
    n: "Îles du Salut",
    x: 404,
    y: 66,
    c: "de la forêt",
    e: [
      { q: "Quel célèbre prisonnier fut enfermé sur l’île du Diable ?", o: ["Napoléon", "Alfred Dreyfus", "Victor Hugo"], a: 1 },
      { q: "Combien d’îles forment l’archipel des îles du Salut ?", o: ["3", "7", "12"], a: 0 },
      { q: "Quel livre célèbre raconte la vie d’un bagnard en Guyane ?", o: ["Moby Dick", "Robinson Crusoé", "Papillon"], a: 2 },
    ],
  },
  {
    n: "Cayenne",
    x: 452,
    y: 112,
    c: "près de",
    e: [
      { q: "Comment appelle-t-on les danseuses masquées du carnaval guyanais ?", o: ["Les Touloulous", "Les Sirènes", "Les Colibris"], a: 0 },
      { q: "Quel est le rôle de Cayenne en Guyane ?", o: ["Elle est la préfecture", "Elle est une île des Antilles", "Elle est la capitale du Brésil"], a: 0 },
      { q: "Quel piment porte le nom de cette ville ?", o: ["Le piment d’Espelette", "Le piment de Cayenne", "Le piment de Padrón"], a: 1 },
    ],
  },
  {
    n: "Marais de Kaw",
    x: 486,
    y: 152,
    c: "Saül",
    e: [
      { q: "Quel oiseau étrange, surnommé « oiseau puant », vit dans les marais de Kaw ?", o: ["Le toucan", "Le hoazin", "Le flamant rose"], a: 1 },
      { q: "Quel animal observe-t-on la nuit, en pirogue, dans les marais de Kaw ?", o: ["Le lion", "Le kangourou", "Le caïman"], a: 2 },
      { q: "Quel type de milieu est le marais de Kaw ?", o: ["Un désert", "Une zone humide", "Un glacier"], a: 1 },
    ],
  },
];



document.addEventListener("DOMContentLoaded", function () {
  /* Le script fonctionne : on cache le message d'alerte */
  document.getElementById("alerte").style.display = "none";

/* ----- 1. État du jeu et éléments de la page ----- */
let verrou = false;
const done = new Set(),
  clues = [];
const pins = document.getElementById("pins"),
  bar = document.getElementById("bar"),
  panel = document.getElementById("panel"),
  msgSecret = document.getElementById("scroll");

/* ----- 2. Création de la carte (SVG) ----- */
const NS = "http://www.w3.org/2000/svg";
function el(t, at, p) {
  const e = document.createElementNS(NS, t);
  for (const k in at) e.setAttribute(k, at[k]);
  if (p) p.appendChild(e);
  return e;
}
for (let i = 0; i < 26; i++) {
  const x = 30 + Math.random() * 540,
    y = 150 + Math.random() * 165;
  if (y < 48 + x * 0.18 + 95 && x > 100) continue;
  const t = el(
    "text",
    { x, y, "font-size": 18 + Math.random() * 8, "text-anchor": "middle", class: "tree" },
    document.getElementById("trees"),
  );
  t.textContent = "🌴";
  t.style.animationDelay = Math.random() * 3 + "s";
}
places.forEach((p, i) => {
  const g = el(
    "g",
    { class: "pin", tabindex: 0, role: "button", "aria-label": p.n },
    pins,
  );
  el("circle", { class: "pulse", cx: p.x, cy: p.y, r: 9 }, g);
  el("circle", { class: "dot", cx: p.x, cy: p.y, r: 9 }, g);
  const t = el("text", { x: p.x, y: p.y - 16, "text-anchor": "middle" }, g);
  t.textContent = p.n;
  g.addEventListener("click", () => ask(i));
  g.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") ask(i);
  });
  p.g = g;
  const c = document.createElement("span");
  c.className = "chip";
  p.etape = 0;
  p.chip = c;
  majChip(p);
  bar.appendChild(c);
});

/* ----- 3. Énigmes (plusieurs par lieu) ----- */
function majChip(p) {
  const fini = p.etape >= p.e.length;
  p.chip.textContent = (fini ? "✅ " : "📍 ") + p.n + " (" + p.etape + "/" + p.e.length + ")";
}

function ask(i) {
  const p = places[i];
  if (done.has(i)) {
    panel.innerHTML =
      "<h2>" + p.n + "</h2><p>Déjà exploré ✅</p><p class='clue'>Indice : « " + p.c + " »</p>";
    return;
  }
  const e = p.e[p.etape];
  panel.innerHTML =
    "<h2>📍 " + p.n + "</h2><p class='etape'>Énigme " + (p.etape + 1) + " sur " + p.e.length + "</p>" +
    "<p>" + e.q + "</p><div class='opts'></div>";
  const box = panel.querySelector(".opts");
  e.o.forEach((t, k) => {
    const b = document.createElement("button");
    b.className = "opt";
    b.textContent = t;
    b.onclick = () => {
      if (verrou) return;
      if (k === e.a) {
        /* Bonne réponse : on passe à l'énigme suivante (ou on gagne l'indice) */
        verrou = true;
        b.classList.add("ok");
        p.etape++;
        majChip(p);
        setTimeout(() => {
          verrou = false;
          if (p.etape >= p.e.length) good(i);
          else ask(i);
        }, 700);
      } else {
        b.classList.add("bad");
        setTimeout(() => b.classList.remove("bad"), 450);
      }
    };
    box.appendChild(b);
  });
}

/* ----- 4. Bonne réponse et indices ----- */
function good(i) {
  const p = places[i];
  done.add(i);
  p.g.classList.add("done");
  p.chip.classList.add("found");
  clues[i] = p.c;
  panel.innerHTML =
    "<h2>Bravo ! 🎉</h2><p>Tu as gagné un indice.</p><p class='clue'>« " + p.c + " »</p>";
  msgSecret.innerHTML =
    "📜 Message secret : <b>" +
    places.map((q, k) => (clues[k] ? clues[k] : "…")).join(" ") +
    "</b>";
  if (done.size === places.length) finale();
}

/* ----- 5. Final : route et trésor ----- */
function finale() {
  const r = document.getElementById("route"),
    k = places[3];
  r.setAttribute("d", "M" + k.x + " " + k.y + " Q420 200 330 230 T282 245");
  r.classList.add("go");
  setTimeout(() => {
    document.getElementById("x").style.display = "block";
  }, 2800);
  panel.innerHTML =
    "<h2>🗺️ Le message est complet !</h2><p>Suis la route pointillée et clique sur la croix rouge pour ouvrir le coffre.</p>";
}
function win() {
  document.getElementById("win").style.display = "flex";
  for (let i = 0; i < 60; i++) {
    const s = document.createElement("span");
    s.className = "conf";
    s.style.left = Math.random() * 100 + "vw";
    s.style.background = ["#e0a800", "#c0392b", "#2e86c1", "#27ae60"][i % 4];
    s.style.animationDuration = 2 + Math.random() * 2.5 + "s";
    s.style.animationDelay = Math.random() + "s";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 6000);
  }
}
const x = document.getElementById("x");
x.addEventListener("click", win);
x.addEventListener("keydown", (e) => {
  if (e.key === "Enter") win();
});
document.getElementById("again").onclick = () => location.reload();

});
