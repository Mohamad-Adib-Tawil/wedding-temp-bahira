/* ============================================================
   بحيرة (bahira) — لوحة عروسين، وسماؤها للنصّ الحيّ
   اللوحة أولاً (من المحتوى أو من القالب)، ثم التعبئة والعدّاد
   والظهور بالتمرير، والبوّابة ترفع حجابها بلمسة
   ============================================================ */

const WEDDING_CONFIG = (typeof window !== "undefined" && window.__INVITE__ && window.__INVITE__.config) || {
  occasion: "wedding",

  groom: "اسم العريس",
  bride: "اسم العروس",

  date: "2026-12-18T19:00:00",
  dateText: "يوم الجمعة، ١٨ كانون الأول ٢٠٢٦",
  timeText: "الساعة السابعة مساءً",

  heroSub: "يتشرّفان بدعوتكم لمشاركتهما فرحة العمر",
  verse: "وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
  invitationText: "بقلوبٍ مفعمةٍ بالفرح، نتشرّف بدعوتكم لحضور حفل زفافنا.",

  groomParents: "",
  brideParents: "",

  venueName: "اسم القاعة",
  venueAddr: "المدينة — العنوان",
  mapUrl: "",

  program: [
    { time: "٧:٠٠ مساءً", title: "استقبال الضيوف" },
    { time: "٨:٠٠ مساءً", title: "بدء الحفل" },
    { time: "٩:٠٠ مساءً", title: "العشاء" },
  ],

  notes: [
    "يُرجى الحضور قبل الموعد بنصف ساعة",
    "نتشرّف بحضوركم",
  ],

  closingNote: "حضوركم يزيّن فرحتنا",
  hashtag: "",
  contactLabel: "للاستفسار والتأكيد",
  contactName: "",
  contactPhone: "",
  closingFamilies: "",

  images: { hero: "", venue: "", background: "", painting: "" },
};

