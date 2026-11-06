import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore'
import { firebaseConfig } from '@shared/firebaseConfig'
import { initAppCheck } from '@shared/firebaseAppCheck'

let cachedApp: FirebaseApp | null = null
let cachedDb: Firestore | null = null

/**
 * Provides a resilient singleton Firestore client for public content subscriptions
 * with automatic Firebase App Check domain verification and DDoS protection.
 */
export function getFirebaseDb(): Firestore | null {
  try {
    if (!cachedDb) {
      cachedApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)
      // Initialize App Check to guard against Denial of Wallet (DDoS)
      initAppCheck(cachedApp)
      try {
        cachedDb = initializeFirestore(cachedApp, { ignoreUndefinedProperties: true })
      } catch {
        cachedDb = getFirestore(cachedApp)
      }
    }
    return cachedDb
  } catch (err) {
    console.warn('Failed to initialize Firebase for public site:', err)
    return null
  }
}

