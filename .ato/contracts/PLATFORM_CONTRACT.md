# PLATFORM_CONTRACT (UIK Governing Contract)

Purpose: Governing contract for platform behavior, constraints, and required gates.

This document is the consolidated, drift-resistant contract for a modern, standards-first **ui-kit** composed of:

- **ui-tokens** — design token system
- **ui-primitives** — Web Components primitives (Custom Elements + Shadow DOM)
- **ui-patterns** — composed components/patterns built from primitives
- **ui-shell** — application-shell/layout layer for composing and hosting primitives
- **docs site** — public documentation + dogfooding surface

It uses RFC-2119 style language (**MUST / MUST NOT / SHOULD / SHOULD NOT / MAY**) and is intended to be **authoritative** for implementation, review, and coding-agent guidance.

> **Compatibility policy (non-negotiable):** Support **Baseline Widely available**, and selectively support **Baseline Newly available** behind progressive enhancement. Baseline definitions come from web.dev / MDN. [Baseline]

---

## 0) Terms, scope, and enforcement language

### 0.1 Terms

- **Baseline Widely available**: interoperable across the Baseline core browser set for ~30+ months after first becoming interoperable. [Baseline]
- **Baseline Newly available**: newly interoperable across the Baseline core browser set; allowed only via progressive enhancement. [Baseline]
- **Limited availability / Not Baseline**: not part of Baseline; must not be required for core correctness. [MDN Baseline Glossary]

### 0.2 Enforcement language

- **MUST / MUST NOT**: hard requirements.
- **SHOULD / SHOULD NOT**: strong defaults; deviations require explicit justification.
- **MAY**: optional.

### 0.3 "Progressive enhancement" in this system

When a feature is not Baseline Widely available, it MUST be treated as an enhancement:

- guarded by **feature detection** (`@supports`, capability checks),
- paired with a fallback that preserves **functional correctness**.

Motion enhancements have an additional rule: visual transitions MUST NOT be the mechanism of state change; they can only be the presentation of a state change (a core principle reinforced by View Transitions). [View Transitions]

### 0.4 Pre-stable policy (0.x)

- The project is pre-stable (<1.0).
- Breaking changes MAY be introduced and are expected during 0.x.
- Migrations, deprecations, and compatibility layers MUST NOT be used at this stage.
- When behavior or API is removed or changed, the old path MUST be removed in the same change set (no dual paths).
- Contract text, docs, and Custom Elements Manifests MUST be updated in the same change set as the breaking change.
- Versioning rule (pre-stable): any breaking change MUST bump the minor version (0.x).

---

## 1) Compatibility contract (platform-first, Baseline-driven)

### 1.1 Baseline gating rules

- The library MUST classify every relied-on platform feature as **Baseline Widely**, **Baseline Newly**, or **Not Baseline** (Limited availability). [MDN Baseline Glossary]
- **Baseline Widely** features MAY be used unconditionally.
- **Baseline Newly** features MUST be guarded by feature detection and MUST include a fallback that preserves correctness. [Baseline]
- **Not Baseline** features MUST NOT be required for core functionality; they MAY exist only in explicitly documented optional modules.

### 1.2 No "magic minimum browser versions"

- The project MUST NOT hardcode browser-version gates as the primary policy surface. Baseline status is the primary policy.

### 1.3 Public support matrix

- The project MUST publish a machine-readable "support matrix" tagging each used feature as Baseline Widely / Baseline Newly / Not Baseline.
- MDN's Baseline banners are acceptable evidence sources for tagging. (Example: MDN flags `scroll-timeline` as limited availability/not Baseline.) [MDN scroll-timeline]

---

## 2) Platform architecture contract (Web Components first)

### 2.1 Component model

- All UI building blocks MUST be **Custom Elements** as defined by the HTML Standard. [HTML Custom Elements]
- Components MUST use **Shadow DOM** for encapsulation with **slots** for composition; shadow tree behavior follows the DOM Standard. [DOM Standard]
- Components MUST present an **HTML-first API**:
  - attributes for declarative configuration,
  - properties for imperative configuration,
  - events for outputs.
- Components MUST NOT require any framework runtime (React/Vue/etc.) to render or function.

