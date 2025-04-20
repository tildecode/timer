# OBS Countdown Overlay

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/.
2. Enable Firestore (in Native mode) and Authentication (e.g., Google sign-in).
3. Install Firebase CLI: `npm install -g firebase-tools`.
4. Authenticate: `firebase login`.
5. Initialize with `firebase init hosting firestore`:
   - Select your project.
   - Set public directory to `.`.
   - Configure as a single-page app: No.
6. Replace the Firebase config placeholders in `panel.js` and `script.js` with your project credentials (found under Project Settings > General).
7. Deploy: `firebase deploy`.

### Firestore Security Rules

The `firestore.rules` file restricts writes to authenticated users:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /config/timer {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Enable the desired sign-in provider (e.g., Google) in Authentication > Sign-in method.

## Hosting

- `.html` extensions are hidden via hosting rewrites in `firebase.json`.
- Access the panel at `https://<your-domain>/panel`.
- Access the overlay at `https://<your-domain>/`.
