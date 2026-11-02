# CampuSmart

**Your Campus, Your Marketplace.** A mobile-first campus marketplace prototype for Mapúa Malayan Colleges Laguna (MMCL), built from the ENT078/CIS201 business proposal.

CampuSmart connects verified `@mcl.edu.ph` students and faculty so they can **buy, sell, rent, and borrow** textbooks, school supplies, uniforms, food, accessories, and everyday needs — with safe on-campus meetups and no delivery fees.

---

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The app is a PWA: on a phone, use **Add to Home Screen** to install it.

```bash
npm run build        # production build
npm run preview      # preview the production build
npm run build:single # portable single-file app (../CampuSmart.html)
```

`CampuSmart.html` is completely self-contained — CSS, JavaScript, fonts, and all product images are inlined. Open it directly in Chrome/Edge with no server or internet connection.

## Demo accounts

Password for all demo accounts: **`CampuSmart123`**

| Role | Email | What to try |
| --- | --- | --- |
| Student buyer | `kaira.galay@mcl.edu.ph` | Cart, checkout, orders, messaging, saved items |
| Student seller | `robby.abaquin@mcl.edu.ph` | Seller Center, incoming orders, listings, boosts |
| Administrator | `admin@mcl.edu.ph` | Verification queue, listing moderation, reports, revenue |
| Campus vendor | `rina.delosreyes@mcl.edu.ph` | Food listings and seller orders |
| Faculty | `marthison.villanueva@mcl.edu.ph` | Faculty account and lending listings |

The login screen has one-tap demo fill buttons. The welcome flow also supports a new registration, which enters the admin verification queue.

---

## What is implemented

### Accounts & trust
- `@mcl.edu.ph` institutional email validation (with `.edu.ph` support noted for expansion)
- Registration → **pending verification** → admin approval, with a 24-hour review message
- Role selection (student / faculty) and department
- **Face ID sign-in** simulation after verification
- Public seller profiles with verified badge, rating, department, bio, listings, and reviews
- Profile editing, saved items, notifications, settings, and data-privacy controls

### Marketplace
- 26 seeded listings across the six proposal categories
- Search by keyword; filters for transaction type, category, condition, price range, and boosted listings
- Sorting: latest, boosted first, price low/high
- Product details with condition, deposit, rental terms, meetup spots, seller card, and report action
- Favourites, sample or uploaded listing photos, editing, hiding, and deleting
- **Sell / rent / borrow** listing types with live fee preview and payout calculator

### Cart, orders & payments
- Shopping cart with quantity controls and a zero-buyer-fee summary
- Checkout with safe meetup spot, date/time, payment method, note, and T&C agreement
- Orders split per seller, with statuses: **pending → confirmed → completed / cancelled**
- Buyer “confirm received”, seller “confirm order” and “mark completed”
- Seller earnings and **5% commission** breakdown on completed transactions
- Cancellation flow with reasons; cancelled orders never earn a commission
- Ratings and reviews after completion

### Revenue model
- **5% seller commission** calculated on completed sale/rental subtotals (deposits excluded)
- **Post boosting** with the exact proposal packages:
  - 1 day — ₱50
  - 3 days — ₱150
  - 5 days — ₱250
  - 7 days — ₱350
- Boosted listings receive visibility on Home and Explore, with clear “not a guaranteed top spot or sale” disclaimers
- Boost history and active-until dates in Seller Center

### Messaging & safety
- Buyer–seller chat with listing context, quick replies, and order shortcuts
- Report listings, accounts, and transaction concerns
- Admin moderation queue with resolve / dismiss / remove-listing actions
- Safe Campus Meetup Spots from the proposal: ET Yuchengco lobby, Library entrance, Student Lounge
- Terms, Privacy Policy, Seller Policies, Prohibited Items, Cancellation & Refunds, and Meetup guidelines

### Administrator
- Overview with GMV, 5% commission revenue, post-boost revenue, verified members, and open reports
- Verification queue with approve/reject
- Listing moderation (remove/restore)
- Report resolution
- Platform-health targets (99.5% uptime, <24h support, <1% crashes)
- Financial projection scenarios from Part 8 of the proposal

### Evaluation
- In-app prototype feedback survey (stars, ease-of-use, recommendation, comments) stored on-device for usability evaluation
- Reset-demo control for repeatable testing

---

## Design system

- **Palette:** deep blue, slate blue, cream, maroon, and yellow — pulled from the CampuSmart logo
- **Typography:** Plus Jakarta Sans variable
- **Layout:** mobile-first 430px shell, 44–48px touch targets, sticky CTAs, bottom tab bar, bottom sheets
- **Motion:** route transitions, staggered card and category entrances, scroll-triggered section reveals, animated stat counters, a bouncing active tab, press feedback, hero sheen, Face ID scan, and toast/sheet transitions — all disabled gracefully under `prefers-reduced-motion`
- **Accessibility:** labelled controls, focus rings, sufficient contrast, reduced-motion support, readable type, and descriptive empty states
- **Imagery:** locally bundled product photography; no runtime image CDN dependency

## Tech & structure

```
src/
  App.tsx                 route map + auth guards
  store.tsx               app state, persistence, and marketplace actions
  styles.css              design system and responsive device frame
  data/
    catalog.ts            categories, meetup spots, policies, boost packages
    seed.ts               demo users, listings, orders, chats, reports, reviews
  components/             shared UI, product card, sheets, layout, feedback, reports
  screens/                auth, home, explore, product, cart/checkout, orders,
                          messages/chat, profile/settings, sell, seller center,
                          boost, admin, policies
scripts/                  Playwright visual + flow QA scripts
public/                   PWA manifest, service worker, icons, product images
```

- **React 19 + TypeScript + Vite**
- **React Router** (hash routing for static hosting)
- **Lucide** icons
- **LocalStorage** persistence (demo state; no backend required)
- **PWA** manifest + service worker for installable offline shell

### Production note

The proposal specifies Flutter/Dart, PHP, and MySQL for production. This repository is an executable, high-fidelity **React PWA prototype** so every flow can be demoed immediately. The screen structure, state model, and API boundaries (users, listings, orders, messages, boosts, reports) are designed to map cleanly to the proposed Flutter client and PHP/MySQL backend. Auth verification, face login, payments, and commission collection are simulated for the prototype.

## QA

```bash
node scripts/shoot.mjs       # captures desktop/mobile screens
node scripts/flow-test.mjs   # order, seller confirm, rating, listing, boost, admin
node scripts/flow-test2.mjs  # registration, approval, Face ID, search, filters, chat, report
```

---

CampuSmart · ENT078/CIS201 · Group 1 · Mapúa Malayan Colleges Laguna
