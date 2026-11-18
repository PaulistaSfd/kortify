// Interações da página em JavaScript puro: rodam no Next (via componente cliente)
// e também na prévia estática. Sem dependências.
export function initInteractions() {
  var doc = document;
  var off = [];
  var on = function (el, ev, fn, opt) { el.addEventListener(ev, fn, opt); off.push(function () { el.removeEventListener(ev, fn, opt); }); };
  var calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mouseFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // 1. Celulares em 3D seguem o mouse
  var hero = doc.querySelector("[data-hero]");
  var stage = doc.querySelector("[data-stage]");
  if (hero && stage && mouseFino && !calmo) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    var loop = function () {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      stage.style.setProperty("--rx", (cy * -8).toFixed(2) + "deg");
      stage.style.setProperty("--ry", (cx * 12).toFixed(2) + "deg");
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(loop) : 0;
    };
    on(hero, "pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    on(hero, "pointerleave", function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  }

  // 2. Lista numerada: cartão de prévia segue o cursor
  var card = doc.querySelector("[data-cursor-card]");
  var rows = doc.querySelectorAll("[data-row]");
  if (card && rows.length && mouseFino) {
    var px = 0, py = 0, qx = 0, qy = 0, raf2 = 0;
    var words = card.querySelectorAll(".w");
    var hook = card.querySelector(".hook");
    var mover = function () {
      qx += (px - qx) * 0.18; qy += (py - qy) * 0.18;
      card.style.translate = qx.toFixed(1) + "px " + qy.toFixed(1) + "px";
      raf2 = Math.abs(px - qx) + Math.abs(py - qy) > 0.3 ? requestAnimationFrame(mover) : 0;
    };
    rows.forEach(function (row) {
      on(row, "pointerenter", function (e) {
        var l = (row.getAttribute("data-caption") || "").split(" ");
        words.forEach(function (w, i) { w.textContent = l[i] || ""; });
        if (hook) hook.textContent = row.getAttribute("data-hook") || "";
        px = qx = e.clientX; py = qy = e.clientY;
        card.style.translate = px + "px " + py + "px";
        card.classList.add("is-on");
      });
      on(row, "pointermove", function (e) { px = e.clientX; py = e.clientY; if (!raf2) raf2 = requestAnimationFrame(mover); });
      on(row, "pointerleave", function () { card.classList.remove("is-on"); });
    });
  }

  // 3. Entrada suave ao rolar (só desloca; o conteúdo já está visível sem JS)
  if (!calmo && "IntersectionObserver" in window) {
    var alvos = doc.querySelectorAll("[data-reveal]");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove("pre"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    alvos.forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add("pre"); io.observe(el); }
    });
    off.push(function () { io.disconnect(); });
  }

  // 4. Demo do painel
  var app = doc.querySelector("[data-demo]");
  if (app) {
    var ms = app.querySelectorAll(".moment");
    var picks = app.querySelectorAll(".pick");
    var count = app.querySelector("[data-count]");
    var phone = app.querySelector(".phone-demo");
    var meta = app.querySelector("[data-meta]");
    var mostrar = function (i) {
      var b = ms[i];
      ms.forEach(function (x, j) { x.classList.toggle("is-active", i === j); x.setAttribute("aria-pressed", String(i === j)); });
      phone.querySelector(".scene").className = "scene scene-" + b.getAttribute("data-id");
      phone.querySelector(".hook").textContent = b.getAttribute("data-hook");
      var l = (b.getAttribute("data-caption") || "").split(" ");
      phone.querySelectorAll(".w").forEach(function (w, k) { w.textContent = l[k] || ""; });
      meta.textContent = "1080×1920 · " + b.getAttribute("data-dur");
      phone.classList.remove("swap"); void phone.offsetWidth; phone.classList.add("swap");
    };
    ms.forEach(function (b, i) { on(b, "click", function () { mostrar(i); }); });
    picks.forEach(function (p) {
      on(p, "click", function () {
        var ligado = !p.classList.contains("is-on");
        p.classList.toggle("is-on", ligado); p.setAttribute("aria-pressed", String(ligado));
        count.textContent = app.querySelectorAll(".pick.is-on").length + " marcados";
      });
    });
  }

  // 5. Modo claro (padrão) e escuro (paleta azul)
  var modoBtn = doc.querySelector("[data-mode-toggle]");
  if (modoBtn) {
    on(modoBtn, "click", function () {
      var novo = doc.documentElement.getAttribute("data-palette") === "azul" ? "claro" : "azul";
      doc.documentElement.setAttribute("data-palette", novo);
      try { localStorage.setItem("kortify-modo", novo); } catch (e) {}
    });
  }

  // 6. Cursor próprio (só com mouse)
  var cur = doc.querySelector("[data-cursor]");
  if (cur && mouseFino) {
    var lbl = cur.querySelector(".cursor-label");
    var mx = -100, my = -100, kx = -100, ky = -100, raf3 = 0;
    var seguir = function () {
      kx += (mx - kx) * 0.22; ky += (my - ky) * 0.22;
      cur.style.translate = kx.toFixed(1) + "px " + ky.toFixed(1) + "px";
      raf3 = Math.abs(mx - kx) + Math.abs(my - ky) > 0.2 ? requestAnimationFrame(seguir) : 0;
    };
    on(window, "pointermove", function (e) {
      mx = e.clientX; my = e.clientY; cur.classList.add("is-on");
      if (!raf3) raf3 = requestAnimationFrame(seguir);
      var alvo = e.target.closest ? e.target.closest("a, button, summary, [data-row]") : null;
      var texto = alvo ? (alvo.matches("[data-row]") ? "ver" : alvo.matches(".moment") ? "abrir" : alvo.matches(".pick") ? "marcar" : "") : "";
      cur.classList.toggle("is-big", !!alvo && !!texto);
      cur.classList.toggle("is-hover", !!alvo && !texto);
      if (lbl) lbl.textContent = texto;
    });
    on(doc, "pointerleave", function () { cur.classList.remove("is-on"); });
  }

  // 7. Botões magnéticos
  if (mouseFino && !calmo) {
    doc.querySelectorAll("[data-magnetic]").forEach(function (b) {
      on(b, "pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.translate = (dx * 0.18).toFixed(1) + "px " + (dy * 0.3).toFixed(1) + "px";
      });
      on(b, "pointerleave", function () { b.style.translate = ""; });
    });
  }

  // 8. "Role para cortar": a live passa sob a agulha e os cortes vão saindo
  var story = doc.querySelector("[data-story]");
  var reel = doc.querySelector("[data-reel]");
  if (story && reel) {
    var janela = reel.parentElement;
    var frames = reel.querySelectorAll(".frame");
    var contador = doc.querySelector("[data-story-count]");
    var barra = doc.querySelector("[data-story-bar]");
    var tel = story.querySelector(".phone-story");
    var ultimo = -1;
    var atualizar = function () {
      var r = story.getBoundingClientRect();
      var total = story.offsetHeight - window.innerHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      var meio = janela.offsetWidth / 2;
      var fw = frames[0].offsetWidth + 8;
      var max = reel.scrollWidth - fw / 2;
      var x = meio - fw / 2 - p * (max - fw / 2);
      reel.style.translate = x.toFixed(1) + "px 0";
      if (barra) barra.style.scale = p.toFixed(4) + " 1";
      var idx = Math.round((meio - x - fw / 2) / fw);
      var achados = 0, atual = null;
      frames.forEach(function (f, i) {
        var passou = f.hasAttribute("data-hit") && i <= idx;
        f.classList.toggle("is-cut", passou);
        f.classList.toggle("is-now", i === idx);
        if (passou) { achados++; atual = f; }
      });
      if (contador) contador.textContent = String(achados);
      if (atual && tel && ultimo !== achados) {
        ultimo = achados;
        tel.querySelector(".scene").className = "scene scene-" + atual.getAttribute("data-cena");
        tel.querySelector(".hook").textContent = atual.getAttribute("data-hook");
        var l = (atual.getAttribute("data-caption") || "").split(" ");
        tel.querySelectorAll(".w").forEach(function (w, k) { w.textContent = l[k] || ""; });
        tel.classList.remove("swap"); void tel.offsetWidth; tel.classList.add("swap");
      }
      story.classList.toggle("has-cut", achados > 0);
    };
    on(window, "scroll", atualizar, { passive: true });
    on(window, "resize", atualizar);
    atualizar();
  }

  // 9. Texto que acende como legenda conforme a rolagem
  var kar = doc.querySelector("[data-karaoke]");
  if (kar) {
    var kws = kar.querySelectorAll(".kw");
    var acender = function () {
      var r = kar.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (window.innerHeight * 0.85 - r.top) / (r.height + window.innerHeight * 0.35)));
      var n = Math.round(p * kws.length);
      kws.forEach(function (w, i) { w.classList.toggle("lit", i < n); w.classList.toggle("now", i === n - 1); });
    };
    on(window, "scroll", acender, { passive: true });
    acender();
  }

  return function () { off.forEach(function (f) { f(); }); };
}
