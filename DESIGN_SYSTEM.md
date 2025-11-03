# 🟢 AutoFacil Design System Guidelines

## I. Brand Identity & Principles

The AutoFacil application is designed to be the safest, easiest, and most trustworthy way to book driving lessons. Our design system is built on the following core pillars:

| Principle | Description | Rationale |
| :--- | :--- | :--- |
| **Safety First** | The primary color is **Calm Green**, promoting a sense of security, stability, and calm. The interface must be non-distracting. | Crucial for a driving app to reduce user anxiety and build confidence. |
| **Effortless Booking** | User flows must be streamlined. All Call-to-Action (CTA) elements, like the 'Book Now' button, should be immediately visible and sticky. | Delivers on the "Facil" (Easy) part of the app's name and maximizes conversion. |
| **Trust through Data** | Critical information—ratings, availability, and qualifications—must be visually prioritized and instantly scannable on all instructor cards and profiles. | Establishes reliability and allows students to make quick, informed choices. |

---

## II. Visual Style Guide

### A. Color Palette

The palette is anchored in **Calm Green** for brand association and positive feedback, complemented by **Vibrant Blue** for essential data and a neutral base for high contrast.

| Color Name | Hex Code | Usage | Role in UX |
| :--- | :--- | :--- | :--- |
| **Primary (Brand/Success)** | `#4CAF50` (Calm Green) | Primary CTAs, Success States, Progress Bars, Rating Stars, Active Navigation, Brand Logo. | **Action & Trust.** Represents 'Go,' 'Success,' and 'Safety.' |
| **Secondary (Data/Highlight)** | `#007AFF` (Vibrant Blue) | Instructor Markers on the Map, Selected Date/Time in Calendar, Secondary Links/Buttons. | **Contrast & Focus.** Used for essential non-committing information. |
| **Neutral Base** | `#FFFFFF` (Pure White) | Backgrounds for cards, modals, and list items. Text color on Primary CTA buttons. | **Clarity & Breather.** Maximizes negative space and scannability. |
| **Background** | `#F9F9F9` (Light Grey) | Main screen background, subtle separators, disabled states. | **Depth.** Provides distinction from White cards and backgrounds. |
| **Text Primary** | `#1C1C1E` (Dark Charcoal) | All body text, headings, and labels. | **Legibility.** Ensures maximum contrast for readability (WCAG compliant). |
| **Warning/Danger** | `#FF3B30` (Alert Red) | Error Messages, 'Cancel Booking' buttons, high-risk notifications. | **Caution.** Standardized for necessary warnings. |

### B. Typography

We will use the **Inter** typeface (or **Roboto** as a fallback) for its clean lines and high legibility across all screen sizes.

| Type Style | Font Weight | Size (Mobile Base) | Use Case |
| :--- | :--- | :--- | :--- |
| **H1 (Screen Title)** | **Bold (700)** | $28\text{pt}$ | Main screen titles (e.g., "AutoFacil," "Instructor Profile"). |
| **H2 (Section Header)** | **Semi-Bold (600)** | $20\text{pt}$ | Card titles, modal headers, list section dividers. |
| **Body Primary** | Regular (400) | $16\text{pt}$ | Main paragraphs, lengthy descriptions (minimum recommended size). |
| **Body Secondary** | Medium (500) | $14\text{pt}$ | Instructor card details, filter labels, date/time info. |
| **Caption/Label** | Medium (500) | $12\text{pt}$ | Map annotations, small labels, footnotes, inactive status. |

---

## III. Component Guidelines

### A. Buttons (Call-to-Action)

| Component | Style | Specifications |
| :--- | :--- | :--- |
| **Primary CTA** | **Pill-Shaped / Full Width** | Solid **Calm Green** fill. White text. Corner radius: $8\text{px}$ (or full capsule). Must be **sticky** on booking and profile screens. |
| **Secondary Button** | **Outlined / Ghost** | Transparent background. **Calm Green** text and $1\text{px}$ border. Used for 'View Details' or 'Go Back.' |
| **Filter/Icon Button** | **Small Floating Icon** | Used for the 'Settings/Filter' on the map. Grey background with a subtle shadow, housing a Dark Charcoal icon. |

### B. Cards & List Views

* **Instructor Card:** Must use a White background (`#FFFFFF`) with a subtle $4\text{px}$ corner radius. Details like **Rating (Green Stars)** and **Next Available Date** must be the most prominent information after the instructor's photo and name.
* **Split View:** The screen must be clearly separated into a **Map Area (Top 50-60%)** and a **List/Card Area (Bottom 40-50%)** to allow for simultaneous viewing and filtering.

### C. Forms & Inputs

* **Focus State:** When a user taps into an input field, the border should transition smoothly to **Calm Green** to indicate active input.
* **Accessibility:** All form fields require clear labels and visible focus states.

### D. Iconography

Icons must be **simple, line-based, and consistent** (no fills), except for the rating stars.

| Icon Example | Style | Use Case |
| :--- | :--- | :--- |
| **Star** | Solid **Calm Green** fill. | Used exclusively for the instructor rating system. |
| **Filter/Funnel** | Line-based, Dark Charcoal. | **Settings/Filter** control. |
| **Car** | Line-based, minimalist. | Used on map markers and car detail flags. |

---

## IV. Layout & Spacing

* **Grid System:** All spacing, padding, and component sizing must adhere to an $8\text{pt}$ grid to maintain visual harmony.
* **Content Margins:** A minimum of $16\text{pt}$ internal padding should be maintained on the left and right sides of all screen content.
* **Home Screen Layout:** Utilize the **Map + Scannable Preview** approach. Dedicate **~60%** of the screen to the map and **~40%** to a scrollable area displaying 1-2 preview cards, replacing the single initial 'Book a Class' button.

---
