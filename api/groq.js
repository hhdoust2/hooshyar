// api/groq.js — پروکسی سرورلس Vercel برای Groq
// مرورگر → همین سایت (/api/groq) → Groq (از آی‌پی آمریکا) → برگشت پاسخ (با پشتیبانی استریم)
// کلید API از هدر x-groq-key می‌آید و ذخیره یا لاگ نمی‌شود.
const { Readable } = require('stream');
const UPSTREAM = 'https://api.groq.com/openai/v1/chat/completions';
const PASS_HEADERS = ['content-type', 'retry-after', 'x-ratelimit-remaining-requests', 'x-ratelimit-remaining-tokens', 'x-ratelimit-reset-requests', 'x-ratelimit-reset-tokens'];

function fail(res, code, msg){
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: { message: msg } }));
}

module.exports = async function handler(req, res){
  res.setHeader('x-gy-proxy', '1');          // نشانه‌ی حضور پروکسی برای برنامه
  res.setHeader('Cache-Control', 'no-store');

  if(req.method !== 'POST'){ res.setHeader('Allow', 'POST'); return fail(res, 405, 'Method not allowed'); }

  // فقط درخواست‌هایی که از خودِ همین سایت آمده‌اند
  const origin = req.headers.origin;
  if(origin){
    try { if(new URL(origin).host !== req.headers.host) return fail(res, 403, 'Origin not allowed'); }
    catch(e){ return fail(res, 403, 'Bad origin'); }
  }

  const key = String(req.headers['x-groq-key'] || '').trim();
  if(!key || key.length > 200 || /\s/.test(key)) return fail(res, 401, 'کلید API ارسال نشده یا نامعتبر است.');

  const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body == null ? {} : req.body);
  if(payload.length > 2000000) return fail(res, 413, 'درخواست بیش از حد بزرگ است.');

  const ac = new AbortController();
  res.on('close', () => { if(!res.writableEnded) ac.abort(); });   // اگر کاربر قطع کرد، درخواست Groq هم قطع شود

  let r;
  try{
    r = await fetch(UPSTREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: payload,
      signal: ac.signal
    });
  }catch(e){
    return fail(res, 502, 'پروکسی نتوانست به Groq وصل شود.');
  }

  res.statusCode = r.status;
  for(const h of PASS_HEADERS){ const v = r.headers.get(h); if(v) res.setHeader(h, v); }
  if(!r.body) return res.end();
  res.setHeader('X-Accel-Buffering', 'no');
  Readable.fromWeb(r.body).on('error', () => res.end()).pipe(res);
};
