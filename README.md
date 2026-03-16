# Energy Vertical - Demo Site

A fictional energy retailer website built to demonstrate HCL CDP & HCL Unica capabilities to prospects. Features multi-brand theming (UniPower & EnergyAustralia), 12 locales, and CDP/Discover/Interact integrations.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with React 19
- **Styling**: Tailwind CSS 4, shadcn/ui, OKLch colour variables
- **i18n**: next-intl with brand-specific translation overrides
- **Database**: PostgreSQL 16 via Prisma ORM
- **Integrations**: HCL CDP, HCL Discover, HCL Interact

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

### Setup

```bash
# Install dependencies
npm install

# Start the database
docker compose up -d

# Generate Prisma client
npx prisma generate

# Run the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Docker Scripts

| Command | Description |
|---|---|
| `npm run docker:rebuild` | Rebuild and restart containers |
| `npm run docker:reset` | Reset containers and volumes |
| `npm run docker:fresh` | Full clean rebuild (prunes volumes/cache) |
| `npm run docker:logs` | Tail container logs |
| `npm run docker:ps` | List running containers |
| `npm run docker:db` | Open psql shell |

## URL Structure

```
/{locale}/{brand}/{page}
```

Example: `/en-AU/energyaustralia/plans`

### Brands

- **UniPower** - Generic energy retailer (blue/teal theme)
- **EnergyAustralia** - EA-branded variant (green theme)

### Pages

- **Home** - Hero, trust numbers, product cards, CTA sections
- **Plans** - Interactive electricity plan comparison with Google Places address lookup
- **Solar & Storage** - Content page
- **Electric Vehicles** - Content page
- **Checkout** - Post-plan-selection flow

## Environment Variables

Copy `.env.example` or set the following:

```
INDUSTRY_VERTICAL=energy
DATABASE_URL=postgresql://energy:energy@localhost:5432/energy_customer
NEXT_PUBLIC_CDP_WRITEKEY=
NEXT_PUBLIC_CDP_ENDPOINT=
NEXT_PUBLIC_DISCOVER_DEFAULT_SCRIPT=
NEXT_PUBLIC_INTERACT_ENDPOINT=
NEXT_PUBLIC_INTERACT_CHANNEL_NAME="Energy Web Site"
NEXT_PUBLIC_INTERACTION_POINT=ipHomePage
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

## Project Structure

```
app/
  [locale]/[brand]/          # Dynamic routing per locale + brand
    page.tsx                 # Home
    plans/page.tsx           # Plans page
    solar-storage/page.tsx   # Solar & Storage
    electric-vehicles/page.tsx
    checkout/page.tsx
  api/                       # Login/register API routes
components/                  # Shared UI components
i18n/                        # Brand + locale configuration
language/                    # Translation JSON files
lib/                         # Context, hooks, utilities
prisma/                      # Database schema
```
