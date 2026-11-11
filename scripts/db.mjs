#!/usr/bin/env node
// Acceso directo a la base de datos del panel (el panel web es de solo lectura).
//
// Dentro del contenedor de producción:
//   docker exec formulario-trazo-production-app-1 node scripts/db.mjs query "SELECT * FROM sites"
//   docker exec -i formulario-trazo-production-app-1 node scripts/db.mjs exec < cambios.sql
//
// `query` abre la base en solo lectura e imprime JSON.
// `exec` lee SQL de stdin y lo aplica en una única transacción: si una sentencia falla, no se aplica ninguna.
// Para ids nuevos se puede usar lower(hex(randomblob(16))). El dinero va en céntimos.
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const path = process.env.TRAZO_DB_PATH || "/data/trazo.sqlite";
const [command, sql] = process.argv.slice(2);

if (command === "query" && sql) {
  const db = new DatabaseSync(path, { readOnly: true });
  console.log(JSON.stringify(db.prepare(sql).all(), null, 2));
} else if (command === "exec") {
  const script = sql || readFileSync(0, "utf8");
  if (!script.trim()) throw new Error("No hay SQL en stdin");
  const db = new DatabaseSync(path);
  db.exec("PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
  const before = db.prepare("SELECT total_changes() AS n").get().n;
  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec(script);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("Error, no se ha aplicado nada:", error.message);
    process.exit(1);
  }
  console.log(`OK: ${db.prepare("SELECT total_changes() AS n").get().n - before} filas modificadas`);
} else {
  console.error('Uso: db.mjs query "SELECT ..." | db.mjs exec < cambios.sql');
  process.exit(1);
}
