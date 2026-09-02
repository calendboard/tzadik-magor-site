import worker from './cms-relay.js';

/* קופסת JSONBin מדומה בזיכרון - הבדיקה לא נוגעת בקופסה האמיתית */
let bin = {
  candles: [{ _id: 'c1', name: 'נר ישן' }],
  prayers: [],
  stories: [{ _id: 's1', status: 'approved', story: 'ישועה ותיקה' }],
  contacts: [{ _id: 'ct1', topic: 'כללי', encb: 'x.y.z' }],
  pidyon: []
};

globalThis.fetch = async (url, init = {}) => {
  const u = String(url);
  if (u.includes('api.jsonbin.io')) {
    if (!init.method || init.method === 'GET') return new Response(JSON.stringify(bin), { status: 200 });
    bin = JSON.parse(init.body);                       // PUT מחליף את הקופסה
    return new Response(JSON.stringify(bin), { status: 200 });
  }
  return new Response('nope', { status: 404 });
};

const kv = new Map();
const env = {
  CMS_PASSWORD: 'סיסמה-חזקה-לבדיקה-9f3a',
  CMS_SIGNING: 'signing-secret',
  JSONBIN_KEY: 'master-key', JSONBIN_BIN: '6a40f90fda38895dfe0b10e7',
  RATE: { get: async (k) => kv.get(k) ?? null, put: async (k, v) => kv.set(k, v) }
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

console.log('\n== קריאה ציבורית ==');
let r = await post('/wall/list', {});
let j = await r.json();
ok('קריאת הקיר בלי סיסמה', r.status === 200 && Array.isArray(j.rec.candles));
ok('כל הסוגים קיימים במבנה', ['candles', 'prayers', 'stories', 'contacts', 'pidyon'].every((k) => Array.isArray(j.rec[k])));

console.log('\n== הוספה מהקהל ==');
r = await post('/wall/append', { kind: 'candles', item: { name: 'נר חדש', family: 'לוי', junk: 'לא-אמור-להישמר' } }, null, '2.0.0.1');
j = await r.json();
ok('נר נוסף', r.status === 200 && j.item.name === 'נר חדש');
ok('השרת הקצה מזהה', !!j.item._id && j.item._id.length > 8);
ok('השרת הקצה תאריך וחותמת', !!j.item.date && !!j.item.ts);
ok('שדה לא מוכר נופל', j.item.junk === undefined);
ok('הנר באמת בקופסה', bin.candles.some((c) => c._id === j.item._id));

r = await post('/wall/append', { kind: 'stories', item: { story: 'ישועה', status: 'approved', public_name: 'פלוני' } }, null, '2.0.0.2');
j = await r.json();
ok('ישועה מהקהל נכפית ל-pending גם אם נשלח approved', j.item.status === 'pending');

r = await post('/wall/append', { kind: 'pidyon', item: { encb: 'a.b.c' } }, null, '2.0.0.3');
ok('פדיון נחסם בהוספה ציבורית (רק דרך ניהול)', r.status === 400);

r = await post('/wall/append', { kind: 'evil', item: {} }, null, '2.0.0.4');
ok('סוג לא מוכר נדחה', r.status === 400);

r = await post('/wall/append', { kind: 'candles', item: { name: 'x'.repeat(200000) } }, null, '2.0.0.5');
ok('רשומה ענקית נדחית', r.status === 413);

console.log('\n== הגבלת קצב ==');
for (let i = 0; i < 12; i++) await post('/wall/append', { kind: 'candles', item: { name: 'ספאם ' + i } }, null, '9.9.9.9');
r = await post('/wall/append', { kind: 'candles', item: { name: 'הטיפה שגלשה' } }, null, '9.9.9.9');
ok('אחרי 12 הוספות מאותו IP השאר נחסם', r.status === 429);
r = await post('/wall/append', { kind: 'candles', item: { name: 'IP אחר' } }, null, '8.8.8.8');
ok('IP אחר לא נפגע', r.status === 200);

console.log('\n== ניהול דורש כרטיס כניסה ==');
r = await post('/wall/admin', { ops: [{ type: 'delete', kind: 'candles', id: 'c1' }] });
ok('מחיקה בלי כרטיס נחסמת', r.status === 401);
ok('הנר לא נמחק', bin.candles.some((c) => c._id === 'c1'));

r = await post('/login', { password: env.CMS_PASSWORD });
const token = (await r.json()).token;

r = await post('/wall/admin', { ops: [{ type: 'edit', kind: 'stories', id: 's1', fields: { status: 'pending' } }] }, token);
j = await r.json();
ok('אדמין מסתיר ישועה', r.status === 200 && j.rec.stories.find((s) => s._id === 's1').status === 'pending');

r = await post('/wall/admin', { ops: [{ type: 'insert', kind: 'stories', item: { story: 'ישועה שנוספה ידנית', status: 'approved' } }] }, token);
j = await r.json();
ok('אדמין מוסיף ישועה מאושרת', j.rec.stories.some((s) => s.status === 'approved' && s.story === 'ישועה שנוספה ידנית'));

r = await post('/wall/admin', { ops: [{ type: 'delete', kind: 'candles', id: 'c1' }] }, token);
j = await r.json();
ok('אדמין מוחק נר', !j.rec.candles.some((c) => c._id === 'c1'));

r = await post('/wall/admin', { ops: [{ type: 'edit', kind: 'candles', id: 'לא-קיים', fields: { name: 'x' } }] }, token);
ok('עריכת רשומה שלא קיימת מחזירה שגיאה', r.status === 500);

console.log('\n== מבנה הקופסה נשאר תקין ==');
ok('הקופסה תקינה אחרי כל הפעולות', ['candles', 'prayers', 'stories', 'contacts', 'pidyon'].every((k) => Array.isArray(bin[k])));

console.log(`\nעברו ${pass} · נכשלו ${fail}\n`);
process.exit(fail ? 1 : 0);
