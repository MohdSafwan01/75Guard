/**
 * 75Guard - Week Planner Component
 * 
 * Per PRD §3.3 Feature 6:
 * - 7-day calendar view with classes
 * - Each class labeled Safe/Risky/Critical
 * - Multi-select for batch skip planning
 */

import { useState, useMemo } from 'react';
import { format, addDays, getDay, isToday } from 'date-fns';
import { useAttendanceStore } from '../store/attendanceStore';
import { getStatus, simulateAttendAll } from '../utils/calculations';

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * WeekPlanner - 7-day rolling schedule with attendance context
 */
export function WeekPlanner({ timetable }) {
    const subjects = useAttendanceStore(state => state.subjects);
    const semester = useAttendanceStore(state => state.semester);
    const [selectedDay, setSelectedDay] = useState(null);

    // Generate next 7 days
    const weekDays = useMemo(() => {
        const today = new Date();
        return Array.from({ length: 7 }, (_, i) => addDays(today, i));
    }, []);

    // Process schedule for each day
    const weekSchedule = useMemo(() => {
        return weekDays.map(date => {
            const dayOfWeek = getDay(date);
            const shortDay = SHORT_DAYS[dayOfWeek];
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            if (isWeekend || !timetable?.schedule?.[shortDay]) {
                return {
                    date,
                    dayName: format(date, 'EEE'),
                    dateNum: format(date, 'd'),
                    isWeekend,
                    isToday: isToday(date),
                    classes: [],
                    totalSessions: 0,
                    criticalCount: 0
                };
            }

            const classes = timetable.schedule[shortDay].map(slot => {
                const subjectData = subjects.find(s =>
                    s.code === slot.subjectCode ||
                    s.code === slot.code
                );

                let status = 'UNKNOWN';
                if (subjectData) {
                    status = getStatus(
                        subjectData.attendance,
                        subjectData.total_expected_sessions || semester?.total_sessions || 80
                    );
                }

                return { ...slot, status, subjectData };
            });

            return {
                date,
                dayName: format(date, 'EEE'),
                dateNum: format(date, 'd'),
                isWeekend: false,
                isToday: isToday(date),
                classes,
                totalSessions: classes.length,
                criticalCount: classes.filter(c => c.status === 'CRITICAL').length
            };
        });
    }, [weekDays, timetable, subjects, semester]);

    // Calculate weekly stats
    const weekStats = useMemo(() => {
        const totalClasses = weekSchedule.reduce((sum, day) => sum + day.totalSessions, 0);
        const criticalClasses = weekSchedule.reduce((sum, day) => sum + day.criticalCount, 0);

        const projections = subjects.map(subject => {
            const weeklyClasses = weekSchedule.reduce((count, day) => {
                return count + day.classes.filter(c =>
                    c.code === subject.code || c.subjectCode === subject.code
                ).length;
            }, 0);

            const projection = simulateAttendAll(
                subject.attendance,
                subject.total_expected_sessions || semester?.total_sessions || 80
            );

            return { ...subject, weeklyClasses, projection };
        });

        return { totalClasses, criticalClasses, projections };
    }, [weekSchedule, subjects, semester]);

    return (
        <div>
            {/* Week Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
            }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>This Week</h3>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {weekStats.totalClasses} classes
                    {weekStats.criticalClasses > 0 && (
                        <span style={{ color: 'var(--accent-critical)', marginLeft: '8px' }}>
                            ({weekStats.criticalClasses} critical)
                        </span>
                    )}
                </div>
            </div>

            {/* Day Selector */}
            <div style={{
                display: 'flex',
                gap: '6px',
                marginBottom: '16px',
                overflowX: 'auto',
                paddingBottom: '8px',
            }}>
                {weekSchedule.map((day, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            minWidth: '56px',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            border: day.isToday ? '2px solid var(--accent-safe)' : '1px solid var(--border)',
                            backgroundColor: selectedDay === index
                                ? 'var(--accent-safe)'
                                : day.isWeekend
                                    ? 'var(--bg-tertiary)'
                                    : day.criticalCount > 0
                                        ? 'var(--accent-critical-muted)'
                                        : 'var(--bg-tertiary)',
                            color: selectedDay === index
                                ? '#000'
                                : day.isWeekend
                                    ? 'var(--text-muted)'
                                    : day.criticalCount > 0
                                        ? 'var(--accent-critical)'
                                        : 'var(--text-primary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <span style={{ fontSize: '11px', fontWeight: '500' }}>{day.dayName}</span>
                        <span style={{ fontSize: '18px', fontWeight: '700' }}>{day.dateNum}</span>
                        {!day.isWeekend && (
                            <div style={{ display: 'flex', gap: '3px', marginTop: '6px' }}>
                                {day.classes.slice(0, 4).map((c, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: c.status === 'CRITICAL'
                                                ? 'var(--accent-critical)'
                                                : c.status === 'TENSION'
                                                    ? 'var(--accent-tension)'
                                                    : c.status === 'SAFE'
                                                        ? 'var(--accent-safe)'
                                                        : 'var(--text-muted)',
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Selected Day Details */}
            {selectedDay !== null && (
                <DayDetail day={weekSchedule[selectedDay]} />
            )}

            {/* Week Projection */}
            <div style={{ marginTop: '20px' }}>
                <h4 style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    marginBottom: '10px',
                }}>
                    If you attend all classes this week:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {weekStats.projections
                        .filter(p => p.weeklyClasses > 0)
                        .map((proj, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    fontSize: '13px',
                                }}
                            >
                                <span style={{ fontWeight: '500' }}>{proj.code}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        +{proj.weeklyClasses} classes
                                    </span>
                                    <span style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontWeight: '600',
                                        color: proj.projection.finalPercentage >= 75
                                            ? 'var(--accent-safe)'
                                            : 'var(--accent-critical)',
                                    }}>
                                        → {proj.projection.finalPercentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Day detail view when a day is selected
 */
function DayDetail({ day }) {
    if (day.isWeekend) {
        return (
            <div style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
            }}>
                No classes on {day.dayName}
            </div>
        );
    }

    if (day.classes.length === 0) {
        return (
            <div style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
            }}>
                No schedule data for {format(day.date, 'EEEE')}
            </div>
        );
    }

    const getStatusBorderColor = (status) => {
        switch (status) {
            case 'SAFE': return 'var(--accent-safe)';
            case 'TENSION': return 'var(--accent-tension)';
            case 'CRITICAL': return 'var(--accent-critical)';
            default: return 'var(--border)';
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'slideDown 0.2s ease',
        }}>
            <p style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginBottom: '8px',
            }}>
                {format(day.date, 'EEEE, MMMM d')}
            </p>

            {day.classes.map((slot, index) => (
                <div
                    key={index}
                    style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        borderLeft: `4px solid ${getStatusBorderColor(slot.status)}`,
                        backgroundColor: 'var(--bg-tertiary)',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                                {slot.subject || slot.code || 'Unknown'}
                            </p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {slot.time || slot.startTime}
                                {slot.room && ` • ${slot.room}`}
                            </p>
                        </div>

                        {slot.subjectData && (
                            <div style={{ textAlign: 'right' }}>
                                <p style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '13px',
                                    color: 'var(--text-primary)',
                                }}>
                                    {slot.subjectData.attendance.attended}/{slot.subjectData.attendance.conducted}
                                </p>
                                <p style={{
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    marginTop: '2px',
                                    color: slot.status === 'CRITICAL'
                                        ? 'var(--accent-critical)'
                                        : slot.status === 'TENSION'
                                            ? 'var(--accent-tension)'
                                            : 'var(--accent-safe)',
                                }}>
                                    {slot.status}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export default WeekPlanner;
