import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { app, hasFirebaseConfig } from '@/firebase/app'

export { hasFirebaseConfig }

export const auth = app ? getAuth(app) : null
export const googleProvider = app ? new GoogleAuthProvider() : null