### 2.2 Composition and interoperability

- Components MUST be usable in any standards-capable environment (modern browsers, WebViews, desktop shells) without bundler/runtime assumptions.
- Components MUST avoid global side effects (global resets, global listeners, global DOM mutation) unless explicitly opt-in and documented.

### 2.3 ui-patterns layer (composed components)

- ui-patterns components MUST be Custom Elements and follow the same standards rules as ui-primitives.
- ui-patterns MUST compose ui-primitives and tokens, and MUST NOT depend on ui-shell at runtime.
- ui-patterns MUST publish a Custom Elements Manifest and declare it in `package.json`.
- ui-patterns MUST provide per-pattern entrypoints and a register entrypoint.

### 2.4 Package boundary and dependency DAG

- **ui-tokens** MUST NOT depend on internal ui-\* packages.
- **ui-primitives** MAY depend on **ui-tokens** and external libraries; it MUST NOT depend on **ui-patterns** or **ui-shell**.
- **ui-patterns** MAY depend on **ui-primitives** and **ui-tokens**; it MUST NOT depend on **ui-shell**.
- **ui-shell** MAY depend on **ui-primitives**; it MUST NOT depend on **ui-patterns** or **ui-tokens** directly.
- **docs** MAY depend on all internal packages.

### 2.5 ui-shell scope and naming invariants

- Any Custom Element implemented in **ui-shell** MUST have a tag name starting with `uik-shell-`.
- ui-shell Custom Elements MUST live under `packages/ui-shell/src/structures/`.
- ui-shell MAY include non-visual utilities under internal modules (for example router and command-center), but MUST NOT define general-purpose UI patterns.

### 2.6 docs import boundaries

- The docs site MUST consume other packages only through their public entrypoints (exports map).
- The docs site MUST NOT import other packages’ internal `src/` paths or use cross-package relative imports.

---

## 3) Styling & theming contract (overrideable, predictable, modern CSS)

### 3.1 Token-driven styling primitives

- All theming MUST be expressed primarily via **CSS Custom Properties** (variables). [CSS Variables]
- Components MUST NOT hardcode design values (color/spacing/radius/type/shadow/motion) except neutral structural values required for layout correctness; any exception MUST be documented.

### 3.2 Shadow DOM styling surface is a public API

Each component MUST document and stabilize:

- the CSS custom properties it consumes,
- the `part` names it exposes (via `::part()`), [CSS Shadow Parts]
- the named slots it provides and their semantics. [HTML Slots]

Removing/renaming a published `part` name, slot name, or custom property MUST be treated as a breaking change.

### 3.3 Cascade control for "system CSS"

- Any "system" CSS shipped by **ui-shell** (layout scaffolding, docs chrome, typography scaffolds) MUST use **Cascade Layers** (`@layer`) to guarantee predictable overrides. [MDN Cascade Layers]

### 3.4 Modern responsive components

- Components SHOULD use **Container Queries** where intrinsic responsiveness is appropriate (component adapts to container, not only viewport). [MDN Container Queries]

### 3.5 Modern selector ergonomics under Baseline gating

- If using **CSS Nesting**, it MUST follow the CSS Nesting module and MUST be gated by Baseline policy. [CSS Nesting TR] [MDN Nesting]
- If using **`@scope`**, it MUST follow the platform rule and MUST be gated by Baseline policy. [MDN @scope] [CSS Scoping TR]

### 3.6 Shared styles for performance

- When Baseline allows, shared theme sheets SHOULD be delivered using **constructable stylesheets** / `adoptedStyleSheets` for deduplicated adoption across documents and shadow roots, with a fallback when unavailable. [MDN adoptedStyleSheets] [web.dev Constructable Stylesheets]

### 3.7 System UI and platform preference integration

- The system MUST support platform preference integration (color schemes, forced colors) aligned to CSS Color Adjustment behavior. [CSS Color Adjustment]
- If the system opts out of forced-color adjustment, it MUST be explicit and documented (and treated as availability-sensitive). [CSS Color Adjustment] [MDN forced-color-adjust]

---

## 4) Tokens contract (ui-tokens) — interoperable, multi-context, deterministic

