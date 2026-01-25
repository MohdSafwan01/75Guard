/**
 * DashboardWidgets - Creative dashboard features
 * 
 * Includes:
 * - Skip Bank
 * - Risk Speedometer  
 * - Weekly Report Card
 * - Streak Counter
 */

import { useAttendanceStore } from '../store/attendanceStore'
import { calculateBuffer, calculatePercentage, getStatus } from '../utils/calculations'

function DashboardWidgets() {
    const subjects = useAttendanceStore((state) => state.subjects)
    const globalState = useAttendanceStore((state) => state.globalState)

    // Calculate aggregate stats
    const stats = subjects.reduce((acc, subject) => {
        if (!subject.attendance || subject.attendance.conducted === 0) return acc

        const percentage = calculatePercentage(
            subject.attendance.attended,
            subject.attendance.conducted
        )
        const buffer = calculateBuffer(subject.attendance, subject.total_expected_sessions || 75)
        const status = getStatus(subject.attendance, subject.total_expected_sessions || 75)

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
        : 0

    // Calculate grade
    const getGrade = (percentage) => {
        if (percentage >= 95) return { grade: 'A+', color: '#7ED957', emoji: '🏆' }
        if (percentage >= 90) return { grade: 'A', color: '#7ED957', emoji: '🌟' }
        if (percentage >= 85) return { grade: 'B+', color: '#98D8AA', emoji: '👍' }
        if (percentage >= 80) return { grade: 'B', color: '#98D8AA', emoji: '✓' }
        if (percentage >= 75) return { grade: 'C', color: '#FFB347', emoji: '⚡' }
        if (percentage >= 70) return { grade: 'D', color: '#FFB347', emoji: '⚠️' }
        return { grade: 'F', color: '#FF6B6B', emoji: '🚨' }
    }

    const gradeInfo = getGrade(overallPercentage)

    // Risk level (0-100)
    const riskLevel = Math.max(0, Math.min(100, 100 - overallPercentage + (stats.criticalCount * 10)))

    // Simulate streak (would be tracked in real app)
    const streak = Math.floor(Math.random() * 10) + 1

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            padding: '8px',
        }}>
            {/* Welcome Card */}
            <div style={{
                gridColumn: '1 / -1',
                padding: '28px',
                backgroundColor: '#FFB5C5',
                border: '3px solid #1C1C1C',
                borderRadius: '16px',
                boxShadow: '6px 6px 0px #1C1C1C',
            }}>
                <h2 style={{
                    fontSize: '28px',
                    fontWeight: '900',
                    color: '#1C1C1C',
                    marginBottom: '8px',
                }}>
                    👋 Welcome to 75Guard!
                </h2>
                <p style={{
                    fontSize: '15px',
                    color: '#4A4A4A',
                }}>
                    Select a subject from the left to see detailed stats and simulations.
                    Here's your quick overview:
                </p>
            </div>

            {/* Skip Bank */}
            <WidgetCard
                title="🏦 Skip Bank"
                color="#87CEEB"
            >
                <div style={{
                    fontSize: '56px',
                    fontWeight: '900',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#1C1C1C',
                    marginBottom: '8px',
                }}>
                    {stats.totalBuffer}
                </div>
                <p style={{ fontSize: '14px', color: '#4A4A4A', fontWeight: '600' }}>
                    free classes you can skip
                </p>
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.5)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#1C1C1C',
                }}>
                    💡 Tip: Spend wisely! This resets when classes are held.
                </div>
            </WidgetCard>

            {/* Weekly Report Card */}
            <WidgetCard
                title="📊 Report Card"
                color={gradeInfo.color}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '12px',
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#FFFFFF',
                        border: '3px solid #1C1C1C',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '40px',
                        fontWeight: '900',
                        color: '#1C1C1C',
                        boxShadow: '4px 4px 0px #1C1C1C',
                    }}>
                        {gradeInfo.grade}
                    </div>
                    <div>
                        <div style={{ fontSize: '32px' }}>{gradeInfo.emoji}</div>
                        <div style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            fontFamily: "'JetBrains Mono', monospace",
                            color: '#1C1C1C',
                        }}>
                            {overallPercentage.toFixed(1)}%
                        </div>
                    </div>
                </div>
                <p style={{ fontSize: '13px', color: '#4A4A4A' }}>
                    Overall attendance this semester
                </p>
            </WidgetCard>

            {/* Risk Speedometer */}
            <WidgetCard
                title="⚡ Risk Meter"
                color={riskLevel > 50 ? '#FF6B6B' : riskLevel > 25 ? '#FFB347' : '#98D8AA'}
            >
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                    {/* Speedometer arc */}
                    <svg width="180" height="100" viewBox="0 0 180 100">
                        {/* Background arc */}
                        <path
                            d="M 10 90 A 80 80 0 0 1 170 90"
                            fill="none"
                            stroke="rgba(255,255,255,0.5)"
                            strokeWidth="14"
                            strokeLinecap="round"
                        />
                        {/* Value arc */}
                        <path
                            d="M 10 90 A 80 80 0 0 1 170 90"
                            fill="none"
                            stroke="#1C1C1C"
                            strokeWidth="14"
                            strokeLinecap="round"
                            strokeDasharray={`${(riskLevel / 100) * 251.2} 251.2`}
                        />
                    </svg>
                    {/* Center value */}
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center',
                    }}>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: '900',
                            fontFamily: "'JetBrains Mono', monospace",
                            color: '#1C1C1C',
                        }}>
                            {Math.round(riskLevel)}
                        </div>
                    </div>
                </div>
                <p style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#1C1C1C',
                    textAlign: 'center',
                }}>
                    {riskLevel > 50 ? '🚨 High Risk!' : riskLevel > 25 ? '⚠️ Moderate' : '✓ Low Risk'}
                </p>
            </WidgetCard>

            {/* Streak Counter */}
            <WidgetCard
                title="🔥 Attendance Streak"
                color="#FFB347"
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                }}>
                    <span style={{ fontSize: '48px' }}>🔥</span>
                    <div>
                        <div style={{
                            fontSize: '48px',
                            fontWeight: '900',
                            fontFamily: "'JetBrains Mono', monospace",
                            color: '#1C1C1C',
                        }}>
                            {streak}
                        </div>
                        <div style={{ fontSize: '14px', color: '#4A4A4A', fontWeight: '600' }}>
                            days perfect
                        </div>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    gap: '4px',
                }}>
                    {[1, 2, 3, 4, 5, 6, 7].map(day => (
                        <div
                            key={day}
                            style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: day <= streak ? '#1C1C1C' : 'rgba(255,255,255,0.5)',
                                border: '2px solid #1C1C1C',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                color: day <= streak ? '#FFFFFF' : '#1C1C1C',
                            }}
                        >
                            {day <= streak ? '✓' : day}
                        </div>
                    ))}
                </div>
            </WidgetCard>

            {/* Subject Summary */}
            <WidgetCard
                title="📚 Subject Summary"
                color="#C5A3FF"
            >
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <SummaryBadge count={stats.safeCount} label="Safe" color="#7ED957" />
                    <SummaryBadge count={stats.tensionCount} label="Tension" color="#FFB347" />
                    <SummaryBadge count={stats.criticalCount} label="Critical" color="#FF6B6B" />
                </div>
                <div style={{
                    fontSize: '13px',
                    color: '#4A4A4A',
                }}>
                    {stats.subjectsWithData} of {subjects.length} subjects tracked
                </div>
            </WidgetCard>

            {/* Quick Tips */}
            <WidgetCard
                title="💡 Quick Tips"
                color="#98D8AA"
            >
                <ul style={{
                    fontSize: '13px',
                    color: '#4A4A4A',
                    lineHeight: '1.8',
                    paddingLeft: '20px',
                    margin: 0,
                }}>
                    <li>Update attendance after each class</li>
                    <li>Check PNR dates before planning trips</li>
                    <li>Use Skip Simulator before bunking</li>
                    <li>Keep 2-3 classes as emergency buffer</li>
                </ul>
            </WidgetCard>
        </div>
    )
}

/**
 * Widget Card wrapper
 */
function WidgetCard({ title, color, children }) {
    return (
        <div style={{
            padding: '24px',
            backgroundColor: color,
            border: '3px solid #1C1C1C',
            borderRadius: '16px',
            boxShadow: '6px 6px 0px #1C1C1C',
        }}>
            <h3 style={{
                fontSize: '14px',
                fontWeight: '800',
                color: '#1C1C1C',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
            }}>
                {title}
            </h3>
            {children}
        </div>
    )
}

/**
 * Summary Badge
 */
function SummaryBadge({ count, label, color }) {
    return (
        <div style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#FFFFFF',
            border: '2px solid #1C1C1C',
            borderRadius: '10px',
            textAlign: 'center',
        }}>
            <div style={{
                fontSize: '28px',
                fontWeight: '900',
                color: color,
                fontFamily: "'JetBrains Mono', monospace",
            }}>
                {count}
            </div>
            <div style={{ fontSize: '11px', color: '#7A7A7A', fontWeight: '600' }}>
                {label}
            </div>
        </div>
    )
}

export default DashboardWidgets
