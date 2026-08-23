import worker from './cms-relay.js';

/* מאגר מדומה בזיכרון במקום גיטהאב */
const files = {
  'data/news.json': JSON.stringify([{ id: 'aaa', title: 'ישנה', sort: 1 }], null, 2)
};
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');

globalThis.fetch = async (url, init = {}) => {
  const m = String(url).match(/contents\/(.+?)(\?|$)/);
  const path = decodeURIComponent(m[1]);
  if (!init.method || init.method === 'GET') {
    if (!(path in files)) return new Response('nope', { status: 404 });
    return new Response(JSON.stringify({ sha: 'sha-' + path, content: b64(files[path]) }), { status: 200 });
  }
  const body = JSON.parse(init.body);
  files[path] = Buffer.from(body.content, 'base64').toString('utf8');
  return new Response(JSON.stringify({ commit: { sha: 'x' } }), { status: 200 });
};

/* KV מדומה */
const kv = new Map();
const env = {
  CMS_PASSWORD: 'סיסמה-חזקה-לבדיקה-9f3a',
  CMS_SIGNING: 'signing-secret',
  GITHUB_TOKEN: 't', GITHUB_REPO: 'calendboard/tzadik-magor-site',
  RATE: {
    get: async (k) => kv.get(k) ?? null,
    put: async (k, v) => kv.set(k, v)
  }
};

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log('  ✅', name); }
  else { fail++; console.log('  ❌', name, extra); }
};

const post = (path, body, token, ip = '1.2.3.4') =>
  worker.fetch(new Request('https://x' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Cms-Token': token || '', 'CF-Connecting-IP': ip },
    body: JSON.stringify(body)
  }), env);

console.log('\n== כניסה ==');
let r = await post('/login', { password: 'לא נכון' });
ok('סיסמה שגויה נדחית', r.status === 401);

r = await post('/login', { password: env.CMS_PASSWORD });
const token = (await r.clone().json()).token;
ok('סיסמה נכונה מתקבלת', r.status === 200 && !!token);

console.log('\n== חסימת ניסיונות ==');
for (let i = 0; i < 8; i++) await post('/login', { password: 'x' }, null, '9.9.9.9');
r = await post('/login', { password: env.CMS_PASSWORD }, null, '9.9.9.9');
ok('אחרי 8 כשלונות ה-IP נחסם, גם עם הסיסמה הנכונה', r.status === 429);
r = await post('/login', { password: env.CMS_PASSWORD }, null, '1.1.1.1');
ok('IP אחר לא נפגע מהחסימה', r.status === 200);

console.log('\n== כרטיס כניסה ==');
r = await post('/list', {}, '');
ok('בלי כרטיס נחסם', r.status === 401);
r = await post('/list', {}, '9999999999.deadbeef');
ok('כרטיס מזויף נחסם', r.status === 401);
r = await post('/list', {}, '1.' + 'a'.repeat(64));
ok('כרטיס שפג תוקפו נחסם', r.status === 401);

console.log('\n== פעולות על כתבות ==');
r = await post('/articles', { ops: [{ type: 'insert', fields: { title: 'כתבה חדשה' } }] }, token);
let j = await r.json();
ok('הוספת כתבה', r.status === 200 && j.rows.length === 2 && j.rows[0].title === 'כתבה חדשה');
ok('נוצר מזהה אוטומטי', !!j.rows[0].id && j.rows[0].id.length > 10);
ok('נוצר תאריך יצירה', !!j.rows[0].created_at);
const newId = j.rows[0].id;

r = await post('/articles', { ops: [{ type: 'patch', id: newId, fields: { title: 'שונתה' } }] }, token);
j = await r.json();
ok('עריכת כתבה', j.rows.find(a => a.id === newId).title === 'שונתה');

r = await post('/articles', { ops: [{ type: 'patch', id: newId, fields: { deleted: true } }] }, token);
j = await r.json();
ok('העברה לסל מיחזור', j.rows.find(a => a.id === newId).deleted === true);

r = await post('/articles', { ops: [{ type: 'patchWhere', field: 'featured', value: true, fields: { featured: false } }] }, token);
ok('ניקוי כתבה מובילה', r.status === 200);

r = await post('/articles', { ops: [{ type: 'delete', id: newId }] }, token);
j = await r.json();
ok('מחיקה סופית', j.rows.length === 1 && !j.rows.find(a => a.id === newId));

r = await post('/articles', { ops: [{ type: 'patch', id: 'לא-קיים', fields: { title: 'x' } }] }, token);
ok('עריכת כתבה שלא קיימת מחזירה שגיאה', r.status === 500);

console.log('\n== שמירות תקינות ==');
const saved = JSON.parse(files['data/news.json']);
ok('הקובץ נשאר JSON תקין', Array.isArray(saved) && saved.length === 1);
ok('הכתבה הישנה לא נפגעה', saved[0].id === 'aaa');

console.log('\n== העלאת קבצים ==');
r = await post('/media', { name: 'img-1-abc.jpg', data: b64('שלום') }, token);
j = await r.json();
ok('העלאת תמונה מחזירה כתובת', j.url === '/assets/news/img-1-abc.jpg');
ok('הקובץ נשמר במאגר', 'assets/news/img-1-abc.jpg' in files);

for (const bad of ['../../evil.js', 'x.html', 'shell.php', 'a.svg', 'noext', '../../../index.html']) {
  r = await post('/media', { name: bad, data: b64('x') }, token);
  ok('נחסם: ' + bad, r.status === 415, await r.clone().text());
}
r = await post('/media', { name: '../../ok.jpg', data: b64('x') }, token);
j = await r.json();
ok('נתיב מנוטרל אבל התמונה עוברת', j.url === '/assets/news/ok.jpg', j.url);
r = await post('/media', { name: 'clip.mp4', data: b64('x') }, token);
ok('סרטון עובר', (await r.json()).url === '/assets/news/clip.mp4');
r = await post('/media', { name: 'rec.m4a', data: b64('x') }, token);
ok('הקלטה עוברת', (await r.json()).url === '/assets/news/rec.m4a');

r = await post('/media', { name: 'big.mp4', data: Buffer.alloc(26 * 1024 * 1024).toString('base64') }, token);
ok('קובץ מעל 25 מגה נדחה', r.status === 413);

console.log('\n== שיטות ונתיבים ==');
r = await worker.fetch(new Request('https://x/list', { method: 'GET' }), env);
ok('GET נדחה', r.status === 405);
r = await post('/מה-זה', {}, token);
ok('נתיב לא מוכר מחזיר 404', r.status === 404);

console.log(`\nעברו ${pass} · נכשלו ${fail}\n`);
process.exit(fail ? 1 : 0);