### 4.1 Canonical source format

- Token source of truth MUST be the **DTCG Design Tokens Format 2025.10**. [DTCG Format]
- Multi-context theming MUST follow the **DTCG Resolver** model (contexts + resolution). [DTCG Resolver]

### 4.2 Token coverage (must include motion and layout primitives)

At minimum, semantic layers MUST include token types for:

- color (including modern spaces), typography, spacing, radii, shadows
- motion: durations, delays (if used), easing/timing functions
- elevation / z-index semantics (especially for overlays)
- component interaction states (hover/active/disabled/focus) as semantic aliases, not ad-hoc constants

### 4.3 Modern color model

- Tokens MUST support modern CSS color spaces as first-class inputs/outputs (CSS Color 4/5), not only hex/RGB. [CSS Color 4]

### 4.4 Deterministic build outputs

From the same token sources, the build MUST produce:

- CSS variables output (themeable at runtime),
- a fully resolved output (no aliases) for debugging/tooling,
- machine-readable metadata for docs (tables, groups, descriptions),
- typed programmatic access (typed JS/TS accessors or generated types).

### 4.5 Runtime theming without rebuild

- Switching theme/density/mode MUST be possible without rebuild via CSS variables and a small, explicit runtime mechanism (attributes/data-attributes/classes) that works without frameworks.

---

## 5) Motion ("movement") contract (CSS + Web APIs)

### 5.1 Motion primitives and tokens

- The system MUST define motion tokens for:
  - durations (short/medium/long + component-specific),
  - delays (if used),
  - easing functions (standard `<easing-function>` vocabulary),
  - reduced-motion variants (separate tokens; not separate components). [CSS Easing]

### 5.2 Baseline motion mechanisms

- Default component motion MUST be expressible with:
  - **CSS Transitions** for state changes, [CSS Transitions 2]
  - **CSS Animations** for keyframed sequences. [CSS Animations 2]
- If JS-driven animation is needed, it SHOULD use **Web Animations (WAAPI)** rather than bespoke timer/easing implementations. [Web Animations]

### 5.3 Progressive enhancement motion features

- **View Transitions** (if used) MUST be enhancement-only and MUST NOT block underlying navigation/state change. [View Transitions]
- **Scroll-driven animations** MUST be opt-in and guarded, especially where APIs are not Baseline; limited-availability features must not be required. [Scroll Animations] [MDN scroll-timeline]

### 5.4 Respect user preferences

- Reduced motion support is mandatory:
  - Under `@media (prefers-reduced-motion: reduce)`, the system MUST remove/shorten non-essential motion and avoid attention-demanding loops and scroll-tied effects. [Media Queries]
- In forced-colors contexts, overlays/backdrops MUST remain readable and operable, and preference behavior MUST be documented. [CSS Color Adjustment]

---

## 6) "Modern CSS UI layout" contract (complete layout requirements)

Treat **CSS Snapshot 2025** as the umbrella index for "what CSS includes" in 2025, and explicitly scope what UIK relies on. [CSS Snapshot 2025]

### 6.1 Core layout engines

- Layout MUST be expressible using modern Flexbox/Grid (not tables/floats).
- If `subgrid` is used, it MUST be treated as an enhancement (Grid Level 2 scope). [Grid Level 2]
- Alignment SHOULD be expressed through the Box Alignment vocabulary (`align-*`, `justify-*`) consistently. [CSSWG Drafts Index]

### 6.2 Responsive layout beyond breakpoints

- Container Queries SHOULD be first-class for component-level responsiveness. [MDN Container Queries]
- Logical properties SHOULD be used wherever applicable to support RTL and non-horizontal writing modes. [CSS Logical Properties]

### 6.3 Overlays, menus, anchored UI

- The system SHOULD use the HTML **popover attribute/API** for appropriate overlay cases, with feature detection and fallback. [HTML Popover] [MDN popover]
- For anchored positioning (tooltips/menus), the system SHOULD align with **CSS Anchor Positioning** when available, with a documented fallback when not. [CSS Anchor Positioning]

### 6.4 Scrolling, snap, and mobile ergonomics

