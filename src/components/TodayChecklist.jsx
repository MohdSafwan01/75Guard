/**
 * TodayChecklist - Quick daily attendance input
 * 
 * Shows today's classes based on timetable, allows one-tap attendance marking
 * Labs are filtered by user's batch (1, 2, or 3)
 * Respects holidays from academic calendar
 */

import { useState, useEffect } from 'react'
import { useAttendanceStore } from '../store/attendanceStore'
import { getHolidayInfo, isWeekend } from '../config/academicCalendar'

// Day mapping
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Timetable based on actual schedule w.e.f Jan 19, 2026
// Labs have 'batch' property indicating which batch attends
const TIMETABLE = {
    Monday: [
        { code: 'CSS', time: '9:30', type: 'lecture' },
        { code: 'DC', time: '10:30', type: 'lecture' },
        { code: 'DAV', time: '11:30', type: 'lecture' },
        { code: 'ML', time: '12:30', type: 'lecture' },
        // Afternoon labs - different batches attend different labs
        { code: 'DAV', time: '2:30', type: 'lab', batch: 1 },
        { code: 'CSS', time: '2:30', type: 'lab', batch: 2 },
        { code: 'CCL', time: '2:30', type: 'lab', batch: 3 },
    ],
    Tuesday: [
        { code: 'SEPM', time: '9:30', type: 'lecture' },
        { code: 'CSS', time: '11:30', type: 'lecture' },
        { code: 'SEPM', time: '12:30', type: 'lecture' },
        // Afternoon - PRO (Professional) period for all
    ],
    Wednesday: [
        { code: 'SEPM', time: '9:30', type: 'lecture' },
        { code: 'DC', time: '10:30', type: 'lecture' },
        // Lab slots
        { code: 'DAV', time: '11:30', type: 'lab', batch: 1 },
        { code: 'CCL', time: '11:30', type: 'lab', batch: 2 },
        { code: 'ML', time: '11:30', type: 'lab', batch: 3 },
        { code: 'DAV', time: '2:30', type: 'lecture' },
        { code: 'SEPM', time: '3:30', type: 'lab', batch: 1 },
        { code: 'SEPM', time: '3:30', type: 'lab', batch: 2 },
        { code: 'SEPM', time: '3:30', type: 'lab', batch: 3 },
    ],
    Thursday: [
        // Morning labs
        { code: 'ML', time: '9:30', type: 'lab', batch: 1 },
        { code: 'ML', time: '9:30', type: 'lab', batch: 2 },
        { code: 'CCL', time: '9:30', type: 'lab', batch: 3 },
        { code: 'ML', time: '12:30', type: 'lecture' },
        { code: 'SEPM', time: '1:30', type: 'lecture' },
        // Afternoon labs
        { code: 'SEPM', time: '3:30', type: 'lab', batch: 1 },
        { code: 'SEPM', time: '3:30', type: 'lab', batch: 2 },
        { code: 'SEPM', time: '3:30', type: 'lab', batch: 3 },
    ],
    Friday: [
        { code: 'ML', time: '9:30', type: 'lecture' },
        { code: 'CSS', time: '10:30', type: 'lecture' },
        { code: 'DAV', time: '11:30', type: 'lecture' },
        { code: 'DC', time: '12:30', type: 'lecture' },
        // Afternoon labs
        { code: 'ML', time: '2:30', type: 'lab', batch: 1 },
        { code: 'CCL', time: '2:30', type: 'lab', batch: 2 },
        { code: 'CCL', time: '2:30', type: 'lab', batch: 3 },
        { code: 'DAV', time: '3:30', type: 'lab', batch: 1 },
        { code: 'DAV', time: '3:30', type: 'lab', batch: 2 },
        { code: 'DAV', time: '3:30', type: 'lab', batch: 3 },
    ],
    Saturday: [],
    Sunday: [],
}

