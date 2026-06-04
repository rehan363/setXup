# UI/UX Design Plan: Enterprise Task Management Platform

> **Design Philosophy**: Notion-inspired minimalism meets ClickUp's power. Every element earns its place. Clean, breathable, and professional.

---

## 1. Design Principles

| Principle | Description |
|-----------|-------------|
| **Content First** | The UI disappears — only the work is visible |
| **Zero Noise** | No decorative elements. Every pixel serves a function |
| **Breathable Whitespace** | Generous spacing creates calm and clarity |
| **Progressive Disclosure** | Show simple by default, reveal complexity on demand |
| **Micro-interactions** | Subtle animations signal state changes without distraction |
| **Consistent Rhythm** | 4px base grid, 8px increments throughout |

---

## 2. Design Tokens (Design System Foundation)

### 2.1 Color Palette

#### Light Mode
```css
/* Backgrounds */
--bg-primary:    #FFFFFF;      /* Main canvas */
--bg-secondary:  #F7F7F5;      /* Sidebar, panels */
--bg-tertiary:   #EFEEEC;      /* Hover states, cards */
--bg-elevated:   #FFFFFF;      /* Modals, dropdowns */

/* Text */
--text-primary:  #1A1A1A;      /* Main content */
--text-secondary: #6B6B6B;     /* Supporting labels, metadata */
--text-tertiary:  #9B9B9B;     /* Placeholders, disabled */
--text-inverse:   #FFFFFF;     /* On dark backgrounds */

/* Borders */
--border-subtle:  #E8E8E6;     /* Dividers, card outlines */
--border-default: #D4D4D2;     /* Input fields */
--border-strong:  #B0B0AE;     /* Active/focused states */

/* Accent (Single strategic color) */
--accent-primary:  #6C47FF;    /* Primary CTAs, active items */
--accent-hover:    #5A38E8;    /* Hover state */
--accent-light:    #F0ECFF;    /* Accent background wash */

/* Priority Colors */
--priority-urgent: #F44336;
--priority-high:   #FF7043;
--priority-medium: #FFB300;
--priority-low:    #42A5F5;
--priority-none:   #9E9E9E;

/* Status Semantic Colors */
--status-todo:       #9E9E9E;
--status-inprogress: #42A5F5;
--status-review:     #AB47BC;
--status-done:       #66BB6A;
```

#### Dark Mode
```css
--bg-primary:     #191919;
--bg-secondary:   #212121;
--bg-tertiary:    #2A2A2A;
--bg-elevated:    #2D2D2D;

--text-primary:   #E8E8E8;
--text-secondary: #9B9B9B;
--text-tertiary:  #6B6B6B;

--border-subtle:  #2E2E2E;
--border-default: #3A3A3A;
--border-strong:  #525252;

--accent-primary: #7C5CFF;
--accent-light:   #2A2040;
```

### 2.2 Typography

```css
/* Font Stack */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Type Scale */
--text-xs:   11px / 1.4;   /* Timestamps, badges */
--text-sm:   13px / 1.5;   /* Secondary labels, metadata */
--text-base: 14px / 1.6;   /* Body text, task titles */
--text-md:   16px / 1.5;   /* Section headings */
--text-lg:   20px / 1.4;   /* Page headings */
--text-xl:   24px / 1.3;   /* Dashboard numbers */
--text-2xl:  32px / 1.2;   /* Hero numbers */

/* Font Weights */
--fw-normal:   400;
--fw-medium:   500;
--fw-semibold: 600;
--fw-bold:     700;
```

### 2.3 Spacing (4px base grid)

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### 2.4 Border Radius

```css
--radius-sm:  4px;   /* Badges, chips */
--radius-md:  6px;   /* Buttons, inputs */
--radius-lg:  8px;   /* Cards, panels */
--radius-xl:  12px;  /* Modals */
--radius-full: 9999px; /* Pills, avatars */
```

### 2.5 Shadows

```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.05);
--shadow-md:  0 2px 8px rgba(0,0,0,0.08);
--shadow-lg:  0 8px 24px rgba(0,0,0,0.12);
--shadow-xl:  0 16px 48px rgba(0,0,0,0.16);
```