- Carousels/pagers SHOULD use **CSS Scroll Snap** where appropriate. [Scroll Snap]
- Nested scrolling MUST avoid scroll chaining issues where applicable using **overscroll-behavior**. [Overscroll]
- Responsive guidance MUST account for dynamic viewport units (dvh/svh/lvh) and document when to use which. [Viewport Units]
- Where scrollbar-induced layout shift is a problem, `scrollbar-gutter` SHOULD be supported as an enhancement with fallback. [MDN scrollbar-gutter]

---

## 7) Interaction primitives contract (native-first overlays and forms)

### 7.1 Top-layer overlays

- Popovers SHOULD use the platform popover model where Baseline permits, with fallback when required. [HTML Popover] [MDN popover]
- Dialog semantics SHOULD leverage the native `<dialog>` element where appropriate (then layer styling/ergonomics). [web.dev Popover+Dialog]

### 7.2 Form controls that behave like the platform

- Custom form controls MUST use **Form-Associated Custom Elements** and **ElementInternals** where supported, for constraint validation, labeling, and submission semantics. [Form-Associated CE] [MDN ElementInternals]
- Where ElementInternals is unavailable in a target environment, components MUST provide a documented fallback mode (minimum: value reflection + custom events) with clear limitations.

---

## 8) Accessibility contract (standards-based, testable)

### 8.1 Conformance target

- The library MUST target **WCAG 2.2** as its baseline for shipped components and shell patterns. [WCAG 2.2]

### 8.2 Semantics and patterns

- Custom widgets MUST follow **WAI-ARIA 1.2** semantics when native semantics are insufficient. [WAI-ARIA 1.2]
- Keyboard interaction MUST follow the **ARIA Authoring Practices Guide (APG)** patterns for relevant widget classes. [APG]

### 8.3 Pointer target sizing

- Interactive targets MUST satisfy WCAG 2.2 SC **2.5.8 Target Size (Minimum)** (24×24 CSS px or valid exception path). [WCAG Target Size]

### 8.4 Automated verification

- Every component MUST have automated accessibility checks in CI (axe-driven or equivalent), plus keyboard tests appropriate to its APG pattern.

---

## 9) Distribution contract (no legacy tooling dependency)

### 9.1 Native ESM first

- Packages MUST ship standards-aligned **ESM** as the primary runtime format.
- The system MUST be usable without a bundler in standards-capable environments.

### 9.2 Import maps supported (no-bundler path)

- The project MUST support consumption via **Import Maps** as a first-class no-bundler option. [MDN Import Maps] [Import Maps Proposal]

### 9.3 No mandatory transpilation

- The public build MUST NOT require Babel/Webpack-era transforms for core usage.
- If build tooling exists, it MUST preserve standards semantics (ESM, real DOM APIs, real CSS) and MUST NOT introduce framework coupling.

### 9.4 Stable import surface

- Public entrypoints MUST remain stable; internal refactors MUST NOT leak internal paths.

---

## 10) Introspection & documentation contract (prevents drift)

### 10.1 Custom Elements Manifest (CEM)

- **ui-primitives**, **ui-patterns**, and **ui-shell** MUST publish a **Custom Elements Manifest** (`custom-elements.json`) including: properties/attributes/events/slots/CSS parts/CSS custom properties. [CEM Schema] [CEM Intro]
- Each package MUST declare the manifest location in `package.json` so tooling can discover it. [webcomponents.dev CEM Discovery]

### 10.2 Docs derived from authoritative metadata

- API reference pages MUST be generated from the manifests (or the same analyzer pipeline) so docs cannot drift from shipped behavior.
- Examples MUST be runnable and represent real component states; demos MUST NOT claim states/behaviors that are not implemented.

---

## 11) ui-shell contract (application frame + layout primitives)

**ui-shell** is a composition and application-shell layer; a docs website is just one consumer.

### 11.1 General-purpose layout primitives

ui-shell MUST provide reusable layout primitives such as:

- app frame, side rails, drawers/panels, toolbars,
- split views, overlay coordination,
- responsive page scaffolds.

### 11.2 Cross-cutting primitives for many apps

ui-shell MUST provide cross-cutting primitives such as:

