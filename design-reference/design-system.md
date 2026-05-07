# Oculis — Design System

> Référence des tokens sémantiques définis dans `tailwind.config.ts`.
> Toutes les valeurs sont extraites des design tokens du fichier `design-tokens.json`.

---

## Couleurs sémantiques

### Brand

| Token | Hex | Usage prévu |
|---|---|---|
| `primary` | `#0A2540` | Titres, texte principal, éléments de marque navy |
| `primary-light` | `rgba(10,37,64,0.06)` | Fond de hover léger sur éléments navy |
| `primary-muted` | `rgba(10,37,64,0.4)` | Overlays semi-transparents, placeholders |
| `primary-strong` | `rgba(10,37,64,0.92)` | Fond de modals, overlays sombres |
| `secondary` | `#1D278B` | Boutons CTA principaux, liens actifs, focus rings |
| `secondary-alt` | `#1E3A8A` | Variante bouton (hover, état pressed) |
| `secondary-light` | `#EEEFFC` | Fond de badges "sélectionné", pills actives |
| `secondary-lighter` | `#EEF2FF` | Fond de sections mises en avant (indigo-50) |
| `accent` | `#F5A524` | Badges "Partial match", warnings, éléments d'attention |
| `accent-alt` | `#F59E0B` | Variante accent (icônes, bordures warning) |
| `accent-light` | `#FEF3C7` | Fond de badges warning, toasts |
| `accent-dark` | `#92400E` | Texte sur fond accent clair (contraste) |

### Neutrals

| Token | Hex | Usage prévu |
|---|---|---|
| `ink` | `#0A0A0A` | Corps de texte principal, labels, valeurs de formulaire |
| `muted` | `#64748B` | Texte secondaire, sous-titres, métadonnées, placeholders |
| `subtle` | `#475569` | Texte tertiaire, icônes inactives |
| `surface` | `#F4F6F9` | Fond de page, fond de sections grises |
| `border` | `#E2E8F0` | Bordures de cartes, séparateurs, dividers, texte très atténué |

### États sémantiques

| Token | Hex | Usage prévu |
|---|---|---|
| `success` | `#10B981` | Confirmations, "In stock", connexion réussie |
| `success-dark` | `#065F46` | Texte sur fond success clair |
| `success-light` | `#D1FAE5` | Fond de badges success, toasts positifs |

---

## Typographie

### Font families

| Token | Valeur | Usage |
|---|---|---|
| `font-sans` | Inter, system-ui… | Tout le texte UI (interface, boutons, labels) |
| `font-serif` | Times | Accents éditoriaux si besoin |
| `font-mono` | ui-monospace, SF Mono… | Code, données techniques (IPD, ratio) |

### Tailles de texte

| Token | Taille | Usage prévu |
|---|---|---|
| `text-2xs` | 9px | Annotations ultra-fines, mentions légales |
| `text-xs` | 10px | Labels uppercase de section (ex: "TOP MATCH", "VISAGES SIMILAIRES") |
| `text-sm` | 11px | Badges, pills, tags |
| `text-base-sm` | 12px | Métadonnées, dates, distances secondaires |
| `text-base` | 13px | Corps de texte UI standard, descriptions de cartes |
| `text-md` | 14px | Labels de formulaire, texte de boutons secondaires |
| `text-lg-sm` | 15px | Corps légèrement agrandi, sous-titres de section |
| `text-lg` | 16px | Texte de bouton principal, paragraphes |
| `text-lg-alt` | 17px | Sous-titres intermédiaires |
| `text-xl` | 18px | Titres de cartes, headings de section |
| `text-2xl` | 22px | Titres de pages secondaires |
| `text-3xl` | 24px | Titres de pages principales |
| `text-4xl` | 28px | Titres de modals larges |
| `text-5xl` | 30px | Grands titres marketing |
| `text-6xl` | 32px | Titres hero |
| `text-7xl` | 40px | Titres très grands |
| `text-display` | 64px | Score de confiance, chiffres clés (ex: "92%") |

