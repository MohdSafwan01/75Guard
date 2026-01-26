/**
 * DefaulterCountdown - Shows countdown to next defaulter list
 * 
 * Critical feature to help students stay above 75% before April 21
 */

import { useState, useEffect } from 'react'
import {
    DEFAULTER_DATES,
    getNextDefaulterDate,
    getDaysUntilNextDefaulter,
    getCurrentWeek,
    TOTAL_TEACHING_WEEKS
} from '../config/academicCalendar'
import { useAttendanceStore } from '../store/attendanceStore'

function DefaulterCountdown() {
    const [now, setNow] = useState(new Date())
    const subjects = useAttendanceStore((state) => state.subjects)
    const globalState = useAttendanceStore((state) => state.globalState)

    // Update every minute
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(interval)
    }, [])

    const nextDefaulter = getNextDefaulterDate(now)
    const daysLeft = getDaysUntilNextDefaulter(now)
    const currentWeek = getCurrentWeek(now)

    // Calculate overall attendance
    const totalAttended = subjects.reduce((sum, s) => sum + (s.attendance?.attended || 0), 0)
    const totalConducted = subjects.reduce((sum, s) => sum + (s.attendance?.conducted || 0), 0)
    const overallPercentage = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 100

    // Check if at risk
    const isAtRisk = overallPercentage < 75
    const isCritical = overallPercentage < 70

    if (!nextDefaulter) {
        return (
            <div style={{
                padding: '20px',
                backgroundColor: '#7ED957',
                border: '3px solid #1C1C1C',
                borderRadius: '16px',
                boxShadow: '6px 6px 0px #1C1C1C',
                textAlign: 'center',
            }}>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#1C1C1C' }}>
                    ✅ All defaulter lists have passed!
                </p>
                <p style={{ fontSize: '13px', color: '#4A4A4A', marginTop: '8px' }}>
                    Focus on maintaining your attendance for ESE.
                </p>
            </div>
        )
    }

    // Severity colors
    const getSeverityStyle = () => {
        if (isCritical || nextDefaulter.severity === 'final') {
            return { bg: '#FF6B6B', text: '#FFFFFF', accent: '#FFFFFF' }
        }
        if (isAtRisk || nextDefaulter.severity === 'critical') {
            return { bg: '#FFB347', text: '#1C1C1C', accent: '#1C1C1C' }
        }
        if (nextDefaulter.severity === 'serious') {
            return { bg: '#FFE066', text: '#1C1C1C', accent: '#1C1C1C' }
        }
        return { bg: '#87CEEB', text: '#1C1C1C', accent: '#1C1C1C' }
    }

    const style = getSeverityStyle()

    return (
        <div style={{
            backgroundColor: style.bg,
            border: '3px solid #1C1C1C',
            borderRadius: '16px',
            boxShadow: '6px 6px 0px #1C1C1C',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                padding: '12px 20px',
                backgroundColor: '#1C1C1C',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <span style={{
                    fontSize: '13px',
                    fontWeight: '800',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}>
                    🚨 Defaulter List Countdown
                </span>
                <span style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    backgroundColor: style.bg,
                    color: style.text,
                    borderRadius: '4px',
                    fontWeight: '700',
                }}>
                    Week {currentWeek}/{TOTAL_TEACHING_WEEKS}
                </span>
            </div>

            {/* Main countdown */}
            <div style={{ padding: '24px', textAlign: 'center' }}>
                {/* Days left */}
                <div style={{
                    fontSize: '64px',
                    fontWeight: '900',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: style.text,
                    lineHeight: 1,
                    marginBottom: '8px',
                }}>
                    {daysLeft}
                </div>
                <p style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: style.text,
                    marginBottom: '16px',
                }}>
                    days until {nextDefaulter.name}
                </p>

                {/* Date */}
                <p style={{
                    fontSize: '14px',
                    color: style.accent,
                    opacity: 0.8,
                    marginBottom: '20px',
                }}>
                    📅 {new Date(nextDefaulter.date).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </p>

                {/* Status message */}
                {isAtRisk ? (
                    <div style={{
                        padding: '16px',
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        borderRadius: '12px',
                        border: '2px solid ' + style.text,
                    }}>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: style.text,
                            marginBottom: '8px',
                        }}>
                            ⚠️ You're at {overallPercentage.toFixed(1)}% - Below 75%!
                        </p>
                        <p style={{
                            fontSize: '13px',
                            color: style.text,
                        }}>
                            {nextDefaulter.description}
                        </p>
                    </div>
                ) : (
                    <div style={{
                        padding: '16px',
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        borderRadius: '12px',
                    }}>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: style.text,
                        }}>
                            ✓ You're at {overallPercentage.toFixed(1)}% - Above 75%!
                        </p>
                        <p style={{
                            fontSize: '13px',
                            color: style.text,
                            marginTop: '4px',
                        }}>
                            Keep it up! Don't let your guard down.
                        </p>
                    </div>
                )}
            </div>

            {/* Upcoming defaulter dates */}
            <div style={{
                padding: '16px 20px',
                borderTop: '2px solid #1C1C1C',
                backgroundColor: 'rgba(255,255,255,0.2)',
            }}>
                <p style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: style.text,
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                }}>
                    All Defaulter Dates
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {DEFAULTER_DATES.map((d, i) => {
                        const isPast = new Date(d.date) < now
                        const isNext = d.date === nextDefaulter.date
                        return (
                            <div
                                key={d.date}
                                style={{
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    backgroundColor: isNext ? '#1C1C1C' : isPast ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                                    color: isNext ? '#FFFFFF' : style.text,
                                    textDecoration: isPast ? 'line-through' : 'none',
                                    opacity: isPast ? 0.5 : 1,
                                }}
                            >
                                {new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default DefaulterCountdown