- command palette host,
- navigation tree/list,
- state/overlay coordination surfaces where appropriate.

### 11.3 Engineering canvas responsibilities

- The docs site/lab layer SHOULD provide engineering-canvas capabilities (multi-theme/density/motion/viewport/RTL viewing, inspectors, event logs, token inspection, Baseline visualization).
- ui-shell MAY expose minimal utilities used by host apps (for example, router and command-center primitives) but is not required to ship the engineering-canvas instrumentation.

ui-shell SHOULD integrate automated:

- accessibility checks,
- visual diffing,
- interaction snapshots including overlay and reduced-motion states.

### 11.4 Scope boundaries

- ui-shell MUST NOT become a "docs-only" framework.
- ui-shell MUST NOT bundle opinionated routers, markdown engines, or site generators into runtime primitives.

---

## 12) Verification & objective conformance gates

The project SHOULD maintain objective "proof" gates:

- **Baseline audit**: every platform feature is classified and justified. [Baseline]
- **A11y audit**: automated + spot manual checks; APG keyboard semantics verified. [APG]
- **Visual regression**: screenshot tests for core components + states in CI.
- **Performance budgets**: limits on JS/CSS weight, per-component update costs, and style adoption duplication (prefer shared sheets where Baseline permits). [MDN adoptedStyleSheets]
- **Native ESM import correctness**: dist outputs MUST NOT contain extensionless relative imports; enforced by `tools/esm/check-relative-imports.mjs` and run in root `npm run test`.
- **Architecture boundary audit**: package boundary rules and ui-shell scope MUST be enforced by `tools/architecture/check-boundaries.mjs`, wired into root `npm run test`.
- **Docs API drift check**: generated docs API output MUST be current; enforced by `apps/docs/tools/generate-docs-content.mjs --api --check`, wired into root `npm run test`.
- **Contracts drift validation**: contract registries MUST match source artifacts; enforced by `tools/contracts/generate.mjs --check` + `tools/contracts/validate.mjs`, wired into root `npm run test`.
- **Baseline support drift check**: baseline support outputs MUST be current; enforced by `tools/baseline/generate.mjs --check`, wired into root `npm run test`.
- **Docs Lighthouse budgets**: enforced by `apps/docs/tools/check-docs-lighthouse.mjs` for `/lab/perf-shell` and `/lab/perf-primitives` with thresholds: performance ≥ 0.8, accessibility ≥ 0.95, best-practices ≥ 0.95, SEO ≥ 0.8, LCP ≤ 2500ms, CLS ≤ 0.02, TBT ≤ 300ms, INP ≤ 200ms (when available). Docs MUST NOT use route-specific hacks to satisfy budgets.
- **Queue schema validation**: `.ato/queue/items.jsonl` MUST be schema-valid; enforced by `ato q validate`, wired into root `npm run test`.
- **Cycle finish check**: `tools/ato/check-cycle-finish.mjs` validates `ato.mjs cycle finish --check` acceptance normalization; wired into root `npm run test`.

---

## 13) Negative contract (MUST NOT / SHOULD NOT)

This section is a guardrail against drift toward legacy failures: global state, bundler-era coupling, framework leakage, inaccessible widgets, unthemeable styling, non-standard hacks.

### 13.1 Hard prohibitions (MUST NOT)

#### A) Compatibility and standards discipline

1. MUST NOT require a framework runtime (React/Vue/Svelte/etc.) to render, style, or operate components.
2. MUST NOT depend on vendor-only APIs for core functionality.
3. MUST NOT use non–Baseline Widely features without progressive enhancement + fallback. [Baseline]
4. MUST NOT assume Chromium-only environments as the implicit target.

#### B) Build/toolchain coupling

5. MUST NOT require Babel/Webpack-era transforms as a condition of consumption.
6. MUST NOT ship a monolithic side-effectful entrypoint that forces whole-library loading.
7. MUST NOT require a custom compiler/macro/codegen step for app developers to consume components.
8. MUST NOT make docs tooling (Storybook/Vite/etc.) a runtime dependency of the library.

#### C) Global CSS conflicts

