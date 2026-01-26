/**
 * SubjectStack - Left Rail Vertical List (Neo-Brutalist Style)
 * 
 * Warm colorful cards with bold borders
 */

import { useAttendanceStore } from '../store/attendanceStore'
import { calculatePercentage, calculateBuffer, getStatus } from '../utils/calculations'

function SubjectStack({ mobile = false }) {
    const subjects = useAttendanceStore((state) => state.subjects)
    const activeSubjectId = useAttendanceStore((state) => state.expandedSubjectId)
    const setExpandedSubject = useAttendanceStore((state) => state.setExpandedSubject)

    const handleSubjectClick = (subjectCode) => {
        setExpandedSubject(subjectCode)
        // On mobile, maybe scroll to top of content?
        if (mobile) {
            const mainContent = document.getElementById('main-content')
            if (mainContent) mainContent.scrollTop = 0
        }
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

    // Mobile Container Style (Horizontal Scroll)
    const mobileContainerStyle = {
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        width: '100%',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none',  // IE/Edge
    }

    // Desktop Container Style (Vertical List)
    const desktopContainerStyle = {}

    if (subjects.length === 0) {
        return (
            <div className={`text-center p-4 rounded-xl border-2 border-dashed border-[#1C1C1C] bg-[#FAF3E3] ${mobile ? 'min-w-[200px]' : ''}`}>
                <div className="text-sm font-bold text-[#7A7A7A]">No subjects</div>
                <div className="text-xs text-[#7A7A7A]">Add data to start</div>
            </div>
        )
    }

    return (
        <aside
            role="navigation"
            aria-label="Subject Stack"
            style={mobile ? mobileContainerStyle : desktopContainerStyle}
            className={mobile ? "hide-scrollbar flex items-center" : ""}
        >
            {!mobile && (
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
            )}

            {subjects.map((subject) => {
                const isActive = activeSubjectId === subject.code
                const status = getSubjectStatus(subject)
                const percentage = getSubjectPercentage(subject)

                if (mobile) {
                    // COMPACT MOBILE CARD (Chip style)
                    return (
                        <div
                            key={subject.code}
                            onClick={() => handleSubjectClick(subject.code)}
                            className="flex-none cursor-pointer transition-transform active:scale-95"
                            style={{
                                padding: '8px 12px',
                                border: '2px solid #1C1C1C',
                                borderRadius: '999px', // Pill shape
                                backgroundColor: getCardBg(status, isActive),
                                boxShadow: isActive ? '2px 2px 0px #1C1C1C' : '1px 1px 0px #1C1C1C',
                                transform: isActive ? 'translate(-1px, -1px)' : 'none',
                                minWidth: 'auto'
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#1C1C1C]">{subject.code}</span>
                                {percentage !== null && (
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: '800',
                                        padding: '1px 5px',
                                        borderRadius: '4px',
                                        backgroundColor: status === 'critical' ? '#FF6B6B' : status === 'tension' ? '#FFB347' : '#7ED957',
                                        color: '#1C1C1C'
                                    }}>
                                        {percentage.toFixed(0)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                }

                // DESKTOP CARD (Full details)
                return (
                    <section
                        key={subject.code}
                        onClick={() => handleSubjectClick(subject.code)}
                        role="button"
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
                            <div style={{ fontWeight: '700', fontSize: '14px', color: '#1C1C1C' }}>
                                {subject.code}
                            </div>
                            {percentage !== null && (
                                <div style={{
                                    fontSize: '14px',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontWeight: '700',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: status === 'critical' ? '#FF6B6B' : status === 'tension' ? '#FFB347' : '#7ED957',
                                    color: '#1C1C1C',
                                }}>
                                    {percentage.toFixed(0)}%
                                </div>
                            )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#4A4A4A', marginTop: '4px' }}>
                            {subject.name}
                        </div>
                    </section>
                )
            })}
        </aside>
    )
}

export default SubjectStack
