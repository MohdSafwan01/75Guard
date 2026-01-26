/**
 * DashboardWidgets - Clean, focused dashboard
 * 
 * Priority layout:
 * 1. Today's Checklist (action-first)
 * 2. Key stats (condensed)
 * 3. Defaulter countdown (if at risk)
 */

import { useState } from 'react'
import { useAttendanceStore } from '../store/attendanceStore'
import { calculateBuffer, getStatus } from '../utils/calculations'
import TodayChecklist from './TodayChecklist'
import DefaulterCountdown from './DefaulterCountdown'

function DashboardWidgets() {
    const subjects = useAttendanceStore((state) => state.subjects)
    const [showMore, setShowMore] = useState(false)

    // Calculate aggregate stats
    const stats = subjects.reduce((acc, subject) => {
        if (!subject.attendance || subject.attendance.conducted === 0) return acc

        const buffer = calculateBuffer(subject.attendance, subject.total_expected_sessions || 60)
        const status = getStatus(subject.attendance, subject.total_expected_sessions || 60)

        return {
            totalAttended: acc.totalAttended + subject.attendance.attended,
            totalConducted: acc.totalConducted + subject.attendance.conducted,
            totalBuffer: acc.totalBuffer + Math.max(0, buffer),
            safeCount: acc.safeCount + (status === 'SAFE' ? 1 : 0),
            tensionCount: acc.tensionCount + (status === 'TENSION' ? 1 : 0),
            criticalCount: acc.criticalCount + (status === 'CRITICAL' ? 1 : 0),
            subjectsWithData: acc.subjectsWithData + 1,
        }
    }, {
        totalAttended: 0,
        totalConducted: 0,
        totalBuffer: 0,
        safeCount: 0,
        tensionCount: 0,
        criticalCount: 0,
        subjectsWithData: 0,
    })

    const overallPercentage = stats.totalConducted > 0
        ? (stats.totalAttended / stats.totalConducted) * 100
        : 100

    const isAtRisk = overallPercentage < 75

    return (
        <div style={{ padding: '8px' }}>
            {/* Main grid - 2 column layout */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(300px, 1fr) minmax(280px, 400px)',
                gap: '24px',
                alignItems: 'start',
            }}>
                {/* Left column - Today's Checklist (Primary Action) */}
                <div>
                    <TodayChecklist />
                </div>

                {/* Right column - Stats & Alerts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Quick Stats Card */}
                    <div style={{
                        backgroundColor: '#FAF3E3',
                        border: '3px solid #1C1C1C',
                        borderRadius: '16px',
                        boxShadow: '6px 6px 0px #1C1C1C',
                        overflow: 'hidden',
                    }}>
                        {/* Stats header */}
                        <div style={{
                            padding: '16px 20px',
                            backgroundColor: overallPercentage >= 75 ? '#7ED957' : '#FF6B6B',
                            borderBottom: '2px solid #1C1C1C',
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    color: '#1C1C1C',
                                }}>
                                    Overall Attendance
                                </span>
                                <span style={{
                                    fontSize: '28px',
                                    fontWeight: '900',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    color: '#1C1C1C',
                                }}>
                                    {overallPercentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '2px',
                            backgroundColor: '#1C1C1C',
                            padding: '2px',
                        }}>
                            <StatBox
                                value={stats.totalBuffer}
                                label="Can Skip"
                                icon="🏦"
                                color="#87CEEB"
                            />
                            <StatBox
                                value={stats.safeCount}
                                label="Safe"
                                icon="✅"
                                color="#7ED957"
                            />
                            <StatBox
                                value={stats.criticalCount + stats.tensionCount}
                                label="At Risk"
                                icon="⚠️"
                                color={stats.criticalCount > 0 ? '#FF6B6B' : '#FFB347'}
                            />
                        </div>
                    </div>

                    {/* Defaulter Countdown - only show if at risk or close to deadline */}
                    {(isAtRisk || true) && (
                        <DefaulterCountdown />
                    )}

                    {/* Expand for more widgets */}
                    {!showMore && (
                        <button
                            onClick={() => setShowMore(true)}
                            style={{
                                padding: '12px',
                                backgroundColor: 'transparent',
                                border: '2px dashed #7A7A7A',
                                borderRadius: '12px',
                                color: '#7A7A7A',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            + Show more stats
                        </button>
                    )}

                    {/* More stats when expanded */}
                    {showMore && (
                        <>
                            <StreakWidget />
                            <TipsWidget />
                            <button
                                onClick={() => setShowMore(false)}
                                style={{
                                    padding: '12px',
                                    backgroundColor: 'transparent',
                                    border: '2px dashed #7A7A7A',
                                    borderRadius: '12px',
                                    color: '#7A7A7A',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                }}
                            >
                                − Show less
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

/**
 * Compact stat box
 */
function StatBox({ value, label, icon, color }) {
    return (
        <div style={{
            padding: '16px',
            backgroundColor: color,
            textAlign: 'center',
        }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{icon}</div>
            <div style={{
                fontSize: '28px',
                fontWeight: '900',
                fontFamily: "'JetBrains Mono', monospace",
                color: '#1C1C1C',
            }}>
                {value}
            </div>
            <div style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#1C1C1C',
                textTransform: 'uppercase',
            }}>
                {label}
            </div>
        </div>
    )
}

/**
 * Streak widget
 */
function StreakWidget() {
    const streak = 3 // TODO: Calculate from actual data

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#FFB347',
            border: '3px solid #1C1C1C',
            borderRadius: '16px',
            boxShadow: '6px 6px 0px #1C1C1C',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
        }}>
            <span style={{ fontSize: '40px' }}>🔥</span>
            <div>
                <div style={{
                    fontSize: '32px',
                    fontWeight: '900',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#1C1C1C',
                }}>
                    {streak}
                </div>
                <div style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#1C1C1C',
                }}>
                    Day streak
                </div>
            </div>
        </div>
    )
}

/**
 * Tips widget
 */
function TipsWidget() {
    const tips = [
        'Update attendance after each class',
        'Check before planning any trips',
        'Keep 2-3 classes as buffer',
    ]

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#98D8AA',
            border: '3px solid #1C1C1C',
            borderRadius: '16px',
            boxShadow: '6px 6px 0px #1C1C1C',
        }}>
            <h3 style={{
                fontSize: '14px',
                fontWeight: '800',
                marginBottom: '12px',
                color: '#1C1C1C',
            }}>
                💡 Quick Tips
            </h3>
            <ul style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '13px',
                color: '#1C1C1C',
                lineHeight: 1.8,
            }}>
                {tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                ))}
            </ul>
        </div>
    )
}

export default DashboardWidgets
