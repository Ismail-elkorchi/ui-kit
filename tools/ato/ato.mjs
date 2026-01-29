import { spawn } from "node:child_process";

const defaultCliPath =
  "/home/ismail-el-korchi/Documents/Projects/ato/dist/cli/main.js";
const cliPath = process.env.ATO_CLI_PATH || defaultCliPath;
const args = process.argv.slice(2);

const child = spawn(process.execPath, [cliPath, ...args], {
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
