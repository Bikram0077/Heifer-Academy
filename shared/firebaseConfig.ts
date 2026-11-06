const getEnv = (key: string, fallback: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key] as string
  }
  return fallback
}

export const firebaseConfig = {
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', 'heifer-academy-cms'),
  appId: getEnv('VITE_FIREBASE_APP_ID', '1:485439700475:web:04802c79a47cfe09f7df5e'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', 'heifer-academy-cms.firebasestorage.app'),
  apiKey: getEnv('VITE_FIREBASE_API_KEY', 'AIzaSyBBjhtNvOqmo0P_ycITWGTcBA2Z1NbB7wA'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', 'heifer-academy-cms.firebaseapp.com'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '485439700475'),
  projectNumber: '485439700475',
} as const
