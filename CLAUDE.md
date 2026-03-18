# Energy Vertical - Demo Site

## Project Overview

A fictional energy retailer website built to demonstrate HCL CDP & HCL Unica capabilities to prospects. Modelled on the banking-industry template (`/Users/simonpallister/Code/banking-industry`), this site replicates the same multi-brand, multi-lingual, CDP/Discover/Interact integration patterns for the energy retail vertical.

The primary demo target is EnergyAustralia, hence the second brand. However, generic content should be globally applicable, not Australia-specific (except where the EA brand and en-AU locale explicitly override).

Reference site for EA content/functionality: https://www.energyaustralia.com.au/

## Original Brief

- Multi-brand, multi-lingual energy retailer site
- Same CDP/Discover integration, login capabilities, and Interact integration as banking template
- 2 brands: UniPower (generic) & EnergyAustralia
- Same locales as banking (minus en-DI/Discover): en, en-US, en-GB, en-AU, en-CA, en-IN, fr, fr-CA, es, de, it-IT, sv-SE
- Pages: Home, Plans (electricity), Solar & Storage, Electric Vehicles, Checkout
- Plans page should simulate EA's plans page functionality with address lookup (Google Maps) and plan selection
- Plans driven from JSON data file with plan types: Fixed Rate, Variable, Time of Use, EV
- Google Maps address lookup on plans page collects address for CDP purposes only (no actual product filtering)
- Solar & Storage and Electric Vehicles are content-only pages
- Checkout page follows plan selection (details TBC)

## Decisions Made

1. **Page naming**: "Solar and Batteries" renamed to "Solar & Storage" (globally understood term)
2. **Plans data model**: Includes fixed, variable, time-of-use, and EV plan types with peak/off-peak/shoulder rates for ToU
3. **Address lookup**: Google Places autocomplete on plans page, address collected for CDP tracking, no filtering of plans
4. **Navigation**: 3 pages only - Plans, Solar & Storage, Electric Vehicles (no My Account page for now)
5. **UniPower brand colours**: Blue/teal palette (`oklch(54% 0.17 240)` primary) - conveys energy/technology
6. **EnergyAustralia brand colours**: Green palette (`oklch(55% 0.18 150)` primary) - matches EA's actual branding from their website
7. **Brand theming**: CSS `data-brand` attribute on layout wrapper triggers colour variable overrides in globals.css
8. **Industry vertical**: `INDUSTRY_VERTICAL=energy` - separate database in shared PostgreSQL
9. **Interact interaction points**: Placeholder points `ipHomePage`, `ipPlans`, `ipCheckout` - details TBC, home page likely the primary one
10. **Settings modal**: 3 tabs (Profile, CDP Settings, Discover Script) - removed banking-specific loan data tab
11. **Content approach**: Generic energy retailer content for UniPower; EA-specific overrides in brand translation files

## Phases

### Phase 1 - Scaffolding (COMPLETE)
- Next.js 15 project with App Router, `[locale]/[brand]` routing
- Multi-brand (UniPower, EnergyAustralia) with colour themes
- Multi-lingual (12 locales) with next-intl
- CDP/Discover/Interact integration (carried from banking)
- Login/Register system (Prisma + PostgreSQL)
- Settings modal, StatusPopover, IframeUserNotifier
- Home page with hero, trust numbers, product cards, "why choose us", CTA
- Placeholder pages for Plans, Solar & Storage, Electric Vehicles, Checkout
- Base English translations + EA brand overrides

### Phase 2 - Home Page Content
- Enrich home page with more detailed energy retailer content
- Add sections typical of energy retailer sites worldwide

### Phase 3 - Plans Page
- Build interactive plans page driven from JSON data file
- Plan types: Fixed Rate, Variable Rate, Time of Use, EV
- Plan data: name, type, rate (c/kWh), daily supply charge, contract term, discount %, green energy %, features list
- ToU plans include peak/off-peak/shoulder rates
- Google Places autocomplete for address collection (CDP tracking)
- Plan comparison/selection UI
- "Select plan" flow leading to checkout

