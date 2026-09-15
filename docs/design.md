# Design NLASmith like Anthropic

Act as an excellent product designer and design engineer for NLASmith. This is a research lab for comparing Natural Language Activations, not a generic SaaS dashboard and not a marketing site pretending to be a product.

The visual reference is Claude / Anthropic: warm paper, near-black ink, one terracotta accent, editorial type, generous quiet, rounded pills. Presence comes from hierarchy and restraint, not from extra chrome.

## Who this is for

Researchers and builders who run datasets of prompts through Neuronpedia, attach LLM judges, and compare experiments. They open a screen to **do a job** (run, attach, compare, configure), not to be decorated.

Start with that job. The primary action on the page should be obvious in under a second.

## Use this priority order

When requirements compete, protect them in this order:

1. Preserve facts, run numbers, metrics, and existing product behavior.
2. Reuse the installed Next.js App Router stack and `components/ui/*` primitives. Do not invent a parallel design system.
3. Make the reader's next action unmistakable (usually one terracotta `Button`).
4. Keep Anthropic authorship: paper surfaces, clay accent used sparingly, 13px UI type, pill buttons.
5. Compose the screen for the material (a compare table is not a settings form).
6. Refine hover, focus, empty, and disabled states without changing the grammar.

## Integrate with this repo

- Read this file before adding or restyling UI.
- Tokens live in `app/globals.css` (`:root` and `@theme inline`).
- Primitives live in `components/ui/`. Page-owned CSS may add topology, never a second button or input language.
- Field chrome (input, textarea, select trigger) shares `lib/control-styles.ts`. Import those classes; do not copy slightly different borders or radii.
- Buttons always come from `components/ui/button.tsx`. Never a raw `<button>` or a one-off `className` that changes height or font size.
- Badges come from `components/ui/badge.tsx`.
- Page chrome (crumb, title, hint, header actions) comes from `components/page-chrome.tsx`.
- Do not add Inter, Geist, purple gradients, glassmorphism, or a second accent (blue/purple) for "energy."

## Work in four passes

### 1. Frame the reader's job

Privately answer: who opened this, to decide or do what? What is the one primary action? What evidence must stay visible (metrics, run ids, errors)?

Support two speeds:

- **Do path:** title, primary button, the table or chart that changes the decision.
- **Audit path:** exact scores, prompts, mappings, timestamps — quieter, after the action.

### 2. Choose the composition

The first viewport is the job, not a masthead of equal-weight cards. Typical NLASmith compositions:

- **List** (datasets, evaluators): `PageHeader` + one primary `Button` + `surface` table.
- **Dataset workspace:** header actions (`outline` attach, `default` run) + line tabs + charts then table.
- **Configure:** header Save (`default`) / Discard (`outline`) + two-column editor.
- **Compare:** identity of runs, charts, then the per-example table.
- **Marketing (`/`):** dark field, terracotta CTA, terracotta panels as atmosphere — not as in-app chrome.

Reject a generic three-column dashboard unless the job is actually three equal tools.

### 3. Authoritative visual system

#### Color

| Token | Hex | Role |
| --- | --- | --- |
| `--bg` / `--card` | `#faf9f5` | Paper. App canvas and surfaces. |
| `--sidebar` / `--paper` | `#f0eee6` | Slightly warmer rail. |
| `--ink` | `#141413` | Text, icons at rest. |
| `--muted` | `#5e5d59` | Secondary copy, table headers. |
| `--line` / `--line-strong` | `#d1cfc5` / `#c4c0b4` | Hairlines and control borders. |
| `--hover` / `--sand` | `#e3dacc` | Hover wash, selected chips. |
| `--clay` / `--accent` | `#d97757` | **The only accent.** Primary actions, focus, checked, active nav, running, tab underline. |
| `--accent-hover` | `#c45f42` | Pressed/hover on clay fills. |
| `--ok` | `#6a7f4a` | Avatar / success, not CTAs. |
| Destructive | `#9b3a2a` | Irreversible or error only. |

Clay is scarce. If more than one large fill on a screen is terracotta, you used too much. Secondary actions stay outline (ink on paper). Ghost is tertiary. Links in crumbs and inline "Replace key" may use clay text.

On dark marketing sections, the primary CTA is still clay. The secondary is `inverseOutline` (hairline on dark). Cream `inverse` is reserved for a light pill on dark when clay would collide with a terracotta panel.

#### Type

- UI: Plus Jakarta Sans (`--font-ui`), **13px**, medium for controls and titles in chrome, regular for body.
- Display (marketing only): same family, heavy, tight tracking (`.font-display`).
- Editorial (marketing only): Source Serif 4 (`.font-editorial`).
- Mono: IBM Plex Mono for run ids, model ids, keys.
- Do not mix 12px / 14px / 16px control type. Tooltips, badges, tabs, inputs, buttons, and table cells are 13px.

Letter-spacing on UI is slightly tight (`-0.012em` on body). Do not add Inter-style wide tracking.

#### Shape and density