---

## Ombres

| Token | Usage |
|---|---|
| `shadow-card` | Cartes au repos (élévation minimale) |
| `shadow-panel` | Panneaux flottants, dropdowns |
| `shadow-modal` | Modals, dialogs |
| `shadow-sheet` | Bottom sheets, drawers |
| `shadow-focus` | Ring de focus sur inputs et boutons |
| `shadow-button` | Bouton CTA primary au hover |
| `shadow-side` | Panneaux latéraux |

## Border radius

| Token | Valeur | Usage |
|---|---|---|
| `rounded-pill` | 999px | Badges, pills, tags, toggles |
| `rounded-card` | 20px | Cartes principales |
| `rounded-2xl` | 24px | Modals, sheets |
| `rounded-sheet` | 28px | Bottom sheets |
| `rounded-xl` | 12px | Inputs, boutons, cartes secondaires |
| `rounded-badge` | 8px | Petits badges rectangulaires |
| `rounded-tag` | 10px | Tags intermédiaires |
| `rounded-sm` | 6px | Éléments discrets (tooltips, micro-badges) |

---

## Combinaisons de référence

### Bouton CTA principal

```tsx
<button className="
  bg-secondary text-white
  px-6 py-3 rounded-xl
  text-lg font-semibold
  hover:bg-secondary-alt
  shadow-button
  transition-colors
">
  📷 Scanner mon visage
</button>
```

**Tokens utilisés :** `bg-secondary` · `text-white` · `rounded-xl` · `text-lg` · `shadow-button`

---

### Bouton outline secondaire

```tsx
<button className="
  border border-secondary text-secondary
  px-4 py-2 rounded-xl
  text-md font-medium
  hover:bg-secondary-light
  transition-colors
">
  Vous êtes opticien ?
</button>
```

**Tokens utilisés :** `border-secondary` · `text-secondary` · `bg-secondary-light` · `rounded-xl`

---

### Card opticien

```tsx
<div className="
  bg-white rounded-card border border-border
  shadow-card p-5
  hover:shadow-panel transition-shadow
">
  <p className="text-lg font-bold text-primary">Optique Lumière</p>
  <p className="text-base text-muted mt-1">12 rue de Rivoli, Paris 1er</p>
  <span className="
    text-sm font-semibold px-3 py-1 rounded-pill
    bg-secondary-light text-secondary
  ">
    Perfect match
  </span>
</div>
```

**Tokens utilisés :** `bg-white` · `rounded-card` · `border-border` · `shadow-card` · `text-primary` · `text-muted` · `bg-secondary-light` · `rounded-pill`

---

### Input de formulaire

```tsx
<input
  type="email"
  placeholder="ton@email.com"
  className="
    w-full border border-border rounded-xl
    px-4 py-3
    text-base text-ink
    placeholder:text-muted
    focus:outline-none focus:border-secondary focus:shadow-focus
    transition-colors
  "
/>
```

**Tokens utilisés :** `border-border` · `rounded-xl` · `text-base` · `text-ink` · `placeholder:text-muted` · `focus:border-secondary` · `focus:shadow-focus`

---

## Règles de combinaison

- **Fond de page** → toujours `bg-surface`, jamais de blanc direct
- **Fond de carte** → `bg-white` + `border-border` + `shadow-card`
- **Texte principal** → `text-primary` (titres) / `text-ink` (corps)
- **Texte secondaire** → `text-muted`, jamais `text-gray-*` hardcodé
- **CTA principal** → `bg-secondary` + `text-white`
- **CTA outline** → `border-secondary` + `text-secondary` + hover `bg-secondary-light`
- **Badges positifs** → `bg-success-light` + `text-success-dark`
- **Badges warning** → `bg-accent-light` + `text-accent-dark`
- **Badges info** → `bg-secondary-light` + `text-secondary`
