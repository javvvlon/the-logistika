// Vercel Serverless Function: POST /api/lead
// Sends website requests to Telegram (a personal chat, a group or a channel).
// Required environment variables (Vercel → Project → Settings → Environment Variables):
//   TELEGRAM_BOT_TOKEN  — token from @BotFather
//   TELEGRAM_CHAT_ID    — your user id, a group id (-100…), or a channel (@channel_name or -100…)
// The bot must be able to write there: press "Start" in the bot chat, or add it to the group/channel as admin.

const MAX = { name: 100, phone: 40, cargo: 1500, page: 300 };

function clean(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
}
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return res.status(500).json({ ok: false, error: 'Telegram is not configured' });
  }

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }

  // Honeypot: bots fill the hidden "website" field — pretend success.
  if (body.website) return res.status(200).json({ ok: true });

  const name = clean(body.name, MAX.name);
  const phone = clean(body.phone, MAX.phone);
  const cargo = clean(body.cargo, MAX.cargo);
  const page = clean(body.page, MAX.page);

  if (!name || !/[0-9]{7,}/.test(phone.replace(/\D/g, '')) || !cargo) {
    return res.status(400).json({ ok: false, error: 'Invalid form data' });
  }

  const time = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });
  const text =
    '🚚 <b>Новая заявка с сайта</b>\n\n' +
    '<b>Имя:</b> ' + esc(name) + '\n' +
    '<b>Телефон:</b> ' + esc(phone) + '\n' +
    '<b>Груз и маршрут:</b>\n' + esc(cargo) + '\n\n' +
    '<i>' + esc(time) + ' (Ташкент)</i>' + (page ? '\n' + esc(page) : '');

  try {
    const tg = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true })
    });
    const data = await tg.json();
    if (!data.ok) {
      console.error('Telegram error', data);
      return res.status(502).json({ ok: false, error: 'Telegram rejected the message' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ ok: false, error: 'Telegram is unreachable' });
  }
};
