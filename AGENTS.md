# AGENTS.md — N3xo App Context

## Overview

Single-page React app ("N3xo") that renders an interactive force-directed social graph. Users visualize people they've met over time, grouped by context (trabajo, universidad, amigos, etc.), connected by typed relations (amigo, colega, mentor, etc.). Everything persists to `localStorage` via Zustand.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Build | Vite | 8.0.0-beta.13 |
| UI | React | 19.2.0 |
| Graph | d3 (d3-force, d3-selection, d3-zoom) | 7.9.0 |
| State | Zustand (with `persist` middleware) | 5.0.11 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) | 4.1.18 |
| UI Components | Custom shadcn/ui-pattern (Radix primitives) | — |
| Animation | Framer Motion | 12.34.0 |
| Icons | Lucide React | 0.563.0 |
| Font | Inter (Google Fonts, loaded in `index.html`) | — |

Path alias: `@` → `./src/` (configured in `vite.config.js`).

---

## Project Structure

```
n3xo/
├── data/
│   └── graph-data.json          # Seed data (15 personas, 25 relaciones)
├── src/
│   ├── main.jsx                 # Entry — renders <App/> in #root
│   ├── index.css                # Tailwind v4 import + dark theme CSS vars (oklch)
│   ├── App.jsx                  # Root layout (Toolbar, SettingsPanel, Legend, ForceGraph, FilterBar, DetailPanel, FormModals)
│   ├── components/
│   │   ├── ErrorBoundary.jsx    # Catches React crashes, shows error + "Reiniciar" (clears localStorage)
│   │   ├── Legend.jsx           # Bottom-left floating legend (groups + relation types)
│   │   ├── graph/
│   │   │   └── ForceGraph.jsx   # Core d3-force SVG graph (simulation, zoom, drag, highlight)
│   │   ├── toolbar/
│   │   │   └── Toolbar.jsx      # Top-center toolbar (view modes, add dropdown, export/import dropdown)
│   │   ├── panels/
│   │   │   ├── DetailPanel.jsx  # Right slide-in panel (person/relation details, edit/delete actions)
│   │   │   ├── FormModals.jsx   # Dialog modals for add/edit person & relation
│   │   │   └── SettingsPanel.jsx# Top-right settings gear (CRUD for groups & relation types)
│   │   ├── filters/
│   │   │   └── FilterBar.jsx    # Bottom-center filter bar (search, date slider, group/type badges)
│   │   └── ui/                  # shadcn/ui-style primitives (badge, button, dialog, input, label, select, separator, slider, toggle-group, tooltip)
│   ├── store/
│   │   └── useGraphStore.js     # Zustand store — ALL app state + CRUD + filters + custom groups/types
│   └── lib/
│       ├── colors.js            # DEFAULT_GROUPS, DEFAULT_RELATION_TYPES, getGroupColor(), getRelationStyle(), getInitials(), COLOR_PALETTE
│       ├── date-utils.js        # dateToValue, valueToDate, formatMonthYear, getDateRange, isDateInRange
│       ├── export.js            # exportSVG, exportPNG, exportJSON, importJSON
│       └── utils.js             # cn() — clsx + tailwind-merge
├── vite.config.js
├── package.json
└── index.html
```

---

## Data Model

### Person (`graph-data.json → persons[]`)

```json
{
  "id": "p1",
  "name": "string",
  "group": "trabajo|universidad|evento|amigos|familia|online|comunidad|yo|otro",
  "metAt": "YYYY-MM-DD",
  "metContext": "string (hidden for group 'yo')",
  "tags": ["string"],
  "notes": "string",
  "avatar": "url (optional)"
}
```

### Relation (`graph-data.json → relations[]`)

```json
{
  "id": "r1",
  "source": "person-id",
  "target": "person-id",
  "type": "amigo|colega|mentor|conocido|compañero|vecino|familiar|otro",
  "strength": 1-5,
  "since": "YYYY-MM-DD",
  "notes": "string"
}
```

---

## Zustand Store (`useGraphStore.js`)

**Persisted to `localStorage` key `n3xo-storage`** (partialize: `persons`, `relations`, `config`, `customGroups`, `customRelationTypes`).

### State Shape