### Phase 4 - Checkout Skeleton
- Post-plan-selection checkout flow
- Details TBC

### Phase 5 - Content Pages
- Solar & Storage content page (content only)
- Electric Vehicles content page (content only)

## Tech Stack

- **Framework**: Next.js 15.3.8 with React 19, App Router
- **Styling**: Tailwind CSS 4 with CSS variables (OKLch colour space), shadcn/ui components
- **i18n**: next-intl v4.3.3 with JSON translation files + brand-specific overrides
- **Database**: PostgreSQL 16 via Prisma ORM (shared multi-tenant container)
- **Auth**: bcryptjs password hashing, localStorage session management
- **CDP**: @hcl-cdp-ta/hclcdp-web-sdk-react
- **Interact**: @hcl-cdp-ta/interact-sdk
- **Icons**: Lucide React

## Key Architecture Patterns

- URL structure: `/{locale}/{brand}/{page}` (e.g., `/en-AU/energyaustralia/plans`)
- Translation loading: base `en.json` -> locale fallback chain -> brand-specific overrides (deep merge)
- Brand switching: SiteContext React context with URL-based navigation
- Brand theming: `data-brand` attribute on layout wrapper, CSS variable overrides in globals.css
- Customer data: localStorage under `${brand.key}_customer_data`
- Tracking type toggle: CDP vs Discover (mutually exclusive, per-brand localStorage)

## Environment Variables

```
INDUSTRY_VERTICAL=energy
DATABASE_URL=postgresql://...@shared-postgres-multitenant:5432/energy
NEXT_PUBLIC_CDP_WRITEKEY=
NEXT_PUBLIC_CDP_ENDPOINT=
NEXT_PUBLIC_DISCOVER_DEFAULT_SCRIPT=
NEXT_PUBLIC_INTERACT_ENDPOINT=
NEXT_PUBLIC_INTERACT_CHANNEL_NAME="Energy Web Site"
NEXT_PUBLIC_INTERACTION_POINT=ipHomePage
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

## File Structure

```
app/
  layout.tsx                          # Root layout (SiteProvider, CdpProvider, StatusPopover)
  globals.css                         # Tailwind + brand colour themes
  [locale]/[brand]/
    layout.tsx                        # NextIntlClientProvider, Header, Footer
    page.tsx                          # Home page
    plans/page.tsx                    # Electricity plans (Phase 3)
    solar-storage/page.tsx            # Solar & Storage (Phase 5)
    electric-vehicles/page.tsx        # Electric Vehicles (Phase 5)
    checkout/page.tsx                 # Checkout (Phase 4)
  actions/LoginRegister.ts
  api/login/route.ts
  api/register/route.ts
components/
  Header.tsx, Footer.tsx, LoginModal.tsx, NavControls.tsx
  CdpProvider.tsx, ScriptInjector.tsx, SettingsModal.tsx
  StatusPopover.tsx, IframeUserNotifier.tsx
  Hero.tsx, OfferHero.tsx, OfferCard.tsx
  common/NavLink.tsx
  ui/                                 # shadcn/ui components (18 files)
i18n/
  brands.ts                           # UniPower, EnergyAustralia
  locales.ts                          # 12 locales
  routing.ts, request.ts
language/
  en.json                             # Base English translations
  energyaustralia/
    en.json                           # EA brand overrides
    en-AU.json                        # Australian locale specifics
lib/
  SiteContext.tsx, getMessages.ts, brandLocaleUtils.ts
  utils.ts, getMetaData.ts, database-setup.ts
  hooks/useTrackingType.ts, hooks/useCDPTracking.ts
prisma/schema.prisma
middleware.ts
docs/
  cdp-events.md                       # CDP event tracking reference (keep in sync with code changes)
```

## Maintenance Notes

- **CDP Events Documentation**: When adding, removing, or modifying CDP tracking events, update `docs/cdp-events.md` to reflect the changes.
