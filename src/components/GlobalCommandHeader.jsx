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
            className="w-full bg-[#1C1C1C] flex items-center justify-between px-4 py-3 shadow-[0_4px_0_#000000] z-30 relative"
        >
            {/* Left: Logo/Brand */}
            <div data-testid="system-name"
                onClick={() => setExpandedSubject(null)}
                className="flex items-center gap-2 md:gap-4 cursor-pointer"
            >
                <span className="text-xl md:text-2xl font-black text-white tracking-tighter">
                    🛡️ 75Guard
                </span>
                <span className="hidden md:inline-block text-xs text-[#7A7A7A] font-medium px-2 py-1 bg-[#333] rounded-md">
                    {subjects.length} subjects
                </span>
            </div>

            {/* Center: Status Badge (Hidden on very small screens if needed, otherwise simplified) */}
            <div
                data-testid="system-state"
                style={getStateBadgeStyle()}
                className="hidden md:block transition-all transform hover:scale-105"
            >
                {globalState === 'CRITICAL' && `🚨 ${criticalCount} CRITICAL`}
                {globalState === 'TENSION' && '⚡ ATTENTION NEEDED'}
                {globalState === 'SAFE' && '✓ ALL SAFE'}
            </div>

            {/* Right: User Menu */}
            <div className="flex items-center gap-4 relative">
                <div className="hidden lg:block text-xs text-[#7A7A7A]">
                    Updated: <span className="text-white font-semibold">{formatLastUpdated()}</span>
                </div>

                {/* User Avatar/Button */}
                {user && (
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 px-3 py-2 bg-[#333] border-2 border-[#555] rounded-xl text-white cursor-pointer hover:bg-[#444] transition-colors"
                        >
                            <div className="w-8 h-8 bg-[#7ED957] rounded-lg flex items-center justify-center font-extrabold text-[#1C1C1C] border-2 border-[#1C1C1C] overflow-hidden">
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    user.name?.charAt(0).toUpperCase() || '?'
                                )}
                            </div>
                            <span className="hidden sm:inline font-semibold text-sm max-w-[100px] truncate">
                                {user.name || 'User'}
                            </span>
                            <span className="text-[10px]">▼</span>
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute top-full right-0 mt-2 bg-[#FAF3E3] border-[3px] border-[#1C1C1C] rounded-2xl shadow-[6px_6px_0px_#1C1C1C] min-w-[200px] z-50 overflow-hidden">
                                <div className="p-4 border-b-2 border-[#1C1C1C]">
                                    <p className="text-sm font-bold text-[#1C1C1C] mb-1 truncate">
                                        {user.name || 'User'}
                                    </p>
                                    <p className="text-xs text-[#7A7A7A] truncate">
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
                                    className="w-full p-4 bg-transparent border-none border-b border-[#1C1C1C] text-left text-sm font-semibold text-[#1C1C1C] cursor-pointer hover:bg-black/5"
                                >
                                    🔄 Reset Data
                                </button>
                                <button
                                    onClick={() => {
                                        setShowUserMenu(false)
                                        if (onLogout) onLogout()
                                    }}
                                    className="w-full p-4 bg-[#FF6B6B] border-none text-left text-sm font-bold text-white cursor-pointer hover:bg-[#FF5252]"
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
