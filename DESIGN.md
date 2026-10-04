# Design System — Aldergate Clinic

The frontend's visual and interaction rules, as built. The source of truth is
`frontend/src/index.css` (tokens, base, shared primitives); component-specific
layout lives in CSS Modules beside each component. This file explains *why* the
rules are what they are, so the next change extends the system instead of
sitting next to it.

Direction contract: `frontend/index.html`, seed `64d8da38`.

---

## 1. Thesis

**One continuous patient file, not a booking feed.**

Booking is the entry point. The consultation record is the product — a doctor
opens tomorrow's list, reads the last visit in one glance, and writes the next
one. Where effort has to be split, history wins (`PRODUCT.md`, Principle 1).

### What this design refuses

These are deliberate exclusions. Reintroducing one is a direction change, not a
tweak.

| Refused | Why |
|---|---|
| Card grid of smiling doctors | Invented faces presented as practitioners. `Monogram` exists instead |
| Soft teal / clinical pastel | The default healthcare-SaaS palette. Warm paper + one deep emerald instead |
| Hero metric row ("10,000+ patients") | This product has no users and no evidence (`PRODUCT.md`, Evidence on Hand) |
| Cards as the default grouping device | Hairline-divided rows group content; cards appear only where elevation is real |
| Centred hero | The first viewport is an asymmetric 7/5 split — claim left, proof right |

---

## 2. Ground and ink

Warm neutrals throughout. No pure black, no pure grey.

| Token | Value | Role |
|---|---|---|
| `--paper` | `#faf9f7` | Page ground |
| `--surface` | `#ffffff` | Raised surfaces: panels, controls |
| `--surface-sunk` | `#f4f2ed` | Recessed: hover rows, day headers, disabled fills |
| `--ink` | `#1a1917` | Primary text |
| `--ink-2` | `#56534c` | Secondary text, body copy in records |
| `--ink-3` | `#6e6a61` | Meta, labels, placeholders |
| `--line` | `#e4e0d8` | Hairline dividers (decorative) |
| `--line-strong` | `#cfc9be` | Control boundaries — see §11 |

### Measured text contrast

Every text pair in the system, computed against its real ground:

| Pair | Ratio |
|---|---|
| `--ink` on `--paper` | 16.70 |
| `--ink-2` on `--paper` | 7.29 |
| `--ink-3` on `--paper` | 5.12 |
| `--ink-3` on `--surface-sunk` | 4.82 |
| `--accent` on `--paper` | 7.28 |
| `#fff` on `--accent` | 7.66 |

The floor is 4.82:1. Everything clears WCAG AA (4.5:1) for normal text with
room to spare. **`--ink-3` is the lightest ink permitted on any ground** — there
is no lighter tier, and adding one would land under AA.

## 3. Accent

One accent, carrying every action and active state. There is no secondary
brand colour.

| Token | Value | Role |
|---|---|---|
| `--accent` | `#0d5f45` | Primary buttons, links, active nav, focus ring |
| `--accent-hover` | `#0a4e38` | Primary button hover |
| `--accent-wash` | `#eaf2ee` | Active nav background, follow-up callouts, selection |
| `--accent-line` | `#bfd8cd` | Accent-tinted hairline |

Deep emerald, not teal — dark enough to carry white text at 7.66:1 and to be
used as text on paper at 7.28:1. The same value doubles as `--st-confirmed`,
which is intentional: "confirmed" is the system's positive state and shares the
accent rather than competing with it.

## 4. Appointment status

Four states appear on nearly every screen in both roles. A Cancelled
appointment misread as Confirmed is a missed consultation, so **status is never
carried by colour alone** — each `StatusTag` pairs a hue with an icon and the
status word (`components/ui/Bits.jsx`).

| State | Ink | Wash | Icon | Contrast |
|---|---|---|---|---|
| Pending | `#8a5a06` | `#fbf2e0` | `Clock` | 5.32 |
| Confirmed | `#0d5f45` | `#eaf2ee` | `CheckCircle` | 6.73 |
| Completed | `#56534c` | `#f0eee9` | `Check` | 6.62 |
| Cancelled | `#9e2f23` | `#fbebe8` | `XCircle` | 6.29 |

Cancelled rows additionally strike through the time and the patient name
(`.slotCancelled`), so the state survives a greyscale print.

## 5. Type

| | Family | Used for |
|---|---|---|
| Text | **Satoshi** 400/500/700/900 | Everything |
| Numeric | **JetBrains Mono** 400/500 | Times, dates, counts, IDs, fees, prescriptions |

**The mono is reserved, not decorative.** It marks values a doctor scans rather
than reads: `09:30`, `2026-08-13`, `₹900`, a slot count, a dose. The `.num`
helper applies it with `tabular-nums` so columns of times align. Prose never
takes mono.

### Scale

