import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
  console.warn('Firebase config missing! Using mock config for development.')
  firebaseConfig.apiKey = 'mock-api-key-for-development'
  firebaseConfig.authDomain = 'women-health1.firebaseapp.com'
  firebaseConfig.projectId = 'women-health1'
}

console.log('Firebase config loaded:', {
  apiKey: firebaseConfig.apiKey ? 'Loaded ✅' : 'Missing ❌',
  authDomain: firebaseConfig.authDomain ? 'Loaded ✅' : 'Missing ❌',
  projectId: firebaseConfig.projectId ? 'Loaded ✅' : 'Missing ❌',
})

let app, auth, db, googleProvider

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  googleProvider = new GoogleAuthProvider()

  googleProvider.setCustomParameters({
    prompt: 'select_account',
  })
} catch (error) {
  console.error('Firebase initialization error:', error)
}

export { auth, db, googleProvider }
