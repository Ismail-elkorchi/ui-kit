import axe from 'axe-core';
import type {Result} from 'axe-core';

function formatViolations(violations: Result[]) {
  return violations
    .map(violation => {
      const targets = violation.nodes
        .map(node => {
          const target = node.target;
          return Array.isArray(target) ? target.join(' ') : String(target);
        })
        .join(', ');
      return `${violation.id}: ${violation.description}\n${targets}`;
    })
    .join('\n\n');
}

export async function runA11y(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': {enabled: true},
    },
  });

  if (results.violations.length > 0) {
    throw new Error(`A11y violations:\n${formatViolations(results.violations)}`);
  }
}