| Token | Size | Use |
|---|---|---|
| `--fs-display` | `clamp(2.25rem, 1.55rem + 2.9vw, 3.5rem)` | Home h1 only |
| `--fs-h1` | `clamp(1.625rem, 1.35rem + 1.2vw, 2.125rem)` | Page titles |
| `--fs-h2` | `1.375rem` | Section headings |
| `--fs-h3` | `1.0625rem` | Panel headings |
| `--fs-body` | `0.9375rem` | Body |
| `--fs-sm` | `0.8125rem` | Meta, helper text, table-dense rows |
| `--fs-xs` | `0.75rem` | Labels, tags, footnotes |

Only the two largest steps are fluid. Everything below is fixed — a working
screen full of records should not reflow its type as the window moves.

Headings run `font-weight: 700`, `letter-spacing: -0.022em`, `line-height:
1.15`, `text-wrap: balance`. The display step tightens further to `-0.032em` at
weight 900. Negative tracking scales with size; body text is never tracked in.

`.section-label` (12px, `0.1em`, uppercase, `--ink-3`) titles a *region of a
working page*. It is not an eyebrow above a hero heading.

### Measure

`.measure` caps at 68ch; `.lede` at 62ch; record body text (`.entryText`,
`.followUp`) at 74ch. Long-form prose never runs the full 1240px shell.

## 6. Space, radius, depth

Space is an 8px-derived ramp with a 4px entry: `--sp-1` 4 · `--sp-2` 8 ·
`--sp-3` 12 · `--sp-4` 16 · `--sp-5` 24 · `--sp-6` 32 · `--sp-7` 48 · `--sp-8`
64 · `--sp-9` 96. Use tokens; no literal pixel gaps.

Radius: `--r-sm` 4 (chips, inline fills) · `--r` 6 (controls) · `--r-lg` 10
(panels). Pills use `999px` — tags and chips only.

Depth is offset plus soft blur, tinted to the warm ground rather than neutral
black:

- `--shadow-sm` — resting panels and controls
- `--shadow-md` — the patient dashboard's next-appointment card, open mobile nav
- `--shadow-lg` — the Home hero record, the one object meant to float

**Elevation must be earned.** A shadow means "this sits above the page." A list
of appointments does not; it gets hairlines.

## 7. Layout

- `.shell` — `max-width: 1240px`, `padding-inline: 24px` (16px ≤640px)
- `.page` — `padding-block: 48px 96px`
- `--nav-h` — 60px, the sticky header height; sticky asides and day headers
  offset from it

### The first viewport

`Home.module.css .hero` is a `7fr 5fr` grid with a `--sp-9` gutter, not
centred. Left: the promise in tight grotesk, the primary action inline beneath
it, then a live specialty directory. Right: a real consultation record, dated,
showing what the doctor actually sees. It collapses to one column at ≤1000px.

### Working pages

`common.module.css .split` — `minmax(0, 1fr) 340px`. The aside is
`position: sticky` under the nav and goes static at ≤940px.

**`.splitWide` is a modifier, not a layout.** It only overrides
`grid-template-columns` to 400px; `display: grid`, the `--sp-6` gutter and
`align-items: start` all live on `.split`. Always write both:

```jsx
<div className={`${common.split} ${common.splitWide}`}>
```

Used alone it silently loses the gutter *and* `align-items: start` — and
without `start` the aside stretches to the full row height, which leaves a
`position: sticky` element no room to move, so the sticky summary stops
sticking. Two of the nine call sites had this and were patched with an inline
`display: grid`, which hid the missing gutter without restoring it.

### Rows over cards

`.rows` + `.row-link` is the default grouping device: a hairline-divided list,
hover-filled with `--surface-sunk`. `.panel` wraps a list only where the group
genuinely sits above the page.

Row grids all follow the same shape — a fixed lead column, a `minmax(0, 1fr)`
identity column, and a `flex: none` trailing column that drops to a full-width
row on narrow screens (`.docRow`, `.apptRow`, `.slotRow`, `.personRow`).
`minmax(0, 1fr)` rather than `1fr` is load-bearing: it lets the identity column
shrink instead of forcing the track wider than the viewport.

## 8. Components

| Primitive | Where | Notes |
|---|---|---|
| `.btn` + `--primary/--secondary/--ghost/--danger`, `--sm/--lg/--block` | `index.css` | 1px transparent border on all variants so sizes match across fills |
| `.panel`, `.panel__head`, `.panel__body` | `index.css` | Head is `align-items: baseline` |
| `.rows`, `.row-link` | `index.css` | Hairline list |
| `.tag--*` | `index.css` + `StatusTag` | Never colour alone |
| `.field`, `.field__control`, `--invalid`, `.field__hint`, `.field__error` | `index.css` | Custom select arrow drawn with two gradients — no background image |
| `.form-grid` | `index.css` | 2-up, `.field--wide` spans, 1-up ≤640px |
| `.link-more` | `index.css` | "See all" beside a heading; holds a 24px target floor |
| `.back` | `common.module.css` | Back link above a detail heading; gap animates 6→9px on hover |
| `Monogram` | `ui/Bits.jsx` | Initials on one of six hue-rotated washes. Deliberately not a photograph |
| `EmptyState`, `Notice`, `Facts`, `PageHead` | `ui/Bits.jsx` | `Notice` carries `role="status"` |
| `.skeleton` | `index.css` | Shimmer on `--surface-sunk` |

