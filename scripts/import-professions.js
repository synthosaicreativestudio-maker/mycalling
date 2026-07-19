/**
 * scripts/import-professions.js
 *
 * Приёмник паспортов профессий от внешнего ИИ (промт — docs/24, схема — docs/23).
 * Берёт JSON-массив паспортов, валидирует КАЖДЫЙ по полной схеме и словарям,
 * ловит дубли (с уже существующими в базе и внутри партии), и превращает
 * валидные записи в готовые TS-объекты для вставки в app/data/professions_db.ts.
 *
 * НЕ пишет в базу сам — печатает/сохраняет TS для ревью и ручной вставки.
 *
 * Запуск:
 *   node scripts/import-professions.js path/to/ai-output.json
 *   node scripts/import-professions.js batch.json --out scripts/to-insert.ts.txt
 *
 * Вход: JSON-массив объектов-паспортов (как вернул ИИ по промту docs/24).
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outPath = outIdx !== -1 ? args[outIdx + 1] : null;
const inputPath = args.find((a, i) => a !== '--out' && args[i - 1] !== '--out');

if (!inputPath) {
  console.error('Использование: node scripts/import-professions.js <файл.json> [--out файл.txt]');
  process.exit(1);
}

// --- Словари: отрасли + существующие id/name — из самой базы (источник истины) ---
const dbSrc = fs.readFileSync(path.resolve(__dirname, '..', 'app', 'data', 'professions_db.ts'), 'utf8');
const industriesMatch = dbSrc.match(/export const industries = \[([\s\S]*?)\];/);
const INDUSTRIES = industriesMatch ? [...industriesMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
const existingIds = new Set([...dbSrc.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]));
const existingNames = new Set([...dbSrc.matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1]));

const RIASEC = ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'];
const GARDNER = ['Linguistic', 'Logical-Mathematical', 'Spatial-Visual', 'Bodily-Kinesthetic', 'Musical', 'Interpersonal', 'Intrapersonal', 'Naturalist'];
const BIGFIVE_KEYS = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Stability'];
const PVQ = ['self_direction', 'stimulation', 'hedonism', 'achievement', 'power', 'security', 'conformity', 'tradition', 'benevolence', 'universalism'];
const VIA = ['creativity', 'curiosity', 'judgment', 'love_of_learning', 'perspective', 'bravery', 'perseverance', 'honesty', 'zest', 'love', 'kindness', 'social_intelligence', 'teamwork', 'fairness', 'leadership', 'forgiveness', 'humility', 'prudence', 'self_regulation', 'appreciation_of_beauty', 'gratitude', 'hope', 'humor', 'spirituality'];

function slugify(name) {
  const map = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };
  return String(name).toLowerCase().split('').map((c) => (map[c] !== undefined ? map[c] : c)).join('')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const isNonEmptyStrArr = (a) => Array.isArray(a) && a.length > 0 && a.every((x) => typeof x === 'string' && x.trim());

function validate(p, seenIds, seenNames) {
  const e = [];
  if (!p || typeof p !== 'object') return ['не объект'];
  if (typeof p.name !== 'string' || !p.name.trim()) e.push('name пустой');
  if (!INDUSTRIES.includes(p.industry)) e.push(`industry вне словаря: "${p.industry}"`);
  if (!['everyday', 'future', 'dream'].includes(p.tier)) e.push(`tier невалиден: ${p.tier}`);
  if (typeof p.archetype !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.archetype || '')) e.push(`archetype не kebab-case: ${p.archetype}`);
  if (!Array.isArray(p.riasec) || p.riasec.length < 1 || p.riasec.length > 3) e.push('riasec должен быть 1-3 кода');
  else { p.riasec.forEach((c) => !RIASEC.includes(c) && e.push(`riasec код: ${c}`)); if (new Set(p.riasec).size !== p.riasec.length) e.push('дубли в riasec'); }
  if (!Array.isArray(p.gardner) || p.gardner.length < 1) e.push('gardner пуст');
  else p.gardner.forEach((c) => !GARDNER.includes(c) && e.push(`gardner код: ${c}`));
  if (!p.bigFive || typeof p.bigFive.traits !== 'object') e.push('bigFive.traits отсутствует');
  else Object.entries(p.bigFive.traits).forEach(([k, v]) => {
    if (!BIGFIVE_KEYS.includes(k)) e.push(`bigFive ключ: ${k}`);
    if (!['high', 'low', 'any'].includes(v)) e.push(`bigFive значение: ${v}`);
  });
  if (!['low', 'medium', 'high'].includes(p.cognitiveDemand)) e.push(`cognitiveDemand: ${p.cognitiveDemand}`);
  if (!Array.isArray(p.values) || p.values.length < 1) e.push('values пуст');
  else p.values.forEach((v) => !PVQ.includes(v) && e.push(`PVQ код: ${v}`));
  if (!Array.isArray(p.viaFit) || p.viaFit.length < 1) e.push('viaFit пуст');
  else p.viaFit.forEach((v) => !VIA.includes(v) && e.push(`VIA код: ${v}`));
  if (!isNonEmptyStrArr(p.subjects)) e.push('subjects пуст');
  if (!p.skills || !isNonEmptyStrArr(p.skills.hard) || !isNonEmptyStrArr(p.skills.soft)) e.push('skills.hard/soft пусты');
  if (!['high', 'medium', 'low'].includes(p.demand)) e.push(`demand: ${p.demand}`);
  if (!isNonEmptyStrArr(p.skillFormula)) e.push('skillFormula пуст');
  if (!isNonEmptyStrArr(p.transferableTo)) e.push('transferableTo пуст');
  if (typeof p.summary !== 'string' || !p.summary.trim()) e.push('summary пуст');
  if (typeof p.why !== 'string' || !p.why.trim()) e.push('why пуст');
  // Кириллица не даёт \b-границ в JS-regex, поэтому ловим «ИИ» вручную по не-буквенному окружению.
  const txt = `${p.summary} ${p.why}`;
  if (/(?:^|[^А-Яа-яЁёA-Za-z])ИИ(?:[^А-Яа-яЁёA-Za-z]|$)/.test(txt) || /искусственн[а-яё]*\s+интеллект/i.test(txt)) e.push('в summary/why есть «ИИ» — запрещено');
  // Дубли имён (с базой и внутри партии)
  if (existingNames.has(p.name) || seenNames.has(p.name)) e.push('дубль name (уже есть)');
  return e;
}

function toTs(p, id) {
  const arr = (a) => `[${(a || []).map((x) => `'${String(x).replace(/'/g, "\\'")}'`).join(', ')}]`;
  const traits = Object.entries(p.bigFive.traits).map(([k, v]) => `${k}: '${v}'`).join(', ');
  return `  {
    id: '${id}',
    name: '${p.name.replace(/'/g, "\\'")}',
    industry: '${p.industry}',
    tier: '${p.tier}',
    archetype: '${p.archetype}',
    riasec: ${arr(p.riasec)},
    gardner: ${arr(p.gardner)},
    bigFive: { traits: { ${traits} } },
    cognitiveDemand: '${p.cognitiveDemand}',
    values: ${arr(p.values)},
    viaFit: ${arr(p.viaFit)},
    subjects: ${arr(p.subjects)},
    summary: '${String(p.summary).replace(/'/g, "\\'")}',
    why: '${String(p.why).replace(/'/g, "\\'")}',
    skills: {
      hard: ${arr(p.skills.hard)},
      soft: ${arr(p.skills.soft)}
    },
    demand: '${p.demand}',
    skillFormula: ${arr(p.skillFormula)},
    transferableTo: ${arr(p.transferableTo)}
  },`;
}

function main() {
  let raw;
  try { raw = JSON.parse(fs.readFileSync(inputPath, 'utf8')); }
  catch (e) { console.error(`❌ Не удалось прочитать/распарсить JSON: ${e.message}`); process.exit(1); }
  const list = Array.isArray(raw) ? raw : (Array.isArray(raw.professions) ? raw.professions : null);
  if (!list) { console.error('❌ Ожидался JSON-массив паспортов (или { professions: [...] }).'); process.exit(1); }

  console.log(`\nПрофессий на входе: ${list.length}. Отраслей в словаре: ${INDUSTRIES.length}.\n`);

  const seenIds = new Set();
  const seenNames = new Set();
  const okSnippets = [];
  const failures = [];

  for (const p of list) {
    const errors = validate(p, seenIds, seenNames);
    const label = p && p.name ? p.name : '(без name)';
    if (errors.length) { failures.push({ label, errors }); continue; }
    let id = (typeof p.id === 'string' && /^[a-z0-9-]+$/.test(p.id)) ? p.id : slugify(p.name);
    while (existingIds.has(id) || seenIds.has(id)) id += '-2';
    seenIds.add(id);
    seenNames.add(p.name);
    okSnippets.push(toTs(p, id));
  }

  console.log(`✅ Валидных: ${okSnippets.length}   ❌ Отклонено: ${failures.length}\n`);
  if (failures.length) {
    console.log('Отклонённые (исправь у ИИ и прогони снова):');
    failures.forEach((f) => console.log(`  ❌ ${f.label}: ${f.errors.join('; ')}`));
    console.log('');
  }

  const ts = okSnippets.join('\n');
  if (outPath) {
    fs.writeFileSync(outPath, `// Импортировано ${new Date().toISOString()} — ${okSnippets.length} записей.\n// Вставь ПЕРЕД закрывающей ]; в app/data/professions_db.ts и прогони тест.\n\n${ts}\n`, 'utf8');
    console.log(`TS-записи → ${outPath}`);
  } else if (okSnippets.length) {
    console.log('TS-записи для вставки в professions_db.ts:\n');
    console.log(ts);
  }
  console.log('\nПосле вставки: npx vitest run app/data/professions_db.test.ts\n');
}

main();
