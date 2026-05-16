import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { app } from '@/firebase/app'

const firestoreSettings = {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
}

export const db = app ? initializeFirestore(app, firestoreSettings) : null
