# CO5MO Professional UI Enhancement Prompt
## Send this to Gemini, Claude, or your AI assistant

---

## Executive Brief

You are redesigning the UI of **CO5MO**, a clinical decision-support web application for nurses at Ormoc District Hospital's Operating Room and Delivery Room unit. The application currently has functional components but lacks visual polish, professional hierarchy, and cohesive design language.

**Constraint:** Do NOT modify business logic, data flows, hooks, API calls, or TypeScript types. This is purely a visual/UI enhancement pass. All React functionality must remain intact.

**Tech Stack:** Next.js 14 (App Router) · Tailwind CSS · Framer Motion · Lucide React · Plus Jakarta Sans

---

## Current State Assessment

### What Works
- Clean component structure (Button, Card, Tag, Stamp primitives exist)
- Responsive grid layouts on most pages
- Functional alerts and notifications
- Auth flow in place
- Patient cards with clinical flags

### What Needs Fixing (Visual Only)
1. **Inconsistent spacing** — padding/margin varies wildly across cards and sections
2. **Flat, lifeless cards** — no elevation hierarchy; everything feels dated
3. **Poor typography hierarchy** — headings don't visually lead the eye
4. **Muted color scheme** — grays and faint pastels; clinical urgency is invisible
5. **Boring badges/tags** — clinical flags blend together; no visual distinction by severity
6. **Dead sidebar** — navigation lacks personality; active states aren't bold enough
7. **Weak form styling** — inputs and labels feel generic
8. **No visual breathing room** — sections feel cramped
9. **Empty states are invisible** — "no data" states don't communicate clearly
10. **Mobile layout awkward** — responsive breakpoints don't feel intentional

---

## Design Vision: "Refined Clinical Warmth"

Target: A premium hospital app UI — not cold/sterile (no dark blues), but warm, composed, and serious. Nurses use this under stress; the UI must communicate calm authority and confidence.

### Visual Signature
- **Warm, rose-tinted palette** — soft pinks and warm stone neutrals
- **Layered depth** — cards with genuine shadows and raised/floating variants
- **Clear typography hierarchy** — bold headings, tight body text, distinct label styles
- **Clinical flags as wristbands** — colored badges that feel medical and urgent
- **Dark sidebar with gradients** — premium medical dashboard aesthetic
- **Micro-motion on interaction** — no snappy jumps; everything eases smoothly

---

## Design Token System

### Color Palette (Use These Everywhere)

```
PINKS (Primary Clinical Brand)
--pink-50: #FFF0F6
--pink-100: #FFE1EE
--pink-200: #FFC2D9
--pink-300: #FF94BB
--pink-400: #FF5C96
--pink-500: #F03B7A
--pink-600: #D4215E (Main brand color)
--pink-700: #B01A4D
--pink-800: #8C1540
--pink-900: #5C0D2A

WARM NEUTRALS (Background & Text)
--stone-50: #FAFAF8
--stone-100: #F5F4F0
--stone-200: #E8E6E1
--stone-300: #D4D0C8
--stone-500: #8A8478
--stone-700: #44403A
--stone-900: #1C1917

SEMANTIC BACKGROUNDS (Layered)
--bg-page: #FDF8FA (outermost—faint rose tint)
--bg-surface: #FFFFFF (card base)
--bg-raised: #FFFBFD (nested cards/inputs)
--bg-sunken: #FFF5F9 (inset areas)

BORDERS (Delicate but Intentional)
--border-faint: #F5E6EE (cards on page bg)
--border-light: #EDD0E0 (cards on surface)
--border-medium: #D4A8C0 (emphasized)
--border-strong: #B01A4D (focus/active)

TEXT (High Contrast in Warm Tones)
--text-display: #1A0810 (headings—nearly black)
--text-primary: #2D1020 (body text)
--text-secondary: #6B3A52 (secondary info)
--text-muted: #A87090 (hints/labels)
--text-faint: #C8A0B8 (disabled/placeholder)

SEMANTIC STATUS COLORS
Critical:  bg=#FFF0F4  text=#C8163A  border=#F5C0CF  dot=#E83058
Moderate: bg=#FFFBEB  text=#B45309  border=#FDE68A  dot=#D97706
Stable:   bg=#F0FDF4  text=#166534  border=#BBF7D0  dot=#22C55E
Info:     bg=#EFF6FF  text=#1D4ED8  border=#BFDBFE  dot=#3B82F6

SHADOWS (Warm-Tinted Elevation)
--shadow-xs: 0 1px 2px rgba(176, 26, 77, 0.06)
--shadow-sm: 0 2px 6px rgba(176, 26, 77, 0.08), 0 1px 2px rgba(176, 26, 77, 0.06)
--shadow-md: 0 4px 16px rgba(176, 26, 77, 0.10), 0 2px 4px rgba(176, 26, 77, 0.06)
--shadow-lg: 0 8px 32px rgba(176, 26, 77, 0.12), 0 4px 8px rgba(176, 26, 77, 0.08)
--shadow-xl: 0 20px 60px rgba(176, 26, 77, 0.16), 0 8px 20px rgba(176, 26, 77, 0.10)

MOTION
--ease-out: cubic-bezier(0.16, 1, 0.3, 1)
--duration-base: 200ms
--duration-fast: 120ms
```

