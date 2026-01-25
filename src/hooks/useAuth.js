/**
 * Auth Hook - Firebase Authentication State
 */

import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../config/firebase'

/**
 * Custom hook for Firebase auth state
 */
export function useAuth() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                    photoURL: firebaseUser.photoURL,
                    provider: firebaseUser.providerData[0]?.providerId,
                })
            } else {
                // User is signed out
                setUser(null)
            }
            setLoading(false)
        })

        // Cleanup subscription
        return () => unsubscribe()
    }, [])

    const logout = async () => {
        try {
            await signOut(auth)
            // Clear local storage as well
            localStorage.removeItem('75guard_user')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return { user, loading, logout }
}

export default useAuth
