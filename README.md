# pos-mobile-app

The staff-facing POS checkout app for POS Services — an Expo (React Native) app, built with Expo Router and NativeWind.

## Getting started

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android/iOS), or run on a simulator/emulator:

```bash
npm run android
npm run ios
```

Set `EXPO_PUBLIC_API_URL` in `.env.local` to point at the backend (`http://localhost:3010` by default). Android emulator needs `http://10.0.2.2:3010` instead of `localhost`; a physical device via Expo Go needs the host machine's LAN IP.

## Structure

- `app/` — Expo Router routes. `login.tsx` (public) and `(app)/` (protected group: `index.tsx` POS screen, `member.tsx`/`history.tsx`/`success.tsx` modal routes) are gated in `app/_layout.tsx` via `Stack.Protected`.
- `contexts/` — `session.tsx` (auth: JWT in `expo-secure-store`), `pos-cart.tsx` (the checkout reducer, shared across the `(app)` group).
- `components/pos/` — POS screen building blocks. `components/ui/` — custom Button/TextField/Toast primitives (NativeWind-styled, no component library).
- `lib/` — `api.ts`/`pos-api.ts` (backend calls), `pos-types.ts` (data shapes), `theme.ts` (design tokens, kept in sync with `tailwind.config.js`).

## Building

`eas.json` has `development`/`preview`/`production` profiles. `npx eas build --profile preview --platform android` for an installable APK.
