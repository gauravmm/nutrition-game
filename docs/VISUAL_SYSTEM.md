# Visual System — Nutrition Game

## Design direction

**Visual thesis:** a calm school science table: warm paper-like surfaces, crisp ink-blue labels, one fresh green action colour, and a large familiar plate as the working object.

**Content plan:** the game opens directly on the tray-and-plate workspace; a compact instruction anchors the task, the plate makes meal-building physical, and the reveal becomes a clear lab-result moment. No dashboard, hero, or grid of decorative cards.

**Interaction thesis:** foods lift from the browser and settle onto the plate; the plate gives a small receptive pulse on valid drag-over; checking a meal turns the quiet workspace into a measured result, with values counting in once. These transitions must be absent under reduced motion.

The product should feel welcoming and rigorous, not clinical, competitive, childish, or diet-focused. The plate is the dominant visual element at every viewport.

## Foundations

Use system UI typography so GitHub Pages needs no network font dependency. `ui-rounded` is a progressive enhancement only; all layouts must work in the system fallback.

```css
:root {
  --font-ui: ui-rounded, "Avenir Next", "Nunito Sans", Inter, system-ui, sans-serif;
  --font-reading: ui-serif, Georgia, serif;

  --canvas: #F7F4EC;
  --surface: #FFFDF8;
  --surface-soft: #F0EBDD;
  --surface-tint: #EAF2E9;
  --ink: #16324F;
  --ink-muted: #5D6D7E;
  --rule: #D8D1C2;
  --rule-strong: #B9B0A0;
  --green: #237A57;
  --green-hover: #1B6246;
  --green-soft: #DCEFE4;
  --focus: #0B73CE;
  --warning: #9A5B13;
  --warning-soft: #FAE9CF;
  --danger: #A63E38;
  --danger-soft: #F8E1DF;
  --white: #FFFFFF;

  --shadow-plate: 0 20px 42px rgb(22 50 79 / 12%), 0 3px 8px rgb(22 50 79 / 9%);
  --shadow-float: 0 10px 24px rgb(22 50 79 / 12%);
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-pill: 999px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --content-max: 1440px;
}
```

| Role | Value |
| --- | --- |
| App title | 28px / 1.1 / 750 desktop; 24px mobile |
| Workspace heading | 18px / 1.25 / 700 |
| Body and controls | 15px / 1.45 / 500 |
| Food name | 15px / 1.25 / 700 |
| Support/detail text | 13px / 1.4 / 500 |
| Numeric result | 40px / 1 / 750 desktop; 32px mobile |
| Minimum control height | 44px pointer/touch; 24px icon target only with surrounding 44px hit area |

Only `--green` is an affirmative/action accent. Use ink and neutral surfaces for normal navigation. Warning and danger are semantic states, never decorative theme colours.

## Composition and responsive layout

The page background is `--canvas`. The app has a restrained top bar: game name on the left, a quiet `Start over` text button on the right, then a thin divider. Do not introduce marketing language, a logo lockup, or a persistent score.

Desktop (`>= 1100px`) uses a three-column working surface, max-width `--content-max` with 32px page gutters:

```text
food browser 360–400px  |  plate workspace minmax(560px, 1fr)  |  meal list 260–300px
tabs + food list       |  oversized circular plate            |  selected foods + action
```

The browser and meal list are plain vertical regions separated by `--rule`; avoid enclosing every region in cards. The plate workspace may use a soft, almost-white plane only to establish focus. The plate itself should be about 560–680px across (bounded by the viewport), centred horizontally, and should visibly dominate the browser. A compact instruction and the check button sit below it, not over it.

At 760–1099px, use two columns: the browser is 300px at left; the plate and selected meal occupy the right column, with the meal list directly below the plate. At `< 760px`, use a single column in this order: top bar, instruction, horizontal tabs, food browser, plate, selected foods, action, then results. Keep the plate width `min(88vw, 500px)`; do not shrink it below 280px. Tabs scroll horizontally with a visible fade or edge cue, while retaining a keyboard-focusable tab list.

On mobile, food tiles form a two-column list (never a carousel); selected-food rows are full-width and portion controls stay in the same row where possible. The primary action is sticky above the safe-area inset after a food has been added, but it must not obscure plate controls or results.

## Component treatment

### Top bar and instruction

Use a small all-lowercase or title-case game name in ink blue, e.g. `Build a balanced plate`. The instruction sits above the workspace as one sentence: `Choose foods, place them on your plate, then check what your meal adds up to.`

