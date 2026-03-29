# Witness AI Client

Frontend application for Witness AI, built with Next.js App Router, TypeScript, Redux Toolkit, and RTK Query.

The app focuses on calm, structured mental-health reflection workflows:
- authentication and session hydration
- guided journaling and dashboard insights
- conversational chat with session history
- profile management and theme support

## Tech Stack

- Next.js 15 (App Router)
- React 18 + TypeScript
- Redux Toolkit + RTK Query
- Axios (with interceptors)
- Tailwind CSS
- next-themes (light/dark mode)
- sonner (toast notifications)
- react-markdown + remark/rehype plugins (markdown + math rendering)

## Project Structure

```text
src/
  app/
    (auth)/                # login/auth flow + auth redux/api
    chat/                  # chat UI page
    dashboard/             # dashboard + actions/journaling nested routes
    journaling/            # journaling page
    profile/               # profile page
    reflect/               # reflection page
    layout.tsx             # root layout
    page.tsx               # landing page
  components/
    LayoutShell.tsx        # app shell + sidebar/top header
    Protected.tsx          # auth-gated route wrapper
    Providers.tsx          # redux/theme/toast providers + auth hydration
    markdown/
      markdown-renderer.tsx
  features/
    chat/
      chat.api.ts
    journal/
      journal.api.ts
  lib/
    api/
      axios.ts             # axios instance + interceptors
      apiSlice.ts          # RTK Query base API
    redux/
      store.ts
      reducers.ts
```

## Prerequisites

- Node.js 18+
- Yarn 1.x (project currently uses a yarn.lock)

## Environment Variables

Copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of backend API (example: `http://localhost:8000`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client id (if auth flow requires it) |

## Installation

```bash
yarn install
```

## Development

```bash
yarn dev
```

Starts the app in development mode (usually at `http://localhost:3000`).

## Build and Production

```bash
yarn build
yarn start
```

## Lint

```bash
yarn lint
```

## NPM Scripts

| Script | Description |
| --- | --- |
| `yarn dev` | Run development server |
| `yarn build` | Build for production |
| `yarn start` | Start production server |
| `yarn lint` | Run lint checks |

## API Integration Overview

RTK Query endpoints are split by domain:

- Auth (`src/app/(auth)/redux/auth.api.ts`)
  - `POST /auth/basic`
  - `GET /profile`
  - `PATCH /profile`
  - `POST /profile/picture`

- Journal (`src/features/journal/journal.api.ts`)
  - `GET /ai/generate-questions`
  - `POST /journal`
  - `GET /journal`
  - `GET /journal/by-date`
  - `GET /dashboard`

- Chat (`src/features/chat/chat.api.ts`)
  - `GET /chat/sessions`
  - `GET /chat/sessions/:sessionId/messages`
  - `POST /chat/message`

## Auth and Session Notes

- Access token is stored in cookies.
- On app boot, `Providers.tsx` hydrates auth state from cookie token.
- Axios request interceptor attaches bearer token for protected routes.
- Axios response interceptor handles common HTTP errors and triggers logout on `401`.

## Theming

- Light/dark theme is managed with `next-themes`.
- Global providers are defined in `src/components/Providers.tsx` and applied in `src/app/layout.tsx`.

## Troubleshooting

- App loads but API calls fail:
  - Verify `NEXT_PUBLIC_API_BASE_URL` in `.env`.
  - Confirm backend is running and reachable.

- Immediate logout or unauthorized errors:
  - Check token cookie presence/expiry.
  - Confirm backend auth headers and CORS settings.

- UI not updating after API changes:
  - Restart `yarn dev`.
  - Clear `.next` if needed and run again.

## Notes for Contributors

- Keep API calls inside RTK Query slices instead of ad-hoc fetches.
- Reuse `LayoutShell` for consistency across protected pages.
- Keep domain types close to their feature modules (`features/*/*.types.ts`).
