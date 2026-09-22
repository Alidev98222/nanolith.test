/* ============================================================
   NANOLITH â€” shared behaviors (feature-detected per page)
   One script for the whole site: each module boots only when
   its target markup exists on the current page.

   In-page views (Data Sheet, single Article) are resolved from
   QUERY PARAMETERS â€” no hash routing anywhere:
     products.html?ds=<product-id>   â†’ data-sheet view
     insights.html?a=<article-slug>  â†’ article view
   ============================================================ */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- Navigation (all pages) ---------- */
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");

  function closeNav() {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    document.getElementById("navPanel").addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { closeNav(); navToggle.focus(); }
    });
    window.addEventListener("scroll", function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    }, { passive: true });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Scroll reveals ---------- */
  var revealIO = null;
  if ("IntersectionObserver" in window && !REDUCED) {
    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); revealIO.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
  }
  document.querySelectorAll(".reveal").forEach(function (r) {
    if (revealIO) revealIO.observe(r); else r.classList.add("is-in");
  });

  /* ============================================================
     TECHNOLOGY â€” animated process stepper
     ============================================================ */
  var PROCESS = [
    { title: "Concept & Feasibility",
      body: "We convert your target spec into an engineering problem statement: literature and patent review, constraint mapping, risk register and a costed feasibility verdict with a go/no-go recommendation.",
      deliv: ["Feasibility report", "Target-spec sheet", "Risk register"] },
    { title: "Simulation & Modeling",
      body: "Before any wafer is touched, the process is modeled: FEM for structural, thermal and fluidic behavior, molecular dynamics where surface effects dominate, and a design-of-experiments matrix that bounds the fabrication window.",
      deliv: ["Validated multiphysics model", "DOE matrix", "Process-window map"] },
    { title: "Nanofabrication",
      body: "Lithography, deposition and etch run in our class-1000 cleanroom under written run sheets, with inline critical-dimension sampling at defined process points â€” no silent drift between lot start and lot end.",
      deliv: ["Wafer lot + run sheets", "Inline CD log", "Deviation notes"] },
    { title: "Characterization",
      body: "SEM, AFM, ellipsometry and parametric electrical testing quantify every critical dimension against the spec. Measurements are calibration-traceable and delivered as a complete dossier, ready for your quality system.",
      deliv: ["Measurement dossier", "Traceability certificates", "Statistical yield summary"] },
    { title: "Integration & Handoff",
      body: "Devices are packaged, screened and documented: reliability screening, final metrology and a data package that lets your team pick up exactly where ours ends â€” or transfer to your pilot line.",
      deliv: ["Packaged, screened devices", "Reliability data", "Transfer documentation"] }
  ];

  (function () {
    var track = document.getElementById("procTrack");
    if (!track) return;
    var steps = Array.prototype.slice.call(track.querySelectorAll(".pstep"));
    var fill = document.getElementById("procFill");
    var bar = document.getElementById("pdBar");
    var timer = null, stopped = false;

    function set(i) {
      steps.forEach(function (s, k) { s.setAttribute("aria-selected", String(k === i)); });
      var st = PROCESS[i];
      document.getElementById("pdTitle").textContent = st.title;
      document.getElementById("pdIdx").textContent = "Stage " + pad2(i + 1) + " / 05";
      document.getElementById("pdBody").textContent = st.body;
      document.getElementById("pdMeta").innerHTML = st.deliv.map(function (d) {
        return '<span class="pd-deliv">' + d + "</span>";
      }).join("");
      var w = ((i + 1) / PROCESS.length * 100) + "%";
      fill.style.width = w;
      bar.style.width = w;
    }

    steps.forEach(function (s) {
      s.addEventListener("click", function () {
        stopped = true;
        if (timer) { clearInterval(timer); timer = null; }
        set(parseInt(s.dataset.step, 10));
      });
    });

    set(0);
    if (!REDUCED) {
      var i = 0;
      timer = setInterval(function () {
        if (stopped) { clearInterval(timer); timer = null; return; }
        i = (i + 1) % PROCESS.length;
        set(i);
      }, 4200);
    }
  })();

  /* ============================================================
     PRODUCTS â€” catalog, filters, data-sheet view (?ds=<id>)
     [SAMPLE] spec values must be replaced with certified data.
     ============================================================ */
  var ICONS = {
    membrane: '<circle cx="36" cy="36" r="26"/><circle cx="36" cy="36" r="4"/><circle cx="36" cy="18" r="2.4"/><circle cx="36" cy="54" r="2.4"/><circle cx="18" cy="36" r="2.4"/><circle cx="54" cy="36" r="2.4"/><circle cx="23" cy="23" r="2.4"/><circle cx="49" cy="23" r="2.4"/><circle cx="23" cy="49" r="2.4"/><circle cx="49" cy="49" r="2.4"/>',
    mirror: '<rect x="12" y="46" width="48" height="8" rx="2"/><path d="M20 46l8-14 8 14M36 46l8-20 8 20"/><path d="M16 26v-8M56 26v-8" stroke-dasharray="3 3"/>',
    chip: '<path d="M8 24h28a8 8 0 018 8v0a8 8 0 01-8 8H24"/><path d="M8 48h16M8 36h12"/><circle cx="52" cy="32" r="2.4"/><circle cx="60" cy="32" r="2.4"/><path d="M8 16v48" stroke-dasharray="4 4"/>',
    film: '<rect x="14" y="44" width="44" height="10" rx="2"/><rect x="14" y="32" width="44" height="8" rx="2" opacity=".7"/><rect x="14" y="22" width="44" height="6" rx="2" opacity=".45"/>',
    resonator: '<path d="M8 36h12M52 36h12"/><rect x="20" y="32" width="32" height="8" rx="4"/><path d="M26 22c4 8 12 8 16 0M26 50c4-8 12-8 16 0" stroke-dasharray="3 3"/>',
    droplet: '<path d="M36 12c8 10 14 17 14 25a14 14 0 11-28 0c0-8 6-15 14-25z"/><circle cx="30" cy="38" r="2.4"/><circle cx="42" cy="44" r="2.4"/>'
  };

  var PRODUCTS = [
    { id: "nl-grid", name: "NL-Gridâ„¢ Nanoporous Membranes", cat: "nanomaterials", catLabel: "Nanomaterials",
      tagline: "Uniform pore arrays for precision filtration",
      desc: "Freestanding nanoporous membranes with highly uniform pore diameter and density, manufactured on silicon, silicon-nitride and polymer supports. Pore statistics are verified by SEM sampling on every wafer.",
      icon: "membrane",
      specs: [
        ["Pore diameter", "10â€“200 nm (selectable) [SAMPLE]"],
        ["Pore density", "10âپ¶â€“10âپ¸ pores/cmآ² [SAMPLE]"],
        ["Pore uniformity", "CV < 5% wafer-level [SAMPLE]"],
        ["Membrane thickness", "100â€“500 nm"],
        ["Support materials", "Si آ· Siâ‚ƒNâ‚„ آ· polymer"],
        ["Die formats", "Up to 100 mm wafer, diced to spec"]
      ],
      apps: ["Filtration & separations", "Cell culture & organoids", "TEM sample support", "Analytical sample prep"],
      order: "Part no. NLG-[PDIAM]-[SIZE] آ· e.g. NLG-100-S10 آ· MOQ 10 die [SAMPLE]" },
    { id: "nx-act", name: "NX-Act MEMS Mirror Array", cat: "mems", catLabel: "MEMS & NEMS",
      tagline: "Wafer-scale electrostatic beam steering",
      desc: "Electrostatically actuated micromirror arrays for beam steering, adaptive optics and fast scanning. Monolithic wafer-level fabrication keeps pixel-to-pixel uniformity high and cost per pixel low.",
      icon: "mirror",
      specs: [
        ["Mirror pitch", "50â€“500 آµm (selectable) [SAMPLE]"],
        ["Actuation", "Electrostatic, dual-axis"],
        ["Tilt range", "آ±5آ° mechanical [SAMPLE]"],
        ["Response time", "< 1 ms [SAMPLE]"],
        ["Array formats", "64أ—64 to 1920أ—1080 [SAMPLE]"],
        ["Mirror coating", "Al standard آ· Au optional"]
      ],
      apps: ["Lidar & 3D sensing", "Adaptive optics", "Confocal scanning", "Hyperspectral imaging"],
      order: "Part no. NXA-[SIZE]-[COAT] آ· evaluation kit NXA-EK1 available [SAMPLE]" },
    { id: "floflo", name: "FloFloâ„¢ Microfluidic Sorter", cat: "loc", catLabel: "Lab-on-Chip",
      tagline: "Label-free high-throughput particle sorting",
      desc: "Acoustofluidic sorting chip separating particles and cells by size and acoustic contrast â€” label-free, contact-free and gentle enough for viable cell recovery.",
      icon: "chip",
      specs: [
        ["Flow rate", "1â€“100 آµL/min"],
        ["Particle range", "1â€“50 آµm diameter"],
        ["Throughput", "Up to 10âپ´ events/s [SAMPLE]"],
        ["Cell viability", "> 90% post-sort [SAMPLE]"],
        ["Chip material", "PDMS-glass آ· COC"],
        ["Interface", "Standard Luer / barb fittings"]
      ],
      apps: ["Cell & bead sorting", "Diagnostics sample prep", "Particle QC", "Organoid workflows"],
      order: "Part no. FLF-[WIDTH]-[MAT] آ· manifold accessory FLF-M1 [SAMPLE]" },
    { id: "nl-thin", name: "NL-Thinâ„¢ ALD Film Service", cat: "nanomaterials", catLabel: "Nanomaterials",
      tagline: "Sub-monolayer conformal coatings",
      desc: "Toll coating on customer substrates: Alâ‚‚Oâ‚ƒ, HfOâ‚‚ and TiOâ‚‚ films with sub-nanometer thickness control and conformal coverage on high-aspect-ratio geometries.",
      icon: "film",
      specs: [
        ["Film materials", "Alâ‚‚Oâ‚ƒ آ· HfOâ‚‚ آ· TiOâ‚‚"],
        ["Thickness control", "آ±0.1 nm"],
        ["Thickness range", "1â€“200 nm"],
        ["Uniformity", "< 1% across 100 mm [SAMPLE]"],
        ["Conformality", "> 95% on 20:1 structures [SAMPLE]"],
        ["Process temp", "80â€“300 آ°C"]
      ],
      apps: ["Barrier & passivation", "Optical coatings", "Membrane functionalization", "Device encapsulation"],
      order: "Service code NLT-[MAT]-[T] آ· quoting on substrate drawing [SAMPLE]" },
    { id: "nx-sense", name: "NX-Senseâ„¢ NEMS Resonator", cat: "mems", catLabel: "MEMS & NEMS",
      tagline: "Zeptogram-class mass sensing",
      desc: "Piezoresistive nanomechanical resonators for mass and surface-stress sensing in research instrumentation â€” no optical readout required, vacuum-compatible packaging available.",
      icon: "resonator",
      specs: [
        ["Resonance range", "1â€“10 MHz"],
        ["Q-factor (vacuum)", "> 10âپ´ [SAMPLE]"],
        ["Mass resolution", "Zeptogram-class [SAMPLE]"],
        ["Readout", "Piezoresistive, on-chip"],
        ["Packaging", "Ambient آ· vacuum-compatible option"],
        ["Die size", "5 أ— 5 mm"]
      ],
      apps: ["Mass spectrometry add-on", "Gas & biomolecule sensing", "Surface-stress studies", "Research instrumentation"],
      order: "Part no. NXS-[F]-[PKG] آ· characterization report included [SAMPLE]" },
    { id: "flomix", name: "FloMixâ„¢ Droplet Generator", cat: "loc", catLabel: "Lab-on-Chip",
      tagline: "Monodisperse droplets at kHz rates",
      desc: "Flow-focusing droplet generators with tight size dispersion for emulsions, encapsulation and digital assays â€” glass and polymer variants for chemical compatibility.",
      icon: "droplet",
      specs: [
        ["Droplet diameter", "10â€“200 آµm (selectable)"],
        ["Size dispersion", "CV < 3% [SAMPLE]"],
        ["Generation rate", "Up to 10 kHz [SAMPLE]"],
        ["Flow ratio", "1:1 to 1:10 (aqueous:oil)"],
        ["Chip material", "Glass آ· polymer (COC)"],
        ["Formats", "Standard + custom designs"]
      ],
      apps: ["Digital assays", "Single-cell encapsulation", "Emulsion production", "Materials synthesis"],
      order: "Part no. FLM-[SIZE]-[MAT] آ· starter pack FLM-SP3 [SAMPLE]" }
  ];

  (function () {
    var grid = document.getElementById("prodGrid");
    if (!grid) return;
    var catalogView = document.getElementById("catalogView");
    var sheetView = document.getElementById("sheetView");

    function specRows(sp) {
      return sp.map(function (s) { return "<tr><td>" + s[0] + "</td><td>" + s[1] + "</td></tr>"; }).join("");
    }

    /* Build catalog cards â€” plain hrefs, no hash routes */
    grid.innerHTML = PRODUCTS.map(function (p) {
      return '<article class="pcard" data-cat="' + p.cat + '">' +
        '<div class="p-visual" aria-hidden="true"><svg viewBox="0 0 72 72" fill="none" stroke-width="1.5">' + ICONS[p.icon] + "</svg></div>" +
        '<div class="pbody-full">' +
          '<span class="pill">' + p.catLabel + "</span>" +
          "<h3>" + p.name + "</h3>" +
          "<p>" + p.desc + "</p>" +
          '<table class="spec-table"><tbody>' + specRows(p.specs) + "</tbody></table>" +
          '<div class="apps">' + p.apps.map(function (a) { return '<span class="app-chip">' + a + "</span>"; }).join("") + "</div>" +
          '<div class="pcard-foot">' +
            '<a class="btn btn-outline btn-sm" href="products.html?ds=' + p.id + '">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" aria-hidden="true"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/></svg>' +
              "Data Sheet (PDF)</a>" +
            '<a class="btn btn-primary btn-sm" href="contact.html">Request a Quote</a>' +
          "</div>" +
        "</div></article>";
    }).join("");

    /* Category filter */
    var bar = document.getElementById("prodFilter");
    var count = document.getElementById("prodCount");
    bar.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      bar.querySelectorAll(".chip").forEach(function (c) {
        var on = c === btn;
        c.classList.toggle("is-on", on);
        c.setAttribute("aria-pressed", String(on));
      });
      var f = btn.dataset.filter, shown = 0;
      var cards = grid.querySelectorAll(".pcard");
      cards.forEach(function (c) {
        var show = f === "all" || c.dataset.cat === f;
        c.classList.toggle("is-hidden", !show);
        if (show) {
          shown++;
          if (!REDUCED) { c.classList.remove("anim"); void c.offsetWidth; c.classList.add("anim"); }
        }
      });
      count.textContent = pad2(shown) + " / " + pad2(cards.length) + " shown";
    });

    /* Data-sheet view â€” resolved from ?ds=<id> */
    function renderSheet(id) {
      var p = PRODUCTS.filter(function (x) { return x.id === id; })[0] || PRODUCTS[0];
      var today = new Date().toISOString().slice(0, 10);
      document.title = "Data Sheet: " + p.name + " â€” NANOLITH";
      document.getElementById("dsDocNo").textContent = "DOC NL-DS-" + p.id.toUpperCase() + " آ· REV A";
      document.getElementById("dsDocDate").textContent = "Issued " + today + " آ· uncontrolled when printed";
      document.getElementById("dsName").textContent = p.name;
      document.getElementById("dsTagline").textContent = p.catLabel + " آ· " + p.tagline;
      document.getElementById("dsDesc").textContent = p.desc;
      document.getElementById("dsSpecs").innerHTML = specRows(p.specs);
      document.getElementById("dsApps").innerHTML = p.apps.map(function (a) { return "<li>" + a + "</li>"; }).join("");
      document.getElementById("dsOrder").innerHTML = p.order + "<br />Lead time: [PLACEHOLDER] weeks ARO";
    }
    function route() {
      var m = (window.location.search || "").match(/[?&]ds=([\w-]+)/);
      if (m) {
        renderSheet(m[1]);
        catalogView.hidden = true;
        sheetView.hidden = false;
        window.scrollTo(0, 0);
      } else {
        catalogView.hidden = false;
        sheetView.hidden = true;
        document.title = "Products & Solutions â€” NANOLITH";
      }
    }
    var printBtn = document.getElementById("printBtn");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
    route();
  })();

  /* ============================================================
     INSIGHTS â€” article list, category filter, article template
     Single-article view is resolved from ?a=<slug> (no hashes).
     Articles are stored MDX-style so they can migrate 1:1 to a
     Markdown content folder later.
     ============================================================ */
  var ARTICLES = {
    "hybrid-resists": {
      cat: "Research", date: "2026-03-14", read: "6 min read",
      title: "Critical-dimension control below 20 nm with hybrid e-beam resists",
      body: "<p>Feature sizes below 20 nm are where most e-beam processes quietly lose control: line-edge roughness grows, dose latitude narrows, and the recipe that worked on Monday drifts by Friday. Over two years of pilot production we iterated on a hybrid resist stack that keeps critical dimensions where you set them.</p><h2>What we changed</h2><p>The stack pairs a high-contrast positive-tone resist with an underlying hard-mask layer tuned for etch selectivity. Instead of optimizing the resist in isolation, we co-optimized resist thickness, bake schedule and etch chemistry as one system â€” a statistical design of experiments across 240 process points.</p><blockquote>The resist is only half the feature. The other half is what the etch does to it.</blockquote><h2>Results across pilot runs</h2><ul><li>Line-edge roughness reduced by 31% versus our single-tone baseline [SAMPLE].</li><li>Dose latitude widened from 6% to 11% at 18 nm half-pitch [SAMPLE].</li><li>Run-to-run CD drift held under 1.2 nm (3دƒ) across eight weeks [SAMPLE].</li></ul><h2>What it means for partners</h2><p>For device programs, tighter CD control converts directly into electrical uniformity â€” and uniformity is what makes a pilot line transferable. The full statistical dataset is available to collaboration partners under NDA.</p>"
    },
    "cleanroom-expansion": {
      cat: "Company", date: "2026-02-27", read: "4 min read",
      title: "NANOLITH expands cleanroom capacity for pilot-line production",
      body: "<p>Our second 200 mآ² cleanroom bay is now qualified and running. The expansion was not about floor space â€” it was about closing the last external dependency in our device pipeline: wafer-level packaging.</p><h2>What moved in-house</h2><p>Die bonding, dicing and final metrology previously ran at two partner facilities. Consolidating them under our process control shortens the feedback loop: a packaging defect found at final test reaches the process engineer the same afternoon, with run sheets and inline logs attached.</p><h2>What partners will notice</h2><ul><li>Standard lead times reduced by ~40% for packaged devices [SAMPLE].</li><li>One quality owner across fab, packaging and metrology â€” one report, one signature.</li><li>More pilot-line slots per quarter for industrial collaborations.</li></ul><p>Existing customers keep their account engineers; new pilot programs open with the next quarterly cycle.</p>"
    },
    "atomic-metrology": {
      cat: "Industry", date: "2026-01-19", read: "5 min read",
      title: "Why atomic-layer metrology is becoming a supply-chain requirement",
      body: "<p>A quiet shift is happening in procurement departments across the membrane and sensor industries: film-thickness tolerance is moving from a datasheet footnote to a signed contract line. When your device depends on a 12 nm layer, \u201capproximately 12 nm\u201d is no longer a spec.</p><h2>From datasheet to contract</h2><p>RFQs increasingly specify not just mean thickness but distribution: uniformity across the substrate, wafer-to-wafer repeatability, and the measurement method with its traceability. Buyers have learned that a number without a measurement protocol is a hope, not a specification.</p><blockquote>A thickness value that cannot be traced to a calibration standard is an anecdote.</blockquote><h2>What suppliers must prepare</h2><ul><li>Documented measurement protocols â€” ellipsometry, XRR or TEM cross-section, declared per layer.</li><li>Statistical process evidence: capability indices, not single golden samples.</li><li>Honest uncertainty budgets that state what the number actually means.</li></ul><p>Suppliers who can answer these questions at quote stage win the audits before they happen.</p>"
    },
    "q-factor-nems": {
      cat: "Research", date: "2025-11-08", read: "7 min read",
      title: "Pushing NEMS resonator Q-factors past 10âپ´ across ambient-to-vacuum transitions",
      body: "<p>Nanomechanical resonators promise extraordinary mass sensitivity, but performance lives and dies with the quality factor â€” and Q is fragile. Devices that shine in vacuum routinely collapse by two orders of magnitude in air, where viscous damping dominates.</p><h2>Designing for both regimes</h2><p>Our platform targets a specific compromise: Q retention from ambient pressure to hard vacuum, so a device characterized on the bench behaves predictably inside its final instrument. The approach combines anchor geometry that minimizes clamping loss with piezoresistive readout that avoids optical alignment entirely.</p><h2>Measured behavior</h2><ul><li>Q > 10âپ´ sustained in vacuum at 1â€“10 MHz [SAMPLE].</li><li>Q retention above 40% of vacuum value at ambient pressure [SAMPLE].</li><li>Readout noise floor compatible with zeptogram-class resolution [SAMPLE].</li></ul><h2>Where we take it next</h2><p>The current generation answers the readout question; the next one addresses temperature drift. A collaboration slot for the thermal-compensation study is open â€” see the research collaboration note on the contact page.</p>"
    },
    "iso-17025": {
      cat: "Company", date: "2025-09-30", read: "3 min read",
      title: "NANOLITH metrology lab completes ISO/IEC 17025 accreditation assessment",
      body: "<p>Our metrology laboratory has completed the on-site assessment for ISO/IEC 17025 accreditation covering SEM critical-dimension measurement and stylus/AFM topography [PLACEHOLDER â€” confirm scope]. The assessment examined what matters: uncertainty budgets, calibration traceability chains and personnel competence records.</p><h2>What accreditation changes for customers</h2><p>Every measurement we deliver now carries the weight of a documented, externally audited quality system. For partners in regulated industries â€” diagnostics, aerospace components, environmental sensing â€” this removes a significant onboarding barrier: your quality department can accept our reports the way it accepts a calibration certificate.</p><ul><li>Accredited scope: SEM CD metrology, AFM topography [PLACEHOLDER].</li><li>Uncertainty budgets published with every measurement dossier.</li><li>Traceability to national standards documented per instrument.</li></ul><p>Accreditation is a floor, not a ceiling â€” but it is a floor both parties can stand on.</p>"
    },
    "chip-lifecycle": {
      cat: "Industry", date: "2025-08-12", read: "6 min read",
      title: "The coming decade of lab-on-chip: from single-purpose devices to reconfigurable platforms",
      body: "<p>Most lab-on-chip devices sold today are single-purpose: one assay, one fluidic layout, one future in a drawer. That made sense when chips were expensive to design. It makes progressively less sense as fabrication costs fall and biology keeps changing faster than lithography.</p><h2>Three signals we are watching</h2><p>First, programmable fluidic logic is maturing from academic demonstration to commercial tooling. Second, assay portfolios in diagnostics are consolidating onto shared hardware with swappable consumables. Third, regulators are gaining experience with modular platforms, shortening the approval path for new assays on existing hardware.</p><blockquote>The winning platform will not be the one with the most features on the chip â€” it will be the one whose chips are cheapest to re-specify.</blockquote><h2>What this means for device builders</h2><ul><li>Design fluidics as modules with defined interfaces, not monolithic layouts.</li><li>Invest in characterization data â€” reusability is sold with statistics, not schematics.</li><li>Choose fabrication partners who can iterate the chip, not only produce it.</li></ul><p>Our lab-on-chip line is being restructured around exactly this modularity; the first reconfigurable platform enters pilot testing this year [SAMPLE].</p>"
    }
  };

  (function () {
    var list = document.getElementById("insList");
    if (!list) return;
    var listView = document.getElementById("listView");
    var artView = document.getElementById("articleView");

    var keys = Object.keys(ARTICLES).sort(function (a, b) {
      return ARTICLES[b].date.localeCompare(ARTICLES[a].date);
    });

    /* Build article cards â€” plain hrefs, no hash routes */
    list.innerHTML = keys.map(function (k) {
      var a = ARTICLES[k];
      return '<article class="i-card" data-cat="' + a.cat + '">' +
        '<div class="i-meta"><span class="pill">' + a.cat + '</span><span class="i-date">' + a.date + "</span></div>" +
        "<h3>" + a.title + "</h3>" +
        "<p>" + a.body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 130) + "â€¦</p>" +
        '<a href="insights.html?a=' + k + '" class="text-link">Read article <span aria-hidden="true">â†’</span></a>' +
        "</article>";
    }).join("");

    var bar = document.getElementById("insFilter");
    var count = document.getElementById("insCount");
    bar.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      bar.querySelectorAll(".chip").forEach(function (c) {
        var on = c === btn;
        c.classList.toggle("is-on", on);
        c.setAttribute("aria-pressed", String(on));
      });
      var f = btn.dataset.filter, shown = 0;
      var cards = list.querySelectorAll(".i-card");
      cards.forEach(function (c) {
        var show = f === "all" || c.dataset.cat === f;
        c.classList.toggle("is-hidden", !show);
        if (show) shown++;
      });
      count.textContent = pad2(shown) + " / " + pad2(cards.length) + " shown";
    });

    function renderArticle(k) {
      var a = ARTICLES[k];
      if (!a) {
        document.getElementById("artTitle").textContent = "Article not found";
        document.getElementById("artCat").textContent = "â€”";
        document.getElementById("artDate").textContent = "";
        document.getElementById("artRead").textContent = "";
        document.getElementById("artBody").innerHTML = "<p>The requested article does not exist â€” browse the full list instead.</p>";
        document.getElementById("artCrumb").textContent = "Not found";
        return;
      }
      document.getElementById("artCat").textContent = a.cat;
      document.getElementById("artDate").textContent = a.date;
      document.getElementById("artRead").textContent = a.read;
      document.getElementById("artTitle").textContent = a.title;
      document.getElementById("artBody").innerHTML = a.body;
      document.getElementById("artCrumb").textContent = a.title.length > 34 ? a.title.slice(0, 34) + "â€¦" : a.title;
      document.title = a.title + " â€” NANOLITH Insights";
    }
    function route() {
      var m = (window.location.search || "").match(/[?&]a=([\w-]+)/);
      if (m) {
        renderArticle(m[1]);
        listView.hidden = true;
        artView.hidden = false;
        window.scrollTo(0, 0);
      } else {
        listView.hidden = false;
        artView.hidden = true;
        document.title = "Insights & News â€” NANOLITH";
      }
    }
    route();
  })();

  /* ============================================================
     CONTACT â€” inquiry form: validation, honeypot, mailto fallback
     ============================================================ */
  var FORM_ENDPOINT = ""; // â†گ paste a free Formspree/Web3Forms endpoint here; empty = mailto fallback

  (function () {
    var form = document.getElementById("inquiryForm");
    if (!form) return;
    var card = document.getElementById("formCard");

    function setErr(id, on) {
      document.getElementById("fw-" + id).classList.toggle("has-err", on);
    }
    function validate() {
      var ok = true, firstBad = null;
      var checks = [
        ["name", document.getElementById("f-name").value.trim().length >= 2],
        ["email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(document.getElementById("f-email").value.trim())],
        ["country", document.getElementById("f-country").value !== ""],
        ["subject", form.querySelector('input[name="subject"]:checked') !== null],
        ["message", document.getElementById("f-message").value.trim().length >= 20]
      ];
      checks.forEach(function (c) {
        setErr(c[0], !c[1]);
        if (!c[1]) { ok = false; if (!firstBad) firstBad = document.getElementById("f-" + c[0]) || document.getElementById("s-general"); }
      });
      if (firstBad) firstBad.focus();
      return ok;
    }
    ["f-name", "f-email", "f-country", "f-message"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", function () {
        setErr(id.replace("f-", ""), false);
      });
    });
    form.querySelectorAll('input[name="subject"]').forEach(function (r) {
      r.addEventListener("change", function () { setErr("subject", false); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      /* Honeypot: bots fill the invisible field â€” silently "succeed", send nothing. */
      if (document.getElementById("f-website").value !== "") { showSuccess(true); return; }
      if (!validate()) return;

      var name = document.getElementById("f-name").value.trim();
      var org = document.getElementById("f-org").value.trim();
      var email = document.getElementById("f-email").value.trim();
      var country = document.getElementById("f-country").value;
      var subject = form.querySelector('input[name="subject"]:checked').value;
      var message = document.getElementById("f-message").value.trim();

      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ name: name, organization: org, email: email, country: country, subject: subject, message: message })
        }).then(function () { showSuccess(false); })
          .catch(function () { mailtoFallback(); showSuccess(true); });
      } else {
        mailtoFallback();
        showSuccess(true);
      }

      function mailtoFallback() {
        var bodyLines = [
          "Name: " + name,
          "Organization: " + (org || "â€”"),
          "Email: " + email,
          "Country: " + country,
          "Subject: " + subject,
          "",
          message
        ].join("\r\n");
        window.location.href = "mailto:hello@nanolith.com?subject=" +
          encodeURIComponent("[Website] " + subject + " inquiry") +
          "&body=" + encodeURIComponent(bodyLines);
      }
      function showSuccess(viaMailto) {
        document.getElementById("successCopy").textContent = viaMailto
          ? "Your email client has opened with the inquiry pre-filled. If it did not open, write to hello@nanolith.com directly â€” we reply within two working days."
          : "Thank you â€” an engineer from the relevant team will respond within two working days.";
        document.getElementById("refCode").textContent =
          "REF NL-" + Date.now().toString(36).toUpperCase().slice(-6);
        card.classList.add("is-done");
      }
    });

    document.getElementById("resetForm").addEventListener("click", function () {
      form.reset();
      card.classList.remove("is-done");
      document.getElementById("f-name").focus();
    });
  })();
})();