Use a short, text-only help disclosure: `How it works`. Its expanded copy explains that nutrition is revealed only after checking, and it includes keyboard/touch instructions.

### Tabs and food browser

Tabs are text-first, not pill buttons. The active tab has an ink-blue bottom rule (2px) and heavier type. Inactive tabs are muted ink. Hover gives a very pale `--surface-soft` wash; focus uses the shared focus ring. No nutrition numbers appear here.

Food tiles are interaction objects, so a subtle compact tile is justified: warm-white fill, 1px `--rule`, `--radius-sm`, and 12px inner padding. They should not form a floating card mosaic: stack them in a dense list with 8px gaps. Each tile includes a 48px square visual placeholder, food name, serving label, then an `Add` button. On desktop the whole tile may also be draggable; `Add` is the accessible equivalent.

For a food with multiple portions, use a native-looking labelled select or segmented stepper below the serving label: `Portion  [1 egg ▾]`. Do not label it `Size` alone.

### Plate workspace

The plate is a simple CSS circle, not a generated image: white/very-pale warm centre (`#FFFDF9`), a 12–16px rim in `--surface-soft`, 1px inner ink-tinted rule at low opacity, and `--shadow-plate`. Include a small centre prompt only while empty: `Your plate is ready` followed by `Drag a food here, or choose Add.`

Placed foods are movable chips with their placeholder visual, short label, current portion, and a visible remove control. They should look like paper labels set on the plate: `--surface` background, 1px rule, 10px radius, and no saturated food-colour coding. Allow deliberate overlaps but ensure labels remain readable and selections can be reached by keyboard. On a plate too full for visual placement, move overflow foods to the selected-food list while retaining every meal item and explaining this in text.

The plate drop target has a 3px dashed neutral border only while it is a drag target. On valid drag-over, change that border to `--green`, tint the rim with `--green-soft`, and show `Drop to add`. For an invalid external drop, briefly use `--danger` on the rim and announce `That food could not be added here`; no food is added.

### Selected foods and primary action

The right/below-plate meal list heading is `On your plate` with a quiet count, such as `3 foods`. Rows show name, portion, compact minus/plus quantity controls when supported, and `Remove` as a text button. Keep energy and macros hidden here before submission.

Primary button: solid `--green`, white label, `--radius-sm`, min 48px height. Before adding food it is disabled with a clear hint: `Add at least one food to check your meal.` After adding food, label it `Check my meal`. Use `Try again` once a checked meal is being edited and `Check updated meal` only if the stale-result notice is already visible; avoid changing the action label too often.

Secondary actions are ink-blue text buttons. The destructive `Start over` action needs a confirmation dialog only if the plate is non-empty; its confirm label is `Clear plate`.

### Results

Results replace the compact pre-check meal summary below the plate; they do not cover the plate or move the student to a new screen. Head it `Your meal, measured`. Start with the calorie total in large type (`1,120 kcal`) and a plain-language sentence (`Here is the nutrition for the portions on your plate.`).

Present carbohydrate, protein, and fat in a single horizontal composition bar plus a three-row text table. The bar segments use distinguishable patterns and text labels in addition to colour. Suggested non-green series: blue-grey `#476A88`, clay `#B86B4C`, and olive `#77824A`; reserve green for actions/success. Each row says, for example, `Carbohydrate  120 g  ·  43% of energy`.

Use a simple bordered contribution table/list below: `Food`, `Portion`, `kcal`, `Carbs`, `Protein`, `Fat`. At the end of each food's expanded details, include `Nutrition source` as an external link with source name, rather than showing a raw URL. This source link is available after the first reveal and remains available in a `Sources` disclosure when the student edits again. Micronutrients and research notes are stored in the data model but deliberately omitted from the first-draft result UI.

Balance feedback is a horizontal callout with a left status rule, not a congratulatory banner card. Headings: `Balanced for this activity`, `Close — try one small change`, or `Try adjusting your meal`. Then give one specific neutral sentence and optional direction. It must include the clause `One meal is only one part of an overall diet.`

## States and messaging

