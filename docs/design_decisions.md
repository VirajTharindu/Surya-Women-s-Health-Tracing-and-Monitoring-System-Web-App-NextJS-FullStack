# Design Decisions

This document details the UI/UX choices and design principles applied to the Suriya Women's Health Tracking application.

## 1. Visual Aesthetics & Theming

### Color Palette
The application utilizes a carefully curated color palette designed to feel welcoming, professional, and culturally resonant.
*   **Primary Accent (Deep Pink/Magenta - `#D81B60`):** Used for core feminine health features (menstrual tracking, pink book). It conveys warmth and vitality without being aggressive.
*   **Secondary Accents:**
    *   *Purple (`#7B1FA2`):* Used for Vital Logging, representing calm and stability.
    *   *Green (`#43A047`):* Used for Reminders and successful actions, universally recognized as a "go" or "safe" color.
    *   *Blue (`#1565C0`):* Used for Medical/Network referrals, providing a clinical and trustworthy feel.
*   **Backgrounds (`#F7F9FB`):** A soft, off-white background reduces eye strain compared to stark white, giving the application a modern, premium feel.

### Typography
We employ clean, sans-serif typography (system defaults prioritizing Inter/Roboto) to ensure maximum legibility across all devices, particularly on lower-resolution mobile screens common in rural areas.

## 2. User Experience (UX)

### Tab-Based Navigation
**Decision:** The primary interface utilizes a persistent bottom navigation bar (on mobile) or lower fixed tabs.
**Rationale:** Health tracking requires frequent, quick data entry. A tabbed interface allows users to switch context instantly (e.g., from reading awareness content to logging a symptom) without navigating through deep menu hierarchies.

### Dynamic Dashboard
**Decision:** The Home screen features a dynamic "Health Summary Strip" (Cycle Phase, Next Period, Last BP, Next Reminder).
**Rationale:** Provides immediate, glanceable value to the user immediately upon login. It prioritizes the most urgent information, reducing the cognitive load required to parse their health status.

### Glassmorphism & Micro-animations
**Decision:** Implementation of subtle backdrop filters (blur) on app bars and hover-state transformations on action cards.
**Rationale:** These modern design cues create a sense of depth and interactivity, making the application feel responsive and premium without overwhelming the user with heavy animations that could impact performance.

## 3. Accessibility & Inclusivity

### Trilingual Support
**Decision:** Full internationalization (i18n) supporting English, Sinhala, and Tamil.
**Rationale:** Essential for the target demographic in Sri Lanka. The language switcher is prominently placed in the main app bar, allowing users to toggle their preferred language instantly, ensuring critical health information is thoroughly understood.

### High Contrast & Legibility
**Decision:** Strict adherence to WCAG contrast ratios for text and interactive elements.
**Rationale:** Ensures usability for individuals with visual impairments or those viewing the app in harsh lighting conditions (e.g., outdoors in bright sunlight).