9. MUST NOT ship global resets or global `* { ... }` rules in ui-primitives.
10. MUST NOT rely on global class names as the primary styling mechanism for components.
11. MUST NOT require consumers to pierce Shadow DOM internals for theming/fixes.
12. MUST NOT use specificity games as a strategy (no `!important` as policy; no selector stacking to win).

#### D) Token violations

13. MUST NOT hardcode design values in components except documented structural exceptions.
14. MUST NOT duplicate token values in components.
15. MUST NOT treat tokens as unvalidated theme blobs; token sources must remain machine-validatable to the adopted DTCG format. [DTCG Format]

#### E) Accessibility and interaction correctness

16. MUST NOT ship interactive components without keyboard operability.
17. MUST NOT ship custom widgets with arbitrary keyboard mappings that contradict ARIA patterns. [APG]
18. MUST NOT create visual-only states (disabled/invalid/loading only via CSS).
19. MUST NOT trap or steal focus unless required by the widget pattern and documented.
20. MUST NOT ignore reduced motion or forced colors preferences. [Media Queries] [CSS Color Adjustment]

#### F) Motion failures

21. MUST NOT make motion required for state changes (animations are presentation, not mechanism). [View Transitions]
22. MUST NOT ship scroll-tied motion as default behavior; it must be opt-in and guarded. [Scroll Animations]
23. MUST NOT ship attention-demanding infinite loops by default; if ever used, it must disable under reduced motion. [Media Queries]

#### G) Overlays and top-layer correctness

24. MUST NOT create overlays that are not dismissible by keyboard and pointer (ESC, outside click when appropriate).
25. MUST NOT create overlays with unpredictable stacking/z-index behavior; top-layer strategy must be coherent.
26. MUST NOT rely on scattered "magic z-index" numbers; elevation must be tokenized.

#### H) State and side effects

27. MUST NOT create hidden global singletons for UI state without explicit host contracts.
28. MUST NOT attach global listeners that persist after disconnect.
29. MUST NOT mutate consumer DOM outside component boundaries except when explicitly documented and reversible.

#### I) Security and correctness

30. MUST NOT inject unsanitized HTML (`innerHTML`) from untrusted input.
31. MUST NOT accept arbitrary HTML strings as the primary content API (slots are the default).
32. MUST NOT log to console in production.
33. MUST NOT include analytics/telemetry in library code.

#### J) Docs and metadata drift

34. MUST NOT hand-maintain API docs that can drift; docs must be generated from authoritative sources and tested.
35. MUST NOT ship breaking changes to styling hooks (`part`, custom properties, slot names) silently.

#### K) ui-shell scope creep

36. MUST NOT make ui-shell docs-only.
37. MUST NOT bundle doc-site infrastructure as runtime primitives.

### 13.2 Soft prohibitions (SHOULD NOT)

1. SHOULD NOT require consumers to adopt a specific bundler/dev-server configuration.
2. SHOULD NOT ship many parallel build flavors (UMD/CJS/etc.) unless there is a concrete need.
3. SHOULD NOT be polyfill-first by default in 2026+; polyfills should be opt-in and justified.
4. SHOULD NOT rely heavily on preprocessors (Sass/Less) for core authoring.
5. SHOULD NOT expose internal class names as public API (prefer parts + custom properties).
6. SHOULD NOT encourage deep piercing patterns.
7. SHOULD NOT add motion without user value; motion should clarify state, hierarchy, or spatial relations.
8. SHOULD NOT implement animation timing logic in JS if CSS/WAAPI suffice.
9. SHOULD NOT build JS layout engines except unavoidable cases; prefer Grid/Flex/Container Queries.
10. SHOULD NOT treat viewport breakpoints as the primary responsive strategy when container queries fit better.
11. SHOULD NOT invent surprising naming conventions that deviate from platform norms.
12. SHOULD NOT expose unstable experimental props/events by default.
13. SHOULD NOT ship heavy runtime abstractions duplicating platform features.
14. SHOULD NOT trigger layout thrash as a normal operation pattern.
15. SHOULD NOT rerender on every micro-change when smaller updates are possible.
16. SHOULD NOT assume network, font availability, or locale/RTL defaults.
17. SHOULD NOT assume pointer-only input; must work with keyboard and touch.