---

## 3. Layout Architecture

### 3.1 Global Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR (240px)           │  MAIN CONTENT AREA (flex: 1)       │
│                            │                                     │
│  [Logo + Org Switcher]     │  [Topbar: Breadcrumb + Actions]    │
│  ────────────────────      │  ──────────────────────────────    │
│  [Search]                  │                                     │
│  [Favorites]               │  [View Toggle: Board|List|Calendar] │
│  ────────────────────      │                                     │
│  MY SPACES                 │                                     │
│    ◆ Engineering           │  [ACTIVE VIEW CONTENT]             │
│      › Sprint Board        │                                     │
│      › Bug Tracker         │                                     │
│    ◆ Marketing             │                                     │
│      › Campaigns           │                                     │
│    ◆ Operations            │                                     │
│  ────────────────────      │                                     │
│  [+ New Space]             │                                     │
│  ────────────────────      │                                     │
│  [Settings]                │                                     │
│  [Members]                 │                                     │
│  [User Avatar + Name]      │                                     │
└─────────────────────────────────────────────────────────────────┘
```

**Sidebar Specs:**
- Width: 240px (collapsed: 56px icon-only mode)
- Background: `--bg-secondary`
- No visible borders — shadow separates from content
- Active item: `--accent-light` background + `--accent-primary` text + left border accent (3px)
- Hover item: `--bg-tertiary` background
- Smooth transition: `0.15s ease`

### 3.2 Topbar

```
┌────────────────────────────────────────────────────────────┐
│  Engineering > Sprint Board    [Filter] [Sort] [+ New Task] │
└────────────────────────────────────────────────────────────┘
```

- Height: 52px
- Background: `--bg-primary` with bottom border `--border-subtle`
- Breadcrumb: Org > Space > List (clickable, text-secondary)
- Action buttons right-aligned: Filter, Sort, Group by, View toggle

### 3.3 View Toggle Strip (below Topbar)

```
[ Board ] [ List ] [ Calendar ] [ Dashboard ]
```

- Tabs style, not buttons
- Active tab: `--text-primary` + 2px bottom border `--accent-primary`
- Inactive: `--text-secondary`
- Height: 40px
- Left-aligned, flush with content

---

## 4. Page Designs

### 4.1 Dashboard Page

```
┌── DASHBOARD ─────────────────────────────────────────────────┐
│                                                               │
│  Good morning, Rehan 👋    [Today's Date]                    │
│                                                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Total  │  │ Active  │  │ Overdue │  │  Done   │        │
│  │   48    │  │   12    │  │    3    │  │   33    │        │
│  │  tasks  │  │ in prog │  │ past due│  │ complete│        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                               │
│  ┌─── My Tasks (8) ──────────────┐  ┌── Activity Feed ───┐  │
│  │ ○ Design homepage hero        │  │ You closed task #4 │  │
│  │ ○ Review PR #23               │  │ Ali assigned task  │  │
│  │ ○ Write Q2 report             │  │ New comment on #7  │  │
│  │   + 5 more                    │  │   ...              │  │
│  └───────────────────────────────┘  └────────────────────┘  │
│                                                               │
│  ┌─── Team Workload ─────────────┐  ┌── Upcoming (7d) ───┐  │
│  │ Ali       [████░░] 8 tasks    │  │ May 18 — PR Review │  │
│  │ Sara      [███░░░] 6 tasks    │  │ May 19 — Launch    │  │
│  │ Omar      [██░░░░] 4 tasks    │  │ May 21 — Report    │  │
│  └───────────────────────────────┘  └────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Stat cards: `--bg-secondary` background, `--shadow-sm`, large number in `--text-2xl` bold, label in `--text-sm --text-secondary`
- Cards in 2-column grid on desktop, 1-column on mobile
- Activity feed: chronological list with user avatar, action description, relative timestamp
- Workload: custom bar using CSS, not a heavy chart library

---

### 4.2 Board View (Kanban)

```
┌── IN SPRINT · 24 tasks ─────────────────────────────────────┐
│                                                               │
│  [ TO DO (8) ]     [ IN PROGRESS (6) ]    [ REVIEW (4) ]    │
│  ┌───────────┐     ┌───────────┐           ┌───────────┐    │
│  │ ○ Fix nav │     │ ● Hero UI │           │ ▶ PR #23  │    │
│  │   Ali  !  │     │   Sara 🔴 │           │   Omar    │    │
│  │   May 20  │     │   Due now │           │   May 22  │    │
│  └───────────┘     └───────────┘           └───────────┘    │
│  ┌───────────┐     ┌───────────┐                            │
│  │ ○ API doc │     │ ● Tests   │                            │
│  │   Omar    │     │   Ali     │                            │
│  └───────────┘     └───────────┘                            │
│  [+ Add task]       [+ Add task]           [+ Add task]     │
└───────────────────────────────────────────────────────────────┘
```

**Task Card Specs:**
- Width: 260px, min-height: 80px
- Background: `--bg-primary` (light) / `--bg-elevated` (dark)
- Border: 1px `--border-subtle` + `--shadow-sm`
- Priority indicator: colored left border (4px)
- Hover: `--shadow-md` + slight Y translate (-1px)
- Assignee: circular avatar (24px), right-bottom
- Dragging: `--shadow-xl` + slight rotation (1.5deg)
- Column header: count badge, color dot matching status color

---

### 4.3 List View

```
┌── BACKLOG · 48 tasks ────────────────────────────────────────────────┐
│  [☐] Title                  Assignee  Priority  Due Date    Status   │
│  ──────────────────────────────────────────────────────────────────  │
│  [☐] Design homepage hero   [Ali]    🟠 High    May 20     In Prog  │
│  [☐] Fix nav dropdown       [Sara]   🔴 Urgent  May 18     To Do    │
│  [☐] Write API docs         [Omar]   🟡 Medium  May 25     To Do    │
│  [☑] Setup CI/CD            [Ali]    🔵 Low     May 15     Done     │
│  ──────────────────────────────────────────────────────────────────  │
│  [+ Add task]                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Row height: 40px
- Completed tasks: `--text-tertiary` + strikethrough
- Hover row: `--bg-secondary` background
- Checkbox: 16px, rounded corners, accent color when checked
- Inline editing on click
- Column headers: sortable with up/down arrow indicator
- Sticky header on scroll

---

### 4.4 Calendar View

```
┌── MAY 2026 ──────────────────────────────────────────────────┐
│  [ < ]  May 2026  [ > ]          [ Month | Week | Day ]      │
│                                                               │
│  Mon    Tue    Wed    Thu    Fri    Sat    Sun                │
│  ────   ────   ────   ────   ────   ────   ────              │
│   12     13     14     15     16     17     18               │
│                        [Hero   [API    
│                         UI]    Docs]                         │
│   19     20     21     22     23     24     25               │
│          [Fix   
│           Nav]                                               │
└───────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Today's date: accent background pill
- Task chips: color-coded by priority, truncated to fit cell
- Overdue tasks: red chip border
- Click task chip → task detail panel slides in from right
- Drag task to new date → instant date update
- Unscheduled drawer: collapsible right panel

---

### 4.5 Task Detail Panel (Slide-in)

Slides in from the right (width: 480px) without leaving the current view.

```
┌── TASK DETAIL ───────────────────────────────────────────────┐
│  [×]                                              [⋯ More]   │
│                                                               │
│  ● Fix navigation dropdown bug                               │
│  (click to edit title)                                       │
│                                                               │
│  Status:    [ In Progress ▼ ]                                │
│  Priority:  [ 🔴 Urgent ▼ ]                                  │
│  Assignee:  [ Ali ▼ ] [ + Add ]                              │
│  Due Date:  [ May 18, 2026 ]                                 │
│  Tags:      [ bug ] [ frontend ] [ + ]                       │
│                                                               │
│  ─── Description ─────────────────────────────────────────  │
│  The nav dropdown breaks on mobile viewports under 375px...  │
│                                                               │
│  ─── Subtasks (2/4) ──────────────────────────────────────  │
│  [✓] Identify breakpoint                                     │
│  [✓] Write failing test                                      │
│  [ ] Fix CSS media query                                     │
│  [ ] Verify on device                                        │
│  [+ Add subtask]                                             │
│                                                               │
│  ─── Activity ─────────────────────────────────────────────  │
│  [Ali] changed status: To Do → In Progress   2h ago         │
│  [Sara] added comment: "Can reproduce on iPhone 12"  3h ago │
│                                                               │
│  ─── Comments ─────────────────────────────────────────────  │
│  [Ali avatar] Can reproduce on iPhone 12                     │
│               [Reply]  [👍]                                  │
│                                                               │
│  [ Type a comment... @ to mention ]  [Send]                  │
└───────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Width: 480px, slides from right with `transform: translateX` + `0.2s ease`
- Background: `--bg-primary` with `--shadow-xl` on left edge
- Scrollable content with fixed header (title + close) and footer (comment box)
- Status/priority dropdowns: floating menus with custom styled options
- Each activity item: user avatar (24px) + action text + timestamp

---

### 4.6 Sidebar Navigation Detail

```
┌─────────────────────────────────┐
│  ◆ WorkFlow          [↕] [···]  │  ← Org switcher
│  ─────────────────────────────  │
│  🔍 Search...           ⌘K      │
│  ─────────────────────────────  │
│  📊 Dashboard                   │
│  📋 My Tasks              (8)   │
│  ─────────────────────────────  │
│  SPACES                         │
│  ▾ ⚡ Engineering               │
│      ├ Sprint Board             │  ← Active (accent bg)
│      ├ Bug Tracker              │
│      └ Roadmap                  │
│  ▸ 📣 Marketing                 │
│  ▸ 🏢 Operations                │
│  ─────────────────────────────  │
│  [+ New Space]                  │
│  ─────────────────────────────  │
│  ⚙ Settings                    │
│  ─────────────────────────────  │
│  [Avatar] Rehan Khan            │
└─────────────────────────────────┘
```

**Design Notes:**
- Section labels: 11px, all-caps, `--text-tertiary`, letter-spacing 0.08em
- Space icons: emoji or custom icon, 18px
- Expand/collapse chevron: rotates 90deg on expand with `0.15s ease`
- Active list item: `--accent-light` bg, `--accent-primary` text, 3px left border
- "New Space" button: dashed border, `--text-tertiary`, hover → `--text-secondary`
- Count badges: 18px pill, `--bg-tertiary`, `--text-secondary`, `--text-xs`

---

## 5. Component Library

### 5.1 Buttons

```
Primary:   [bg: accent]  [text: white]  [radius: md]  [pad: 8px 16px]
Secondary: [bg: tertiary] [text: primary] [border: subtle]
Ghost:     [bg: none]    [text: secondary] [hover: tertiary bg]
Danger:    [bg: #FEE2E2] [text: #DC2626]  [hover: #DC2626 bg]
Icon-only: [bg: none]    [icon: 16px]    [hover: tertiary bg]  [size: 32px]
```

### 5.2 Inputs

```css
/* Base input */
height: 36px;
background: var(--bg-primary);
border: 1px solid var(--border-default);
border-radius: var(--radius-md);
padding: 0 12px;
font-size: var(--text-base);
color: var(--text-primary);

/* Focus */
border-color: var(--accent-primary);
box-shadow: 0 0 0 3px var(--accent-light);
outline: none;
```

### 5.3 Priority Badge

```
[🔴] Urgent  → red bg (#FEE2E2), red text (#DC2626)
[🟠] High    → orange bg (#FFF3E0), orange text (#F57C00)
[🟡] Medium  → yellow bg (#FFFDE7), yellow text (#F9A825)
[🔵] Low     → blue bg (#E3F2FD), blue text (#1976D2)
[—]  None    → gray bg (#F5F5F5), gray text (#757575)

Size: height 20px, padding 4px 8px, border-radius: full, text-xs font-medium
```

### 5.4 Status Badge

```
Color dot (8px circle) + status name
Background: status color at 12% opacity
Text: status color at full opacity
```

### 5.5 Avatar

```
Sizes: 20px / 24px / 32px / 40px
Shape: circle (border-radius: full)
Fallback: initials on gradient background
Stacked group: -8px margin-left overlap
```

### 5.6 Tag Chip

```
height: 20px, padding: 2px 8px, border-radius: full
background: tag color at 15% opacity
text: tag color, text-xs, font-medium
```

### 5.7 Modal

```
Backdrop: rgba(0,0,0,0.4) blur(2px)
Panel: --bg-elevated, --shadow-xl, --radius-xl
Max width: 480px (small), 640px (medium), 800px (large)
Animation: scale(0.96) → scale(1) + opacity 0→1, 0.15s ease
```

### 5.8 Toast Notifications

```
Position: bottom-right, 16px margin
Width: 320px, --shadow-lg, --radius-lg
Types: success (green), error (red), warning (yellow), info (blue)
Auto-dismiss: 4s, with progress bar
Hover to pause dismiss
Animation: slide in from right
```

---

## 6. Motion & Animation

| Interaction | Animation |
|-------------|-----------|
| Page transition | Fade in `opacity 0→1, 0.1s` |
| Sidebar expand | `height: auto, 0.15s ease` |
| Task card drag | `scale(1.02) + shadow-xl` |
| Detail panel open | `translateX(100%) → 0, 0.2s ease-out` |
| Modal open | `scale(0.96) → 1, 0.15s ease` |
| Checkbox complete | checkmark draw SVG `stroke-dashoffset` |
| Status change | color morph `0.2s ease` |
| Toast appear | `translateX(100%) → 0, 0.25s ease` |
| Hover lift | `translateY(0) → -1px, 0.1s ease` |
| Skeleton loader | shimmer gradient `1.5s infinite` |

**Rule**: No animation over 300ms. All transitions `ease` or `ease-out`. Never `linear` for UI.

---

## 7. Responsive Design

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 768px | Sidebar hidden (drawer), single column, bottom nav |
| Tablet | 768–1024px | Sidebar icon-only (56px), 2-col dashboard |
| Desktop | > 1024px | Full sidebar (240px), multi-column layouts |
| Wide | > 1440px | Max content width 1400px, centered |

### Mobile Adaptations
- Board view: horizontal scroll columns or stacked accordion
- Task detail: full-screen bottom sheet
- Calendar: week view default (month on request)
- Bottom navigation bar: Dashboard | Tasks | Calendar | Spaces

---

## 8. Empty States

Each empty state: illustration (SVG, minimal line art) + heading + subtext + CTA button.

| State | Heading | CTA |
|-------|---------|-----|
| No tasks in list | "Nothing here yet" | "Create your first task" |
| No spaces | "Your workspace is empty" | "Create a Space" |
| No search results | "No matches found" | "Clear filters" |
| Dashboard new user | "Welcome to WorkFlow" | "Create a Space" |

---

## 9. Loading States

- **Skeleton screens**: gray shimmer blocks matching content shape — never spinners for page loads
- **Inline loading**: small spinner (16px) inside buttons/actions
- **Optimistic UI**: task updates reflected instantly; rollback silently on error

---

## 10. Accessibility

- All colors meet WCAG AA contrast ratio (4.5:1 minimum)
- Focus rings: 3px offset, `--accent-primary` color
- All interactive elements keyboard navigable
- ARIA labels on icon-only buttons
- `prefers-reduced-motion`: disable all non-essential animations

---

## 11. Implementation Order (UI Priority)

### Phase 1 (Foundation)
1. Design tokens CSS file (`tokens.css`)
2. Sidebar navigation component
3. Topbar with breadcrumbs
4. View toggle strip
5. Button, Input, Badge components

### Phase 2 (Core Views)
6. Board View (Kanban columns + cards)
7. List View (table rows + inline edit)
8. Task Detail panel (slide-in)
9. Task creation modal

### Phase 3 (Dashboard & Polish)
10. Dashboard stat cards + activity feed
11. Calendar view
12. Empty states & loading skeletons
13. Toast notifications
14. Responsive mobile layout

---

*Last updated: 2026-05-17 | Inspired by: Notion, Linear, Craft*