---

## Component Specifications

### Buttons
- **Primary:** Solid critical pink, white text, subtle shimmer on hover, shadow elevation
- **Secondary:** Light bg, border, hover fills slightly
- **Ghost:** Transparent, text only, hover background
- **Danger:** Critical red bg/border, hover inverts (red bg with white text)
- **Success:** Green bg/border, hover inverts
- **Sizes:** sm (small form buttons) · md (default) · lg (hero actions) · icon (square)
- **All buttons:** Font weight 600, smooth transitions, active scale-down (0.97)

### Cards
- **Flat:** No shadow, basic border, for lightweight containers
- **Raised (default):** Subtle shadow, used for most patient cards and sections
- **Floating:** Deep shadow, for modals and prediction panels
- **Hoverable variant:** Lift on hover with shadow increase
- **Padding standard:** p-5, rounded corners match radius tokens

### Clinical Flag Tags/Badges
Design as **medical wristbands** — bold, colored pills with dot indicators:

```
Pre-eclampsia, Fetal distress → bg:#FFF0F4 text:#C8163A border:#F5C0CF dot:#E83058
Cord prolapse (CRITICAL) → bg:#2D0010 text:#FFB3CC border:#7A0035 dot:#FF3D7A (dark mode)
GDM, Meconium, PROM → bg:#FFFBEB text:#B45309 border:#FDE68A dot:#D97706
Post-term, VBAC → bg:#F0FDF4 text:#166534 border:#BBF7D0 dot:#22C55E

Format: 
- Height: 24–28px
- Padding: px-2.5
- Border: 1px solid [color]
- Border-radius: fully rounded (9999px)
- Font: 11px uppercase bold tracking-wide
- Left dot: 6px colored circle
- Animation on appearance: scale 0.8→1 + fade
```

### Stamp Component (Auto-Timestamp Lockbox)
- Inline pill shape: bg-sunken border-faint rounded-md px-4 py-2.5
- Left icon: LockKeyhole (14px, muted color)
- Label: "AUTO-CAPTURED ARRIVAL TIME" (9px uppercase tracking-wide, faint text)
- Time: Large monospace font (14px bold), formatted "May 17, 2026 · 08:42:31 AM"
- Right indicator: Small green dot with subtle glow
- Purpose: Show server-captured timestamp without manual input

---

## Page-by-Page Visual Improvements

