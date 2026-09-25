# GreenLife interface

The redesign follows the supplied [GPT Taste skill](https://github.com/Leonxlnx/taste-skill/blob/main/skills/gpt-tasteskill/SKILL.md), adapted for an invoice workspace. Sign-in takes color inspiration from the reference with two original sections: a concise store introduction on warm ivory and a focused sign-in form on forest green. Mobile stacks a compact introduction above the form. Remember me controls persistent versus tab-session authentication; demo buttons populate credentials for sign-in. Signup retains an asymmetric photographic composition. Operational pages use a compact sidebar, shared headings, clear tables and live data.

## Design foundations

- Cabinet Grotesk, forest green, warm ivory and muted sage.
- Shared light/dark theme variables and responsive styles in `frontend/src/redesign.css`.
- The dashboard uses a short GSAP entrance animation that respects reduced-motion preferences and is cleaned up on navigation.
- Tamil and English remain available. Authentication, billing, product management and reporting use the existing APIs.
- Dashboard requests have explicit loading/error states. Empty charts do not fabricate data.
- Page components load on demand; font and photo assets are served locally.

## Asset sources

- Cabinet Grotesk: [Fontshare](https://www.fontshare.com/fonts/cabinet-grotesk), weights 400, 500, 700 and 800, downloaded through its CSS API.
- Forest photograph: [Unsplash source image](https://images.unsplash.com/photo-1441974231531-c6227db76b6e).
- Landscape: [Picsum seeded image](https://picsum.photos/seed/greenlife-nature/1920/1080).
- Icons: the application's existing Lucide React package.

## Verification

With the frontend and backend running, run `npx playwright test e2e/redesign.spec.ts`. These read-only business-flow checks cover sign-in, validation errors, themes, Tamil, responsive public pages, all workspace routes, revenue chart rendering, mobile overflow, keyboard navigation and logout. They do not create customers, invoices or accounts, or send notifications. The checks use installed Chrome.

Run `npm run build` for TypeScript and production-build verification.
