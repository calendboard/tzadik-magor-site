/* בודק את השרשרת המלאה: קוד הדשבורד -> js/cms-client.js -> שירות הביניים -> המאגר */
import worker from './cms-relay.js';
import fs from 'node:fs';

const files = { 'data/news.json': JSON.stringify([
  { id: 'old-1', title: 'כתבה ישנה', sort: 10, deleted: false },
  { id: 'old-2', title: 'בסל', sort: 5, deleted: true },
  { id: 'old-3', title: 'מובילה', sort: 7, featured: true, deleted: false }
], null, 2) };
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const kv = new Map();
const env = {
  CMS_PASSWORD: 'pw-חזקה', CMS_SIGNING: 'sig', GITHUB_TOKEN: 't',
  GITHUB_REPO: 'calendboard/tzadik-magor-site',
  RATE: { get: async k => kv.get(k) ?? null, put: async (k, v) => kv.set(k, v) }
};

/* גיטהאב מדומה */
const ghFetch = async (url, init = {}) => {
  const path = decodeURIComponent(String(url).match(/contents\/(.+?)(\?|$)/)[1]);
  if (!init.method || init.method === 'GET') {
    if (!(path in files)) return new Response('', { status: 404 });
    return new Response(JSON.stringify({ sha: 's', content: b64(files[path]) }), { status: 200 });
  }
  files[path] = Buffer.from(JSON.parse(init.body).content, 'base64').toString('utf8');
  return new Response('{}', { status: 200 });
};

/* כל בקשה של הלקוח לשירות הביניים מנותבת ישירות לקוד הווקר */
globalThis.fetch = async (url, init = {}) => {
  const u = String(url);
  if (u.includes('api.github.com')) return ghFetch(url, init);
  if (u.includes('cms-relay')) {
    const h = new Headers(init.headers || {});
    h.set('CF-Connecting-IP', '5.5.5.5');
    return worker.fetch(new Request('https://x' + new URL(u).pathname, { method: init.method, headers: h, body: init.body }), env);
  }
  if (u.includes('/data/news.json')) return new Response(files['data/news.json'], { status: 200 });
  throw new Error('בקשה לא צפויה: ' + u);
};

/* סביבת דפדפן מינימלית */
const store = new Map();
globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) };
globalThis.FileReader = class { readAsDataURL(blob) { blob.arrayBuffer().then(b => { this.result = 'data:;base64,' + Buffer.from(b).toString('base64'); this.onload(); }); } };
globalThis.window = globalThis;

eval(fs.readFileSync(new URL('../js/cms-client.js', import.meta.url), 'utf8'));
const sb = window.cms;

let pass = 0, fail = 0;
const ok = (n, c, x = '') => { c ? (pass++, console.log('  ✅', n)) : (fail++, console.log('  ❌', n, x)); };

console.log('\n== כניסה (כמו שהדשבורד קורא לזה) ==');
let r = await sb.auth.getSession();
ok('לפני כניסה אין חיבור', !r.data.session);
r = await sb.auth.signInWithPassword({ password: 'לא נכון' });
ok('סיסמה שגויה מחזירה שגיאה', !!r.error);
r = await sb.auth.signInWithPassword({ password: env.CMS_PASSWORD });
ok('כניסה מוצלחת', !r.error);
r = await sb.auth.getSession();
ok('אחרי כניסה יש חיבור', !!r.data.session);

console.log('\n== רשימת כתבות ==');
r = await sb.from('articles').select('*').eq('deleted', false).order('sort', { ascending: false });
ok('כתבות פעילות בלבד', !r.error && r.data.length === 2, JSON.stringify(r.error));
ok('ממוינות מהגבוה לנמוך', r.data[0].sort === 10 && r.data[1].sort === 7);
r = await sb.from('articles').select('*').eq('deleted', true).order('sort', { ascending: false });
ok('סל המיחזור מציג רק מחוקות', r.data.length === 1 && r.data[0].id === 'old-2');

console.log('\n== שמירת כתבה חדשה ==');
r = await sb.from('articles').insert({ title: 'כתבה מהדשבורד', cat: 'הילולא', deleted: false });
ok('נשמרה בלי שגיאה', !r.error, JSON.stringify(r.error));
let rows = JSON.parse(files['data/news.json']);
ok('נוספה לקובץ', rows.length === 4 && rows[0].title === 'כתבה מהדשבורד');
const nid = rows[0].id;

console.log('\n== עריכה, סל מיחזור ושחזור ==');
r = await sb.from('articles').update({ title: 'אחרי עריכה' }).eq('id', nid);
ok('עריכה', !r.error && JSON.parse(files['data/news.json']).find(a => a.id === nid).title === 'אחרי עריכה');
r = await sb.from('articles').update({ deleted: true }).eq('id', nid);
ok('העברה לסל', JSON.parse(files['data/news.json']).find(a => a.id === nid).deleted === true);
r = await sb.from('articles').update({ deleted: false }).eq('id', nid);
ok('שחזור מהסל', JSON.parse(files['data/news.json']).find(a => a.id === nid).deleted === false);
r = await sb.from('articles').update({ draft: false }).eq('id', nid);
ok('פרסום טיוטה', !r.error);

console.log('\n== כתבה מובילה אחת בלבד ==');
r = await sb.from('articles').update({ featured: false }).eq('featured', true);
ok('הקודמת בוטלה', !r.error && !JSON.parse(files['data/news.json']).some(a => a.featured));

console.log('\n== מחיקה סופית ==');
r = await sb.from('articles').delete().eq('id', nid);
ok('נמחקה', !r.error && !JSON.parse(files['data/news.json']).some(a => a.id === nid));
ok('השאר נשארו', JSON.parse(files['data/news.json']).length === 3);

console.log('\n== העלאת תמונה (כמו בקוד הדשבורד) ==');
const blob = new Blob([Buffer.from('תמונה')], { type: 'image/jpeg' });
const name = 'img-' + Date.now() + '-abcde.jpg';
r = await sb.storage.from('news-images').upload(name, blob, { contentType: 'image/jpeg', upsert: true });
ok('הועלתה', !r.error, JSON.stringify(r.error));
const pub = sb.storage.from('news-images').getPublicUrl(name);
ok('הכתובת תואמת למה שנשמר', pub.data.publicUrl === '/assets/news/' + name, pub.data.publicUrl);
ok('הקובץ במאגר', ('assets/news/' + name) in files);

console.log('\n== יציאה ==');
await sb.auth.signOut();
r = await sb.auth.getSession();
ok('החיבור נמחק', !r.data.session);
r = await sb.from('articles').insert({ title: 'לא אמור להישמר' });
ok('בלי חיבור אי אפשר לשמור', !!r.error);
ok('הקובץ לא השתנה', JSON.parse(files['data/news.json']).length === 3);

console.log(`\nעברו ${pass} · נכשלו ${fail}\n`);
process.exit(fail ? 1 : 0);
