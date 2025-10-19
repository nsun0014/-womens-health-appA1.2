import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBw-rXiOlZQZZF8Kh1tGZQmQy49cM-Onf8',
  authDomain: 'women-health1.firebaseapp.com',
  projectId: 'women-health1',
  storageBucket: 'women-health1.appspot.com',
  messagingSenderId: '1054735058747',
  appId: '1:1054735058747:web:1e39083ec003905dbcd91e',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({
  prompt: 'select_account',
})

export { app, auth, db, storage, googleProvider }