## 9. Motion

`--dur: 240ms`, `--ease: cubic-bezier(0.16, 1, 0.3, 1)` — a fast-out
decelerating curve. Transitions are limited to `background`, `border-color`,
`color`, `transform`, `box-shadow`. Nothing transitions `width`, `height`, or
`top`.

One authored entrance: `.settle` fades and lifts content 8px on load, staggered
by `--i` at 55ms. It uses `animation-fill-mode: backwards`, so **content is
visible by default and a failed animation can never hide a record.**

Hover lifts are 1px (`.slot`, `.chip`); active states drop 1px (`.btn`). The
history accordion opens with `unfold` (320ms).

Under `prefers-reduced-motion: reduce`, all animations and transitions collapse
to 0.01ms globally.

## 10. Responsive

Breakpoints are per-component, chosen where each layout actually breaks, rather
than a single device ladder:

| Width | What changes |
|---|---|
| ≤1000px | Home hero → one column; record un-sticks |
| ≤940px | `.split` / `.splitWide` → one column; aside un-sticks |
| ≤900px | Nav → burger; role switch moves into the panel |
| ≤760px | Doctor schedule rows → two columns, trail wraps full-width |
| ≤700px | Doctor list rows, history entry button → stacked |
| ≤640px | Shell padding 24→16; form grid → 1-up; appointment rows stack; step numbers hide |
| ≤560px | `Bits` empty state tightens |

The day picker (`.days`) is a deliberate `overflow-x: auto` rail, not a break —
seven day cells at a 62px minimum will not fit 375px and should not be forced
to.

## 11. Accessibility rules that are load-bearing

These are constraints, not aspirations. Each one is currently satisfied.

1. **Status is never colour alone** — icon + word + hue (§4).
2. **Text contrast floor is 4.82:1**; `--ink-3` is the lightest permitted ink.
3. **Targets are ≥24×24** (WCAG 2.5.8). `.back` and `.link-more` carry an
   explicit `min-height: 24px` because 13px text alone does not reach it. The
   only sub-24px targets in the app are links inline in a sentence, which the
   success criterion exempts.
4. **Keyboard focus is always visible** — `:focus-visible` draws a 2px
   `--accent` outline at 2px offset. Pointer focus does not.
5. **A skip link** (`.skip-link`) precedes the nav and targets `#main`.
6. **One `h1` per page, no skipped heading levels.** Verified across all 19
   routes.
7. **Every form control has a label** — visible, or `.sr-only` where the
   context already names it (the booking reason textarea).
8. **`overflow-wrap: anywhere` is set on `body`** and is not decorative.
   Patient data is not typography-safe: an email address or a compound drug
   name is one unbreakable token. Without it, a single long word widens the
   layout viewport on a phone and zooms the entire page out.
9. **Icons are `aria-hidden`**; the adjacent text carries the meaning.

### Known gap

`--line-strong` (`#cfc9be`) is the boundary that identifies text inputs,
selects, secondary buttons, chips, slot and day cells. Against `--surface` it
measures **1.65:1**, below the 3:1 that WCAG 1.4.11 (Non-text Contrast) asks of
a control boundary. Because a field's fill (`#ffffff`) is nearly identical to
the page ground (`#faf9f7`), that border is the *only* thing marking the
control.

Recommended fix, one token: `--line-strong: #968a73` — 3.40:1 on `--surface`,
3.23:1 on `--paper`, 3.04:1 on `--surface-sunk`, same warm hue family. It
visibly weights every control in the app, which is why it is recorded here
rather than applied silently: it trades against the contract's "hairline rules"
commitment and wants a look before it lands.

`Auth.module.css .demoBox` uses `--line-strong` as a decorative divider; it
should move to `--line` when the token changes.

## 12. Content rules

From `PRODUCT.md`, binding on every screen:

- **Placeholder, never plausible.** All doctors, patients and records are
  invented and must read as invented. The Home record and the footer both say
  so on the page.
- **No manufactured evidence** — no testimonials, no "trusted by N clinics", no
  credentials or licence numbers, no accreditation badges, no star ratings, no
  usage statistics.
- **No photographs of people.** `Monogram` is the answer to every avatar slot.

## 13. Extending this

- New colour? There isn't one. Use `--accent`, an ink tier, or a status token.
- New elevation? Ask whether the thing sits above the page. If not, hairlines.
- New text tier lighter than `--ink-3`? No — it fails AA.
- New breakpoint? Put it where that component breaks, and add it to §10.
- Mono for something new? Only if it is a value being scanned, not read.
- New sub-24px interactive target? Only if it is inline in a sentence.