| State | Visual behaviour | Accessible announcement / copy |
| --- | --- | --- |
| Empty plate | Centre prompt; primary disabled. | `Your plate is empty. Add a food to begin.` |
| Food available | Tile has normal border; Add visible. | `Add [food name] to your plate.` |
| Dragging | Food tile lifts with shadow; plate activates. | `Moving [food name]. Drop on the plate, or press Escape to cancel.` |
| Food added | Placed label settles; count updates. | `[Food name] added to your plate.` |
| Portion edited | Only portion label and meal count/list update. Results become stale if previously checked. | `[Food name] portion changed to [portion]. Check your updated meal.` |
| Submitted | Result area reveals values and feedback. | `Meal checked. Your total is [kcal] calories.` |
| Stale results | Subdued inline notice, old numeric results hidden. | `Your meal changed. Check it again for updated nutrition.` |
| Calculation failure | Neutral error region; food selection preserved. | `We could not calculate this meal. Try again; your plate is unchanged.` |
| Success / balanced | Green left rule and a small check mark; no confetti. | `Balanced for this activity. You can still explore another combination.` |

Never use red/green alone to communicate feedback; pair every status with explicit text and an icon or pattern. Error text should state what happened and what the student can do next.

## Motion

- Initial load: title and instruction fade upward by 8px over 180ms, then plate fades/scales from 0.985 to 1 over 240ms. Food list enters without a stagger.
- Add/drop: the plate label appears at its position with 160ms `transform`/`opacity`; valid drop gives the rim one 220ms green pulse. A clicked Add should use the same motion from the button direction where feasible, otherwise simply fade in on the plate.
- Check: reserve layout space for results, then fade and rise the result section by 8px over 220ms. Calorie and gram values count to their final values within 450ms only when their text is also immediately accessible to screen readers.

Use `cubic-bezier(.2,.8,.2,1)`. Animate only `transform` and `opacity` when possible. Under `prefers-reduced-motion: reduce`, disable transform/number animation and show the final state immediately; do not rely on any animation to explain a change.

## Placeholder food visual system

Do not generate, source, or imply production food photography in this draft. Each food tile and plate label uses a deliberately simple placeholder square: `--surface-tint` fill, `--rule` outline, a central line icon of a covered dish, and small all-caps text `FOOD IMAGE`. The actual food name remains adjacent as real text; placeholder text is not the sole identifier.

Use the same placeholder for every food in v1 so unresearched imagery does not imply an authentic preparation or serving. Add a code comment / data field such as `imageStatus: "placeholder"` and `imageAlt: "Placeholder for chicken rice"`. When production visuals arrive, each must have concise descriptive alt text (for example, `A serving of roasted chicken rice with cucumber`) or be marked decorative if its adjacent label fully identifies it.

## Accessibility and implementation guardrails

- Meet WCAG AA: normal text contrast at least 4.5:1, large text at least 3:1, UI boundaries and focus indicators at least 3:1. Validate the chosen token pairs in implementation.
- All controls have visible labels, semantic buttons, and a 2–3px `--focus` outline with 3px offset. Do not remove focus outlines.
- Implement tabs with `role="tablist"`, `role="tab"`, arrow-key navigation, `aria-selected`, and linked tab panels.
- Dragging is additive enhancement only. `Add` gives full pointer, keyboard, and touch parity; placed items have a labelled `Remove [food]` button. Avoid a keyboard-only spatial drag interaction.
- The plate has a clear accessible name such as `Your plate. 3 foods selected.` It must not be a button if its only keyboard action is conveyed by individual controls.
- Announce add/remove, portion, stale-result, and submission events through a concise polite live region; use an assertive region only for a calculation failure.
- Render macronutrient chart data as an adjacent semantic table/list. Provide the actual numeric percentages, not a colour-only chart.
- Do not trap focus on result reveal. The `Check my meal` button may move focus to `Your meal, measured` after activation, but only after results exist.
- The source link must say the source's name and include an external-link indication visible to screen readers, e.g. `HealthHub nutrition source (opens in new tab)`.

## Recommended UI copy

| Moment | Copy |
| --- | --- |
| Empty plate | `Your plate is ready` / `Choose a food to get started.` |
| Food browser heading | `Choose a food` |
| Meal list heading | `On your plate` |
| Pre-check privacy reminder | `Nutrition stays hidden until you check your meal.` |
| Primary action | `Check my meal` |
| Result heading | `Your meal, measured` |
| Retry | `Adjust and check again` |
| Clearing confirmation | `Clear everything from your plate?` |
| Source disclosure | `Nutrition sources and serving notes` |
| Micronutrient status | Do not mention in v1 results; retain only in data for a later learning view. |

