# Loan Options Next

Reusable Next.js landing page scaffold inspired by the provided loan website design.

## Structure

- `app/`: App Router entrypoints and global styles
- `components/layout/`: layout primitives like the header
- `components/sections/`: reusable page sections
- `components/ui/`: shared UI building blocks
- `data/`: centralized content for cards, nav items, and FAQs
- `lib/`: small utilities
- `database/`: database setup notes

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Database

The project now uses MongoDB.

Required environment variables:

- `MONGODB_URI`
- `MONGODB_DB`

Optional collection overrides:

- `MONGODB_APPLICATIONS_COLLECTION`
- `MONGODB_APPLICATION_LOGS_COLLECTION`
- `MONGODB_CONTACT_COLLECTION`
- `MONGODB_DO_NOT_SELL_COLLECTION`
- `MONGODB_ZIP_COLLECTION`

The ZIP lookup used by the loan application API expects a Mongo collection containing US ZIP data. See [database/mongodb-collections.md](/d:/Projects/loan-options-next/database/mongodb-collections.md) for the expected collection names, indexes, and document shape.
