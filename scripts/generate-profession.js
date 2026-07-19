/**
 * scripts/generate-profession.js
 *
 * Офлайн ИИ-генератор записей каталога профессий (docs/22, фаза E). Драфтит
 * ПОЛНУЮ структурную запись Profession по названию профессии, строго по схеме и
 * контролируемому словарю (отрасли, RIASEC/Gardner-коды, tier). Результат
 * валидируется и печатается готовым TS-сниппетом для ревью и вставки в
 * app/data/professions_db.ts.
 *
 * ВАЖНО: скрипт НЕ пишет в базу сам — человек ревьюит RIASEC-коды и вставляет.
 * Это и есть «конвейер добавления»: генератор → валидатор → человек → коммит.
 *
 * Запуск (точечно):
 *   node scripts/generate-profession.js "Риелтор"
 *   node scripts/generate-profession.js "Врач-терапевт" "Военный офицер" "Агроном"
 *
 * Запуск (пачкой из файла — по названию на строку, # = комментарий):
 *   node scripts/generate-profession.js --file scripts/professions-to-add.txt
 *   node scripts/generate-profession.js --file list.txt --out scripts/generated.ts.txt
 *
 * В батч-режиме валидные записи пишутся в --out (по умолчанию
 * scripts/generated-professions.txt), провалы — в консоль сводкой. Между
 * запросами пауза + перебор ключей при сбоях провайдера.
 *
 * Требует PROXYAPI_KEY(_FALLBACK/_FALLBACK2) в .env.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// --- .env loader (как в других скриптах) ---
(function loadDotEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    if (process.env[key] !== undefined) continue;
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[key] = v;
  }
})();

const API_KEYS = [process.env.PROXYAPI_KEY, process.env.PROXYAPI_KEY_FALLBACK, process.env.PROXYAPI_KEY_FALLBACK2].filter(Boolean);
const MODEL = 'gpt-5.5';
if (API_KEYS.length === 0) {
  console.error('❌ Нет PROXYAPI_KEY в .env');
  process.exit(1);
}

// --- Контролируемый словарь из самой базы (единый источник истины) ---
const dbSrc = fs.readFileSync(path.resolve(__dirname, '..', 'app', 'data', 'professions_db.ts'), 'utf8');
const industriesMatch = dbSrc.match(/export const industries = \[([\s\S]*?)\];/);
const INDUSTRIES = industriesMatch ? [...industriesMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
const existingIds = new Set([...dbSrc.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]));
const existingNames = new Set([...dbSrc.matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1]));

const RIASEC = ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'];
const GARDNER = ['Linguistic', 'Logical-Mathematical', 'Spatial-Visual', 'Bodily-Kinesthetic', 'Musical', 'Interpersonal', 'Intrapersonal', 'Naturalist'];

function slugify(name) {
  const map = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };
  return name.toLowerCase().split('').map((c) => (map[c] !== undefined ? map[c] : c)).join('')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function callOnce(prompt, apiKey) {
  const body = JSON.stringify({
    model: MODEL,
    messages: [
      { role: 'system', content: 'Ты — эксперт по профориентации и классификатору занятий O*NET/ОКЗ. Отвечай СТРОГО одним валидным JSON-объектом, без markdown и пояснений.' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 900,
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.freemodel.dev', port: 443, path: '/v1/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`, 'Content-Length': Buffer.byteLength(body) },
      timeout: 30000,
    }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const txt = JSON.parse(data).choices?.[0]?.message?.content || '';
            resolve(JSON.parse(txt.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '').trim()));
          } catch (e) { reject(new Error('Парсинг ответа не удался: ' + e.message)); }
        } else reject(new Error(`API ${res.statusCode}: ${data.slice(0, 200)}`));
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body);
    req.end();
  });
}

// Перебор ключей при сбое провайдера (INC-005: 500/401 «плавают»).
async function callLLM(prompt) {
  let lastErr;
  for (const key of API_KEYS) {
    try { return await callOnce(prompt, key); }
    catch (e) { lastErr = e; }
  }
  throw lastErr;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function buildPrompt(name) {
  return `Составь запись каталога профессий для «${name}» (аудитория — школьники РФ).
Верни JSON РОВНО с такими полями:
{
  "industry": одна отрасль ТОЧНО из списка: ${JSON.stringify(INDUSTRIES)},
  "riasec": массив из 1-3 кодов по убыванию значимости ТОЛЬКО из: ${JSON.stringify(RIASEC)} (это Holland-код профессии по O*NET),
  "gardner": массив из 1-3 ТОЛЬКО из: ${JSON.stringify(GARDNER)},
  "bigFive": { "traits": { любые из Openness/Conscientiousness/Extraversion/Agreeableness/Stability со значением "high" или "low" } },
  "subjects": ["3-4 школьных предмета РФ, которые важны для этой профессии"],
  "summary": "1 предложение — суть профессии простым языком для подростка",
  "why": "1-2 предложения — кому подходит, через какие интересы/характер (без аббревиатуры ИИ, заменяй на 'алгоритмы'/'цифровые системы')",
  "skills": { "hard": ["3-4 хард-скилла"], "soft": ["2-3 софт-скилла"] },
  "demand": "high" | "medium" | "low" (реальный спрос на рынке РФ; для конкурсных/редких — low),
  "skillFormula": ["2-3 переносимые компетенции"],
  "transferableTo": ["2-4 смежные профессии — это 'план Б'"],
  "tier": "everyday" (массовая, много вакансий) | "future" (трендовая) | "dream" (мечта/экзотика/спорт/служение),
  "archetype": "kebab-case ключ базового архетипа, напр. 'lawyer' для всех юристов, 'doctor' для врачей — чтобы родственные роли группировались"
}
Будь реалистичен: для конкурсных профессий (спортсмен, космонавт) ставь demand:"low" и честный transferableTo.`;
}

function validate(name, r) {
  const errors = [];
  if (!INDUSTRIES.includes(r.industry)) errors.push(`industry вне словаря: "${r.industry}"`);
  if (!Array.isArray(r.riasec) || r.riasec.length < 1 || r.riasec.length > 3) errors.push('riasec должен быть 1-3 кода');
  else r.riasec.forEach((c) => !RIASEC.includes(c) && errors.push(`riasec код невалиден: ${c}`));
  if (!Array.isArray(r.gardner) || r.gardner.length < 1) errors.push('gardner пуст');
  else r.gardner.forEach((c) => !GARDNER.includes(c) && errors.push(`gardner код невалиден: ${c}`));
  if (!Array.isArray(r.subjects) || r.subjects.length < 1) errors.push('subjects пуст');
  if (!r.summary || !r.why) errors.push('summary/why пусты');
  if (!['high', 'medium', 'low'].includes(r.demand)) errors.push(`demand невалиден: ${r.demand}`);
  if (!['everyday', 'future', 'dream'].includes(r.tier)) errors.push(`tier невалиден: ${r.tier}`);
  if (!r.archetype || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.archetype)) errors.push(`archetype не kebab-case: ${r.archetype}`);
  if (existingNames.has(name)) errors.push(`⚠️ профессия с таким name уже есть в базе`);
  return errors;
}

function toTs(name, r) {
  let id = slugify(name);
  while (existingIds.has(id)) id += '-2';
  const arr = (a) => `[${(a || []).map((x) => `'${String(x).replace(/'/g, "\\'")}'`).join(', ')}]`;
  const traits = Object.entries(r.bigFive?.traits || {}).map(([k, v]) => `${k}: '${v}'`).join(', ');
  return `  {
    id: '${id}',
    name: '${name.replace(/'/g, "\\'")}',
    industry: '${r.industry}',
    riasec: ${arr(r.riasec)},
    gardner: ${arr(r.gardner)},
    bigFive: { traits: { ${traits} } },
    subjects: ${arr(r.subjects)},
    summary: '${String(r.summary).replace(/'/g, "\\'")}',
    why: '${String(r.why).replace(/'/g, "\\'")}',
    skills: {
      hard: ${arr(r.skills?.hard)},
      soft: ${arr(r.skills?.soft)}
    },
    demand: '${r.demand}',
    skillFormula: ${arr(r.skillFormula)},
    transferableTo: ${arr(r.transferableTo)},
    tier: '${r.tier}',
    archetype: '${r.archetype}'
  },`;
}

// Разбор аргументов: --file <путь>, --out <путь>, остальное — названия.
function parseArgs(argv) {
  const opts = { file: null, out: null, names: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--file') opts.file = argv[++i];
    else if (argv[i] === '--out') opts.out = argv[++i];
    else opts.names.push(argv[i]);
  }
  return opts;
}

function readNamesFromFile(file) {
  return fs.readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const names = opts.file ? readNamesFromFile(opts.file) : opts.names;

  if (names.length === 0) {
    console.error('Использование:');
    console.error('  node scripts/generate-profession.js "Название 1" "Название 2"');
    console.error('  node scripts/generate-profession.js --file list.txt [--out generated.txt]');
    process.exit(1);
  }

  const batch = !!opts.file;
  const outPath = opts.out || path.resolve(__dirname, 'generated-professions.txt');
  console.log(`\nОтраслей в словаре: ${INDUSTRIES.length}. Генерирую ${names.length} записей моделью ${MODEL}${batch ? ` (батч → ${outPath})` : ''}...\n`);

  const okSnippets = [];
  const failures = [];

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    process.stdout.write(`[${i + 1}/${names.length}] ${name} … `);
    try {
      const r = await callLLM(buildPrompt(name));
      const errors = validate(name, r);
      if (errors.length) {
        console.log(`❌ (${errors.join('; ')})`);
        failures.push({ name, reason: errors.join('; ') });
      } else {
        const snippet = toTs(name, r);
        console.log(`✅ ${r.tier}/${r.archetype}`);
        if (batch) okSnippets.push(snippet);
        else console.log(snippet);
      }
    } catch (e) {
      console.log(`❌ ${e.message}`);
      failures.push({ name, reason: e.message });
    }
    if (batch && i < names.length - 1) await sleep(1200); // мягкая пауза для провайдера
  }

  if (batch) {
    const header = `// Сгенерировано scripts/generate-profession.js ${new Date().toISOString()}\n// ${okSnippets.length} записей. ПРОВЕРЬ RIASEC глазами перед вставкой в professions_db.ts.\n\n`;
    fs.writeFileSync(outPath, header + okSnippets.join('\n'), 'utf8');
    console.log(`\n=== Готово: ${okSnippets.length} валидных → ${outPath}; провалов: ${failures.length} ===`);
    if (failures.length) failures.forEach((f) => console.log(`  ❌ ${f.name}: ${f.reason}`));
  }
  console.log('\nПроверь RIASEC-коды глазами, вставь в professions_db.ts и запусти `npx vitest run app/data/professions_db.test.ts`.\n');
}

main();
