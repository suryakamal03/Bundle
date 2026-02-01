import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

function initializeFirebaseAdmin() {
  if (!app) {
    if (!getApps().length) {
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      app = getApps()[0];
    }
  }
  return app;
}

export const getAdminDb = (): Firestore => {
  if (!firestoreInstance) {
    const app = initializeFirebaseAdmin();
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
};

export const getAdminAuth = (): Auth => {
  if (!authInstance) {
    const app = initializeFirebaseAdmin();
    authInstance = getAuth(app);
  }
  return authInstance;
};

// For backward compatibility - but these will still initialize lazily
export const adminDb = new Proxy({} as Firestore, {
  get(target, prop) {
    return getAdminDb()[prop as keyof Firestore];
  }
});

export const auth = new Proxy({} as Auth, {
  get(target, prop) {
    return getAdminAuth()[prop as keyof Auth];
  }
});