(function () {
  "use strict";

  var C = WEDDING_CONFIG;
  var REDUCED = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function $(id) { return document.getElementById(id); }

  /* خانة مفرَّغة عمداً تُفرِّغ العنصر — النص بالقالب احتياط لخانة لم تُضبط أصلاً */
  function setText(id, val) { var el = $(id); if (el && val != null) el.textContent = latinDigits(val); }

  /* خانة فارغة داخل كتلة مزخرفة تترك زخرفتها معلّقة — نُخفي الحاوية بدل تفريغ النص */
  function setOrHide(id, val, ancestorSel) {
    var el = $(id);
    if (!el) return;
    if (val != null && String(val).trim() !== "") { el.textContent = latinDigits(val); return; }
    var t = (ancestorSel && el.closest(ancestorSel)) || el;
    t.style.display = "none";
  }


  /* مدّ الاسم بحرف التطويل (ـ) كما بالخط النستعليق المطبوع: «فـــــيصل».
     التطويل لا يصحّ إلا بعد حرفٍ يتّصل بما بعده — بعد ا/د/ر/و/ة ونحوها يبقى
     الخط منفصلاً وتظهر شرطة سائبة، فنبحث عن أول مفصلٍ صالح. */
  var NO_JOIN = "ادذرزوؤةىءآأإژ";
  var AR_LETTER = /[\u0621-\u064A]/;
  function madd(name, n) {
    var s = String(name == null ? "" : name).trim();
    if (s.length < 3) return s;
    if (s.indexOf("\u0640") !== -1) return s;      /* الزبونة مدّته بنفسها — لا نزيد */
    var reps = n || 5;
    for (var i = 1; i < s.length - 1; i++) {
      var prev = s.charAt(i - 1);
      if (AR_LETTER.test(prev) && NO_JOIN.indexOf(prev) === -1 && AR_LETTER.test(s.charAt(i))) {
        return s.slice(0, i) + new Array(reps + 1).join("\u0640") + s.slice(i);
      }
    }
    return s;
  }

  /* أرقام الدعوة كلها لاتينية (طلب كرار): أي رقم هندي (٠-٩) أو فارسي (۰-۹)
     يصل من محتوى الزبونة أو من أقسام المنصّة المحقونة يُحوَّل 0-9 */
  var AR_DIGITS = /[٠-٩۰-۹]/;
  function latinDigits(s) {
    return String(s).replace(/[٠-٩]/g, function (c) { return String("٠١٢٣٤٥٦٧٨٩".indexOf(c)); })
                    .replace(/[۰-۹]/g, function (c) { return String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)); });
  }
  function latinizeTree(root) {
    if (!root || !document.createTreeWalker) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      if (AR_DIGITS.test(n.nodeValue)) n.nodeValue = latinDigits(n.nodeValue);
    }
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------------- اللوحة ---------------- */
  /* الرسمة المعتمدة: مسار ثابت `/ai/<job_id>` يبدّل محتواه وحده (معلّمة قبل
     الدفع، نظيفة بعده)، أو رابط https لرسمة رفعها الأدمن. الاحتياط مكتوب
     أصلاً بـsrc داخل الـHTML، فدعوةٌ بلا رسمة لا تحتاج جافاسكربت لتُعرض. */
  var FALLBACK_ART = "assets/painting.webp";

  function onArtError(e) {
    var el = e.currentTarget;
    /* مرّة واحدة: لو فشلت لوحة القالب نفسها لصار onerror حلقةً لا تنتهي */
    el.removeEventListener("error", onArtError);
    if (el.getAttribute("src") !== FALLBACK_ART) el.src = FALLBACK_ART;
  }

  /* الضباب خلف اللوحة على الشاشة العريضة يُرسم بـCSS من --art-url. الرابط يصل
     من محتوى الزبونة، فلا يُحقن بـurl() إلا بعد التحقّق من شكله: مسار الرسمة
     الداخلي أو https بلا محرفٍ يكسر الدالة — وإلا بقيت لوحة القالب بالـCSS. */
  var SAFE_ART = /^\/ai\/[\w.-]+$|^https:\/\/[^"'()\s\\]+$/;

  function applyPainting() {
    var src = (C.images && C.images.painting) || "";
    var el = $("heroArt");
    if (!el) return;
    el.addEventListener("error", onArtError);
    if (!src) return;
    el.src = src;
    var hero = $("hero");
    if (hero && SAFE_ART.test(src)) hero.style.setProperty("--art-url", 'url("' + src + '")');
    /* نسبة اللوحة تضبط الإطار: رسمة «رسمتكم» بمقاس القالب نفسه، لكن أدمناً
       قد يرفع لوحةً بنسبةٍ أخرى — عندها يتبدّل الإطار فلا يبقى شريطٌ فارغ
       حولها داخله. (object-fit:contain يحمي من القصّ قبل وبعد.) */
    el.addEventListener("load", function () {
      var w = el.naturalWidth, h = el.naturalHeight;
      if (!hero || !w || !h) return;
      hero.style.setProperty("--art-ar", w + " / " + h);
      hero.style.setProperty("--art-arn", String(Math.round((w / h) * 1e4) / 1e4));
    });
  }

  /* ---------------- التعبئة ---------------- */
  function fillContent() {
    var names = [C.groom, C.bride].filter(function (n) { return n && String(n).trim(); });

    /* مدّ الأسماء بالواجهة فقط — لا يمسّ عنوان الصفحة ولا معاينة المشاركة */
    setText("groomName", madd(C.groom));
    setText("brideName", madd(C.bride));
    if (names.length < 2) {
      var sep = document.querySelector(".couple-sep");
      if (sep) sep.style.display = "none";
    }

    setText("heroSub", C.heroSub);
    setOrHide("verseText", C.verse, ".verse-card");
    setOrHide("invitationText", C.invitationText);

    /* الأهل: عمود فارغ يترك الورقة الفاصلة معلّقة بين فراغين */
    var hasG = C.groomParents && String(C.groomParents).trim();
    var hasB = C.brideParents && String(C.brideParents).trim();
    if (hasG) setText("groomParents", C.groomParents); else hide($("familyGroom"));
    if (hasB) setText("brideParents", C.brideParents); else hide($("familyBride"));
    if (!hasG || !hasB) {
      var leaf = document.querySelector(".families-leaf");
      if (leaf) leaf.style.display = "none";
    }
    if (!hasG && !hasB) {
      hide($("families"));
      var it = $("invitationText");            /* بلا أهل يبقى هامش النص فراغاً معلّقاً */
      if (it) it.style.marginBottom = "0";
    }

    setText("weddingDate", C.dateText);
    setOrHide("weddingTime", C.timeText);
    setText("venueName", C.venueName);
    setOrHide("venueAddr", C.venueAddr);
    setOrHide("closingNote", C.closingNote);
    setOrHide("closingHashtag", C.hashtag);
    setOrHide("closingFamilies", C.closingFamilies);
    setOrHide("contactLabel", C.contactLabel, ".sec-title");

    document.title = names.length ? "دعوة زفاف " + names.join(" & ") : "دعوة زفاف";

    /* الخريطة: وجهُ الخريطة المرسوم والزرّ معاً — كلاهما يفتح الرابط نفسه،
       وكلاهما يختفي حين لا يضع الزبون رابطاً (لوحُ موقعٍ بلا موقع خدعة) */
    var map = $("mapBtn"), mapCard = $("mapCard");
    if (C.mapUrl) {
      if (map) map.href = C.mapUrl;
      if (mapCard) mapCard.href = C.mapUrl;
    } else {
      hide(map);
      hide(mapCard);
    }

    /* التواصل */
    var tel = $("contactLink");
    if (C.contactPhone) {
      setOrHide("contactName", C.contactName);
      if (tel) tel.href = C.whatsappUrl || ("tel:" + String(C.contactPhone).replace(/[^\d+]/g, ""));
      setText("contactPhoneText", C.contactPhone);
    } else {
      hide($("contactBox"));
    }

    /* صورة القاعة (العقد الموحّد: content.images.venue) */
    var img = (C.images && C.images.venue) || "";
    if (img) {
      var box = $("venuePhoto"), el = $("venuePhotoImg");
      if (box && el) { el.src = img; box.hidden = false; }
    }

    renderProgram();
    renderNotes();
  }

  function hide(el) { if (el) el.style.display = "none"; }

  function renderProgram() {
    var ul = $("timeline");
    var list = Array.isArray(C.program) ? C.program.filter(function (p) { return p && (p.title || p.time); }) : [];
    if (!ul) return;
    if (!list.length) { hide($("programCard")); return; }
    ul.innerHTML = "";
    list.forEach(function (p) {
      var li = document.createElement("li");
      li.className = "tl-item";
      if (p.time) { var t = document.createElement("span"); t.className = "tl-time"; t.textContent = latinDigits(p.time); li.appendChild(t); }
      var h = document.createElement("span"); h.className = "tl-title"; h.textContent = latinDigits(p.title || "");
      li.appendChild(h);
      ul.appendChild(li);
    });
  }

  function renderNotes() {
    var ul = $("notesList");
    var list = Array.isArray(C.notes) ? C.notes.filter(function (n) { return n && String(n).trim(); }) : [];
    if (!ul) return;
    if (!list.length) { hide($("notesCard")); return; }
    ul.innerHTML = "";
    list.forEach(function (n) {
      var li = document.createElement("li");
      li.textContent = latinDigits(n);
      ul.appendChild(li);
    });
  }

  /* ---------------- كشف الموعد بالحكّ ----------------
     ثلاث بلاطات مغطّاةٌ بغشاءٍ أزرق يُمحى بتمرير الإصبع فيظهر اليوم والشهر
     والسنة. الغشاء <canvas> يُرسم بالكود ويُمحى بـdestination-out — لا صورة
     تُجلب ولا مكتبة. والقيم مكتوبةٌ بالـDOM أصلاً، فالغشاء زينةٌ فوقها لا
     شرطٌ لقراءتها: بلا canvas أو بحركةٍ مخفّضة تُكشف البلاطات فوراً. */
  function setupScratch() {
    var card = $("scratchCard"), row = $("scratchRow");
    if (!card || !row) return;

    /* التاريخ من الحقل نفسه الذي يقرأه العدّاد — لا من نصّ الزبونة الحرّ */
    var d = new Date(String(C.date || "").replace(" ", "T"));
    if (!C.date || isNaN(d.getTime())) { hide(card); return; }
    /* الشهر رقماً لا اسماً (طلب كرار): ثلاث بلاطاتٍ بثلاثة أرقام تُقرأ
       تاريخاً بلمحة — واسمٌ طويل («كانون الأول») كان يصغر ليسع البلاطة
       فيخرج عن قدّ أختيه. والاسم مكتوبٌ كاملاً في لوح «الموقع» أسفل. */
    setText("scDay", String(d.getDate()));
    setText("scMonth", String(d.getMonth() + 1));
    setText("scYear", String(d.getFullYear()));

    var tiles = [].slice.call(row.querySelectorAll(".scratch-tile"));
    var left = tiles.length;

    function openTile(t) {
      if (t.dataset.open) return;
      t.dataset.open = "1";
      t.classList.add("is-open");
      if (--left <= 0) card.classList.add("is-done");
    }

    /* لا canvas أو حركةٌ مخفّضة: الموعد مكشوفٌ من أوّله */
    if (REDUCED || !document.createElement("canvas").getContext) {
      tiles.forEach(openTile);
      var h = $("scratchHint");
      if (h) h.textContent = "";
      return;
    }

    tiles.forEach(function (tile) {
      var cv = document.createElement("canvas");
      cv.className = "scratch-foil";
      cv.setAttribute("aria-hidden", "true");
      tile.appendChild(cv);
      var ctx = cv.getContext("2d");
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = 0, h = 0, painted = false;

      /* غشاء ماء البحيرة: تدرّجٌ مائل ولمعةٌ عبره، وعلامةُ حكٍّ رقيقة بوسطه */
      function paint() {
        var r = tile.getBoundingClientRect();
        if (!r.width || !r.height) return;
        w = r.width; h = r.height;
        cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        var g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, "#a9cbdf");
        g.addColorStop(.5, "#94b9d0");
        g.addColorStop(1, "#6f9db8");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        /* لمعةٌ مائلة كالتي على الماء */
        var sh = ctx.createLinearGradient(0, h, w, 0);
        sh.addColorStop(.38, "rgba(255,255,255,0)");
        sh.addColorStop(.5, "rgba(255,255,255,.3)");
        sh.addColorStop(.62, "rgba(255,255,255,0)");
        ctx.fillStyle = sh;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "rgba(255,255,255,.72)";
        ctx.font = "600 " + Math.round(Math.min(w, h) * .3) + "px system-ui, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("؟", w / 2, h / 2 + 1);
        painted = true;
      }

      /* نسبة الممحوّ: تُقاس بعيّنةٍ متباعدة لا ببكسلٍ بكسل — القراءة الكاملة
         لبلاطةٍ بـ٣٠٠×٣٠٠ عند كل حركةٍ تُثقل الإصبع على هاتفٍ متوسّط */
      function erasedEnough() {
        var img;
        try { img = ctx.getImageData(0, 0, cv.width, cv.height).data; } catch { return false; }
        var step = 4 * 24, gone = 0, seen = 0;
        for (var i = 3; i < img.length; i += step) { seen++; if (img[i] < 24) gone++; }
        return seen > 0 && gone / seen > .48;
      }

      var drawing = false, since = 0;
      function rub(e) {
        if (!painted) return;
        var r = cv.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, Math.max(16, Math.min(w, h) * .17), 0, Math.PI * 2);
        ctx.fill();
        if (++since >= 6) { since = 0; if (erasedEnough()) openTile(tile); }
      }

      cv.addEventListener("pointerdown", function (e) {
        drawing = true;
        try { cv.setPointerCapture(e.pointerId); } catch { /* لا شيء */ }
        rub(e);
        e.preventDefault();
      });
      cv.addEventListener("pointermove", function (e) { if (drawing) { rub(e); e.preventDefault(); } });
      function stop() { if (!drawing) return; drawing = false; if (erasedEnough()) openTile(tile); }
      cv.addEventListener("pointerup", stop);
      cv.addEventListener("pointercancel", stop);
      cv.addEventListener("pointerleave", stop);

      paint();
      /* دوران الهاتف يغيّر المقاس: يُعاد الرسم لما لم يُكشف بعد */
      window.addEventListener("resize", function () { if (!tile.dataset.open) paint(); });
    });
  }

  /* ---------------- العدّاد ---------------- */
  function setupCountdown() {
    var target = new Date(String(C.date || "").replace(" ", "T")).getTime();
    var box = $("countdown");
    if (!box || !target || isNaN(target)) { hide(box); return; }

    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        box.style.display = "none";
        var a = $("cdArrived"); if (a) a.hidden = false;
        clearInterval(timer);
        return;
      }
      var s = Math.floor(diff / 1000);
      setText("cdDays",  pad2(Math.floor(s / 86400)));
      setText("cdHours", pad2(Math.floor(s % 86400 / 3600)));
      setText("cdMins",  pad2(Math.floor(s % 3600 / 60)));
      setText("cdSecs",  pad2(s % 60));
    }
    tick();
    var timer = setInterval(tick, 1000);
  }

  /* ---------------- خيط البرنامج يمشي مع التمرير ----------------
     نسبةٌ تُحسب من موضع القائمة على الشاشة، لا حدثٌ يقع مرّة: بالنزول يتقدّم
     الخيط وبالصعود يرتدّ. خطّ القراءة عند ٦٢٪ من ارتفاع الشاشة — حيث تستقرّ
     العين على المحطّة التي تقرؤها. القياس داخل rAF والاستماع سلبيّ، فلا
     يُعاد تخطيط الصفحة في كل إطار تمرير. */
  function setupTimelineTrail() {
    var ul = $("timeline");
    if (!ul) return;
    var items = [].slice.call(ul.querySelectorAll(".tl-item"));
    if (!items.length) return;
    var queued = false;

    function paint() {
      queued = false;
      var r = ul.getBoundingClientRect();
      var mark = window.innerHeight * .62;
      var p = (mark - r.top) / (r.height || 1);
      ul.style.setProperty("--tl-p", (p < 0 ? 0 : p > 1 ? 1 : p).toFixed(4));
      for (var i = 0; i < items.length; i++) {
        /* الوردة عند رأس البند: تتفتّح حين يبلغها الخيط لا حين يظهر البند */
        items[i].classList.toggle("is-lit", items[i].getBoundingClientRect().top + 12 <= mark);
      }
    }
    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(paint);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    paint();
  }

  /* ---------------- الظهور بالتمرير ---------------- */
  function setupReveal() {
    var els = [].slice.call(document.querySelectorAll(".reveal"));
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------------- بتلات الورد ---------------- */
  /* قليلةٌ ومتفرّقة على عمقين. عددٌ ثابت بلا إضافةٍ ولا حذفٍ بعد الإنشاء، فلا
     عمل لجافاسكربت بعد هذه الدالة — الحركة كلها بـtransform/opacity على
     المُركِّب. الطبقة الخلفية أكبر وأبطأ وأشدّ ميلاً، والأمامية أصغر وأرقّ
     وأسرع: بهذا يُقرأ النزول مشهداً له عمق لا ستارةً مسطّحة. */
  var PETAL_LAYERS = [
    /* [المحدِّد, العدد على الهاتف, العدد على العريضة, أصغر مقاس, مدى المقاس, أبطأ مدّة, مدى المدّة, أقلّ شفافية, مدى الشفافية]
       العدد رُفع بطلب كرار («كثّر الأنميشن الذي ينزل بداخل الدعوة»): ١٢ ← ٢٠
       على الهاتف و١٧ ← ٢٨ على العريضة. الكلفة تبقى transform وopacity وحدهما
       بلا فلاتر ولا ظلال، والطبقة الأمامية تبقى الأرقّ كي لا تعبر النصّ. */
    [".petals-back",  12, 17, 16, 13, 19, 13, .34, .30],
    [".petals-front",  8, 11, 12,  9, 14, 10, .28, .28],
  ];

  function fillPetals(sel, n, szMin, szSpan, durMin, durSpan, opMin, opSpan) {
    var host = document.querySelector(sel);
    if (!host || host.dataset.on) return;
    host.dataset.on = "1";
    for (var i = 0; i < n; i++) {
      var p = document.createElement("span");
      p.className = i % 3 === 1 ? "petal is-curled" : "petal";
      /* التوزيع بشرائح متساوية + إزاحة داخلها: العشوائية وحدها تكدّس أربعاً
         بجانب بعضها وتترك نصف الشاشة فارغاً */
      p.style.left = (((i + Math.random() * .84) / n) * 100).toFixed(1) + "%";
      p.style.setProperty("--sz",    (szMin + Math.random() * szSpan).toFixed(1) + "px");
      p.style.setProperty("--dur",   (durMin + Math.random() * durSpan).toFixed(1) + "s");
      p.style.setProperty("--delay", (-Math.random() * 30).toFixed(1) + "s");   /* سالب: منتصف الطريق عند الكشف، لا دفعةٌ من الأعلى */
      p.style.setProperty("--drift", (-56 + Math.random() * 112).toFixed(0) + "px");
      p.style.setProperty("--spin",  (Math.random() < .5 ? -1 : 1) * (190 + Math.round(Math.random() * 250)) + "deg");
      p.style.setProperty("--op",    (opMin + Math.random() * opSpan).toFixed(2));
      host.appendChild(p);
    }
  }

  function startPetals() {
    if (REDUCED) return;
    var wide = window.innerWidth >= 900;
    for (var i = 0; i < PETAL_LAYERS.length; i++) {
      var L = PETAL_LAYERS[i];
      fillPetals(L[0], wide ? L[2] : L[1], L[3], L[4], L[5], L[6], L[7], L[8]);
    }
  }

  /* ============================================================
     البوّابة: لمسة ← البوّابة تنفتح ← الضوء يتمدّد ← اللوحة
     ============================================================ */
  function setupGate() {
    var gate = $("gate"), invite = $("invite"), btn = $("gateBtn"), video = $("gateVideo");
    if (!gate || !invite || !btn) return;
    var label = $("gatePillText"), fill = $("gateBarFill");
    var opened = false;
    /* ready = المقطع في الذاكرة واللوحة محمّلة. قبلها اللمسة تعمل أيضاً لكن
       تدخل الدعوة رأساً بلا دخولية — الباب لا يصمت أبداً تحت الإصبع. */
    var ready = false;

    /* التسليم بالبياض: البلوم الأبيض بلغ حوافّ الشاشة، فتصير البوّابة صفحةً
       بيضاء كاملة (is-white) وتُكشف الدعوة تحتها، ثم يذوب البياض نفسه فتظهر
       من داخله. لا قطعَ من مشهدٍ إلى مشهد. */
    function finish() {
      gate.classList.add("is-white");
      document.body.classList.remove("locked");
      invite.setAttribute("aria-hidden", "false");
      window.scrollTo(0, 0);
      var hero = document.querySelector(".hero.reveal");
      if (hero) hero.classList.add("is-in");
      startPetals();
      /* إطارٌ واحد على الأقل بين البياض وذوبانه: بلا فاصل يبتلع المتصفّح
         الانتقال ويقع القطع الحادّ الذي نتجنّبه */
      setTimeout(function () { gate.classList.add("is-gone"); }, REDUCED ? 30 : 220);
      setTimeout(function () { if (gate.parentNode) gate.parentNode.removeChild(gate); }, 1600);
    }

    /* الضوء يتمدّد أولاً فتعبر الضيفة من البوّابة المفتوحة — لا قطع حادّ */
    function bloomThenFinish(delay) {
      gate.classList.add("is-opening");
      setTimeout(finish, REDUCED ? 120 : (delay == null ? 620 : delay));
    }

    function open() {
      if (opened) return;
      opened = true;

      /* الموسيقى مع الضغطة نفسها: نداء المنصّة العام يُستدعى **متزامناً داخل
         معالج اللمسة** — على iOS الإذن مربوط بلمسة حيّة وأي تأجيل يُسقطه.
         محروس: القوالب بلا موسيقى (الباقة الأساسية) لا تعرّف هذه الدالة. */
      try { if (typeof window.__da3waMusicGo === "function") window.__da3waMusicGo(); } catch { /* لا شيء */ }

      gate.classList.add("is-playing");

      /* 🚨 لا نشترط جاهزيةً مسبقة قبل التشغيل. iOS **لا يخزّن شيئاً من
         المقطع قبل لمسةٍ من المستخدم** مهما كتبنا preload — فـreadyState يبقى
         صفراً حتى اللحظة، وكان الشرط السابق (‏≥ ٢) يُسقط الدخوليّة على كل
         آيفون: «لا يعمل الفيديو وينقلني مباشرة للرئيسية». اللمسة نفسها هي
         إذن التحميل، فنطلب التشغيل دائماً ونمهله نافذةً قصيرة ليبدأ. */
      if (!video || REDUCED) { bloomThenFinish(REDUCED ? 120 : 420); return; }

      var done = false;
      function settle(delay) { if (done) return; done = true; bloomThenFinish(delay); }

      /* التوقيت نسبةً إلى طول المقطع لا برقمٍ ثابت: أي إعادة قصٍّ للفيديو كانت
         تُسقط لحظة العبور بصمت. والوهج يبدأ قبل آخره بقليل فينتهي انفتاح
         الدفّتين داخل الضوء نفسه. */
      function dur() { return isFinite(video.duration) && video.duration > 0 ? video.duration : 5.33; }
      /* الكشف لا ينتظر آخر إطار: عند ٧٦٪ تكون الدفّتان مفتوحتين والضوء يسكب
         من بينهما، فيبدأ البياض هناك ويكمل ما بقي من الانفتاح داخله. (طلب
         كرار: «اجعل المحتوى بعد الفيديو يعمل بمنتصف الفيديو».) */
      video.addEventListener("timeupdate", function () {
        if (video.currentTime >= Math.min(dur() - .55, dur() * .76)) settle(760);
      });
      video.addEventListener("ended", function () { settle(420); }, { once: true });
      video.addEventListener("error", function () { settle(300); }, { once: true });
      /* تعثّرٌ أثناء العرض: لا ننتظر نهايةً لن تأتي. المقطع محمَّلٌ كاملاً في
         الذاكرة فهذا نادر، لكن جهازاً مثقلاً قد يوقف فكّ الترميز. */
      var stall = null;
      function onStall() {
        if (stall) clearTimeout(stall);
        stall = setTimeout(function () { settle(260); }, 1400);
      }
      video.addEventListener("waiting", onStall);
      video.addEventListener("stalled", onStall);
      video.addEventListener("playing", function () { if (stall) { clearTimeout(stall); stall = null; } });

      /* iOS يتجاهل preload، فاللمسة هي أوّل طلبٍ للملف: load() هنا صريحاً كي
         يبدأ السحب فوراً لا بعد أن يقرّر المتصفّح */
      if (video.readyState === 0) { try { video.load(); } catch { /* لا شيء */ } }
      var p = video.play();
      if (p && p.catch) p.catch(function () { settle(300); });

      /* نافذةُ الإقلاع: إن لم يتحرّك أوّل إطارٍ خلالها دخلنا الدعوة بدل أن
         تقف الضيفة أمام إطارٍ ساكن. سخيّةٌ بقدر ما يكفي آيفون ليبدأ من الصفر
         (الملف ٣٨٠ك.ب وبـfaststart)، وقصيرةٌ بقدر ما لا يُقرأ تعطّلاً. */
      var started = false;
      video.addEventListener("playing", function () { started = true; }, { once: true });
      setTimeout(function () { if (!started) settle(240); }, 1600);

      /* حزام أمان أخير */
      setTimeout(function () { settle(320); }, Math.ceil(dur() * 1000) + 1500);
    }

    btn.addEventListener("click", open);

    /* ---------------- تحميلٌ حقيقي ----------------
       الشريط يقيس ما تخزّن فعلاً من المقطع (`video.buffered`) لا حركةً تمثّل
       انتظاراً، ومعه اللوحة (٧٥٪ مقطع + ٢٥٪ لوحة) فـ«جاهز» تعني الدخوليّة
       وما خلفها معاً.

       ولا نجلبه بأنفسنا: كانت النسخة السابقة تسحبه بـfetch كاملاً ثم تسلّمه
       blob — رقمٌ دقيق، لكنّه **ألغى العرض التدريجي**: لا يبدأ شيءٌ قبل أن
       يصل آخر بايت، فاللمسة تدخل الدعوة بلا دخوليّة على شبكةٍ عادية. العنصر
       نفسه يبدأ العرض بعد أوّل ثانيةٍ مخزّنة (والملف بـfaststart ورأسه أوّلاً)،
       وهذا هو «يعمل مباشرة بعد اللمس». */
    var artProg = 0;

    function bufferedFrac() {
      if (!video || !isFinite(video.duration) || !video.duration) return 0;
      var b = video.buffered;
      if (!b || !b.length) return 0;
      return Math.min(b.end(b.length - 1) / video.duration, 1);
    }

    function paint() {
      var v = video ? bufferedFrac() : 1;
      /* أرضيةٌ صغيرة ما إن يصل الوصف: الشريط عند الصفر يُقرأ عطلاً لا بداية */
      if (video && v === 0 && video.readyState >= 1) v = .06;
      var p = v * .75 + artProg * .25;
      if (fill) fill.style.transform = "scaleX(" + p.toFixed(3) + ")";
      if (label && !ready) label.textContent = "تُحمَّل الدعوة " + Math.round(p * 100) + "%";
    }

    function markReady() {
      if (ready) return;
      ready = true;
      if (fill) fill.style.transform = "scaleX(1)";
      if (label) label.textContent = "المسي الباب";
      gate.classList.add("is-ready");
    }

    /* جاهز = حكم المتصفّح نفسه أنّه يقدر أن يعرض حتى النهاية بلا تعثّر
       (readyState 4)، أو نصف المقطع مخزَّنٌ وهو قادر على العرض الآن.
       وإلّا فبعد مهلةٍ قصيرة: iOS لا يخزّن شيئاً قبل اللمسة، فبلا هذه المهلة
       يبقى اللوح على «تُحمَّل ٠٪» إلى الأبد على كل آيفون — واللمسة تعمل أصلاً
       وهي التي تبدأ التحميل. */
    var grace = false;
    function check() {
      if (artProg < 1) return;
      if (!video) { markReady(); return; }
      if (video.readyState >= 4 || (video.readyState >= 3 && bufferedFrac() >= .5) || grace) markReady();
    }

    /* اللوحة: هي أثقل ما بالدعوة خلف البوّابة */
    var art = $("heroArt");
    if (!art || art.complete) artProg = 1;
    else {
      art.addEventListener("load",  function () { artProg = 1; paint(); check(); }, { once: true });
      art.addEventListener("error", function () { artProg = 1; paint(); check(); }, { once: true });
    }

    if (video) {
      ["progress", "loadedmetadata", "loadeddata", "canplay", "canplaythrough", "timeupdate"]
        .forEach(function (ev) { video.addEventListener(ev, function () { paint(); check(); }); });
      /* مقطعٌ تعذّر: لا نعلّق اللوح على «تُحمَّل» — اللمسة تدخل الدعوة رأساً */
      video.addEventListener("error", function () { artProg = 1; markReady(); }, { once: true });

      /* أوّل إطارٍ مفكوكٌ ومطليّ قبل اللمسة: المتصفّح يُسقط الـposter لحظة
         التشغيل، فإن لم يكن إطارٌ جاهزاً ظهر العنصر شفّافاً ومضة. (وخلفية
         .gate-video تحمل الإطار الأوّل احتياطاً كاملاً.) */
      var primed = false;
      var prime = function () {
        if (primed || opened) return;
        primed = true;
        var q = video.play();
        if (q && q.then) q.then(function () { if (!opened) video.pause(); }).catch(function () { /* منعٌ تلقائي */ });
        else if (!opened) { try { video.pause(); } catch { /* لا شيء */ } }
      };
      if (video.readyState >= 2) prime();
      else video.addEventListener("loadeddata", prime, { once: true });

      /* المتصفّح يؤجّل التحميل إلى اللمسة (iOS): ندعو إليها بعد ثانيتين ونصف */
      setTimeout(function () { grace = true; check(); }, 2500);
      /* وشبكةٌ متعثّرة حتى في اللوحة: لا نترك اللوح على «تُحمَّل» إلى الأبد */
      setTimeout(markReady, 8000);
    } else {
      artProg = 1;
    }
    paint();
    check();

    if (/[?&]autoopen=1/.test(location.search)) setTimeout(function () { btn.click(); }, 400);
  }

  /* ---------------- الإقلاع ---------------- */
  function boot() {
    /* اللوحة أولاً: هي أثقل ما بالصفحة وأول ما يُرى، وتبديلها بعد التعبئة
       يجعل الضيف يرى لوحة القالب لحظةً ثم تُستبدل أمام عينه */
    applyPainting();
    fillContent();
    setupScratch();
    setupCountdown();
    setupTimelineTrail();
    setupReveal();
    setupGate();
    /* البتلات تنطلق مع كشف الدعوة (setupGate.finish). وحين لا تكون هناك بوّابة
       أصلاً — أدوات التصوير تحذفها، ولقطات المعرض تُلتقط بعدها — ننثرها هنا. */
    if (!$("gate")) startPetals();
    /* الأقسام المحقونة (تأكيد الحضور/التقويم/الألبوم) تصل بالـHTML من الخادم،
       فلا تمرّ بـsetText — نمسح الشجرة كلها مرّة بعد التعبئة، ومرّة متأخّرة
       لالتقاط ما يُضاف بعد الإقلاع */
    var inv = $("invite");
    latinizeTree(inv);
    setTimeout(function () { latinizeTree(inv); }, 1200);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
