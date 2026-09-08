"use strict";

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

function loadEnvVars(root) {
  const envPath = path.join(root, ".env");
  const vars = {};
  if (!fs.existsSync(envPath)) return vars;
  for (const rawLine of fs.readFileSync(envPath, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function parseDatabaseUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("DATABASE_URL tidak valid (tidak bisa di-parse sebagai URL).");
  }
  const dbName = parsed.pathname.replace(/^\//, "");
  if (!dbName) throw new Error("DATABASE_URL tidak memuat nama database.");
  return {
    host: parsed.hostname || "localhost",
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    db: dbName,
  };
}

function findDumpBinary() {
  const candidates = [];
  if (process.env.DB_DUMP_BIN) {
    candidates.push({ bin: path.resolve(process.env.DB_DUMP_BIN), name: process.env.DB_DUMP_BIN });
  }
  candidates.push(
    { bin: "mariadb-dump", name: "mariadb-dump" },
    { bin: "mysqldump", name: "mysqldump" }
  );
  return candidates;
}

function runDump(candidate, args, password) {
  return new Promise((resolve, reject) => {
    const child = spawn(candidate.bin, args, {
      env: { ...process.env, MYSQL_PWD: password },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const chunks = [];
    let stderr = "";
    child.stdout.on("data", (d) => chunks.push(d));
    child.stderr.on("data", (d) => (stderr += d.toString()));

    child.on("error", (err) => reject(err));

    child.on("close", (code) => {
      if (code === 0) resolve(Buffer.concat(chunks));
      else reject(new Error(`Gagal dump (exit ${code}). stderr: ${stderr} yang dimulai:${stderr.slice(0, 300)}`));
    });
  });
}

async function main() {
  const root = process.cwd();
  const env = loadEnvVars(root);
  const databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL tidak ditemukan di .env atau environment.");
  }

  const cfg = parseDatabaseUrl(databaseUrl);

  const outputDir = env.DB_BACKUP_DIR || process.env.DB_BACKUP_DIR || path.join(root, "backups");
  const retentionDays = Number(
    env.DB_BACKUP_RETENTION_DAYS || process.env.DB_BACKUP_RETENTION_DAYS || 14
  );

  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "_")
    .replace(/\..+$/, "");
  const fileName = `backup_${cfg.db}_${stamp}.sql`;
  const outputPath = path.join(outputDir, fileName);

  fs.mkdirSync(outputDir, { recursive: true });

  const args = [
    `--host=${cfg.host}`,
    `--port=${cfg.port}`,
    `--user=${cfg.user}`,
    "--single-transaction",
    "--routines",
    "--triggers",
    "--events",
    "--default-character-set=utf8mb4",
    cfg.db,
  ];

  const candidates = findDumpBinary();
  let output = null;
  let usedBin = null;
  let lastError = null;

  for (const candidate of candidates) {
    try {
      output = await runDump(candidate, args, cfg.password);
      usedBin = candidate.name;
      break;
    } catch (err) {
      lastError = err;
      if (err.code === "ENOENT") continue;
      break;
    }
  }

  if (!output) {
    const detail =
      lastError && lastError.code === "ENOENT"
        ? "Tool dump tidak ditemukan. Atur variabel DB_DUMP_BIN di .env menunjuk ke mariadb-dump/mysqldump."
        : lastError ? lastError.message : "Tidak ada tool dump yang tersedia.";
    throw new Error(detail);
  }

  const head = output.slice(0, 512).toString("utf8");
  if (output.length === 0 || !/dump/i.test(head)) {
    throw new Error("Hasil dump kosong atau bukan file dump yang valid.");
  }

  fs.writeFileSync(outputPath, output);
  const sizeKb = (output.length / 1024).toFixed(1);

  const now = Date.now();
  let removed = 0;
  if (fs.existsSync(outputDir)) {
    for (const entry of fs.readdirSync(outputDir)) {
      if (!entry.startsWith(`backup_${cfg.db}_`) || !entry.endsWith(".sql")) continue;
      const full = path.join(outputDir, entry);
      const stat = fs.statSync(full);
      const ageDays = (now - stat.mtimeMs) / (1000 * 60 * 60 * 24);
      if (ageDays > retentionDays) {
        fs.unlinkSync(full);
        removed += 1;
      }
    }
  }

  console.log(
    `[backup-db] OK via ${usedBin} | ${cfg.db}@${cfg.host}:${cfg.port}\n` +
      `  file   : ${outputPath}\n` +
      `  ukuran : ${sizeKb} KB\n` +
      `  retensi: ${retentionDays} hari (${removed} file lama dihapus)`
  );
}

main().catch((err) => {
  console.error(`[backup-db] GAGAL: ${err.message}`);
  process.exit(1);
});