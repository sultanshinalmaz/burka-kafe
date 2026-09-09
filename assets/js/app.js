/* ============================================================================
   BURKA — поведение сайта.
   Контент лежит в data.js, тексты интерфейса — в i18n.js.
   Здесь: переключение языка (ru/ar/en + RTL), корзина, фильтры меню,
   галерея, карта, анимации.
   ========================================================================= */
(function () {
  'use strict';

  var D    = window.BURKA_DATA;
  var I18N = window.BURKA_I18N;

  var LANGS      = ['ru', 'ar', 'en'];
  var LS_LANG    = 'burka_lang';
  var LS_CART    = 'burka_cart';
  var LS_CUST    = 'burka_customer';

  var lang = 'ru';
  var T    = I18N.ru;               // текущий словарь
  var cart = {};                    // { id: количество }
  var activeCat = 'all';
  var query = '';
  var checkoutStep = 0;             // 0 — список блюд, 1 — форма получателя

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────────────────────────── заставка ──────────────────────────── */
  /* Тёмный экран → прорисовывается звезда гириха → встают буквы →
     проступает «بوركا» → расходится золотая черта → всё растворяется.
     Уходит не по таймеру, а когда сойдутся три условия: анимация доиграла,
     шрифт готов, главная фотография загружена. У каждого свой потолок. */
  function splash() {
    var el = $('#splash');
    if (!el) { document.body.classList.add('is-ready'); armReveals(); return; }

    var P = (D && D.preloader) || {};

    /* По умолчанию заставка играет при каждом открытии. Если в data.js
       поставить oncePerSession: true — покажется только первый раз за вкладку. */
    var seen = false;
    try { seen = sessionStorage.getItem('burka_splash') === '1'; } catch (e) {}

    if (P.enabled === false || (P.oncePerSession === true && seen)) {
      el.remove();
      document.body.classList.add('is-ready');
      armReveals();
      return;
    }
    try { sessionStorage.setItem('burka_splash', '1'); } catch (e) {}

    var DARK = reduced ? 0   : (P.darkMs != null ? P.darkMs : 450);
    var ANIM = reduced ? 200 : (P.animMs != null ? P.animMs : 2100);
    var FADE = reduced ? 150 : (P.fadeMs != null ? P.fadeMs : 850);
    var EASE = 'cubic-bezier(.22,1,.36,1)';

    el.style.setProperty('--fade', FADE + 'ms');
    document.body.classList.add('is-locked');

    /* скрипт стартует не в нулевую миллисекунду — вычитаем уже прошедшее */
    var d0 = Math.max(0, DARK - performance.now());

    /* звезда прорисовывается: каждой линии задаём её собственную длину */
    $$('.splash__sq, .splash__ring', el).forEach(function (p, i) {
      var len = 420;
      try { len = Math.ceil(p.getTotalLength()); } catch (e) {}
      p.style.setProperty('--len', len);
      p.style.animation = 'drawLine ' + Math.round(ANIM * 0.52) + 'ms ' + EASE + ' ' +
                          Math.round(d0 + i * ANIM * 0.06) + 'ms both';
    });
    var core = $('.splash__core', el);
    if (core) core.style.animation = 'corePop 520ms ' + EASE + ' ' + Math.round(d0 + ANIM * 0.48) + 'ms both';

    /* буквы поднимаются по очереди */
    var chars = $$('.splash__word span', el);
    var span  = ANIM * 0.42;
    var dur   = Math.min(520, span * 0.5);
    var step  = chars.length > 1 ? (span - dur) / (chars.length - 1) : 0;
    chars.forEach(function (s, i) {
      s.style.animation = 'letterUp ' + Math.round(dur) + 'ms ' + EASE + ' ' +
                          Math.round(d0 + ANIM * 0.34 + i * step) + 'ms both';
    });

    var ar = $('.splash__ar', el);
    if (ar) ar.style.animation = 'arIn 620ms ' + EASE + ' ' + Math.round(d0 + ANIM * 0.70) + 'ms both';

    var line = $('.splash__line', el);
    if (line) line.style.animation = 'lineOut ' + Math.round(ANIM * 0.32) + 'ms ' + EASE + ' ' +
                                     Math.round(d0 + ANIM * 0.68) + 'ms both';

    /* --- когда уходить ------------------------------------------------ */
    var got = 0, ready = false, done = false;
    function step3() { if (++got >= 3) ready = true; }
    function cap(fn, at) { setTimeout(fn, Math.max(0, at - performance.now())); }

    var animDone = false;
    function animReady() { if (!animDone) { animDone = true; step3(); } }
    if (!line) animReady();
    else { line.addEventListener('animationend', animReady); cap(animReady, DARK + ANIM + 900); }

    var fontDone = false;
    function fontReady() { if (!fontDone) { fontDone = true; step3(); } }
    if (document.fonts && document.fonts.load) {
      document.fonts.load('600 64px "Cormorant Garamond"', 'BURKA').then(fontReady, fontReady);
      cap(fontReady, 1000);
    } else fontReady();

    var imgDone = false;
    function imgReady() { if (!imgDone) { imgDone = true; step3(); } }
    var heroImg = $('.arch__win img');
    if (!heroImg || heroImg.complete) imgReady();
    else {
      heroImg.addEventListener('load', imgReady);
      heroImg.addEventListener('error', imgReady);
      cap(imgReady, DARK + ANIM);
    }

    /* Общая страховка. Держать заставку дольше нельзя: пока она на экране,
       страница заблокирована от прокрутки, и на медленном мобильном
       интернете это читается как зависший сайт. */
    cap(function () { ready = true; }, DARK + ANIM + 900);

    /* Момент ухода считаем от реального старта анимации, а не от загрузки
       страницы. На телефоне скрипт запускается позже: d0 обнуляется, буквы
       начинают подниматься с опозданием — и заставка успевала смениться
       раньше, чем они договаривали. Плюс короткая выдержка, чтобы название
       и «بوركا» можно было прочитать, а не поймать взглядом.            */
    var START = performance.now() + d0;
    var MIN   = START + ANIM + 260;

    (function wait() {
      if (ready && performance.now() >= MIN) return finish();
      setTimeout(wait, 30);
    })();

    function finish() {
      if (done) return; done = true;
      el.classList.add('is-done');
      document.body.classList.remove('is-locked');
      document.body.classList.add('is-ready');
      armReveals();
      setTimeout(function () { el.classList.add('is-hidden'); }, FADE + 100);
    }
  }

  /* ───────────────────────── вспомогательное ───────────────────────── */

  function store(key, value) {
    try {
      if (value === undefined) { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { return null; }
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /** Достаёт строку нужного языка из объекта {ru, ar, en}. */
  function tr(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj.ru || obj.en || '';
  }

  /** Цена с валютой: «45 SAR» / «45 ر.س». */
  function money(n) {
    return n + ' ' + tr(D.delivery.currency);
  }

  function dishById(id) {
    for (var i = 0; i < D.menu.length; i++) if (D.menu[i].id === id) return D.menu[i];
    return null;
  }

  function icon(name, cls) {
    return '<svg class="' + (cls || 'ic') + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  }

  function waLink(number, text) {
    return 'https://wa.me/' + number + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  /** Разбивает номер на группы, чтобы его было легко прочитать и продиктовать. */
  function phone(num) {
    var d = String(num).replace(/\D/g, '');
    if (d.length === 12 && d.slice(0, 3) === '966')                 // Саудовская Аравия
      return '+966 ' + d.slice(3, 5) + ' ' + d.slice(5, 8) + ' ' + d.slice(8);
    if (d.length === 11 && (d[0] === '7' || d[0] === '8'))          // Россия
      return '+7 ' + d.slice(1, 4) + ' ' + d.slice(4, 7) + '-' + d.slice(7, 9) + '-' + d.slice(9);
    return '+' + d;
  }

  /* ───────────────────────── переключение языка ────────────────────── */

  function detectLang() {
    var fromUrl = new URLSearchParams(location.search).get('lang');
    if (LANGS.indexOf(fromUrl) > -1) return fromUrl;

    var saved = store(LS_LANG);
    if (LANGS.indexOf(saved) > -1) return saved;

    var nav = (navigator.language || 'ru').slice(0, 2).toLowerCase();
    if (nav === 'ar') return 'ar';
    if (nav === 'en') return 'en';
    return 'ru';
  }

  /* Если гость пришёл по ссылке с ?lang=, этот параметр при каждой
     перезагрузке перебивал бы его собственный выбор в переключателе.
     Поэтому при смене языка переписываем параметр под новый.
     Адрес без параметра не трогаем — пусть остаётся чистым. */
  function syncUrlLang() {
    if (!window.history || !history.replaceState) return;
    try {
      var u = new URL(location.href);
      if (!u.searchParams.has('lang')) return;
      if (u.searchParams.get('lang') === lang) return;
      u.searchParams.set('lang', lang);
      history.replaceState(null, '', u.toString());
    } catch (e) {}
  }

  function setLang(next, save) {
    lang = LANGS.indexOf(next) > -1 ? next : 'ru';
    T = I18N[lang];
    if (save !== false) { store(LS_LANG, lang); syncUrlLang(); }

    document.documentElement.lang = T._htmlLang;
    document.documentElement.dir  = T._dir;
    document.title = T.docTitle;

    var meta = $('meta[name="description"]');
    if (meta) meta.content = T.docDesc;

    $('#langCurrent').textContent = lang.toUpperCase();
    $$('#langMenu button').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.lang === lang);
    });

    applyI18n();
    renderAll();
  }

  /** Подставляет тексты во все элементы с data-i18n / data-i18n-attr. */
  function applyI18n() {
    $$('[data-i18n]').forEach(function (el) {
      var v = T[el.dataset.i18n];
      if (v != null) el.textContent = v;
    });
    $$('[data-i18n-attr]').forEach(function (el) {
      el.dataset.i18nAttr.split(',').forEach(function (pair) {
        var p = pair.split(':');
        var v = T[p[1]];
        if (v != null) el.setAttribute(p[0].trim(), v);
      });
    });
  }

  /* ───────────── заголовок героя: слова поднимаются по очереди ─────── */

  function renderHeroTitle() {
    var el = $('#heroTitle');
    if (!el) return;
    el.innerHTML = (T.heroTitle || '').split('\n').map(function (line) {
      return line.split(' ').map(function (w) {
        return '<span class="w">' + esc(w) + '</span>';
      }).join(' ');
    }).join('\n');
    $$('.w', el).forEach(function (w, i) {
      w.style.transitionDelay = (100 + i * 65) + 'ms';
    });
  }

  /* ─────────────── кубачинская лоза-разделитель ─────────────────────── */
  /* Вставляем узор внутрь страницы копией, а не через <use>: CSS-селекторы
     не проникают в теневое дерево <use>, а нам нужно анимировать каждую
     линию отдельно. Без скрипта разделитель просто остаётся статичным.   */

  function initRules() {
    var sym = document.getElementById('o-vine');
    if (!sym) return;
    $$('.rule').forEach(function (r) {
      if (r.dataset.built) return;
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', sym.getAttribute('viewBox') || '0 0 360 46');
      svg.innerHTML = sym.innerHTML;
      r.innerHTML = '';
      r.appendChild(svg);
      r.dataset.built = '1';

      /* каждой линии — её собственная длина, чтобы прорисовка шла ровно */
      $$('path, circle', svg).forEach(function (p) {
        if (p.classList.contains('vine-star')) return;
        try { p.style.setProperty('--vl', Math.ceil(p.getTotalLength()) + 1); } catch (e) {}
      });
    });
  }

  /* ───────────────── счётчики в блоке «О нас» ───────────────────────── */

  var countersInit = false;

  function initCounters() {
    var box = $('.stats');
    if (!box || countersInit) return;
    countersInit = true;

    var items = $$('b', box).map(function (b) {
      var m = b.textContent.match(/^(\d+)(.*)$/);
      return m ? { el: b, to: +m[1], suffix: m[2] } : null;
    }).filter(Boolean);
    if (!items.length) return;

    if (reduced || !('IntersectionObserver' in window)) return;

    items.forEach(function (it) { it.el.textContent = '0' + it.suffix; });

    var obs = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      var t0 = performance.now(), DUR = 1100;
      (function tick(now) {
        var k = Math.min(1, (now - t0) / DUR);
        var e = 1 - Math.pow(1 - k, 3);            // плавное торможение
        items.forEach(function (it) {
          it.el.textContent = Math.round(it.to * e) + it.suffix;
        });
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.4 });

    obs.observe(box);
  }

  /* ──────────────────────────── бегущая строка ─────────────────────── */

  /* Лента из всех девятнадцати названий тянется почти на 10 000 пикселей.
     На телефоне такой слой не влезает в видеопамять — браузер перестаёт
     двигать его на видеокарте, и лента замирает на полпути. Поэтому на
     узком экране берём короткий список: движение важнее полноты. */
  function renderMarquee() {
    var list = D.menu;
    if (window.innerWidth < 700) {
      /* берём шесть самых коротких названий: лента выходит вдвое уже,
         а блюд в ней видно столько же */
      list = list.slice().sort(function (a, b) {
        return tr(a.name).length - tr(b.name).length;
      }).slice(0, 6);
    }
    var names = list.map(function (d) { return '<span>' + esc(tr(d.name)) + '</span>'; });
    // дублируем список, чтобы прокрутка была бесшовной
    $('#marquee').innerHTML = names.join('') + names.join('');
  }

  /* ──────────────────────────────── меню ───────────────────────────── */

  function renderChips() {
    var html = '<button class="chip' + (activeCat === 'all' ? ' is-active' : '') +
               '" data-cat="all">' + esc(T.menuAll) + '</button>';
    D.categories.forEach(function (c) {
      html += '<button class="chip' + (activeCat === c.id ? ' is-active' : '') +
              '" data-cat="' + c.id + '">' + esc(tr(c.title)) + '</button>';
    });
    $('#chips').innerHTML = html;
  }

  function cardHTML(d) {
    var qty = cart[d.id] || 0;

    /* фото можно нажать и рассмотреть крупно; кнопка-лупа нужна тем, кто
       ходит по сайту с клавиатуры или экранным диктором */
    var media = d.img
      ? '<img src="assets/img/' + d.img + '" alt="' + esc(tr(d.name)) + '" loading="lazy" width="760" height="760">' +
        '<button class="card__zoom" type="button" data-zoom="' + d.id + '" title="' + esc(T.zoomHint) +
        '" aria-label="' + esc(T.zoomHint) + ': ' + esc(tr(d.name)) + '">' + icon('search') + '</button>'
      : '<span class="card__nophoto">' + icon('star8', '') + '<span>' + esc(T.noPhoto) + '</span></span>';

    var badges = '';
    if (d.hit)      badges += '<span class="badge badge--hit">' + esc(T.badgeHit) + '</span>';
    if (d.preorder) badges += '<span class="badge badge--pre">' + esc(T.badgePreorder) + '</span>';

    return '<article class="card reveal' + (qty ? ' is-in-cart' : '') + '" data-id="' + d.id + '">' +
             '<div class="card__media' + (d.img ? ' is-zoomable" data-zoom="' + d.id : '') + '">' + media +
               '<span class="card__frame" aria-hidden="true"></span>' +
               (badges ? '<div class="card__badges">' + badges + '</div>' : '') +
               '<span class="card__price">' + d.price + '<small>' + esc(tr(D.delivery.currency)) + '</small></span>' +
             '</div>' +
             '<div class="card__body">' +
               '<span class="card__num">' + esc(T.dishNo) + ' ' + d.id + '</span>' +
               '<h3 class="card__name">' + esc(tr(d.name)) + '</h3>' +
               '<p class="card__desc">' + esc(tr(d.desc)) + '</p>' +
               '<div class="card__control">' + controlHTML(d.id) + '</div>' +
             '</div>' +
           '</article>';
  }

  /* Кнопка «В корзину» или счётчик. Вынесено отдельно, чтобы при изменении
     заказа перерисовывать только этот кусочек, а не всё меню целиком. */
  function controlHTML(id) {
    var qty = cart[id] || 0;
    if (!qty) {
      return '<button class="card__add" data-act="add" data-id="' + id + '">' +
             icon('plus') + '<span>' + esc(T.btnAdd) + '</span></button>';
    }
    return '<div class="stepper">' +
             '<button data-act="dec" data-id="' + id + '" aria-label="−">' + icon('minus') + '</button>' +
             '<span class="stepper__q">' + qty + '</span>' +
             '<button data-act="inc" data-id="' + id + '" aria-label="+">' + icon('plus') + '</button>' +
           '</div>';
  }

  /* Точечное обновление карточки: пересобирать #menuGrid нельзя — карточки
     пересоздаются, теряют класс появления и на миг пропадают с экрана. */
  function refreshCard(id) {
    var card = $('#menuGrid .card[data-id="' + id + '"]');
    if (!card) return;
    card.classList.toggle('is-in-cart', !!cart[id]);
    var box = $('.card__control', card);
    if (box) box.innerHTML = controlHTML(id);
  }

  function refreshAllCards() {
    $$('#menuGrid .card').forEach(function (el) { refreshCard(+el.dataset.id); });
  }

  function renderMenu() {
    var q = query.trim().toLowerCase();
    var html = '';
    var total = 0;

    D.categories.forEach(function (c) {
      if (activeCat !== 'all' && activeCat !== c.id) return;

      var items = D.menu.filter(function (d) {
        if (d.cat !== c.id) return false;
        if (!q) return true;
        // ищем сразу по всем трём языкам — гость может писать как ему удобно
        var hay = [d.name.ru, d.name.ar, d.name.en, d.desc.ru, d.desc.en]
                    .join(' ').toLowerCase();
        return hay.indexOf(q) > -1;
      });
      if (!items.length) return;

      total += items.length;
      html += '<section class="menu__group">' +
                '<h3 class="menu__group-title">' + esc(tr(c.title)) + '</h3>' +
                '<div class="menu__grid">' + items.map(cardHTML).join('') + '</div>' +
              '</section>';
    });

    $('#menuGrid').innerHTML = html;
    $('#menuEmpty').hidden = total > 0;
    observeReveals();
  }

  /* ─────────────────────────────── корзина ─────────────────────────── */

  function cartList() {
    return Object.keys(cart).map(function (id) {
      var d = dishById(+id);
      return d ? { dish: d, qty: cart[id] } : null;
    }).filter(Boolean);
  }

  function cartTotals() {
    var items = cartList();
    var count = 0, subtotal = 0;
    items.forEach(function (r) { count += r.qty; subtotal += r.dish.price * r.qty; });

    var fee = count ? D.delivery.fee : 0;
    if (count && D.delivery.freeFrom && subtotal >= D.delivery.freeFrom) fee = 0;

    return { items: items, count: count, subtotal: subtotal, fee: fee, total: subtotal + fee };
  }

  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    saveCart(id);
    toast(tr(dishById(id).name) + ' · ' + T.btnAdded);
  }

  function changeQty(id, delta) {
    cart[id] = (cart[id] || 0) + delta;
    if (cart[id] <= 0) delete cart[id];
    saveCart(id);
  }

  /* id — какая карточка изменилась. Без него обновляем все (например,
     после очистки корзины). Меню при этом не пересобирается. */
  function saveCart(id) {
    store(LS_CART, cart);
    if (id == null) refreshAllCards(); else refreshCard(id);
    renderCart();
  }

  function renderCart() {
    var t = cartTotals();
    var cur = tr(D.delivery.currency);

    // счётчики в шапке и на плавающей кнопке
    $('#cartCount').textContent = t.count;
    $('#cartCount').hidden = !t.count;
    $('#cartFab').hidden = !t.count || $('#cart').classList.contains('is-open');
    $('#cartFabCount').textContent = t.count;
    $('#cartFabSum').textContent = money(t.total);

    $('#cartEmpty').hidden = t.count > 0;
    $('#cartFoot').hidden  = !t.count;
    $('#cartItems').hidden = !t.count || checkoutStep === 1;
    $('#cartForm').hidden  = checkoutStep !== 1;
    $('#cartBack').hidden  = checkoutStep !== 1;

    if (!t.count) { checkoutStep = 0; $('#cartItems').innerHTML = ''; return; }

    $('#cartItems').innerHTML = t.items.map(function (r) {
      var d = r.dish;
      var img = d.img
        ? '<img class="ci__img" src="assets/img/' + d.img + '" alt="" loading="lazy">'
        : '<span class="ci__img"></span>';
      return '<div class="ci">' + img +
        '<div class="ci__main">' +
          '<div class="ci__name">' + esc(tr(d.name)) + '</div>' +
          '<div class="ci__price">' + d.price + ' ' + cur + ' × ' + r.qty + ' = ' +
            '<span class="ci__sum">' + (d.price * r.qty) + ' ' + cur + '</span></div>' +
          '<div class="ci__ctrl">' +
            '<button data-act="dec" data-id="' + d.id + '" aria-label="−">' + icon('minus') + '</button>' +
            '<span class="ci__q">' + r.qty + '</span>' +
            '<button data-act="inc" data-id="' + d.id + '" aria-label="+">' + icon('plus') + '</button>' +
          '</div>' +
        '</div></div>';
    }).join('');

    $('#sumItems').textContent    = money(t.subtotal);
    $('#sumDelivery').textContent = t.fee ? money(t.fee) : '0 ' + cur;
    $('#sumTotal').textContent    = money(t.total);
    $('#checkoutLabel').textContent = checkoutStep === 1 ? T.formSubmit : T.cartCheckout;
  }

  function openCart(open) {
    var el = $('#cart');
    el.classList.toggle('is-open', open);
    el.setAttribute('aria-hidden', open ? 'false' : 'true');
    $('#overlay').classList.remove('overlay--nav');
    $('#overlay').hidden = !open;
    document.body.classList.toggle('is-locked', open);
    if (!open) checkoutStep = 0;
    renderCart();
  }

  /* ───────────────────── оформление заказа в WhatsApp ──────────────── */

  function buildMessage() {
    var t = cartTotals();
    var cur = tr(D.delivery.currency);
    var nl = '\n';

    var msg = '🌙 ' + T.msgTitle + nl + nl;

    t.items.forEach(function (r) {
      msg += '• ' + tr(r.dish.name) +
             (r.dish.preorder ? ' (' + T.msgPreorder + ')' : '') +
             ' × ' + r.qty + ' = ' + (r.dish.price * r.qty) + ' ' + cur + nl;
    });

    msg += nl + '📦 ' + T.msgDelivery + ': ' + (t.fee ? t.fee + ' ' + cur : '0 ' + cur) + nl;
    msg += '💰 ' + T.msgTotal + ': ' + t.total + ' ' + cur + nl;

    var name = $('#fName').value.trim();
    var phone = $('#fPhone').value.trim();
    var addr = $('#fAddress').value.trim();
    var note = $('#fNote').value.trim();

    if (name || phone || addr || note) {
      msg += nl + '———' + nl;
      if (name)  msg += '👤 ' + T.msgName + ': ' + name + nl;
      if (phone) msg += '📞 ' + T.msgPhone + ': ' + phone + nl;
      if (addr)  msg += '📍 ' + T.msgAddress + ': ' + addr + nl;
      if (note)  msg += '📝 ' + T.msgNote + ': ' + note + nl;
    }
    return msg;
  }

  function checkout() {
    // первый клик открывает форму получателя, второй — отправляет
    if (checkoutStep === 0) {
      checkoutStep = 1;
      renderCart();
      $('#cartBody').scrollTop = 0;
      $('#fName').focus();
      return;
    }

    saveCustomer();
    var text = buildMessage();

    // необязательная копия заказа боту в Telegram
    if (D.orderEndpoint) {
      try {
        fetch(D.orderEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lang: lang,
            text: text,
            items: cartTotals().items.map(function (r) {
              return { id: r.dish.id, name: tr(r.dish.name), price: r.dish.price, qty: r.qty };
            }),
            total: cartTotals().total,
            customer: {
              name: $('#fName').value.trim(),
              phone: $('#fPhone').value.trim(),
              address: $('#fAddress').value.trim(),
              note: $('#fNote').value.trim()
            }
          })
        }).catch(function () {});
      } catch (e) {}
    }

    window.open(waLink(D.contacts.whatsapp, text), '_blank', 'noopener');
    toast(T.formSent);
  }

  function saveCustomer() {
    store(LS_CUST, {
      name: $('#fName').value, phone: $('#fPhone').value,
      address: $('#fAddress').value, note: $('#fNote').value
    });
  }

  function loadCustomer() {
    var c = store(LS_CUST);
    if (!c) return;
    if (c.name)    $('#fName').value = c.name;
    if (c.phone)   $('#fPhone').value = c.phone;
    if (c.address) $('#fAddress').value = c.address;
    if (c.note)    $('#fNote').value = c.note;
  }

  /* ───────────────────────────── галерея ───────────────────────────── */

  /* Лайтбокс работает с любым списком снимков: и с галереей, и с фотографиями
     блюд в меню. Стрелки листают внутри того списка, из которого открыли. */
  var lbList = [], lbIndex = 0;

  function renderGallery() {
    $('#galleryGrid').innerHTML = D.gallery.map(function (g, i) {
      return '<figure class="gallery__item reveal" data-i="' + i + '">' +
               '<img src="assets/img/' + g.img + '" alt="' + esc(tr(g.cap)) + '" loading="lazy" width="600" height="800">' +
               '<figcaption>' + esc(tr(g.cap)) + '</figcaption>' +
             '</figure>';
    }).join('');
  }

  function galleryList() {
    return D.gallery.map(function (g) { return { img: g.img, cap: tr(g.cap) }; });
  }

  /* Снимки блюд — только те, что сейчас видны в меню: если гость отфильтровал
     категорию или что-то нашёл поиском, листаться будет ровно найденное. */
  function menuList() {
    return $$('#menuGrid .card').map(function (el) {
      var d = dishById(+el.dataset.id);
      return (d && d.img) ? { img: d.img, cap: tr(d.name), note: money(d.price) } : null;
    }).filter(Boolean);
  }

  function openLightbox(list, i) {
    if (!list || !list.length) return;
    lbList = list;
    lbIndex = (i + list.length) % list.length;
    var it = lbList[lbIndex];

    $('#lbImg').src = 'assets/img/' + it.img;
    $('#lbImg').alt = it.cap;
    $('#lbCap').innerHTML = esc(it.cap) +
      (it.note ? ' <span class="lightbox__price">' + esc(it.note) + '</span>' : '');

    /* стрелки не нужны, когда снимок один */
    var many = lbList.length > 1;
    $('#lbPrev').hidden = !many;
    $('#lbNext').hidden = !many;

    $('#lightbox').hidden = false;
    document.body.classList.add('is-locked');
  }

  function lbStep(delta) { openLightbox(lbList, lbIndex + delta); }

  function closeLightbox() {
    $('#lightbox').hidden = true;
    if (!$('#cart').classList.contains('is-open')) document.body.classList.remove('is-locked');
  }

  /* ───────────────────────────── отзывы ────────────────────────────── */

  function renderReviews() {
    /* Пока reviewsAreDemo: true, в отзывах стоят учебные тексты.
       На странице об этом ничего не сказано — напоминание видит только тот,
       кто открыл код, поэтому дублируем его в консоль разработчика. */
    if (D.reviewsAreDemo && window.console && console.info) {
      console.info('Burka: отзывы демонстрационные. Замените их в assets/js/data.js и поставьте reviewsAreDemo: false.');
    }

    $('#reviewsGrid').innerHTML = D.reviews.map(function (r) {
      var stars = '';
      for (var i = 0; i < (r.rating || 5); i++) stars += icon('star', '');
      return '<article class="review reveal">' +
               '<div class="review__stars">' + stars + '</div>' +
               '<p class="review__text">«' + esc(tr(r.text)) + '»</p>' +
               '<div class="review__who">' +
                 '<span class="review__ava">' + esc(r.name.charAt(0)) + '</span>' +
                 '<span><span class="review__name">' + esc(r.name) + '</span>' +
                 '<span class="review__city">' + esc(tr(r.city)) + '</span></span>' +
               '</div>' +
             '</article>';
    }).join('');

    $('#reviewCta').href = waLink(D.contacts.whatsapp, T.reviewsCta + ' — Burka');
  }

  /* ─────────────────────── доставка, карта, FAQ ────────────────────── */

  function renderZones() {
    $('#zones').innerHTML = D.delivery.zones.map(function (z) {
      var price = z.price != null
        ? '<span class="zone__price">' + z.price + '<small>' + esc(tr(D.delivery.currency)) + '</small></span>'
        : '<span class="zone__price zone__price--txt">' + esc(T.deliveryNegotiable) + '</span>';
      return '<article class="zone reveal">' +
               '<span class="zone__ic">' + icon(z.icon, '') + '</span>' +
               '<div><h3 class="zone__name">' + esc(tr(z.name)) + '</h3>' +
               '<p class="zone__note">' + esc(tr(z.note)) + '</p></div>' + price +
             '</article>';
    }).join('');
  }

  function renderMap() {
    $('#mapAddress').textContent = tr(D.contacts.address);
    $('#mapLink').href = 'https://www.google.com/maps/search/?api=1&query=' + D.map.lat + ',' + D.map.lng;
  }

  function loadMap() {
    var d = 0.045;
    var bbox = [D.map.lng - d, D.map.lat - d / 2, D.map.lng + d, D.map.lat + d / 2].join(',');
    var src = 'https://www.openstreetmap.org/export/embed.html?bbox=' + bbox +
              '&layer=mapnik&marker=' + D.map.lat + ',' + D.map.lng;
    $('#mapCanvas').innerHTML =
      '<iframe src="' + src + '" loading="lazy" title="' + esc(T.mapTitle) + '" ' +
      'referrerpolicy="no-referrer-when-downgrade"></iframe>';
  }

  function renderFaq() {
    $('#faqList').innerHTML = D.faq.map(function (f) {
      return '<div class="faq__item reveal">' +
               '<button class="faq__q">' + esc(tr(f.q)) + '</button>' +
               '<div class="faq__a"><p>' + esc(tr(f.a)) + '</p></div>' +
             '</div>';
    }).join('');
  }

  /* ──────────────────────── контакты и соцсети ─────────────────────── */

  function socialsHTML(cls) {
    var c = D.contacts;
    return '<a href="' + c.telegram + '" target="_blank" rel="noopener" aria-label="Telegram">' + icon('tg', cls) + '</a>' +
           '<a href="' + c.instagram + '" target="_blank" rel="noopener" aria-label="Instagram">' + icon('ig', cls) + '</a>' +
           '<a href="' + waLink(c.whatsapp) + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + icon('wa', cls) + '</a>';
  }

  function renderContacts() {
    var c = D.contacts;

    function card(href, ic, fill, label, value, note) {
      var tag = href ? 'a' : 'div';
      var attrs = href ? ' href="' + href + '" target="_blank" rel="noopener"' : '';
      return '<' + tag + ' class="contact reveal"' + attrs + '>' +
               '<span class="contact__ic">' + icon(ic, fill ? 'fill' : '') + '</span>' +
               '<span class="contact__label">' + esc(label) + '</span>' +
               '<span class="contact__value">' + esc(value) + '</span>' +
               (note ? '<p class="contact__note">' + esc(note) + '</p>' : '') +
             '</' + tag + '>';
    }

    $('#contactsGrid').innerHTML =
      card(waLink(c.whatsapp), 'wa', true, 'WhatsApp', phone(c.whatsapp), T.contactsWrite) +
      card(c.telegram,  'tg', true, 'Telegram',  '@' + c.telegram.split('/').pop(), T.contactsWrite) +
      card(c.instagram, 'ig', false, 'Instagram', '@' + c.instagram.replace(/\/$/, '').split('/').pop(), T.contactsWrite) +
      card(waLink(c.whatsappAlt), 'phone', false, T.contactsWhatsAlt, phone(c.whatsappAlt), 'WhatsApp') +
      card(null, 'pin',   false, T.contactsAddress, tr(c.address)) +
      card(null, 'clock', false, T.contactsHours,   tr(c.hours));

    $('#topbarSocial').innerHTML = socialsHTML('');
    $('#footerSocial').innerHTML = socialsHTML('');

    var waText = T.heroBtnOrder;
    $('#heroWa').href = waLink(c.whatsapp, waText);
    $('#fabWa').href  = waLink(c.whatsapp, waText);
    $('#footerSource').href = c.sourcePage;
    $('#heroChipNum').textContent = D.delivery.fee;
    $('#heroChipCur').textContent = tr(D.delivery.currency);
    $('#statDishes').textContent = D.menu.length;
    $('#statFee').textContent = money(D.delivery.fee);
    $('#year').textContent = new Date().getFullYear();
  }

  /* ─────────────────────────── уведомление ─────────────────────────── */

  var toastTimer;
  function toast(text) {
    var el = $('#toast');
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2200);
  }

  /* ──────────────────── появление блоков при прокрутке ─────────────── */

  var io = null;
  var revealsArmed = false;

  /* Пока висит заставка, появление блоков придерживаем: иначе всё «выедет»
     за закрытым экраном и страница откроется уже статичной. */
  function armReveals() {
    revealsArmed = true;
    observeReveals();
  }

  function observeReveals() {
    if (!revealsArmed) return;
    if (!('IntersectionObserver' in window)) {
      $$('.reveal, .rule').forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        /* элементы, попавшие в кадр одной пачкой, появляются каскадом */
        var shown = 0;
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.style.setProperty('--d', Math.min(shown * 80, 480) + 'ms');
          e.target.classList.add('is-in');
          io.unobserve(e.target);
          shown++;
        });
      }, { rootMargin: '0px 0px -60px 0px', threshold: 0.06 });
    }
    $$('.reveal:not(.is-in), .rule:not(.is-in)').forEach(function (el) { io.observe(el); });
  }

  /* ───────────────────────── перерисовка всего ─────────────────────── */

  function renderAll() {
    renderHeroTitle();
    initRules();
    renderMarquee();
    renderChips();
    renderMenu();
    renderGallery();
    renderReviews();
    renderZones();
    renderMap();
    renderFaq();
    renderContacts();
    renderCart();
    observeReveals();
    initCounters();
  }

  /* ──────────────────────────── обработчики ────────────────────────── */

  function bind() {

    /* язык */
    $('#langBtn').addEventListener('click', function (e) {
      e.stopPropagation();
      var l = $('#lang');
      l.classList.toggle('is-open');
      $('#langBtn').setAttribute('aria-expanded', l.classList.contains('is-open'));
    });
    $('#langMenu').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-lang]');
      if (!b) return;
      setLang(b.dataset.lang);
      $('#lang').classList.remove('is-open');
      $('#langBtn').setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('click', function () {
      $('#lang').classList.remove('is-open');
      $('#langBtn').setAttribute('aria-expanded', 'false');
    });

    /* мобильное меню: вместе со шторкой показываем затемнение, по нему
       меню и закрывается — на телефоне это привычнее, чем искать крестик */
    function openNav(open) {
      $('#nav').classList.toggle('is-open', open);
      $('#burger').setAttribute('aria-expanded', open);
      document.body.classList.toggle('is-locked', open);
      $('#overlay').classList.toggle('overlay--nav', open);
      $('#overlay').hidden = !open;
    }

    $('#burger').addEventListener('click', function () {
      openNav(!$('#nav').classList.contains('is-open'));
    });
    $('#nav').addEventListener('click', function (e) {
      if (e.target.tagName !== 'A') return;
      openNav(false);
    });

    /* фильтры меню */
    $('#chips').addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      activeCat = b.dataset.cat;
      renderChips();
      renderMenu();
    });

    var searchTimer;
    $('#search').addEventListener('input', function (e) {
      clearTimeout(searchTimer);
      var v = e.target.value;
      searchTimer = setTimeout(function () { query = v; renderMenu(); }, 180);
    });

    $('#menuReset').addEventListener('click', function () {
      activeCat = 'all'; query = ''; $('#search').value = '';
      renderChips(); renderMenu();
    });

    /* кнопки «в корзину» и степперы — и в меню, и в самой корзине */
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var id = +b.dataset.id;
      if (b.dataset.act === 'add') addToCart(id);
      if (b.dataset.act === 'inc') changeQty(id, 1);
      if (b.dataset.act === 'dec') changeQty(id, -1);
    });

    /* корзина */
    $('#cartBtn').addEventListener('click', function () { openCart(true); });
    $('#cartFab').addEventListener('click', function () { openCart(true); });
    $('#cartClose').addEventListener('click', function () { openCart(false); });
    /* тап по затемнению закрывает то, что открыто */
    $('#overlay').addEventListener('click', function () {
      if ($('#nav').classList.contains('is-open')) openNav(false);
      else openCart(false);
    });
    $('#cartEmptyBtn').addEventListener('click', function () {
      openCart(false);
      $('#menu').scrollIntoView({ behavior: 'smooth' });
    });
    $('#checkout').addEventListener('click', checkout);
    $('#cartBack').addEventListener('click', function () { checkoutStep = 0; renderCart(); });
    $('#cartClear').addEventListener('click', function () {
      if (!confirm(T.cartClearConfirm)) return;
      cart = {}; checkoutStep = 0; saveCart();
    });
    $('#cartForm').addEventListener('input', saveCustomer);
    $('#cartForm').addEventListener('submit', function (e) { e.preventDefault(); checkout(); });

    /* галерея и лайтбокс */
    $('#galleryGrid').addEventListener('click', function (e) {
      var f = e.target.closest('.gallery__item');
      if (f) openLightbox(galleryList(), +f.dataset.i);
    });

    /* фотография блюда в меню — тоже открывается крупно */
    $('#menuGrid').addEventListener('click', function (e) {
      var z = e.target.closest('[data-zoom]');
      if (!z) return;
      var id = +z.dataset.zoom;
      var list = menuList();
      var at = 0;
      for (var i = 0; i < list.length; i++) {
        if (list[i].img === (dishById(id) || {}).img) { at = i; break; }
      }
      openLightbox(list, at);
    });

    $('#lbClose').addEventListener('click', closeLightbox);
    $('#lbPrev').addEventListener('click', function () { lbStep(-1); });
    $('#lbNext').addEventListener('click', function () { lbStep(1); });
    $('#lightbox').addEventListener('click', function (e) {
      if (e.target === e.currentTarget) closeLightbox();
    });

    /* листание пальцем — на телефоне стрелки мелкие */
    (function swipe() {
      var lb = $('#lightbox'), x0 = null, y0 = null;
      lb.addEventListener('touchstart', function (e) {
        x0 = e.changedTouches[0].clientX; y0 = e.changedTouches[0].clientY;
      }, { passive: true });
      lb.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        var dy = e.changedTouches[0].clientY - y0;
        x0 = null;
        if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
        /* в арабской версии направление зеркалим */
        var back = document.documentElement.dir === 'rtl' ? dx < 0 : dx > 0;
        lbStep(back ? -1 : 1);
      }, { passive: true });
    })();

    /* FAQ */
    $('#faqList').addEventListener('click', function (e) {
      var q = e.target.closest('.faq__q');
      if (!q) return;
      var item = q.parentElement;
      var open = item.classList.toggle('is-open');
      var a = $('.faq__a', item);
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '';
    });

    /* карта по клику */
    $('#mapLoad').addEventListener('click', loadMap);

    /* клавиатура */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (!$('#lightbox').hidden) closeLightbox();
        else if ($('#cart').classList.contains('is-open')) openCart(false);
        else if ($('#nav').classList.contains('is-open')) $('#burger').click();
      }
      if (!$('#lightbox').hidden) {
        if (e.key === 'ArrowRight') lbStep(1);
        if (e.key === 'ArrowLeft')  lbStep(-1);
      }
    });

    /* прокрутка: залипшая шапка, кнопка «наверх», активный пункт меню */
    var sections = ['menu', 'about', 'how', 'gallery', 'reviews', 'delivery', 'contacts'];
    var ticking = false;

    function onScroll() {
      var y = window.scrollY;
      $('#header').classList.toggle('is-stuck', y > 20);
      $('#toTop').classList.toggle('is-on', y > 700);

      var current = '';
      sections.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      });
      $$('.nav a').forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });

    $('#toTop').addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* при повороте телефона лента должна пересобраться: на широком экране
       возвращаем полный список, на узком — короткий */
    var wasNarrow = window.innerWidth < 700, rzTimer;
    window.addEventListener('resize', function () {
      clearTimeout(rzTimer);
      rzTimer = setTimeout(function () {
        var narrow = window.innerWidth < 700;
        if (narrow !== wasNarrow) { wasNarrow = narrow; renderMarquee(); }
      }, 250);
    }, { passive: true });

    onScroll();
  }

  /* ──────────────────────────────── старт ──────────────────────────── */

  function init() {
    cart = store(LS_CART) || {};
    // чистим позиции, которых больше нет в меню
    Object.keys(cart).forEach(function (id) { if (!dishById(+id)) delete cart[id]; });

    bind();
    loadCustomer();
    setLang(detectLang(), false);
    splash();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
