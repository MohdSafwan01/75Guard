/**
 * 75Guard - Main Application
 * 
 * Flow: Hero Page → Login (Firebase Auth) → Dashboard
 */

import { useState, useEffect } from 'react'
import { useAttendanceStore } from './store/attendanceStore'
import { useAuth } from './hooks/useAuth'

// Pages
import HeroPage from './pages/HeroPage'
import LoginPage from './pages/LoginPage'

// Components
import StateContainer from './components/StateContainer'
import LayoutShell from './components/LayoutShell'
import ErrorBoundary from './components/ErrorBoundary'
import { LoadingState } from './components/EmptyStates'
import Confetti from './components/Confetti'


function App() {
    // Firebase auth state
    const { user, loading: authLoading, logout } = useAuth()

    // Navigation state (only used when not authenticated)
    const [currentPage, setCurrentPage] = useState('hero') // 'hero' | 'login'

    // Store state
    const subjects = useAttendanceStore((state) => state.subjects)
    const globalState = useAttendanceStore((state) => state.globalState)
    const isLoading = useAttendanceStore((state) => state.isLoading)

    // Store actions
    const initializeSubjects = useAttendanceStore((state) => state.initializeSubjects)
    const refreshGlobalState = useAttendanceStore((state) => state.refreshGlobalState)

    // Initialize subjects if empty
    useEffect(() => {
        if (subjects.length === 0) {
            initializeSubjects()
        }
    }, [subjects.length, initializeSubjects])

    // Refresh global state on mount
    useEffect(() => {
        if (subjects.length > 0) {
            refreshGlobalState()
        }
    }, [subjects, refreshGlobalState])

    // Navigation handlers
    const handleGetStarted = () => {
        setCurrentPage('login')
    }

    const handleLoginSuccess = () => {
        // Firebase auth state listener will automatically update user
        // No need to manually change page - user state change triggers dashboard
    }

    const handleBackToHero = () => {
        setCurrentPage('hero')
    }

    const handleLogout = async () => {
        await logout()
        setCurrentPage('hero')
    }

    // Show loading while Firebase checks auth state
    if (authLoading) {
        return (
            <StateContainer globalState="SAFE">
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#1C1C1C',
                }}>
                    <div style={{
                        textAlign: 'center',
                        color: '#FFFFFF',
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛡️</div>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: '800',
                            marginBottom: '16px',
                        }}>
                            75Guard
                        </div>
                        <LoadingState message="Loading..." />
                    </div>
                </div>
            </StateContainer>
        )
    }

    // Not authenticated - show hero or login page
    if (!user) {
        if (currentPage === 'login') {
            return <LoginPage onLoginSuccess={handleLoginSuccess} onBack={handleBackToHero} />
        }
        return <HeroPage onGetStarted={handleGetStarted} />
    }

    // Authenticated - show dashboard
    if (isLoading) {
        return (
            <StateContainer globalState="SAFE">
                <LoadingState message="Loading attendance data..." />
            </StateContainer>
        )
    }

    // Show confetti when all subjects are safe
    const allSafe = globalState === 'SAFE' && subjects.every(s => {
        if (!s.attendance || s.attendance.conducted === 0) return true
        return (s.attendance.attended / s.attendance.conducted) * 100 >= 75
    })

    return (
        <ErrorBoundary>
            <StateContainer globalState={globalState}>
                {allSafe && <Confetti />}
                <LayoutShell user={user} onLogout={handleLogout} />
            </StateContainer>
        </ErrorBoundary>
    )
}

export default App
