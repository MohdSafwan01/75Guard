/**
 * Leaderboard - Simple, subtle ranking display
 */

import { useState, useEffect } from 'react'
import { getLeaderboard, getUserRank } from '../services/userService'
import { useAuth } from '../hooks/useAuth'

function Leaderboard({ division = 'TE-DS' }) {
    const { user } = useAuth()
    const [leaderboard, setLeaderboard] = useState([])
    const [userRank, setUserRank] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                setLoading(true)
                const data = await getLeaderboard(division, 10)
                setLeaderboard(data)

                if (user?.uid) {
                    const rank = await getUserRank(user.uid, division)
                    setUserRank(rank)
                }
            } catch (err) {
                console.error('Leaderboard error:', err)
                setError('Could not load leaderboard')
            } finally {
                setLoading(false)
            }
        }

        fetchLeaderboard()
    }, [division, user?.uid])

    if (loading) {
        return (
            <div style={{
                padding: '24px',
                backgroundColor: '#FAF3E3',
                border: '3px solid #1C1C1C',
                borderRadius: '16px',
                textAlign: 'center',
            }}>
                <p style={{ color: '#7A7A7A' }}>Loading leaderboard...</p>
            </div>
        )
    }

    if (error || leaderboard.length === 0) {
        return (
            <div style={{
                padding: '24px',
                backgroundColor: '#FAF3E3',
                border: '3px solid #1C1C1C',
                borderRadius: '16px',
                textAlign: 'center',
            }}>
                <p style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</p>
                <p style={{ color: '#7A7A7A', fontSize: '14px' }}>
                    {error || 'No rankings yet. Be the first!'}
                </p>
            </div>
        )
    }

    const getRankBadge = (rank) => {
        switch (rank) {
            case 1: return '🥇'
            case 2: return '🥈'
            case 3: return '🥉'
            default: return `#${rank}`
        }
    }

    return (
        <div style={{
            backgroundColor: '#FAF3E3',
            border: '3px solid #1C1C1C',
            borderRadius: '16px',
            boxShadow: '6px 6px 0px #1C1C1C',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                backgroundColor: '#1C1C1C',
                color: '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>🏆</span>
                    <span style={{ fontWeight: '800', fontSize: '14px' }}>LEADERBOARD</span>
                </div>
                <span style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    backgroundColor: '#7ED957',
                    color: '#1C1C1C',
                    borderRadius: '6px',
                    fontWeight: '700',
                }}>
                    {division}
                </span>
            </div>

            {/* User's rank highlight */}
            {userRank?.rank && (
                <div style={{
                    padding: '12px 20px',
                    backgroundColor: '#87CEEB',
                    borderBottom: '2px solid #1C1C1C',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#1C1C1C' }}>
                        Your Position
                    </span>
                    <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: '800',
                        fontSize: '14px',
                        color: '#1C1C1C',
                    }}>
                        #{userRank.rank} of {userRank.total}
                    </span>
                </div>
            )}

            {/* Rankings */}
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {leaderboard.map((entry, i) => {
                    const isCurrentUser = entry.uid === user?.uid
                    return (
                        <div
                            key={entry.uid}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 20px',
                                borderBottom: i < leaderboard.length - 1 ? '1px solid #E0D5C0' : 'none',
                                backgroundColor: isCurrentUser ? '#E8F5E0' : 'transparent',
                            }}
                        >
                            {/* Rank */}
                            <div style={{
                                width: '36px',
                                fontSize: entry.rank <= 3 ? '20px' : '14px',
                                fontWeight: '800',
                                color: '#1C1C1C',
                            }}>
                                {getRankBadge(entry.rank)}
                            </div>

                            {/* Avatar */}
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: '#7ED957',
                                border: '2px solid #1C1C1C',
                                marginRight: '12px',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: '800',
                            }}>
                                {entry.photoURL ? (
                                    <img src={entry.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    entry.name?.charAt(0).toUpperCase()
                                )}
                            </div>

                            {/* Name */}
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#1C1C1C',
                                    marginBottom: '2px',
                                }}>
                                    {isCurrentUser ? 'You' : entry.name}
                                </p>
                                {entry.streak > 0 && (
                                    <p style={{ fontSize: '11px', color: '#7A7A7A' }}>
                                        🔥 {entry.streak}-day streak
                                    </p>
                                )}
                            </div>

                            {/* Percentage */}
                            <div style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: '800',
                                fontSize: '15px',
                                color: entry.percentage >= 75 ? '#1C1C1C' : '#FF6B6B',
                                padding: '4px 10px',
                                backgroundColor: entry.percentage >= 75 ? '#7ED957' : '#FFE8E8',
                                borderRadius: '6px',
                                border: '2px solid #1C1C1C',
                            }}>
                                {entry.percentage}%
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Leaderboard
