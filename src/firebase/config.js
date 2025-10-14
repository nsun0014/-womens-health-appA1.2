import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDujXO1r7b3xkIEiW4MGcIfF9H5vsrmHR4',
  authDomain: 'womencare-8e0d2.firebaseapp.com',
  projectId: 'womencare-8e0d2',
  storageBucket: 'womencare-8e0d2.firebasestorage.app',
  messagingSenderId: '176516747545',
  appId: '1:176516747545:web:4674e392b8a18f9ee9b588',
}

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account',
})

export { auth, googleProvider }
