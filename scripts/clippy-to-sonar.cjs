#!/usr/bin/env node
/**
 * clippy-to-sonar.js
 *
 * แปลงผลลัพธ์จาก `cargo clippy --message-format=json` (newline-delimited JSON)
 * เป็น SonarQube Generic Issue Import Format
 * https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/importing-external-issues/generic-issue-import-format/
 *
 * Usage: node clippy-to-sonar.js <input-clippy-report.json> <output-sonar-report.json>
 *
 * หมายเหตุ: cargo clippy รันจากโฟลเดอร์ src-tauri ดังนั้น path ของไฟล์ในผลลัพธ์
 * clippy จะเป็น relative จาก src-tauri/ (เช่น "src/lib.rs") จึงต้อง prefix
 * ด้วย "src-tauri/" ให้ตรงกับ sonar.sources ที่ประกาศไว้ที่ root ของ repo
 */

const fs = require('fs');

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: node clippy-to-sonar.js <input> <output>');
  process.exit(1);
}

function levelToSeverity(level) {
  switch (level) {
    case 'error':
      return 'CRITICAL';
    case 'warning':
      return 'MAJOR';
    default:
      return 'INFO';
  }
}

function levelToType(level) {
  // clippy ไม่แยก bug/vulnerability ให้ชัดเจน ใช้ CODE_SMELL เป็นค่าเริ่มต้น
  // ยกเว้น error ร้ายแรงที่มักเป็นบั๊กจริง ๆ ให้จัดเป็น BUG
  return level === 'error' ? 'BUG' : 'CODE_SMELL';
}

let raw;
try {
  raw = fs.readFileSync(inputPath, 'utf8');
} catch (err) {
  console.error(`อ่านไฟล์ ${inputPath} ไม่ได้:`, err.message);
  // ไม่ fail build ถ้าไม่มีไฟล์ (เช่น clippy ไม่มี warning เลยและไม่ได้สร้างไฟล์)
  fs.writeFileSync(outputPath, JSON.stringify({ issues: [] }, null, 2));
  process.exit(0);
}

const issues = [];
const lines = raw.split('\n').filter((l) => l.trim().length > 0);

for (const line of lines) {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    continue; // ข้ามบรรทัดที่ไม่ใช่ JSON (เช่น warning summary ท้ายสุด)
  }

  if (msg.reason !== 'compiler-message') continue;
  const diag = msg.message;
  if (!diag || !diag.spans || diag.spans.length === 0) continue;
  if (diag.level !== 'error' && diag.level !== 'warning') continue;

  // เอา span หลัก (is_primary) ถ้ามี ไม่งั้นใช้ span แรก
  const span = diag.spans.find((s) => s.is_primary) || diag.spans[0];
  if (!span.file_name) continue;

  const filePath = span.file_name.startsWith('src-tauri/')
    ? span.file_name
    : `src-tauri/${span.file_name}`;

  const ruleId = (diag.code && diag.code.code) || 'clippy::unknown';

  issues.push({
    engineId: 'clippy',
    ruleId,
    severity: levelToSeverity(diag.level),
    type: levelToType(diag.level),
    primaryLocation: {
      message: diag.message || ruleId,
      filePath,
      textRange: {
        startLine: span.line_start,
        endLine: span.line_end,
        startColumn: Math.max(span.column_start - 1, 0),
        endColumn: Math.max(span.column_end - 1, 0),
      },
    },
  });
}

fs.writeFileSync(outputPath, JSON.stringify({ issues }, null, 2));
console.log(`แปลงเสร็จ: ${issues.length} issues -> ${outputPath}`);
