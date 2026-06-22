# Northvale Platform

A full-stack, production-ready e-commerce platform built with React, Node.js, Express, and PostgreSQL.

## Features

- **Authentication**: Custom JWT-based authentication with Google OAuth integration and OTP email verification.
- **Image Management**: Seamless integration with Cloudinary for fast, optimized image delivery and upload.
- **Admin Portal**: Fully featured dashboard to manage products, orders, and user roles.
- **Storefront**: Dynamic catalog with category filtering and real-time product search.
- **Wishlist**: Allow users to save their favorite products.
- **PWA Ready**: Works offline and can be installed as an app.
- **Theme Support**: Automatically adapts to the user's system theme (Light/Dark mode).
- **Responsive Design**: Mobile-first architecture with bottom navigation for touch devices.

## Tech Stack

- **Frontend**: React, Vite, React Router, TailwindCSS, DaisyUI, TanStack Query, Zustand
- **Backend**: Node.js, Express, Drizzle ORM, PostgreSQL, Zod
- **Infrastructure**: Cloudinary (Images), Sentry (Error Tracking), Google OAuth

## Environment Setup

Copy `.env.example` to create your `.env` files in both `frontend/` and `backend/` directories.

## Running Locally

1. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. Setup database:
   Ensure PostgreSQL is running, then in `backend/`:
   ```bash
   npm run db:push
   ```

3. Start dev servers:
   ```bash
   # Backend
   npm run dev
   # Frontend
   npm run dev
   ```
# Northvale
