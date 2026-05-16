import { defineStore } from 'pinia'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth, googleProvider, hasFirebaseConfig } from '@/firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    ready: false,
    loading: false,
    error: '',
    configMissing: !hasFirebaseConfig,
    listenerStarted: false,
    initPromise: null,
  }),
  actions: {
    init() {
      if (this.ready) {
        return Promise.resolve()
      }
      if (this.initPromise) return this.initPromise

      if (!auth) {
        this.ready = true
        return Promise.resolve()
      }

      this.listenerStarted = true
      this.initPromise = new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
          this.user = user
          this.ready = true
          resolve()
        })
      })
      return this.initPromise
    },
    async login(email, password) {
      this.error = ''
      this.loading = true
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password)
        this.user = credential.user
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    async register(email, password) {
      this.error = ''
      this.loading = true
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password)
        this.user = credential.user
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    async loginWithGoogle() {
      this.error = ''
      this.loading = true
      try {
        const credential = await signInWithPopup(auth, googleProvider)
        this.user = credential.user
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    async logout() {
      await signOut(auth)
      this.user = null
    },
  },
})
