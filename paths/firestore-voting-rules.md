# Firestore Security Rules for Voting

Paste these rules into the **Firebase Console** → your project → **Firestore Database** → **Rules** tab.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /votes/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

This ensures:
- Only authenticated users can read any vote document (e.g. to check their own or to count).
- Users can only write to the document whose ID is their own `uid` (one vote per user, overwrite allowed).
