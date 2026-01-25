/**
 * QuickBatchUpdate - Fast Weekly Update (Neo-Brutalist Style)
 */

import { useState } from 'react'
import PropTypes from 'prop-types'
import { useAttendanceStore } from '../store/attendanceStore'

function QuickBatchUpdate({ onComplete, onCancel }) {
    const subjects = useAttendanceStore((state) => state.subjects)
    const batchUpdateAttendance = useAttendanceStore((state) => state.batchUpdateAttendance)

    const [mode, setMode] = useState('proportional')
    const [totalMissed, setTotalMissed] = useState(0)
    const [perSubjectMissed, setPerSubjectMissed] = useState(
        subjects.reduce((acc, s) => ({ ...acc, [s.code]: 0 }), {})
    )
    const [sessionsAdded, setSessionsAdded] = useState(
        subjects.reduce((acc, s) => ({ ...acc, [s.code]: s.total_sessions_per_week || 4 }), {})
    )

    const totalSessionsThisWeek = subjects.reduce((sum, s) => sum + (s.total_sessions_per_week || 4), 0)

    const handleProportionalSubmit = () => {
        const updates = subjects.map(s => {
            const proportion = (s.total_sessions_per_week || 4) / totalSessionsThisWeek
            const missed = Math.round(totalMissed * proportion)
            const sessionsThisWeek = s.total_sessions_per_week || 4
            return {
                code: s.code,
                attended: (s.attendance?.attended || 0) + (sessionsThisWeek - missed),
                conducted: (s.attendance?.conducted || 0) + sessionsThisWeek,
                source: 'batch_update',
            }
        })
        batchUpdateAttendance(updates)
        if (onComplete) onComplete()
    }

    const handlePerSubjectSubmit = () => {
        const updates = subjects.map(s => {
            const missed = perSubjectMissed[s.code] || 0
            const added = sessionsAdded[s.code] || (s.total_sessions_per_week || 4)
            return {
                code: s.code,
                attended: (s.attendance?.attended || 0) + (added - missed),
                conducted: (s.attendance?.conducted || 0) + added,
                source: 'batch_update',
            }
        })
        batchUpdateAttendance(updates)
        if (onComplete) onComplete()
    }

    const buttonStyle = {
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '700',
        border: '2px solid #1C1C1C',
        cursor: 'pointer',
        boxShadow: '2px 2px 0px #1C1C1C',
        transition: 'all 0.15s ease',
    }

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        borderRadius: '8px',
        border: '2px solid #1C1C1C',
        backgroundColor: '#FFFFFF',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '18px',
        boxShadow: '2px 2px 0px #1C1C1C',
    }

    return (
        <div>
            {/* Mode selector */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => setMode('proportional')}
                    style={{
                        ...buttonStyle,
                        backgroundColor: mode === 'proportional' ? '#98D8AA' : '#FFFFFF',
                    }}
                >
                    📊 Total Missed
                </button>
                <button
                    onClick={() => setMode('per-subject')}
                    style={{
                        ...buttonStyle,
                        backgroundColor: mode === 'per-subject' ? '#98D8AA' : '#FFFFFF',
                    }}
                >
                    📋 Per Subject
                </button>
            </div>

            {/* Proportional mode */}
            {mode === 'proportional' && (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#FAF3E3',
                        borderRadius: '12px',
                        border: '2px solid #1C1C1C',
                        marginBottom: '16px',
                    }}>
                        <p style={{ fontSize: '14px', color: '#1C1C1C', marginBottom: '4px' }}>
                            This week had{' '}
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: '800' }}>
                                {totalSessionsThisWeek}
                            </span>{' '}
                            total sessions.
                        </p>
                        <p style={{ fontSize: '14px', color: '#7A7A7A' }}>
                            How many did you miss?
                        </p>
                    </div>

                    <input
                        type="number"
                        min="0"
                        max={totalSessionsThisWeek}
                        value={totalMissed}
                        onChange={(e) => setTotalMissed(parseInt(e.target.value, 10) || 0)}
                        style={inputStyle}
                        placeholder="0"
                    />

                    <p style={{ fontSize: '12px', color: '#7A7A7A', marginTop: '8px' }}>
                        Will distribute missed sessions proportionally across subjects.
                    </p>
                </div>
            )}

            {/* Per-subject mode */}
            {mode === 'per-subject' && (
                <div style={{ marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
                    {subjects.map(s => (
                        <div key={s.code} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '16px',
                            padding: '14px',
                            marginBottom: '10px',
                            borderRadius: '10px',
                            backgroundColor: '#FFFFFF',
                            border: '2px solid #1C1C1C',
                            boxShadow: '2px 2px 0px #1C1C1C',
                        }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '2px', color: '#1C1C1C' }}>
                                    {s.name}
                                </p>
                                <p style={{ fontSize: '12px', color: '#7A7A7A' }}>
                                    {s.total_sessions_per_week || 4} sessions/week
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1C1C1C' }}>
                                    Missed:
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    max={sessionsAdded[s.code]}
                                    value={perSubjectMissed[s.code]}
                                    onChange={(e) => setPerSubjectMissed({
                                        ...perSubjectMissed,
                                        [s.code]: parseInt(e.target.value, 10) || 0
                                    })}
                                    style={{
                                        width: '60px',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: '2px solid #1C1C1C',
                                        backgroundColor: '#FFFFFF',
                                        fontFamily: "'JetBrains Mono', monospace",
                                        textAlign: 'center',
                                        fontWeight: '700',
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                {onCancel && (
                    <button onClick={onCancel} style={{ ...buttonStyle, backgroundColor: '#FFFFFF' }}>
                        Cancel
                    </button>
                )}

                <button
                    onClick={mode === 'proportional' ? handleProportionalSubmit : handlePerSubjectSubmit}
                    style={{ ...buttonStyle, backgroundColor: '#7ED957', marginLeft: 'auto' }}
                >
                    ✓ Update Attendance
                </button>
            </div>
        </div>
    )
}

QuickBatchUpdate.propTypes = {
    onComplete: PropTypes.func,
    onCancel: PropTypes.func,
}

export default QuickBatchUpdate
