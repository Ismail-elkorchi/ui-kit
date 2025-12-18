import {spawnSync} from 'node:child_process';

const workspaceOrder = [
  '@ismail-elkorchi/ui-tokens',
  '@ismail-elkorchi/ui-primitives',
  '@ismail-elkorchi/ui-shell',
];

const [script, ...scriptArgs] = process.argv.slice(2);

if (!script) {
  console.error('Usage: node tools/run-workspaces.mjs <script> [-- <args>]');
  process.exit(1);
}

for (const workspace of workspaceOrder) {
  console.log(`\n→ Running "${script}" in ${workspace}`);
  const result = spawnSync(
    'npm',
    ['run', script, '--workspace', workspace, '--', ...scriptArgs],
    {stdio: 'inherit', env: {...process.env}},
  );

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
