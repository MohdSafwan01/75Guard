/**
 * SubjectStack - Left Rail Vertical List (Neo-Brutalist Style)
 * 
 * Warm colorful cards with bold borders
 */

import { useAttendanceStore } from '../store/attendanceStore'
import { calculatePercentage, calculateBuffer, getStatus } from '../utils/calculations'

function SubjectStack() {
    const subjects = useAttendanceStore((state) => state.subjects)
    const activeSubjectId = useAttendanceStore((state) => state.expandedSubjectId)
    const setExpandedSubject = useAttendanceStore((state) => state.setExpandedSubject)

    const handleSubjectClick = (subjectCode) => {
        setExpandedSubject(subjectCode)
    }

    const getSubjectStatus = (subject) => {
        if (!subject.attendance) return 'safe'
        const attendance = {
            attended: subject.attendance.attended || 0,
            conducted: subject.attendance.conducted || 0
        }
        const totalSessions = subject.total_expected_sessions || 75
        const status = getStatus(attendance, totalSessions)
        return status.toLowerCase()
    }

    const getSubjectPercentage = (subject) => {
        if (!subject.attendance || subject.attendance.conducted === 0) return null
        return calculatePercentage(
            subject.attendance.attended,
            subject.attendance.conducted
        )
    }

    const getSubjectBuffer = (subject) => {
        if (!subject.attendance) return null
        const attendance = {
            attended: subject.attendance.attended || 0,
            conducted: subject.attendance.conducted || 0
        }
        return calculateBuffer(attendance, subject.total_expected_sessions || 75)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'critical': return '#FF6B6B'
            case 'tension': return '#FFB347'
            default: return '#7ED957'
        }
    }

    const getCardBg = (status, isActive) => {
        if (isActive) return '#FFB5C5'
        if (status === 'critical') return '#FFE8E8'
        return '#FFFFFF'
    }

    return (
        <aside
            role="navigation"
            aria-label="Subject Stack"
        >
            {/* Header */}
            <div style={{
                padding: '4px 0 16px 0',
                marginBottom: '12px',
                borderBottom: '2px solid #1C1C1C',
            }}>
                <div style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#1C1C1C',
                }}>
                    📚 Subjects
                </div>
            </div>

            {subjects.length === 0 ? (
                <div style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: '#7A7A7A',
                    fontSize: '13px',
                    border: '2px dashed #1C1C1C',
                    borderRadius: '12px',
                    backgroundColor: '#FAF3E3',
                }}>
                    No subjects loaded.<br />
                    Add attendance data to get started.
                </div>
            ) : (
                subjects.map((subject) => {
                    const isActive = activeSubjectId === subject.code
                    const status = getSubjectStatus(subject)
                    const percentage = getSubjectPercentage(subject)
                    const buffer = getSubjectBuffer(subject)

                    return (
                        <section
                            key={subject.code}
                            data-testid={`subject-block-${subject.code}`}
                            data-active={isActive}
                            data-status={status}
                            onClick={() => handleSubjectClick(subject.code)}
                            role="button"
                            aria-label={`Select subject ${subject.name}`}
                            aria-pressed={isActive}
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubjectClick(subject.code)}
                            style={{
                                padding: '14px 16px',
                                marginBottom: '10px',
                                cursor: 'pointer',
                                border: '2px solid #1C1C1C',
                                borderLeft: `5px solid ${getStatusColor(status)}`,
                                borderRadius: '12px',
                                backgroundColor: getCardBg(status, isActive),
                                boxShadow: isActive ? '4px 4px 0px #1C1C1C' : '2px 2px 0px #1C1C1C',
                                transform: isActive ? 'translate(-2px, -2px)' : 'none',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div data-testid="subject-code" style={{
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    color: '#1C1C1C',
                                }}>
                                    {subject.code}
                                </div>
                                {percentage !== null && (
                                    <div style={{
                                        fontSize: '14px',
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontWeight: '700',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        backgroundColor: status === 'critical' ? '#FF6B6B'
                                            : status === 'tension' ? '#FFB347'
                                                : '#7ED957',
                                        color: '#1C1C1C',
                                    }}>
                                        {percentage.toFixed(0)}%
                                    </div>
                                )}
                            </div>
                            <div data-testid="subject-name" style={{
                                fontSize: '12px',
                                color: '#4A4A4A',
                                marginTop: '4px',
                            }}>
                                {subject.name}
                            </div>

                            {/* Buffer/Deficit indicator */}
                            {percentage !== null && (
                                <div style={{
                                    marginTop: '8px',
                                    fontSize: '11px',
                                    color: '#7A7A7A',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}>
                                    {buffer > 0
                                        ? `✓ Buffer: ${buffer} classes`
                                        : percentage < 75
                                            ? '⚠️ In deficit'
                                            : '⚡ No buffer'
                                    }
                                </div>
                            )}
                        </section>
                    )
                })
            )}
        </aside>
    )
}

export default SubjectStack