---

## 14) Competitive analysis (failure modes to exploit, and positioning moves)

This section focuses on documented friction points from primary sources, and how UIK can position ahead through product-level guarantees and proof artifacts.

### 14.1 Shoelace

**Strengths:** strong DX, good coverage, customization via tokens + parts/vars. [Shoelace Customizing]  
**Failure mode:** theming across nested Shadow DOM boundaries is difficult; root-loaded theme CSS won't affect components inside other shadow roots, producing "theme doesn't apply here" surprises. [Shoelace Discussion 343]  
**UIK positioning moves:**

- Make theme propagation across nested shadow roots a first-class requirement (constructable stylesheets/adoptedStyleSheets where available, fallback otherwise). [MDN adoptedStyleSheets]
- Treat parts/vars as a stable compatibility surface; changes are breaking.
- Ship token traceability: component styling → semantic token mapping as an explicit tool surface.

### 14.2 Material Web (`@material/web`)

**Strengths:** brand recognition, broad familiarity.  
**Failure mode:** official guidance indicates maintenance mode/no further updates. [Material Web Status]  
**UIK positioning moves:**

- Compete on velocity + modern standards adoption under Baseline + fallback.
- Stay design-language-neutral: "primitives + tokens" rather than one aesthetic.

### 14.3 Spectrum Web Components (Adobe)

**Strengths:** enterprise pedigree, design system depth.  
**Failure modes:** entrypoint/registration friction and overhead; issues around bundling/organization and version pinning incidents. [Spectrum Issue 679] [Spectrum Workshop Note]  
**UIK positioning moves:**

- Per-component side-effect-free entrypoints as a hard contract.
- Explicit registry policy and proof via bundle analysis tests.
- Release discipline with compatibility matrices to avoid "pin these exact versions".

### 14.4 Vaadin Components

**Strengths:** large component set, serious Shadow DOM styling guidance.  
**Failure modes:** commercial split (premium components/tools); styling constraints imply fragility if you go beyond supported hooks. [Vaadin Pricing FAQ] [Vaadin Styling Docs]  
**UIK positioning moves:**

- Fully open, JS-first distribution with no paywalled primitives.
- Make styling hooks so explicit and stable that safe customization is the default.
- Strong universal HTML/CSS/JS story: native ESM, import maps, WebView friendliness.

### 14.5 Microsoft FAST

**Strengths:** influential engineering history.  
**Failure mode:** visible direction churn around foundational packages; removal discussions and migration surfaces add adoption friction. [FAST RFC 6951] [FAST Migration Guide]  
**UIK positioning moves:**

- Long-lived invariants: stable primitives surface, stable styling hooks, stable token model.
- Commit to components as a first-class deliverable with systematic evolution rules.

### 14.6 Carbon ecosystem (IBM)

**Strengths:** enterprise design-system maturity.  
**Failure mode:** end-of-support and package churn signals migration costs. [Carbon Deprecations] [Carbon WC Repo]  
**UIK positioning moves:**

- Stability signals: stable package locations, stable naming, mechanical migrations.
- Future-proof tokens (DTCG + resolver + deterministic outputs) with tooling-assisted upgrades.

### 14.7 Ionic

**Strengths:** strong mobile UI patterns; theming story built around CSS variables. [Ionic Theming]  
**Failure mode:** restyling can be difficult in practice (community friction); also has a cohesive app framework feel that can fight teams wanting a different design language. [Ionic Forum Thread]  
**UIK positioning moves:**

- Neutral primitives + token-driven system that doesn't force an aesthetic.
- Deep restyling is safe by design via parts + vars + layers (not internal selector hunting). [CSS Shadow Parts] [MDN Cascade Layers]

### 14.8 Common "ahead" checklist (product guarantees + proof)

If UIK implements these as testable guarantees, it competes where multiple incumbents show recurring friction:

