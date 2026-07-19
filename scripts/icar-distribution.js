/**
 * scripts/icar-distribution.js
 *
 * Выгрузка распределения баллов теста ICAR из БД для перекалибровки возрастных
 * норм (см. app/lib/diagnostic/icarNorms.ts — текущие пороги экспертные, не
 * откалиброванные на выборке). Запускается офлайн владельцем, когда наберётся
 * достаточно прохождений.
 *
 * Запуск:
 *   node scripts/icar-distribution.js
 *   node scripts/icar-distribution.js --min 200     # порог группы для рекомендаций
 *
 * Требует DATABASE_URL / DIRECT_URL (берутся из .env автоматически, как в приложении).
 * Скрипт ТОЛЬКО читает БД (findMany), ничего не пишет.
 *
 * Что делает:
 *  - тянет все DiagnosticResult с testCode='ICAR' (+ grade пользователя);
 *  - раскладывает по возрастным группам (10-12 / 13-15 / 16-17), возраст ≈ grade+6;
 *  - печатает N, среднее, перцентили сырого балла и средние по субшкалам;
 *  - предлагает пересчитанные пороги norm.{low,mid,high} = p33/p50/p90,
 *    но ТОЛЬКО для групп с N ≥ порога (по умолчанию 200) — иначе честно
 *    помечает «данных мало, не калибровать».
 */

const fs = require('fs');
const path = require('path');

// --- Мини-загрузчик .env (в приложении это делает Next; в голом node — нет). ---
function loadDotEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key] !== undefined) continue;
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadDotEnv();

// Прямое подключение для скрипта: PgBouncer-порт → прямой (как в app/lib/env.ts).
const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
const dbUrl = rawUrl.replace(':6543/', ':5432/').replace('?pgbouncer=true', '').replace('&pgbouncer=true', '');
if (!dbUrl) {
  console.error('❌ Не найден DATABASE_URL / DIRECT_URL (в .env или окружении).');
  process.exit(1);
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

// Порог выборки на группу для рекомендаций (по умолчанию 200).
const minArgIdx = process.argv.indexOf('--min');
const MIN_SAMPLE = minArgIdx !== -1 ? Number(process.argv[minArgIdx + 1]) || 200 : 200;

// Возрастная группа по возрасту — та же логика, что icarAgeGroup в icarNorms.ts.
function ageGroup(age) {
  if (typeof age === 'number' && !Number.isNaN(age)) {
    if (age <= 12) return '10-12';
    if (age <= 15) return '13-15';
  }
  return '16-17';
}

// Возраст ≈ grade + 6 (1-й класс ≈ 7 лет). Без grade → null (уйдёт в 16-17).
function gradeToAge(grade) {
  return typeof grade === 'number' ? grade + 6 : null;
}

function percentile(sortedAsc, p) {
  if (sortedAsc.length === 0) return null;
  const idx = Math.min(sortedAsc.length - 1, Math.max(0, Math.round((p / 100) * (sortedAsc.length - 1))));
  return sortedAsc[idx];
}

function mean(arr) {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;
}

function fmt(v) {
  return v === null ? '—' : (Math.round(v * 100) / 100).toString();
}

async function main() {
  console.log(`\n=== ICAR distribution (перекалибровка норм) ===`);
  console.log(`Порог выборки на группу для рекомендаций: N ≥ ${MIN_SAMPLE}\n`);

  const rows = await prisma.diagnosticResult.findMany({
    where: { testCode: 'ICAR' },
    select: { scores: true, completedAt: true, user: { select: { grade: true } } },
  });

  console.log(`Всего записей ICAR в БД: ${rows.length}\n`);
  if (rows.length === 0) {
    console.log('Нет прохождений ICAR — калибровать нечего.');
    return;
  }

  const groups = { '10-12': [], '13-15': [], '16-17': [] };
  const subs = { '10-12': [], '13-15': [], '16-17': [] };

  for (const row of rows) {
    const s = row.scores || {};
    const raw = typeof s.raw === 'number' ? s.raw : null;
    if (raw === null) continue;
    const grp = ageGroup(gradeToAge(row.user ? row.user.grade : null));
    groups[grp].push(raw);
    if (s.bySubscale && typeof s.bySubscale === 'object') subs[grp].push(s.bySubscale);
  }

  const suggested = {};

  for (const grp of ['10-12', '13-15', '16-17']) {
    const vals = groups[grp].slice().sort((a, b) => a - b);
    const n = vals.length;
    console.log(`── Группа ${grp} ──`);
    console.log(`  N = ${n}`);
    if (n === 0) {
      console.log('  (нет данных)\n');
      continue;
    }
    console.log(`  среднее=${fmt(mean(vals))}  min=${vals[0]}  max=${vals[n - 1]}`);
    console.log(
      `  перцентили: p10=${fmt(percentile(vals, 10))}  p25=${fmt(percentile(vals, 25))}  ` +
        `p33=${fmt(percentile(vals, 33))}  p50=${fmt(percentile(vals, 50))}  ` +
        `p75=${fmt(percentile(vals, 75))}  p90=${fmt(percentile(vals, 90))}`,
    );

    // Средние по субшкалам (verbal/numeric/spatial).
    const subKeys = ['verbal', 'numeric', 'spatial'];
    const subMeans = subKeys.map((k) => {
      const arr = subs[grp].map((o) => (typeof o[k] === 'number' ? o[k] : null)).filter((v) => v !== null);
      return `${k}=${fmt(mean(arr))}`;
    });
    console.log(`  субшкалы (среднее из 3): ${subMeans.join('  ')}`);

    // Рекомендация порогов: developing < p33 ≤ solid < p90 ≤ strong.
    const low = percentile(vals, 33);
    const mid = percentile(vals, 50);
    const high = percentile(vals, 90);
    if (n >= MIN_SAMPLE) {
      suggested[grp] = { low, mid, high };
      console.log(`  ✅ N ≥ ${MIN_SAMPLE} → предлагаемые пороги: { low: ${low}, mid: ${mid}, high: ${high} }`);
    } else {
      console.log(`  ⚠️  N < ${MIN_SAMPLE} — выборка мала, НЕ калибровать (пороги оставить экспертными).`);
    }
    console.log('');
  }

  if (Object.keys(suggested).length > 0) {
    console.log('=== Предлагаемый фрагмент для app/lib/diagnostic/icarNorms.ts ===');
    console.log('(перенести вручную только группы с достаточной выборкой)\n');
    console.log('export const icarNorms = {');
    for (const grp of ['10-12', '13-15', '16-17']) {
      if (suggested[grp]) {
        const { low, mid, high } = suggested[grp];
        console.log(`  '${grp}': { low: ${low}, mid: ${mid}, high: ${high} },`);
      } else {
        console.log(`  // '${grp}': выборка мала — оставить текущие экспертные пороги`);
      }
    }
    console.log('};');
  } else {
    console.log('Ни одна возрастная группа пока не набрала достаточную выборку — калибровать рано.');
  }
}

main()
  .catch((e) => {
    console.error('Ошибка выгрузки:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
