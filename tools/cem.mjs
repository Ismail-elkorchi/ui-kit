import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const runner = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'run-workspaces.mjs');

const result = spawnSync('node', [runner, 'cem'], {
  stdio: 'inherit',
  env: {...process.env},
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
