import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore'
import { firebaseConfig } from '@shared/firebaseConfig'

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)

function initDb(): Firestore {
  try {
    return initializeFirestore(app, { ignoreUndefinedProperties: true })
  } catch {
    return getFirestore(app)
  }
}

export const db = initDb()