1. Theme propagation across nested Shadow DOM (not only document-root theming). [Shoelace Discussion 343]
2. Per-component, side-effect-free entrypoints (no "import one, register many"). [Spectrum Issue 679]
3. Standards-native token system (DTCG + resolver + deterministic outputs). [DTCG Format] [DTCG Resolver]
4. Baseline-driven feature policy with progressive enhancement as a first-class rule. [Baseline]
5. Proof-based accessibility: APG-aligned keyboard behavior + automated checks in CI and in the workbench. [APG]
6. A real engineering canvas: ui-shell with token inspector, slot/part map, event log, theme/density/motion toggles, and generated conformance evidence.

---

## 15) Codex "no drift" operating rules (paste above tasks)

1. If a requirement in this contract conflicts with an implementation shortcut, the contract wins.
2. If uncertain about a platform feature, consult the Spec Pack and classify it as Baseline Widely / Baseline Newly / Not Baseline before using it. [Baseline]
3. Baseline Newly available features require feature detection + fallback. [Baseline]
4. Any new component must ship: slots + parts + custom props docs, plus CEM metadata. [CEM Schema]
5. Any custom widget must follow APG keyboard interaction + ARIA 1.2 semantics and target WCAG 2.2. [APG] [WAI-ARIA 1.2] [WCAG 2.2]
6. If uncertain about behavior and cannot confirm from specs, implement the fallback path only and leave a TODO referencing the relevant spec section.

---

## 16) Spec Pack (authoritative references)

Copy this list into tool contexts to reduce model uncertainty; URLs are included for direct use.

```text
Baseline / support policy
- https://web.dev/baseline
- https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility

Web platform standards
- https://dom.spec.whatwg.org/
- https://html.spec.whatwg.org/multipage/custom-elements.html
- https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-face
- https://html.spec.whatwg.org/multipage/dom.html#the-slot-element
- https://html.spec.whatwg.org/multipage/popover.html

Import maps / no-bundler
- https://github.com/WICG/import-maps
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap

Custom Elements Manifest (CEM)
- https://github.com/webcomponents/custom-elements-manifest
- https://custom-elements-manifest.open-wc.org/analyzer/getting-started/
- https://webcomponents.dev/docs/custom-elements-manifest

CSS fundamentals & theming
- https://www.w3.org/TR/css-variables-1/
- https://www.w3.org/TR/css-shadow-parts-1/
- https://www.w3.org/TR/css-cascade-5/
- https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers
- https://www.w3.org/TR/css-contain-3/
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries
- https://www.w3.org/TR/css-nesting-1/
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope
- https://www.w3.org/TR/css-scoping-1/
- https://web.dev/articles/constructable-stylesheets
- https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets
- https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets

Design tokens
- https://www.designtokens.org/TR/2025.10/format/
- https://www.designtokens.org/TR/2025.10/resolver/

Accessibility
- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- https://www.w3.org/TR/wai-aria-1.2/
- https://www.w3.org/WAI/ARIA/apg/

Motion
- https://www.w3.org/TR/css-easing-1/
- https://www.w3.org/TR/css-transitions-2/
- https://www.w3.org/TR/css-animations-2/
- https://www.w3.org/TR/web-animations-1/
- https://www.w3.org/TR/scroll-animations-1/
- https://www.w3.org/TR/css-view-transitions-1/

Layout / snapshots
- https://www.w3.org/TR/css-2025/
- https://www.w3.org/TR/css-anchor-position-1/
- https://www.w3.org/TR/css-scroll-snap-1/
- https://www.w3.org/TR/css-overscroll-1/
- https://www.w3.org/TR/css-grid-2/
- https://www.w3.org/TR/css-align-3/
- https://web.dev/blog/viewport-units
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-gutter
- https://www.w3.org/TR/css-scrollbars-1/
- https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color
- https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values

Color & user preferences
- https://www.w3.org/TR/css-color-4/
- https://www.w3.org/TR/css-color-5/
- https://www.w3.org/TR/css-color-adjust-1/
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/forced-color-adjust
- https://www.w3.org/TR/mediaqueries-5/
- https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors
- https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion

Focus & UI hooks (docs references used by baseline-support)
- https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible
- https://developer.mozilla.org/en-US/docs/Web/CSS/@layer
- https://developer.mozilla.org/en-US/docs/Web/CSS/accent-color
- https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog

Platform APIs
- https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals
```
