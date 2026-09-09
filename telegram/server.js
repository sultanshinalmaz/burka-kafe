/* ============================================================================
   Burka — приёмник заказов с сайта → сообщение в Telegram.

   Зачем он нужен, если заказ и так уходит в WhatsApp:
   гость может собрать корзину, нажать «Оформить» — и не отправить сообщение
   в WhatsApp. Этот сервер получает копию заказа в момент нажатия кнопки,
   поэтому вы видите заказ в любом случае.

   Запуск:
     1) BOT_TOKEN=...  CHAT_ID=...  node telegram/server.js
        (или скопируйте .env.example в .env и заполните — читается автоматически)
     2) В assets/js/data.js укажите:
        orderEndpoint: "http://localhost:8788/api/order"

   Зависимостей нет — только встроенный Node (18+).
   ========================================================================== */
'use strict';

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

/* --- мини-.env ---------------------------------------------------------- */
(function loadEnv() {
  const f = path.join(__dirname, '.env');
  if (!fs.existsSync(f)) return;
  fs.readFileSync(f, 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
})();

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const CHAT_ID   = process.env.CHAT_ID || '';        // куда падают заказы (админ/группа)
const PORT      = +(process.env.PORT || 8788);
const ORIGIN    = process.env.ALLOW_ORIGIN || '*';  // на проде поставьте домен сайта
const LOG       = path.join(__dirname, 'orders.log');

if (!BOT_TOKEN || !CHAT_ID) {
  console.warn('⚠  BOT_TOKEN / CHAT_ID не заданы — заказы будут только писаться в orders.log');
}

/* --- отправка в Telegram ------------------------------------------------ */
function tg(method, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          j.ok ? resolve(j.result) : reject(new Error(j.description));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end(body);
  });
}

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const LANG_NAME = { ru: 'русский', ar: 'арабский', en: 'английский' };

function message(o) {
  const c = o.customer || {};
  const lines = [
    '🌙 <b>Новый заказ с сайта Burka</b>',
    ''
  ];

  (o.items || []).forEach(i => {
    lines.push(`• ${esc(i.name)} × ${esc(i.qty)} = <b>${esc(i.price * i.qty)} SAR</b>`);
  });

  lines.push('', `💰 <b>ИТОГО: ${esc(o.total)} SAR</b> (с доставкой)`, '');

  if (c.name)    lines.push(`👤 ${esc(c.name)}`);
  if (c.phone)   lines.push(`📞 ${esc(c.phone)}`);
  if (c.address) lines.push(`📍 ${esc(c.address)}`);
  if (c.note)    lines.push(`📝 ${esc(c.note)}`);

  lines.push('', `🌐 Язык сайта: ${esc(LANG_NAME[o.lang] || o.lang || '—')}`);
  return lines.filter(l => l !== undefined).join('\n');
}

/* --- проверка заказа ---------------------------------------------------- */
function validate(o) {
  if (!o || typeof o !== 'object')       return 'пустой запрос';
  if (!Array.isArray(o.items) || !o.items.length) return 'состав заказа';
  if (o.items.length > 60)               return 'слишком много позиций';
  if (typeof o.total !== 'number')       return 'сумма';
  return null;
}

/* --- простейший антифлуд: 5 заказов в минуту с одного IP ----------------- */
const hits = new Map();
function tooMany(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 5;
}

/* --- сервер ------------------------------------------------------------- */
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }

  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, telegram: Boolean(BOT_TOKEN && CHAT_ID) }));
    return;
  }

  if (req.method !== 'POST' || req.url !== '/api/order') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'not found' }));
    return;
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (tooMany(ip)) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'слишком часто' }));
    return;
  }

  let raw = '';
  req.on('data', c => {
    raw += c;
    if (raw.length > 16000) req.destroy();          // защита от мусора
  });

  req.on('end', async () => {
    let o;
    try { o = JSON.parse(raw); }
    catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'битый JSON' }));
      return;
    }

    const bad = validate(o);
    if (bad) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'проверьте поле: ' + bad }));
      return;
    }

    fs.appendFile(LOG, JSON.stringify({ ...o, ip, at: new Date().toISOString() }) + '\n', () => {});

    if (BOT_TOKEN && CHAT_ID) {
      try {
        await tg('sendMessage', { chat_id: CHAT_ID, text: message(o), parse_mode: 'HTML' });
      } catch (e) {
        console.error('Telegram:', e.message);   // заказ всё равно сохранили в лог
      }
    }

    const who = (o.customer && o.customer.name) || '—';
    console.log(`✓ заказ на ${o.total} SAR · ${o.items.length} поз. · ${who}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  });

}).listen(PORT, () => {
  console.log(`Burka · приём заказов → http://localhost:${PORT}/api/order`);
  console.log(`Проверка: http://localhost:${PORT}/api/health`);
});
