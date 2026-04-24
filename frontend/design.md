---
name: Rio Campo Digital
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#424751'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737783'
  outline-variant: '#c2c6d3'
  surface-tint: '#255dad'
  primary: '#00346f'
  on-primary: '#ffffff'
  primary-container: '#004a99'
  on-primary-container: '#9bbdff'
  inverse-primary: '#abc7ff'
  secondary: '#3e5f92'
  on-secondary: '#ffffff'
  secondary-container: '#a5c5ff'
  on-secondary-container: '#2f5183'
  tertiary: '#5f2200'
  on-tertiary: '#ffffff'
  tertiary-container: '#833301'
  on-tertiary-container: '#ffa77e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#abc7ff'
  on-primary-fixed: '#001b3f'
  on-primary-fixed-variant: '#00458f'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#a9c7ff'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#244779'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb694'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  h2:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h3:
    fontFamily: Public Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: '0'
  body-base:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-sm:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  button:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 16px
  gutter: 16px
---

## Brand & Style

This design system is built to serve as a reliable bridge between the municipal administration and field technicians. The brand personality is **Institutional, Efficient, and Authoritative**. It prioritizes utility over decoration, ensuring that workers in diverse outdoor conditions can capture and process data without cognitive friction.

The visual style is **Corporate Modern**, leveraging the clean aesthetics of shadcn/ui. It utilizes significant whitespace to reduce visual noise, high-contrast elements for outdoor readability, and a structured hierarchy that conveys the stability of the Rio de Janeiro government. The emotional response should be one of professional confidence and civic duty.

## Colors

The palette is anchored in the official colors of the City of Rio de Janeiro. The **Royal Blue (#004A99)** serves as the primary action color, ensuring all interactive elements meet WCAG AA contrast ratios against white backgrounds. 

- **Primary:** Royal Blue for buttons, active states, and primary branding.
- **Secondary:** Navy Blue for deep navigation headers and high-level categorization.
- **Neutral:** A range of slates for secondary text and decorative borders.
- **Background:** Pure White to maintain maximum clarity and brightness for field use.
- **Semantic:** High-saturation reds and greens are reserved strictly for status indicators and critical feedback, ensuring field technicians can identify issues at a glance.

## Typography

The design system exclusively uses **Public Sans**, a typeface designed for government interfaces. Its neutral, open character ensures legibility at small sizes on mobile devices used in the field.

Typography is organized to emphasize scanability. Headlines are bold and slightly condensed in tracking to create a strong visual anchor. Body text maintains a generous line height (1.5x) to prevent fatigue during long data-entry sessions. Labels use a slightly heavier weight to distinguish them from user-inputted content.

## Layout & Spacing

The layout follows a **Fluid Grid** model optimized for mobile-first field workflows. On mobile devices, a single-column layout is preferred to maximize tap targets. On tablets, a 12-column grid with 16px gutters is used.

The spacing rhythm is based on a **4px baseline grid**. All margins and paddings must be multiples of 4, ensuring consistent vertical rhythm. For field technicians, "touch-ready" spacing is critical: interactive elements should have at least 8px of separation to prevent accidental taps while moving or wearing gloves.

## Elevation & Depth

To maintain the clean, shadcn-inspired aesthetic, this design system uses **Low-contrast outlines** and **Tonal layers** rather than heavy shadows. 

- **Level 0 (Flat):** Used for the main background.
- **Level 1 (Surface):** Subtle 1px borders (#E2E8F0) define cards and input fields.
- **Level 2 (Raised):** Very soft, diffused shadows (0px 4px 6px rgba(0,0,0,0.05)) are used only for floating action buttons or active dropdown menus to suggest interactability.
- **Active State:** Primary color outlines (2px) are used to indicate focus, ensuring high visibility for keyboard or d-pad navigation.

## Shapes

The design system adopts a **Soft** shape language. This creates a professional but modern appearance that feels approachable. 

- **Components:** Buttons, inputs, and cards use a standard 0.25rem (4px) corner radius.
- **Containers:** Larger modal overlays or mobile bottom sheets may use a 0.5rem (8px) radius for the top corners to soften the transition from the edge of the screen.
- **Icons:** Icons should follow a linear style with slightly rounded terminals to match the component corners.

## Components

### Buttons
Primary buttons use the Institutional Royal Blue with white text. Secondary buttons use a white background with a Slate-200 border. All buttons must have a minimum height of 48px for field accessibility (touch targets).

### Input Fields
Inputs are defined by a 1px border. When focused, they transition to a 2px Royal Blue border. Labels are always persistent (not floating) to ensure the technician never loses context of the required data.

### Chips & Badges
Used for status (e.g., "Pendente", "Concluído"). These use low-saturation background tints with high-saturation text to maintain readability without overwhelming the primary actions.

### Lists
Field data is often presented in lists. These use "Divided Lists" with a 1px horizontal separator. Each list item should have a minimum vertical padding of 12px.

### Cards
Cards are the primary container for field tasks. They feature a white background, a light gray border, and no shadow by default. This keeps the interface flat and reduces visual clutter on low-end mobile screens.

### Field-Specific Components
- **Camera Trigger:** A large, centered action button for capturing evidence.
- **Sync Bar:** A persistent status indicator showing offline/online data synchronization state at the top of the interface.
- **Location Badge:** A specialized label showing GPS accuracy to ensure technicians are within the correct geographic perimeter.