import axe from "axe-core";
import type { Result } from "axe-core";

function formatViolations(violations: Result[]) {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .map((node) => {
          const target = node.target;
          return Array.isArray(target) ? target.join(" ") : String(target);
        })
        .join(", ");
      return `${violation.id}: ${violation.description}\n${targets}`;
    })
    .join("\n\n");
}

export async function runA11y(container: HTMLElement) {
  const results = await axe.run(container, {
    shadowDom: true,
    rules: {
      "color-contrast": { enabled: true },
      "landmark-complementary-is-top-level": { enabled: false },
      "landmark-contentinfo-is-top-level": { enabled: false },
      "landmark-main-is-top-level": { enabled: false },
    },
  });

  if (results.violations.length > 0) {
    throw new Error(
      `A11y violations:\n${formatViolations(results.violations)}`,
    );
  }
}

export const playA11y = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => runA11y(canvasElement);

const documentRuleIds = [
  "document-title",
  "html-has-lang",
  "landmark-one-main",
];

async function runA11yDocument() {
  const results = await axe.run(document, {
    shadowDom: true,
    runOnly: {
      type: "rule",
      values: documentRuleIds,
    },
  });

  if (results.violations.length > 0) {
    throw new Error(
      `A11y document violations:\n${formatViolations(results.violations)}`,
    );
  }
}

export const interactionStory = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await runA11y(canvasElement);
    await runA11yDocument();
  },
};
