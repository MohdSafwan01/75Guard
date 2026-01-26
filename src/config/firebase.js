/**
 * Firebase Configuration
 * 
 * 75Guard - Firebase Authentication + Firestore Setup
 */

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB4NJ4l_if3psJn7O7o41CozfNLcJvVh8U",
    authDomain: "guard-93060.firebaseapp.com",
    projectId: "guard-93060",
    storageBucket: "guard-93060.firebasestorage.app",
    messagingSenderId: "234578860411",
    appId: "1:234578860411:web:d4307d6dd70e3da86f05de",
    measurementId: "G-F6GGXLTJMW"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Auth
export const auth = getAuth(app)

// Initialize Firestore (for leaderboard & user data)
export const db = getFirestore(app)

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider()

// Configure Google provider - restrict to college domain
googleProvider.setCustomParameters({
    prompt: 'select_account',
    hd: 'aiktc.ac.in'  // Hint to show only AIKTC accounts
})

export default app

