/**
 * LoginPage - Neo-brutalist Login Experience with Firebase Google Auth
 */

import { useState } from 'react'
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import { isCollegeEmail, getEmailValidationError } from '../config/divisions'
import { saveUserProfile } from '../services/userService'

function LoginPage({ onLoginSuccess, onBack }) {
    const [isSignUp, setIsSignUp] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Email/Password Sign In
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        // Validate college email for signup
        if (isSignUp && !isCollegeEmail(formData.email)) {
            setError(getEmailValidationError(formData.email))
            setIsLoading(false)
            return
        }

        try {
            let userCredential
            if (isSignUp) {
                // Create new account
                userCredential = await createUserWithEmailAndPassword(
                    auth,
                    formData.email,
                    formData.password
                )
                // Update display name
                if (formData.name) {
                    await updateProfile(userCredential.user, {
                        displayName: formData.name
                    })
                }
                // Save to Firestore
                await saveUserProfile({
                    uid: userCredential.user.uid,
                    email: formData.email,
                    name: formData.name || formData.email.split('@')[0],
                })
            } else {
                // Sign in existing user
                userCredential = await signInWithEmailAndPassword(
                    auth,
                    formData.email,
                    formData.password
                )
            }
            // Auth state listener in useAuth will handle the redirect
            if (onLoginSuccess) onLoginSuccess()
        } catch (err) {
            console.error('Auth error:', err)
            setError(getErrorMessage(err.code))
        } finally {
            setIsLoading(false)
        }
    }

    // Google Sign In
    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        setError('')

        try {
            const result = await signInWithPopup(auth, googleProvider)
            const user = result.user

            // Validate college email
            if (!isCollegeEmail(user.email)) {
                // Sign out if not college email
                await auth.signOut()
                setError('Please use your college email (@aiktc.ac.in) to sign in.')
                setIsLoading(false)
                return
            }

            // Save to Firestore
            await saveUserProfile({
                uid: user.uid,
                email: user.email,
                name: user.displayName,
                photoURL: user.photoURL,
            })

            // Auth state listener in useAuth will handle the redirect
            if (onLoginSuccess) onLoginSuccess()
        } catch (err) {
            console.error('Google auth error:', err)
            if (err.code !== 'auth/popup-closed-by-user') {
                setError(getErrorMessage(err.code))
            }
        } finally {
            setIsLoading(false)
        }
    }

    // Convert Firebase error codes to user-friendly messages
    const getErrorMessage = (code) => {
        switch (code) {
            case 'auth/email-already-in-use':
                return 'This email is already registered. Try logging in instead.'
            case 'auth/invalid-email':
                return 'Invalid email address.'
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.'
            case 'auth/user-not-found':
                return 'No account found with this email.'
            case 'auth/wrong-password':
                return 'Incorrect password.'
            case 'auth/too-many-requests':
                return 'Too many attempts. Please try again later.'
            case 'auth/popup-blocked':
                return 'Popup was blocked. Please allow popups for this site.'
            default:
                return 'An error occurred. Please try again.'
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '16px 20px',
        fontSize: '16px',
        fontWeight: '500',
        border: '3px solid #1C1C1C',
        borderRadius: '12px',
        backgroundColor: '#FFFFFF',
        marginBottom: '16px',
        boxShadow: '4px 4px 0px #1C1C1C',
        transition: 'all 0.15s ease',
        outline: 'none',
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#1C1C1C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background decorations */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                width: '200px',
                height: '200px',
                backgroundColor: '#FFB5C5',
                borderRadius: '50%',
                filter: 'blur(100px)',
                opacity: 0.4,
            }} />
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '10%',
                width: '250px',
                height: '250px',
                backgroundColor: '#7ED957',
                borderRadius: '50%',
                filter: 'blur(100px)',
                opacity: 0.4,
            }} />

            {/* Back button */}
            <button
                onClick={onBack}
                style={{
                    position: 'absolute',
                    top: '24px',
                    left: '24px',
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    border: '2px solid #FFFFFF',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    zIndex: 10,
                }}
            >
                ← Back
            </button>

            {/* Login Card */}
            <div style={{
                width: '100%',
                maxWidth: '440px',
                backgroundColor: '#FAF3E3',
                border: '4px solid #1C1C1C',
                borderRadius: '24px',
                padding: '48px 40px',
                boxShadow: '12px 12px 0px #1C1C1C',
                position: 'relative',
                zIndex: 10,
            }}>
                {/* Logo */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '32px',
                }}>
                    <div style={{
                        fontSize: '48px',
                        marginBottom: '16px',
                    }}>
                        🛡️
                    </div>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '900',
                        color: '#1C1C1C',
                        marginBottom: '8px',
                    }}>
                        {isSignUp ? 'Join 75Guard' : 'Welcome Back'}
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: '#7A7A7A',
                    }}>
                        {isSignUp
                            ? 'Create your account to start tracking'
                            : 'Login to access your dashboard'
                        }
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: '#FFE8E8',
                        border: '2px solid #FF6B6B',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '13px',
                        color: '#FF6B6B',
                        fontWeight: '600',
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {isSignUp && (
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '700',
                                color: '#1C1C1C',
                                marginBottom: '8px',
                            }}>
                                Your Name
                            </label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={inputStyle}
                                required={isSignUp}
                            />
                        </div>
                    )}

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#1C1C1C',
                            marginBottom: '8px',
                        }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#1C1C1C',
                            marginBottom: '8px',
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={inputStyle}
                            required
                            minLength={6}
                        />
                    </div>

                    {!isSignUp && (
                        <div style={{
                            textAlign: 'right',
                            marginBottom: '24px',
                        }}>
                            <a
                                href="#"
                                style={{
                                    fontSize: '13px',
                                    color: '#1C1C1C',
                                    textDecoration: 'underline',
                                }}
                            >
                                Forgot password?
                            </a>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '18px',
                            fontSize: '16px',
                            fontWeight: '800',
                            backgroundColor: '#7ED957',
                            border: '3px solid #1C1C1C',
                            borderRadius: '12px',
                            color: '#1C1C1C',
                            cursor: isLoading ? 'wait' : 'pointer',
                            boxShadow: '5px 5px 0px #1C1C1C',
                            transition: 'all 0.15s ease',
                            marginBottom: '24px',
                            opacity: isLoading ? 0.7 : 1,
                        }}
                    >
                        {isLoading ? '⏳ Please wait...' : isSignUp ? '🚀 Create Account' : '🔐 Login'}
                    </button>

                    {/* Divider */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '24px',
                    }}>
                        <div style={{ flex: 1, height: '2px', backgroundColor: '#1C1C1C' }} />
                        <span style={{ fontSize: '12px', color: '#7A7A7A', fontWeight: '600' }}>OR</span>
                        <div style={{ flex: 1, height: '2px', backgroundColor: '#1C1C1C' }} />
                    </div>

                    {/* Google Button */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '14px',
                            fontWeight: '700',
                            backgroundColor: '#FFFFFF',
                            border: '3px solid #1C1C1C',
                            borderRadius: '12px',
                            color: '#1C1C1C',
                            cursor: isLoading ? 'wait' : 'pointer',
                            boxShadow: '4px 4px 0px #1C1C1C',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            opacity: isLoading ? 0.7 : 1,
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>
                </form>

                {/* Toggle */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '32px',
                    fontSize: '14px',
                    color: '#7A7A7A',
                }}>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp)
                            setError('')
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#1C1C1C',
                            fontWeight: '700',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            padding: 0,
                            boxShadow: 'none',
                        }}
                    >
                        {isSignUp ? 'Login' : 'Sign Up'}
                    </button>
                </p>

                {/* Decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#FFB5C5',
                    border: '3px solid #1C1C1C',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    boxShadow: '4px 4px 0px #1C1C1C',
                }}>
                    ✨
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: '-15px',
                    left: '-15px',
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#87CEEB',
                    border: '3px solid #1C1C1C',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    boxShadow: '3px 3px 0px #1C1C1C',
                    transform: 'rotate(-12deg)',
                }}>
                    🔒
                </div>
            </div>
        </div>
    )
}

export default LoginPage
