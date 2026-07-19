/**
 * scripts/profession-tier-audit.js  (read-only)
 *
 * Аудит баланса каталога профессий против правила 70/20/10 (см.
 * docs/22-profession-catalog-architecture). Классифицирует текущие записи по
 * tier ЭВРИСТИКОЙ (demand + ключевые слова/отрасль) — это только чтобы увидеть
 * масштаб перекоса; точный tier проставляется вручную на фазе D. Скрипт НЕ
 * редактирует app/data/professions_db.ts (парсит его как текст), поэтому
 * безопасен при параллельной работе над файлом... но всё же читает его снимок.
 *
 * Запуск: node scripts/profession-tier-audit.js
 */

const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'app', 'data', 'professions_db.ts');
const src = fs.readFileSync(dbPath, 'utf8');

// --- Список задекларированных отраслей (массив industries[]) ---
const industriesMatch = src.match(/export const industries = \[([\s\S]*?)\];/);
const declaredIndustries = industriesMatch
  ? [...industriesMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
  : [];

// --- Разбор записей профессий по объектам (по границе "\n  {") ---
const objectsPart = src.slice(src.indexOf('export const professionsDb'));
const chunks = objectsPart.split(/\n {2}\{/).slice(1); // первый кусок — заголовок массива

const field = (chunk, name) => {
  const m = chunk.match(new RegExp(`${name}:\\s*'([^']*)'`));
  return m ? m[1] : '';
};

const professions = chunks
  .map((c) => ({ name: field(c, 'name'), industry: field(c, 'industry'), demand: field(c, 'demand') }))
  .filter((p) => p.name);

// --- Эвристическая классификация tier ---
const DREAM_RE = /космонавт|астронавт|лётчик-испыт|пилот-испыт|футбол|спортсмен|атлет|военн|прокурор|актёр|актриса|музыкант|артист|каскадёр|дипломат/i;
const FUTURE_CLUSTERS = new Set([
  'Аналитика данных и ИИ',
  'Оркестрация ИИ и Агенты',
  'Космические технологии и коммерция',
  'Биотехнологии и биоинженерия',
  'Робототехника и хардвер',
]);
const FUTURE_RE = /\bИИ\b|\bAI\b|нейро|кибер|mlops|промпт|агент|квант|блокчейн|\bvr\b|\bar\b|метавселен|биоинформ|генетич|дрон|беспилот|цифров|киберпрот/i;

function classify(p) {
  if (DREAM_RE.test(p.name)) return 'dream';
  if (FUTURE_CLUSTERS.has(p.industry) || FUTURE_RE.test(p.name)) return 'future';
  return 'everyday';
}

const tally = { everyday: 0, future: 0, dream: 0 };
const byTier = { everyday: [], future: [], dream: [] };
for (const p of professions) {
  const t = classify(p);
  tally[t]++;
  byTier[t].push(p.name);
}

const total = professions.length;
const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

console.log('\n=== Аудит каталога профессий (баланс 70/20/10) ===\n');
console.log(`Всего профессий: ${total}\n`);

console.log('Фактический баланс (эвристика) против цели:');
console.log(`  🟢 everyday (бытовые):  ${tally.everyday.toString().padStart(3)}  = ${pct(tally.everyday)}%   (цель 70%)`);
console.log(`  🔵 future (будущего):   ${tally.future.toString().padStart(3)}  = ${pct(tally.future)}%   (цель 20%)`);
console.log(`  🟣 dream (мечта):       ${tally.dream.toString().padStart(3)}  = ${pct(tally.dream)}%   (цель 10%)`);
console.log('');

// Насколько далеко от цели и сколько бытовых надо добрать при цели 150-180.
const TARGET = 165;
const needEveryday = Math.max(0, Math.round(TARGET * 0.7) - tally.everyday);
console.log(`Для целевого каталога ~${TARGET} архетипов (70% бытовых = ${Math.round(TARGET * 0.7)}):`);
console.log(`  добрать 🟢 everyday: ~${needEveryday} профессий\n`);

// --- Рассинхрон отраслей ---
const usedIndustries = [...new Set(professions.map((p) => p.industry).filter(Boolean))];
const missingFromArray = usedIndustries.filter((i) => !declaredIndustries.includes(i));
console.log('Отрасли:');
console.log(`  задекларировано в industries[]: ${declaredIndustries.length}`);
console.log(`  реально используется профессиями: ${usedIndustries.length}`);
if (missingFromArray.length) {
  console.log(`  ⚠️ используются, но НЕ в массиве industries[]:`);
  missingFromArray.forEach((i) => console.log(`     - ${i}`));
} else {
  console.log('  ✅ рассинхрона нет');
}
console.log('');

// --- Примеры dream/future для проверки эвристики глазами ---
console.log('Примеры классификации (для проверки эвристики):');
console.log(`  🟣 dream: ${byTier.dream.join(', ') || '—'}`);
console.log(`  🔵 future (первые 10): ${byTier.future.slice(0, 10).join(', ')}${byTier.future.length > 10 ? '…' : ''}`);
console.log('');
console.log('⚠️ Эвристика приблизительная — точный tier проставляется вручную (фаза D).');
