# Fitness Species Commercial Seller Portal

Official commercial seller portal for the **Fitness Species** marketplace (`https://seller-lilac-five.vercel.app`).

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom dark SaaS theme
- **Icons**: Lucide React
- **Animations**: Framer Motion & dynamic Three.js / React Three Fiber (lazy loaded)
- **Auth**: Firebase Web Authentication (`firebase/auth`)
- **Backend API**: Node.js + Express + MongoDB Atlas (`D:/FitnessSpeciesBackend`)

---

## Domain Configuration (`seller-lilac-five.vercel.app`)
The production seller web portal is configured for deployment at `https://seller-lilac-five.vercel.app`.

### Environment Variables (.env.local)
Set `NEXT_PUBLIC_API_URL` in the Vercel project environment to the deployed backend URL. The local `.env.local` value is only for development; production builds do not fall back to `localhost`.

```env
NEXT_PUBLIC_API_URL=https://api.alk.co.in
NEXT_PUBLIC_SELLER_DOMAIN=https://seller-lilac-five.vercel.app

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sellerportal-2786c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sellerportal-2786c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sellerportal-2786c.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---

## Development & Production Build Instructions

### Installation
```bash
npm install
```

### Run Locally (Dev Server)
```bash
npm run dev
# Portal accessible at http://localhost:3005
```

### Production Build
```bash
npm run build
npm run start
```

---

## Architecture & Product Approval Pipeline

### 1. Security Architecture
- Firebase Web Authentication handles user login/session state.
- Firebase ID token is retrieved (`user.getIdToken()`) and sent in `Authorization: Bearer <ID_TOKEN>` headers.
- Node.js backend verifies token using `firebase-admin` and enforces seller role check against MongoDB.

### 2. Product Approval Lifecycle
- **Product Creation (`POST /api/seller/products`)**:
  Seller submits product through 8-section creation workflow. The status is **forced to `pending`** by backend business rules.
- **Admin Review**:
  Admins review pending products. Approved products become `status = approved` and visible in the marketplace catalog. Rejected products become `status = rejected` with a recorded `rejectionReason`.
- **Product Edit & Resubmit (`PATCH /api/seller/products/:id`)**:
  When a seller edits any product (especially a rejected one), the backend forces status back to **`pending`** for re-approval. Sellers cannot manually approve products from the frontend.