- Buttons, badges, switches: **pill** (`rounded-full`).
- Fields and selects: **12px** (`rounded-xl`) via `fieldRadiusClass`.
- Surfaces and dialogs: **16px** (`rounded-2xl` / `.surface`).
- Control height: **32px** (`h-8`) for buttons, inputs, selects. Icon buttons are `size-8`. Marketing CTAs may use `size="lg"` (`h-10`) with the same 13px type.
- Page body padding: 24px (`.page-body`). Stacks: 20px (`.stack`).
- No drop shadows on fields. Elevation is for portaled layers (dialog, popover, select menu) only: `shadow-[0_16px_48px_rgba(20,20,19,0.16)]`.

#### Motion

Framer Motion is already in the shell. Prefer CSS transitions on color. Honor `useLimitedMotion`. Do not add springy logo tricks or layout-shifting header animations.

##### Animated editorial illustrations

Marketing illustrations use a **pixel-faithful base plus animated overlays**. The PNG or JPG is always rendered unchanged as the bottom layer, so the composition, watercolor texture, colors, and idle state remain exactly as designed. Animation is added with a pointer-inert SVG positioned over that image; never redraw or replace the original artwork just to make it move.

Use this structure:

1. Wrap the original `next/image` and overlay SVG in the same `relative`, `overflow-hidden` container.
2. Give the SVG the source asset's exact `viewBox` and the same `preserveAspectRatio="xMidYMid slice"` behavior as `object-cover`, so paths align at every responsive size.
3. Animate only semantic parts already present in the illustration: trace an existing route, pulse a node, redraw a check, grow a bar, or highlight a document line.
4. Keep overlays `pointer-events-none`; the wrapper owns `onPointerEnter` and `onPointerLeave`.
5. Set `initial={false}` on overlay motion elements to prevent a mount animation or hydration mismatch.
6. Disable overlays for reduced motion and leave the original asset visible.

Every illustration needs its own motion idea. Do not apply one generic zoom or floating effect to all cards. Examples in the landing are intentionally distinct: token selection shifts tokens, datasets trace records, NLA lights a graph, evaluators resolve checks, live runs travel through a route, compare grows bars, The gap propagates through activation nodes, Method branches into outputs, and An experiment traces the conversation loop.

The standard interaction lasts `1.05s`. Entry uses `[0.22, 1, 0.36, 1]`; return uses its temporal inverse `[0.64, 0, 0.78, 0]`. For animations whose overlay must remain visible while returning, control `hovered` and `active` separately: start both on pointer enter, clear only `hovered` on pointer leave, and clear `active` in `onAnimationComplete`. Do not rely on an implicit `whileHover` reset when the reverse animation must finish before revealing the static base.

Keep the effect restrained. The resting illustration must remain the authored image, the animation should happen once per hover rather than loop indefinitely, and decorative overlays must not introduce new symbols or colors that are absent from the visual language.

### 4. Components — reuse, don't restyle

| Job | Use |
| --- | --- |
| Any clickable action | `Button` from `components/ui/button.tsx` |
| Primary / the thing that should call attention | `variant="default"` (clay) |
| Secondary (Discard, Cancel, Compare, + Evaluator beside a stronger + Experiment) | `variant="outline"` |
| Tertiary / icon in chrome | `variant="ghost"` `size="icon"` |
| Inline text action | `variant="link"` |
| Account menu rows | `variant="nav"` |
| Text field | `Input` |
| Multiline | `Textarea` |
| Closed list | `Select` |
| Boolean | `Checkbox` or `Switch` (checked fill is clay) |
| Page sections | `Tabs` `variant="line"` (active underline is clay) |
| Status | `Badge` |
| Overlay | `Dialog` / `Popover` / `Tooltip` already in `components/ui` |

Button variants that exist today: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `nav`, `inverse`, `inverseOutline`. Sizes: `default`, `lg`, `icon`, `nav`. Do not add `xs`/`sm` heights that break the 32px rhythm.

If you need a new visual treatment, add a **variant** to the existing primitive. Do not fork a second component.

### Copy

Product copy is English, short, and specific. Buttons are verbs: Save, Discard, Run experiment, Dataset, Evaluator. Do not write "Get started with your journey." Do not shout in all caps. Preserve the Settings keys sentence if you touch that page.

### Anti-patterns (named so agents can refuse them)

- **Ink CTA:** black or gray primary buttons. Primary is clay.
- **Accent soup:** clay on buttons and big backgrounds and icons and charts in the same view.
- **Control drift:** a 36px input next to a 32px button, or 12px label next to 13px body.
- **Raw controls:** `<button>`, unstyled `<input>`, or leftover `.btn` CSS.
- **Generic AI UI:** purple gradients, Inter, three identical metric cards with thick borders, neon focus rings.
- **Equal weight:** two filled buttons side by side competing for the same job.
- **Template report:** a page that looks like every other shadcn dashboard.

## Squint test

At a glance you should see paper, one clay action, and quiet ink. If the screen looks like a beige spreadsheet with no hotspot, the primary action is missing. If it looks like a sunset, you overused clay.