function TodayChecklist() {
    const subjects = useAttendanceStore((state) => state.subjects)
    const updateAttendance = useAttendanceStore((state) => state.updateAttendance)

    const [todayClasses, setTodayClasses] = useState([])
    const [marked, setMarked] = useState({})

    // User's batch - saved in localStorage
    const [userBatch, setUserBatch] = useState(() => {
        const saved = localStorage.getItem('75guard_batch')
        return saved ? parseInt(saved, 10) : null
    })

    const today = new Date()
    const dayName = DAYS[today.getDay()]

    // Save batch to localStorage when changed
    const handleBatchSelect = (batch) => {
        setUserBatch(batch)
        localStorage.setItem('75guard_batch', batch.toString())
    }

    useEffect(() => {
        if (!userBatch) return

        // Get today's classes
        let classes = TIMETABLE[dayName] || []

        // Filter by batch for labs
        classes = classes.filter(c => {
            // If it's a lecture (no batch property), show to all
            if (!c.batch) return true
            // If it's a lab, only show if it matches user's batch
            return c.batch === userBatch
        })

        setTodayClasses(classes)
    }, [dayName, userBatch])

    const handleMark = (index, status) => {
        const classInfo = todayClasses[index]
        const subject = subjects.find(s => s.code === classInfo.code)

        if (!subject) return

        // Update attendance in store
        const newAttended = status === 'attended'
            ? (subject.attendance?.attended || 0) + 1
            : (subject.attendance?.attended || 0)
        const newConducted = (subject.attendance?.conducted || 0) + 1

        updateAttendance(subject.code, {
            attended: newAttended,
            conducted: newConducted,
        })

        // Mark as done
        setMarked(prev => ({ ...prev, [index]: status }))
    }

    const formatDate = () => {
        return today.toLocaleDateString('en-IN', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        })
    }

    // Check for holiday or weekend FIRST
    // Use local time, not UTC (toISOString uses UTC which causes issues in IST)
    const todayString = today.toLocaleDateString('en-CA') // Returns YYYY-MM-DD in local time
    const holiday = getHolidayInfo(todayString)
    const weekend = isWeekend(today)

    if (holiday) {
        return (
            <div style={{
                padding: '32px',
                backgroundColor: '#FFB5C5',
                border: '3px solid #1C1C1C',
                borderRadius: '20px',
                boxShadow: '8px 8px 0px #1C1C1C',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#1C1C1C' }}>
                    {holiday.name}!
                </h2>
                <p style={{ color: '#4A4A4A', fontSize: '16px', marginBottom: '8px' }}>
                    {formatDate()}
                </p>
                <p style={{ color: '#7A7A7A', fontSize: '14px' }}>
                    No classes today. Enjoy your holiday! 🇮🇳
                </p>
            </div>
        )
    }

    if (weekend) {
        return (
            <div style={{
                padding: '32px',
                backgroundColor: '#C5A3FF',
                border: '3px solid #1C1C1C',
                borderRadius: '20px',
                boxShadow: '8px 8px 0px #1C1C1C',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>😴</div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#1C1C1C' }}>
                    It's {dayName}!
                </h2>
                <p style={{ color: '#4A4A4A', fontSize: '16px', marginBottom: '8px' }}>
                    {formatDate()}
                </p>
                <p style={{ color: '#7A7A7A', fontSize: '14px' }}>
                    No classes on weekends. Rest up for next week!
                </p>
            </div>
        )
    }

    // Batch selector - show if user hasn't selected batch yet
    if (!userBatch) {
        return (
            <div style={{
                backgroundColor: '#FAF3E3',
                border: '3px solid #1C1C1C',
                borderRadius: '20px',
                boxShadow: '8px 8px 0px #1C1C1C',
                padding: '32px',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    marginBottom: '8px',
                    color: '#1C1C1C',
                }}>
                    Select Your Batch
                </h2>
                <p style={{ color: '#7A7A7A', marginBottom: '24px' }}>
                    This helps show only your labs in the checklist
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    {[1, 2, 3].map(batch => (
                        <button
                            key={batch}
                            onClick={() => handleBatchSelect(batch)}
                            style={{
                                padding: '20px 32px',
                                fontSize: '24px',
                                fontWeight: '900',
                                backgroundColor: batch === 1 ? '#7ED957' : batch === 2 ? '#87CEEB' : '#FFB347',
                                border: '3px solid #1C1C1C',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                boxShadow: '5px 5px 0px #1C1C1C',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            Batch {batch}
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    // No classes today
    if (todayClasses.length === 0) {
        return (
            <div style={{
                padding: '32px',
                backgroundColor: '#FAF3E3',
                border: '3px solid #1C1C1C',
                borderRadius: '20px',
                boxShadow: '8px 8px 0px #1C1C1C',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#1C1C1C' }}>
                    No Classes Today!
                </h2>
                <p style={{ color: '#7A7A7A' }}>{formatDate()}</p>
                <button
                    onClick={() => setUserBatch(null)}
                    style={{
                        marginTop: '16px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        border: '2px solid #7A7A7A',
                        borderRadius: '8px',
                        color: '#7A7A7A',
                        cursor: 'pointer',
                    }}
                >
                    Change Batch (Currently: {userBatch})
                </button>
            </div>
        )
    }

    const allMarked = todayClasses.every((_, i) => marked[i])

    return (
        <div style={{
            backgroundColor: '#FAF3E3',
            border: '3px solid #1C1C1C',
            borderRadius: '20px',
            boxShadow: '8px 8px 0px #1C1C1C',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                padding: '20px 24px',
                backgroundColor: '#1C1C1C',
                color: '#FFFFFF',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '800',
                            marginBottom: '4px',
                            color: '#FFFFFF',
                        }}>
                            📋 Today's Classes
                        </h2>
                        <p style={{ fontSize: '14px', opacity: 0.8, color: '#FFFFFF' }}>
                            {formatDate()} • Batch {userBatch}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{
                            padding: '8px 16px',
                            backgroundColor: allMarked ? '#7ED957' : '#FFB347',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#1C1C1C',
                        }}>
                            {Object.keys(marked).length}/{todayClasses.length}
                        </div>
                        <button
                            onClick={() => setUserBatch(null)}
                            style={{
                                padding: '8px 12px',
                                fontSize: '11px',
                                backgroundColor: 'transparent',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '6px',
                                color: '#FFFFFF',
                                cursor: 'pointer',
                            }}
                        >
                            Change Batch
                        </button>
                    </div>
                </div>
            </div>

            {/* Classes list */}
            <div style={{ padding: '16px' }}>
                {todayClasses.map((cls, index) => {
                    const subject = subjects.find(s => s.code === cls.code)
                    const isMarked = marked[index]

                    return (
                        <div
                            key={`${cls.code}-${cls.time}-${index}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '16px',
                                marginBottom: index < todayClasses.length - 1 ? '12px' : 0,
                                backgroundColor: isMarked === 'attended' ? '#E8F5E0' : isMarked === 'missed' ? '#FFE8E8' : '#FFFFFF',
                                border: '2px solid #1C1C1C',
                                borderRadius: '12px',
                                opacity: isMarked ? 0.8 : 1,
                            }}
                        >
                            {/* Time */}
                            <div style={{
                                minWidth: '60px',
                                fontSize: '14px',
                                fontWeight: '700',
                                fontFamily: "'JetBrains Mono', monospace",
                                color: '#7A7A7A',
                            }}>
                                {cls.time}
                            </div>

                            {/* Subject info */}
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                    <span style={{
                                        fontSize: '16px',
                                        fontWeight: '800',
                                        color: '#1C1C1C',
                                    }}>
                                        {cls.code}
                                    </span>
                                    <span style={{
                                        padding: '2px 8px',
                                        fontSize: '10px',
                                        fontWeight: '700',
                                        backgroundColor: cls.type === 'lab' ? '#C5A3FF' : '#87CEEB',
                                        borderRadius: '4px',
                                        color: '#1C1C1C',
                                    }}>
                                        {cls.type.toUpperCase()}
                                    </span>
                                </div>
                                <p style={{
                                    fontSize: '12px',
                                    color: '#7A7A7A',
                                    marginTop: '2px',
                                }}>
                                    {subject?.name || cls.code}
                                </p>
                            </div>

                            {/* Action buttons */}
                            {!isMarked ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleMark(index, 'attended')}
                                        style={{
                                            padding: '10px 16px',
                                            fontSize: '13px',
                                            fontWeight: '700',
                                            backgroundColor: '#7ED957',
                                            border: '2px solid #1C1C1C',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            boxShadow: '3px 3px 0px #1C1C1C',
                                        }}
                                    >
                                        ✓ Present
                                    </button>
                                    <button
                                        onClick={() => handleMark(index, 'missed')}
                                        style={{
                                            padding: '10px 16px',
                                            fontSize: '13px',
                                            fontWeight: '700',
                                            backgroundColor: '#FF6B6B',
                                            border: '2px solid #1C1C1C',
                                            borderRadius: '8px',
                                            color: '#FFFFFF',
                                            cursor: 'pointer',
                                            boxShadow: '3px 3px 0px #1C1C1C',
                                        }}
                                    >
                                        ✗ Absent
                                    </button>
                                </div>
                            ) : (
                                <div style={{
                                    padding: '10px 16px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    backgroundColor: isMarked === 'attended' ? '#7ED957' : '#FF6B6B',
                                    borderRadius: '8px',
                                    color: isMarked === 'attended' ? '#1C1C1C' : '#FFFFFF',
                                }}>
                                    {isMarked === 'attended' ? '✓ Attended' : '✗ Missed'}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* All done message */}
            {allMarked && (
                <div style={{
                    padding: '16px 24px',
                    backgroundColor: '#7ED957',
                    borderTop: '2px solid #1C1C1C',
                    textAlign: 'center',
                }}>
                    <p style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#1C1C1C',
                    }}>
                        🎉 All done for today! Great job keeping track.
                    </p>
                </div>
            )}
        </div>
    )
}

export default TodayChecklist
