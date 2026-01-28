/**
 * GlobalCommandHeader - Top Bar (Neo-Brutalist Style)
 * With user profile and logout
 */

import { useState } from 'react'
import { useAttendanceStore } from '../store/attendanceStore'

function GlobalCommandHeader({ user, onLogout }) {
    const globalState = useAttendanceStore((state) => state.globalState)
    const subjects = useAttendanceStore((state) => state.subjects)
    const lastUpdated = useAttendanceStore((state) => state.lastUpdated)
    const setExpandedSubject = useAttendanceStore((state) => state.setExpandedSubject)
    const [showUserMenu, setShowUserMenu] = useState(false)

    const criticalCount = subjects.filter(s => {
        if (!s.attendance || s.attendance.conducted === 0) return false
        const percentage = (s.attendance.attended / s.attendance.conducted) * 100
        return percentage < 75
    }).length

    const formatLastUpdated = () => {
        if (!lastUpdated) return 'Never'
        const now = new Date()
        const updated = new Date(lastUpdated)
        const diffDays = Math.floor((now - updated) / (1000 * 60 * 60 * 24))
        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        return `${diffDays} days ago`
    }

    const getStateBadgeStyle = () => {
        const base = {
            padding: '8px 18px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            border: '2px solid #1C1C1C',
            boxShadow: '3px 3px 0px #1C1C1C',
        }

        switch (globalState) {
            case 'CRITICAL':
                return { ...base, backgroundColor: '#FF6B6B', color: '#FFFFFF' }
            case 'TENSION':
                return { ...base, backgroundColor: '#FFB347', color: '#1C1C1C' }
            default:
                return { ...base, backgroundColor: '#7ED957', color: '#1C1C1C' }
        }
    }

    return (
        <header
            role="banner"
            aria-label="Global Command Header"
            data-testid="global-command-header"
        >
            {/* Left: Logo/Brand */}
            <div data-testid="system-name"
                onClick={() => setExpandedSubject(null)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    cursor: 'pointer',
                }}>
                <span style={{
                    fontSize: '26px',
                    fontWeight: '900',
                    color: '#FFFFFF',
                    letterSpacing: '-0.5px',
                }}>
                    🛡️ 75Guard
                </span>
                <span style={{
                    fontSize: '12px',
                    color: '#7A7A7A',
                    fontWeight: '500',
                    padding: '4px 10px',
                    backgroundColor: '#333',
                    borderRadius: '6px',
                }}>
                    {subjects.length} subjects
                </span>
            </div>

            {/* Center: Status Badge */}
            <div data-testid="system-state" style={getStateBadgeStyle()}>
                {globalState === 'CRITICAL' && `🚨 ${criticalCount} CRITICAL`}
                {globalState === 'TENSION' && '⚡ ATTENTION NEEDED'}
                {globalState === 'SAFE' && '✓ ALL SAFE'}
            </div>

            {/* Right: User Menu */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                position: 'relative',
            }}>
                <div style={{
                    fontSize: '12px',
                    color: '#7A7A7A',
                    display: 'none', // Hide on mobile
                }}>
                    Updated: <span style={{ color: '#FFFFFF', fontWeight: '600' }}>{formatLastUpdated()}</span>
                </div>

                {/* User Avatar/Button */}
                {user && (
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 14px',
                                backgroundColor: '#333',
                                border: '2px solid #555',
                                borderRadius: '10px',
                                color: '#FFFFFF',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                boxShadow: 'none',
                            }}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                backgroundColor: '#7ED957',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: '800',
                                color: '#1C1C1C',
                                border: '2px solid #1C1C1C',
                                overflow: 'hidden',
                            }}>
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    user.name?.charAt(0).toUpperCase() || '?'
                                )}
                            </div>
                            <span>{user.name || 'User'}</span>
                            <span style={{ fontSize: '10px' }}>▼</span>
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: '0',
                                marginTop: '8px',
                                backgroundColor: '#FAF3E3',
                                border: '3px solid #1C1C1C',
                                borderRadius: '12px',
                                boxShadow: '6px 6px 0px #1C1C1C',
                                minWidth: '180px',
                                zIndex: 1000,
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    padding: '16px',
                                    borderBottom: '2px solid #1C1C1C',
                                }}>
                                    <p style={{
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        color: '#1C1C1C',
                                        marginBottom: '4px',
                                    }}>
                                        {user.name || 'User'}
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#7A7A7A' }}>
                                        {user.email}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure? This will reset all attendance data to default.')) {
                                            useAttendanceStore.getState().resetAllData()
                                            useAttendanceStore.persist.clearStorage()
                                            window.location.reload()
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid #1C1C1C',
                                        borderRadius: '0',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#1C1C1C',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        boxShadow: 'none',
                                    }}
                                >
                                    🔄 Reset Data
                                </button>
                                <button
                                    onClick={() => {
                                        setShowUserMenu(false)
                                        if (onLogout) onLogout()
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        backgroundColor: '#FF6B6B',
                                        border: 'none',
                                        borderRadius: '0',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        color: '#FFFFFF',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        boxShadow: 'none',
                                    }}
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    )
}

export default GlobalCommandHeader