- `persons[]`, `relations[]`, `config` — data
- `customGroups {}`, `customRelationTypes {}` — dynamic, editable from SettingsPanel
- `filters { dateRange, groups[], relationTypes[], searchQuery }` — not persisted
- `viewMode` — `'color'` | `'clusters'` | `'combined'`
- `selectedNode`, `selectedEdge`, `detailPanelOpen` — selection UI
- `formModal`, `editingItem` — form modal state

### Key Constraints

- **"Yo" group**: Only ONE person can have `group: 'yo'`. Enforced in `addPerson` and `updatePerson`.
- **Protected groups**: `'yo'` and `'otro'` cannot be deleted. Deleting other groups reassigns persons to `'otro'`.
- **Protected relation type**: `'otro'` cannot be deleted. Deleting other types reassigns relations to `'otro'`.

---

## Key Components Detail

### ForceGraph.jsx
- Uses `useRef` pattern to isolate d3 DOM manipulation from React.
- Subscribes to `customGroups` and `customRelationTypes` from store, passes them to `getGroupColor()` / `getRelationStyle()`.
- **Highlight system**: `applyHighlight(nodeId)` dims unrelated nodes/edges. `applyEdgeHighlight(edgeId)` dims everything except the 2 connected nodes + that edge. `clearHighlight()` restores. Applied on hover AND on selection.
- Separate `useEffect` for `[selectedNode, selectedEdge]` to apply/clear highlight on selection changes.
- Stores d3 selections in refs: `nodeGroupRef`, `edgeSelectionRef`, `edgeLabelSelectionRef`, `linksDataRef`.
- `mouseleave` on nodes restores selection highlight if a node/edge is currently selected.

### Toolbar.jsx
- Single "Añadir" button with dropdown (Persona / Relación) — same pattern as Export dropdown.
- Both dropdowns close on click-outside (via `useEffect` + `mousedown` + ref).
- Green emerald-styled add button.

### DetailPanel.jsx
- Slide-in from right with Framer Motion.
- Shows person or relation details.
- Has "Añadir conexión" button when viewing a person (opens addRelation with prefilledSource).
- Adapts labels for 'yo' group: "Nacimiento" instead of "Conocido", hides metContext.

### FormModals.jsx
- `PersonForm`: uses store `customGroups` for group select. Hides 'yo' from select if already taken by another person. Conditional "Fecha de nacimiento" vs "Fecha conocido" label. Hides metContext for 'yo'.
- `RelationForm`: uses store `customRelationTypes` for type select. Supports `editingItem.prefilledSource`.

### SettingsPanel.jsx
- Gear icon top-right → expands to scrollable panel.
- Inline editing: color picker + label input per group/type.
- Add new groups/types. Delete with protections.
- COLOR_PALETTE used for new item defaults.

### FilterBar.jsx
- Search, date range slider, group + relation type badge toggles.
- Uses `customGroups` and `customRelationTypes` from store.
- `filteredData` via `useMemo` calling `getFilteredData()`.

---

## Styling Notes

- Dark theme only: `<html class="dark">` + oklch CSS variables in `index.css`.
- All UI is absolute-positioned overlays on top of the graph SVG.
- Green emerald accent for action buttons (`text-emerald-400`, `hover:text-emerald-300`, `hover:bg-emerald-500/15`).
- `bg-card/80 backdrop-blur-xl` for all floating panels.

---

## Known Patterns / Gotchas

1. **Infinite re-render risk**: Never call `getFilteredData()` inside a Zustand selector. Always use `useMemo` with explicit deps + `useGraphStore.getState()`.
2. **Vite 8 beta**: Uses OXC transformer — parse errors show as `vite:oxc` Plugin errors.
3. **localStorage stale data**: When adding new persisted fields to the store, Zustand's persist merge handles missing keys by using store defaults. No manual migration needed for new fields.
4. **d3 + React isolation**: ForceGraph uses `useRef` for the SVG container and all d3 selections. React only controls mount/unmount; d3 owns the DOM inside the SVG.
5. **Duplicate JSX tags**: Previous bugs caused by accidentally duplicating `<Badge` or `}));` during edits — always verify parse after editing JSX.

---

## Dev Commands

```bash
npm run dev      # Start Vite dev server (HMR)
npm run build    # Production build
npm run preview  # Preview production build
```
