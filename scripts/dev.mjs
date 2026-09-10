import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const expoBin = join(root, "node_modules", ".bin", "expo");

function run(command, args) {
  const child = spawn(command, args, {
    stdio: "inherit",
    cwd: root,
    env: process.env,
  });
  child.on("exit", (code) => {
    if (code) process.exit(code ?? 1);
  });
  return child;
}

const push = run(process.execPath, ["scripts/push-server.mjs"]);
const expo = run(expoBin, ["start", "--web", "--port", "43127"]);

function shutdown() {
  push.kill("SIGTERM");
  expo.kill("SIGTERM");
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
