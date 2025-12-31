# GameSwap (Gaming Classifieds MVP)

A minimal Next.js + Prisma (SQLite) classifieds site for games, consoles, CDs and DVDs with:
- PriceCharting price-match (official API if token is set; mock mode otherwise)
- Disc/CD/DVD listings must include a DISC_BACK (scratch-check) photo
- Condition categories: Loose / Box / Box with manual / Box with no manual
- Ads appear in only a few non-distracting places

## Requirements
- Node.js 18+ (recommended 20+)

## Setup
```bash
# 1) install deps
npm install

# 2) env
cp .env.example .env.local
cp .env.example .env

# 3) (optional) set PRICECHARTING_TOKEN in .env.local and .env

# 4) create db (SQLite)
npm run prisma:push

# 5) run
npm run dev
```

Open http://localhost:3000

## Notes
- For testing images, paste public image URLs.
- If you don't set `PRICECHARTING_TOKEN`, the app runs in mock mode for price matching.
