import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  initializeAuth,
  browserSessionPersistence,
  inMemoryPersistence,
  setPersistence,
  type Auth,
} from 'firebase/auth'
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore'
import { firebaseConfig } from '@shared/firebaseConfig'
import { initAppCheck } from '@shared/firebaseAppCheck'

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

// Enforce Firebase App Check for CMS administration queries
initAppCheck(app)

function initAuth(): Auth {
  try {
    return initializeAuth(app, {
      persistence: [browserSessionPersistence, inMemoryPersistence],
    })
  } catch {
    const a = getAuth(app)
    setPersistence(a, browserSessionPersistence).catch(() => {})
    return a
  }
}

export const auth = initAuth()

function initDb(): Firestore {
  try {
    return initializeFirestore(app, { ignoreUndefinedProperties: true })
  } catch {
    return getFirestore(app)
  }
}

export const db = initDb()
