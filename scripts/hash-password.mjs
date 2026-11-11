#!/usr/bin/env node
// Uso: node scripts/hash-password.mjs 'la contraseña'
// Imprime el valor para ADMIN_PASSWORD_HASH. Escapa los "$" si lo pegas en un compose.
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error("Indica una contraseña de al menos 12 caracteres.");
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(password.normalize("NFKC"), salt, 64);
console.log(`scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`);
