/**
 * 75Guard - Today's Schedule Component
 * 
 * Per PRD: Shows today's classes with safe/risky labels
 * Each class shows skip-impact preview
 */

import { useMemo } from 'react';
import { format, isToday, getDay } from 'date-fns';
import { useAttendanceStore } from '../store/attendanceStore';
import { getStatus, simulateSkip } from '../utils/calculations';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * TodaySchedule - Shows today's class schedule with attendance context
 */
export function TodaySchedule({ timetable, selectedDate = new Date() }) {
    const subjects = useAttendanceStore(state => state.subjects);
    const semester = useAttendanceStore(state => state.semester);

    const dayOfWeek = getDay(selectedDate);
    const dayName = DAY_NAMES[dayOfWeek];
    const shortDay = SHORT_DAYS[dayOfWeek];

    // Get today's schedule from timetable
    const todayClasses = useMemo(() => {
        if (!timetable?.schedule?.[shortDay]) return [];

        return timetable.schedule[shortDay].map(slot => {
            // Find subject data
            const subjectData = subjects.find(s =>
                s.code === slot.subjectCode ||
                s.code === slot.code ||
                s.name?.toLowerCase().includes(slot.subject?.toLowerCase())
            );

            // Calculate current status
            let status = 'UNKNOWN';
            let skipImpact = null;

            if (subjectData) {
                status = getStatus(
                    subjectData.attendance,
                    subjectData.total_expected_sessions || semester?.total_sessions || 80
                );

                skipImpact = simulateSkip(
                    subjectData.attendance,
                    subjectData.total_expected_sessions || semester?.total_sessions || 80,
                    1
                );
            }

            return {
                ...slot,
                subjectData,
                status,
                skipImpact
            };
        });
    }, [timetable, subjects, semester, shortDay]);

    // Check if it's a weekend
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
        return (
            <div style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--text-muted)',
            }}>
                <p>
                    {isToday(selectedDate) ? "It's" : format(selectedDate, 'EEEE, MMM d') + ' is'} {dayName} — No classes
                </p>
            </div>
        );
    }

    if (todayClasses.length === 0) {
        return (
            <div style={{ padding: '20px' }}>
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    color: 'var(--text-primary)',
                }}>
                    {isToday(selectedDate) ? "Today's Schedule" : format(selectedDate, 'EEEE, MMM d')}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    No schedule data available for {dayName}.
                </p>
            </div>
        );
    }

    return (
        <div>
            <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '16px',
                padding: '0 4px',
                color: 'var(--text-primary)',
            }}>
                {isToday(selectedDate) ? "Today's Classes" : format(selectedDate, 'EEEE, MMM d')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {todayClasses.map((slot, index) => (
                    <ScheduleSlot key={index} slot={slot} />
                ))}
            </div>
        </div>
    );
}

/**
 * Individual schedule slot with attendance context
 */
function ScheduleSlot({ slot }) {
    const getStatusStyles = (status) => {
        switch (status) {
            case 'SAFE':
                return {
                    borderColor: 'var(--accent-safe)',
                    backgroundColor: 'var(--accent-safe-muted)'
                };
            case 'TENSION':
                return {
                    borderColor: 'var(--accent-tension)',
                    backgroundColor: 'var(--accent-tension-muted)'
                };
            case 'CRITICAL':
                return {
                    borderColor: 'var(--accent-critical)',
                    backgroundColor: 'var(--accent-critical-muted)'
                };
            default:
                return {
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--bg-tertiary)'
                };
        }
    };

    const getStatusDotColor = (status) => {
        switch (status) {
            case 'SAFE': return 'var(--accent-safe)';
            case 'TENSION': return 'var(--accent-tension)';
            case 'CRITICAL': return 'var(--accent-critical)';
            default: return 'var(--text-muted)';
        }
    };

    const styles = getStatusStyles(slot.status);

    return (
        <div style={{
            padding: '14px 16px',
            borderRadius: '10px',
            borderLeft: `4px solid ${styles.borderColor}`,
            backgroundColor: styles.backgroundColor,
            transition: 'all 0.2s ease',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: getStatusDotColor(slot.status),
                            animation: slot.status === 'CRITICAL' ? 'pulse 2s infinite' : 'none',
                        }} />
                        <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                            {slot.subject || slot.subjectCode || 'Unknown'}
                        </span>
                        <span style={{
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                            fontFamily: "'JetBrains Mono', monospace",
                        }}>
                            {slot.code || slot.subjectCode}
                        </span>
                    </div>

                    <div style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        marginTop: '6px',
                        marginLeft: '16px',
                        display: 'flex',
                        gap: '16px',
                    }}>
                        <span>{slot.time || slot.startTime}</span>
                        {slot.room && <span>📍 {slot.room}</span>}
                        {slot.faculty && <span>👤 {slot.faculty}</span>}
                        {slot.type && (
                            <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                backgroundColor: slot.type === 'Lab'
                                    ? 'rgba(147, 51, 234, 0.2)'
                                    : 'rgba(59, 130, 246, 0.2)',
                                color: slot.type === 'Lab'
                                    ? '#a78bfa'
                                    : '#60a5fa',
                            }}>
                                {slot.type}
                            </span>
                        )}
                    </div>
                </div>

                {/* Attendance Context */}
                {slot.subjectData && (
                    <div style={{ textAlign: 'right', fontSize: '13px' }}>
                        <div style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            color: 'var(--text-primary)',
                        }}>
                            {slot.subjectData.attendance.attended}/{slot.subjectData.attendance.conducted}
                        </div>
                        {slot.skipImpact && slot.status !== 'SAFE' && (
                            <div style={{
                                fontSize: '11px',
                                color: 'var(--accent-critical)',
                                marginTop: '2px',
                            }}>
                                Skip: {slot.skipImpact.percentageChange.toFixed(1)}%
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Warning for critical subjects */}
            {slot.status === 'CRITICAL' && slot.skipImpact?.wouldCrossThreshold && (
                <div style={{
                    marginTop: '10px',
                    fontSize: '12px',
                    color: 'var(--accent-critical)',
                    fontWeight: '500',
                }}>
                    ⚠️ Missing this class would worsen your situation
                </div>
            )}
        </div>
    );
}

export default TodaySchedule;
