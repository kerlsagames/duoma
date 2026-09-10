import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

const send = require("../api/push/send.js");
const daily = require("../api/push/daily.js");
const PORT = Number(process.env.PUSH_PORT || 43128);

function wrap(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
  };
  return res;
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
  wrap(res);
  if (url.pathname === "/health") {
    res.status(200).json({ ok: true, push: true });
    return;
  }
  req.body = await readBody(req);
  if (url.pathname === "/api/push/send") {
    await send(req, res);
    return;
  }
  if (url.pathname === "/api/push/daily") {
    await daily(req, res);
    return;
  }
  res.status(404).json({ error: "Not found" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Fuse web-push server on http://127.0.0.1:${PORT}`);
});
