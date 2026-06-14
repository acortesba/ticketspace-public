# 03. Design System — TicketSpace

> "Crystal clear glassmorphism" — Dark, minimal, premium.

---

## Design Philosophy

TicketSpace uses a **dark glassmorphism** design language:
- **No gradients** — solid colors with transparency
- **Frosted glass** — `backdrop-filter: blur(20px)` on panels
- **Subtle borders** — `rgba(255, 255, 255, 0.1)` borders create depth
- **100vh pages** — fixed viewport height, no body scroll, scroll only within content containers
- **Inter font** — Clean, professional, excellent readability

---

## Color Palette

### Base Colors
| Token | Value | Usage |
|:------|:------|:------|
| `--bg-primary` | `#0a0e17` | Page background |
| `--bg-secondary` | `#111827` | Card backgrounds, modals |
| `--bg-surface` | `rgba(255,255,255,0.03)` | Elevated surfaces |

### Glass Effects
| Token | Value | Usage |
|:------|:------|:------|
| `--glass-bg` | `rgba(255,255,255,0.06)` | Glass panel background |
| `--glass-bg-hover` | `rgba(255,255,255,0.1)` | Glass hover state |
| `--glass-border` | `rgba(255,255,255,0.1)` | Glass panel border |
| `--glass-border-focus` | `rgba(255,255,255,0.25)` | Input focus border |
| `--glass-blur` | `20px` | Backdrop blur radius |
| `--glass-shadow` | `0 8px 32px rgba(0,0,0,0.3)` | Glass drop shadow |

### Text
| Token | Value | Usage |
|:------|:------|:------|
| `--text-primary` | `#f1f5f9` | Headings, primary text |
| `--text-secondary` | `#94a3b8` | Body text, descriptions |
| `--text-muted` | `#64748b` | Labels, timestamps |
| `--text-inverse` | `#0f172a` | Text on light backgrounds |

### Accent
| Token | Value | Usage |
|:------|:------|:------|
| `--accent-primary` | `#3b82f6` | Primary buttons, links |
| `--accent-hover` | `#60a5fa` | Hover state |
| `--accent-subtle` | `rgba(59,130,246,0.15)` | Subtle highlights |

### Status Colors
| Status | Color | Background |
|:-------|:------|:-----------|
| Success | `#22c55e` | `rgba(34,197,94,0.1)` |
| Warning | `#f59e0b` | `rgba(245,158,11,0.1)` |
| Error | `#ef4444` | `rgba(239,68,68,0.1)` |
| Info | `#06b6d4` | `rgba(6,182,212,0.1)` |

---

## Typography

| Element | Font | Weight | Size |
|:--------|:-----|:-------|:-----|
| Headings | Inter | 600 (SemiBold) | Responsive |
| Body | Inter | 400 (Regular) | 14–16px |
| Small | Inter | 400 | 12–13px |
| Code/Mono | JetBrains Mono | 400 | 13px |

```css
--font-primary: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

---

## Spacing Scale

| Token | Value |
|:------|:------|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 32px |
| `--space-2xl` | 48px |

---

## Border Radius

| Token | Value | Usage |
|:------|:------|:------|
| `--radius-sm` | 8px | Inputs, small cards |
| `--radius-md` | 12px | Cards, panels |
| `--radius-lg` | 16px | Large panels, modals |
| `--radius-xl` | 24px | Hero elements |
| `--radius-full` | 9999px | Badges, pills, avatars |

---

## Transitions

| Token | Value |
|:------|:------|
| `--transition-fast` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--transition-normal` | `250ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--transition-slow` | `350ms cubic-bezier(0.4, 0, 0.2, 1)` |

---

## Core Components

### GlassCard
A container with frosted glass styling.

```jsx
<GlassCard className="p-6">
  <h3>Event Title</h3>
  <p>Event description</p>
</GlassCard>
```

CSS applied:
```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  transition: all var(--transition-normal);
}
```

### GlassButton
Styled button with multiple variants.

```jsx
<GlassButton variant="primary" size="md" isLoading={false}>
  Click Me
</GlassButton>
```

| Variant | Style |
|:--------|:------|
| `primary` | Solid blue (`bg-blue-600`), white text, blue glow shadow |
| `secondary` | Glass background, white text |
| `danger` | Solid red (`bg-red-600`), white text, red glow shadow |
| `ghost` | Transparent, subtle hover |

| Size | Padding |
|:-----|:--------|
| `sm` | `px-3 py-1.5 text-sm` |
| `md` | `px-4 py-2 text-sm` |
| `lg` | `px-6 py-3 text-base` |

### GlassInput
Styled input with label and error support.

```jsx
<GlassInput
  label="Email Address"
  name="email"
  type="email"
  error="Please enter a valid email"
  value={email}
  onChange={handleChange}
/>
```

States:
- **Default**: `bg-white/5`, `border-white/10`
- **Focus**: `ring-blue-500/50`, `border-blue-500/50`
- **Error**: `border-red-500/50`, `ring-red-500/50`

---

## Layout Patterns

### Page Container (100vh)
All pages are constrained to the viewport height:

```css
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;    /* Only this area scrolls */
  overflow-x: hidden;
  padding: var(--space-xl) 0;
}
```

### Navbar
- Fixed top (`position: fixed`, `z-index: 50`)
- Frosted glass background: `bg-[#0a0e17]/80 backdrop-blur-md`
- Border bottom: `border-white/10`
- Height: 64px (`h-16`)
- Responsive: hamburger menu on mobile

---

## Custom Scrollbar

```css
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

---

## Responsive Breakpoints

Using Tailwind defaults:
| Prefix | Min Width |
|:-------|:----------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |

---

## Toast Notifications

Non-intrusive toasts appear at the bottom-right corner with a colored left border indicating status.

```jsx
const { addToast } = useToast();
addToast('Profile updated successfully', 'success');
addToast('Something went wrong', 'error', 5000); // custom 5s duration
```

Toast types: `success` (green), `error` (red), `warning` (yellow), `info` (blue).
Default duration: 3000ms. Auto-dismiss with manual close button.