### 1. Authentication Page (`/auth`)
- **Layout:** Desktop two-panel (left branding, right form) · mobile single column
- **Left panel:** Dark gradient bg (linear-gradient 135deg #1A0810→#5C0D2A→#8C1540) with diagonal stripe pattern overlay (opacity 4%)
  - Large "CO5MO" in white + italic pink "+"
  - 3 feature callouts with icons (timestamp, alerts, AI)
- **Right panel:** Centered form on page-bg, max-w-sm
  - "Welcome back" h2 + "Sign in to your account" subtitle
  - Email input with Mail icon prefix (left-aligned inside field)
  - Password input with Lock icon + Eye toggle
  - Primary button full-width
  - Error state: animated slide-down red callout card
  - Footer: demo credentials hint

### 2. Dashboard (`/dashboard`)
- **Header:** "Dashboard · Overview" h2 with right-aligned Stamp
- **Metrics row:** 4 raised cards (2×2 mobile) with icon + label + large number
  - Icons in small colored circles (pink-100, critical-bg, moderate-bg, stable-bg)
- **Patient sections:** Critical / Moderate / Stable (with colored left border + count badge + "Live" indicator)
  - Empty state: Stethoscope icon + "No [level] patients" + hint text
  - Patient cards: Left accent bar (4px, colored) + name bold + flags + last-assessed + action buttons
- **Search results:** Full-width empty state with SearchX icon

### 3. Intake Form (`/intake`)
- **Header:** "New Patient Registration" h2 + "OR/DR Unit" subtitle + Stamp on right
- **Triage toggle:** Pill-shaped button pair (Standard/Emergency), Emergency has Zap icon
- **Emergency banner:** Slides down when Emergency mode active—red-bg callout
- **Section headers:** Small uppercase text, border-bottom, icons (UserPlus, Stethoscope, etc.)
- **Form grid:** 4-col on desktop, full-width on mobile
- **Classification section:** bg-sunken inset background
- **Clinical flags:** Tap-to-select Tag components (ring on selected)
- **CDSS Hints section:** Slides in when flags are added—see CDSSHints spec below
- **Submit button:** Full-width primary "Register Patient"

### 4. Alerts Page (`/alerts`)
- **Tabs:** ER View / DR View (segmented pill toggle)
- **DR live indicator:** Full-width green-bg banner with live dot + "Live connection"
- **Alert cards (unacknowledged):**
  - Left border (4px critical pink)
  - Pulsing red dot top-right
  - Patient name bold + age small + gravida_para badge
  - Clinical flags as Tags
  - Destination highlighted
  - "Acknowledge ✓" button primary
- **Alert cards (acknowledged):** Fade to 60% opacity, stable-green badge with checkmark
- **Empty state:** CheckCircle icon + "All caught up" message

### 5. Patient Detail (`/patients/[id]`)
- **Header card:** Dark gradient (same as auth left panel) with patient name in white
  - gravida_para + flags + chief complaint in right inset box
  - Alert-level badge
- **Two-column layout:** 35% left (vitals info) / 65% right (monitoring form + timeline)
- **Left cards:** Baseline vitals detail list (label/value pairs)
- **Right cards:** Monitoring form (raised) + timeline with vertical connector line
  - Timeline dots colored by status (critical/normal)
  - Entries fade-in on new logs

### 6. Intervention Log (`/log`)
- **Header:** Icon + "Intervention Log" + Stamp
- **Metrics:** 3 small raised cards (Today count, Delayed count, Last log time)
- **Timeline:** Vertical line with dots, each entry a raised card with:
  - Action title bold
  - Patient + category badge
  - Time right-aligned
  - Delayed flag if applicable
  - Notes italic in light bg
  - Logged by text small
- **Form panel (right):** Sticky, shows patient selector + DelayedEntryForm

### 7. Trends Page (`/trends`)
- **Metrics row:** 4 cards (Cases analyzed, timestamp accuracy, alert fatigue, handoff time)
- **AI panel (left):** Raised card with patient selector + "Generate Prediction" button
- **Chart (left):** Horizontal bar chart with gradient bars (pink-200→pink-700)
- **Protocol library (right):** Expandable protocol cards with checkboxes, left color bar on expansion

### 8. CDSSHints Component
- **Container:** bg-pink-50 border-pink-200 rounded-lg with icon + "Protocol Reminders" title
- **Subtext:** "Rule-based · DOH Protocol · Available offline"
- **Per-flag section:**
  - Flag Tag + ChevronDown toggle
  - Expanded: numbered list of top 3 interventions
  - Animation: height 0→auto, smooth open/close
- **Footer disclaimer:** Small italic muted text

---

## Sidebar Redesign

- **Background:** Linear gradient 180deg (#1A0810 → #2D1020 60% → #1A0810 100%)
- **Border-right:** 1px white/10 (subtle)
- **Logo area:** 
  - "CO5MO" text white + italic "+" in pink-400
  - Below: "ODH Companion" small uppercase text, pink-300/60
  - Divider: 1px border white/10
- **Nav items:**
  - INACTIVE: text-white/50 · hover: bg-white/10 text-white/80
  - ACTIVE: left border-l-2 pink-500 · gradient bg · bold text-white · icon pink-400
- **User section (bottom):**
  - Avatar circle (pink-800 bg) with initials
  - Name white bold + role badge + "Live connection" text with animated dot
  - LogOut button icon-only, hover text-white/70

---

## TopBar Enhancements

- **Background:** bg-surface with shadow-xs
- **Left:** Page title h3 bold + breadcrumb small muted
- **Center:** Live clock pill (bg-sunken border-faint, with green dot + glow)
- **Right:**
  - Search input (full-width on mobile, fixed on desktop)
  - Alert bell (icon-only button, animates on unread, badge shows count)
  - Notification permission dot (green if granted, amber if pending, glow effect)
  - Profile pill (avatar + first name, visible on desktop)

---

## Global Styling Rules

### Spacing Hierarchy
- **Page padding:** p-4 md:p-6 (always this, no exceptions)
- **Card padding:** p-5 (internal content)
- **Gap between sections:** gap-6
- **Gap between items:** gap-4

### Typography Scale
- h1: 1.875rem · font-800 · tracking-[-0.03em]
- h2: 1.375rem · font-700 · tracking-[-0.02em]
- h3: 1.125rem · font-600 · tracking-[-0.01em]
- h4: 0.9375rem · font-600
- body: 0.875rem · font-400 · line-height-1.6
- label: 0.75rem · font-600 · uppercase · tracking-[0.06em]

### Border Radius (Tokens)
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- full: 9999px

### Transitions
- All interactive elements: transition-all duration-200 ease-out
- No instant changes; everything eases smoothly
- Active state: scale(0.97) on click
- Focus: box-shadow var(--focus-ring)

### Input Styling (Global)
- Background: bg-raised
- Border: 1.5px border-light
- Padding: px-3.5 py-2.5
- Border-radius: rounded-sm
- Focus: border-strong + focus-ring
- Placeholder: text-faint (uppercase labels above, not inside)

---

## Micro-Interactions

1. **Button hover:** Subtle lift + shadow increase (primary only)
2. **Button primary shimmer:** White overlay sweeps left-to-right (opacity 0→1→0)
3. **Card hover (if hoverable):** Lift -1px + shadow-md
4. **Tag appear:** Scale 0.8→1 + opacity 0→1 (100ms)
5. **Timeline entry appear:** Slide-down fade (y: 12→0, opacity: 0→1)
6. **Alert badge pulse:** Continuous animate-pulse on critical items
7. **Form error slide:** Slide-down from top + fade (y: -8→0)
8. **Modal overlay:** Fade-in 0→1, bg-overlay semi-transparent dark
9. **Sidebar active glow:** Pink left border acts as light source visually

---

## Consistency Checklist

Before approving any UI change:

- [ ] All cards use one of three variants (flat/raised/floating)
- [ ] No hardcoded colors; all use CSS variables (--pink-500, --text-primary, etc.)
- [ ] All buttons use Button component with variant prop
- [ ] All text aligns to typography scale (h1–h4, body, label)
- [ ] All shadows use shadow-* tokens (never box-shadow directly)
- [ ] All spacing multiples of 4px (p-3, p-4, p-5, gap-4, gap-6, mt-3, mt-4)
- [ ] Border radius consistent (rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-full)
- [ ] All borders use --border-* colors
- [ ] Hover states use transitions (not instant)
- [ ] Focus states show focus-ring
- [ ] Empty states have icon + text + optional subtext
- [ ] Forms have labels (uppercase, bold, 0.75rem)
- [ ] Lists and tables have clear row separation (border-b border-faint)
- [ ] All modals/overlays have bg-overlay
- [ ] Responsive breakpoints: mobile-first, then md: (768px), lg: (1024px)

---

## Final Deliverables

✅ Apply new design tokens to globals.css  
✅ Rebuild all UI component variants (Button, Card, Tag, Stamp)  
✅ Restyle Sidebar with gradient + glow active state  
✅ Restyle TopBar with polish and indicators  
✅ Restyle auth page into two-panel premium layout  
✅ Apply warm color palette to all pages  
✅ Enhance cards with proper elevation and hover states  
✅ Polish clinical flag tags into wristband-style badges  
✅ Add micro-motions and smooth transitions  
✅ Ensure all spacing is consistent and intentional  
✅ All visual changes only—no business logic modified  

**Target outcome:** A professional, warm, premium medical UI that communicates calm authority and clinical precision. Nurses should feel the app is serious, trustworthy, and built for their needs.

---

## Notes for AI Assistant

- When unsure about a specific style, refer to the design tokens section
- Maintain all existing functionality; this is cosmetic only
- Use Tailwind CSS utility classes + CSS variables for flexibility
- Include Framer Motion for page transitions and entrance animations
- Test on mobile (375px), tablet (768px), and desktop (1024px+)
- Preserve all onClick, onChange, form submission logic
- Do NOT rename components, props, or data structures

Good luck building a beautiful, professional CO5MO UI! 🏥✨
