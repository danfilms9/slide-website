# Firebase Setup Checklist — Slide Experience

Use this guide to set up Firebase and Google Authentication for the project.

---

## STEP 1 — Firebase Project Setup (manual)

- [ ] **1.** Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] **2.** Create a new project named **"slide-experience"**
  - You can disable or enable Google Analytics; either is fine.
- [ ] **3.** Enable Authentication
  - In the left sidebar: **Build → Authentication**
  - Open **Sign-in method**
  - Click **Google** → **Enable** → Save
- [ ] **4.** Create Firestore Database
  - **Build → Firestore Database** → **Create database**
  - Start in **test mode** for now (rules can be tightened later)
- [ ] **5.** Register the web app
  - **Project Settings** (gear) → **General** → **Your apps**
  - Click **Add app** → choose **Web** (</>)
  - Register the app (e.g. nickname "slide-web") and copy the `firebaseConfig` object
- [ ] **6.** Add environment variables
  - In the project root, create **`.env.local`** (if it doesn’t exist)
  - Add these variables with the values from `firebaseConfig`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

- [ ] **7.** Restart the Next.js dev server after editing `.env.local` so the new variables are picked up.

**Important:** Copy each value from the Firebase Console **exactly** (no extra quotes, no spaces). The `auth/invalid-api-key` error usually means the API key is missing, wrong, or from a different project.

---

## Troubleshooting: `auth/invalid-api-key`

- Ensure **`.env.local`** is in the **project root** (same folder as `package.json`).
- Use the **exact** variable names above (e.g. `NEXT_PUBLIC_FIREBASE_API_KEY`, not `FIREBASE_API_KEY`).
- Paste the **apiKey** from Firebase Console → Project Settings → Your apps → SDK setup (no quotes around the value).
- **Stop and restart** the dev server (`npm run dev` or `yarn dev`) after changing `.env.local` — Next.js only reads env files at startup.

---

## Verification

- The app uses these env vars in `src/lib/firebase/firebase.ts`.
- Google sign-in is handled in `src/lib/auth.ts` and the **Login** screen.
- After completing the steps above, you can run the app and use **Log in with Google** on the login screen.
