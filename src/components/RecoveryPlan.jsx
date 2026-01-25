/**
 * RecoveryPlan - Recovery Plan Display (Neo-Brutalist Style)
 */

import PropTypes from 'prop-types'

function RecoveryPlan({ subject, recoveryPlan }) {
    if (!recoveryPlan) return null

    const { possible, difficulty, requiredAttendances, weeksNeeded, finalPercentage, maxPercentage, plan: weeklyPlan } = recoveryPlan
    const subjectName = subject?.name || 'Subject'

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'NONE':
            case 'EASY': return '#7ED957'
            case 'MEDIUM': return '#FFB347'
            case 'HARD':
            case 'IMPOSSIBLE': return '#FF6B6B'
            default: return '#FFFFFF'
        }
    }

    // Impossible state
    if (!possible) {
        return (
            <div style={{
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: '#FFE8E8',
                border: '2px solid #FF6B6B',
                boxShadow: '4px 4px 0px #FF6B6B',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: '#FF6B6B',
                        color: '#FFFFFF',
                        border: '2px solid #1C1C1C',
                    }}>
                        IMPOSSIBLE
                    </span>
                    <span style={{ fontWeight: '700', color: '#1C1C1C' }}>{subjectName}</span>
                </div>

                <p style={{ fontSize: '18px', fontWeight: '800', color: '#FF6B6B', marginBottom: '12px' }}>
                    🚨 RECOVERY NO LONGER POSSIBLE
                </p>

                <p style={{ fontSize: '14px', color: '#4A4A4A', marginBottom: '16px' }}>
                    Even if you attend all remaining classes, you will reach only{' '}
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: '700' }}>
                        {maxPercentage?.toFixed(1)}%
                    </span>.
                    <br />
                    75% is no longer mathematically achievable.
                </p>

                <div style={{
                    paddingTop: '16px',
                    borderTop: '2px solid #FF6B6B',
                }}>
                    <p style={{ fontWeight: '700', marginBottom: '8px', color: '#1C1C1C' }}>
                        📋 What you can do:
                    </p>
                    <ul style={{ fontSize: '13px', color: '#4A4A4A', lineHeight: '1.8', paddingLeft: '20px' }}>
                        <li>Request faculty condonation</li>
                        <li>Submit medical certificates if applicable</li>
                        <li>Review attendance policy for exceptions</li>
                        <li>Meet with your advisor to discuss options</li>
                    </ul>
                </div>
            </div>
        )
    }

    // No recovery needed
    if (difficulty === 'NONE') {
        return (
            <div style={{
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: '#E8F5E0',
                border: '2px solid #7ED957',
                boxShadow: '4px 4px 0px #7ED957',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: '#7ED957',
                        color: '#1C1C1C',
                        border: '2px solid #1C1C1C',
                    }}>
                        ✓ NO RECOVERY NEEDED
                    </span>
                </div>
                <p style={{ fontSize: '14px', color: '#4A4A4A', marginTop: '12px' }}>
                    You are already at or above 75%. Maintain your attendance to stay safe. 🎉
                </p>
            </div>
        )
    }

    // Recovery possible
    return (
        <div style={{
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            border: '2px solid #1C1C1C',
            boxShadow: '4px 4px 0px #1C1C1C',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '2px solid #1C1C1C',
            }}>
                <span style={{ fontWeight: '700', color: '#1C1C1C' }}>📈 Recovery Plan</span>
                <span style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: getDifficultyColor(difficulty),
                    color: '#1C1C1C',
                    border: '2px solid #1C1C1C',
                }}>
                    {difficulty}
                </span>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                    padding: '16px',
                    backgroundColor: '#87CEEB',
                    borderRadius: '10px',
                    border: '2px solid #1C1C1C',
                }}>
                    <p style={{ fontSize: '12px', color: '#1C1C1C', marginBottom: '4px', fontWeight: '600' }}>
                        Required Attendance
                    </p>
                    <p style={{
                        fontSize: '28px',
                        fontWeight: '800',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#1C1C1C',
                    }}>
                        {requiredAttendances}
                        <span style={{ fontSize: '14px', fontWeight: '500', marginLeft: '4px' }}>classes</span>
                    </p>
                </div>
                <div style={{
                    padding: '16px',
                    backgroundColor: '#FFB5C5',
                    borderRadius: '10px',
                    border: '2px solid #1C1C1C',
                }}>
                    <p style={{ fontSize: '12px', color: '#1C1C1C', marginBottom: '4px', fontWeight: '600' }}>
                        Duration
                    </p>
                    <p style={{
                        fontSize: '28px',
                        fontWeight: '800',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#1C1C1C',
                    }}>
                        {weeksNeeded}
                        <span style={{ fontSize: '14px', fontWeight: '500', marginLeft: '4px' }}>weeks</span>
                    </p>
                </div>
            </div>

            {/* Weekly breakdown */}
            {weeklyPlan && weeklyPlan.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: '#1C1C1C' }}>
                        📅 Weekly Breakdown:
                    </p>
                    <div style={{
                        backgroundColor: '#FAF3E3',
                        borderRadius: '10px',
                        padding: '12px',
                        border: '2px solid #1C1C1C',
                    }}>
                        {weeklyPlan.slice(0, 4).map((week) => (
                            <div key={week.week} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '8px 0',
                                borderBottom: '2px dashed #1C1C1C',
                                fontSize: '13px',
                            }}>
                                <span style={{ fontWeight: '600', color: '#1C1C1C' }}>Week {week.week}:</span>
                                <span>
                                    Attend{' '}
                                    <span style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontWeight: '700',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        backgroundColor: week.attend >= 4 ? '#FFB347' : '#98D8AA',
                                        color: '#1C1C1C',
                                    }}>
                                        {week.attend}
                                    </span>
                                    {week.skip > 0 && (
                                        <span style={{ color: '#7A7A7A', marginLeft: '8px' }}>
                                            (skip max {week.skip})
                                        </span>
                                    )}
                                </span>
                            </div>
                        ))}
                        {weeklyPlan.length > 4 && (
                            <p style={{
                                fontSize: '12px',
                                color: '#7A7A7A',
                                marginTop: '8px',
                                textAlign: 'center',
                            }}>
                                ...and {weeklyPlan.length - 4} more weeks
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Result */}
            <div style={{
                padding: '12px 16px',
                backgroundColor: '#E8F5E0',
                borderRadius: '8px',
                border: '2px solid #7ED957',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1C1C1C' }}>
                    Result:{' '}
                    <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: '800',
                        color: '#1C1C1C',
                    }}>
                        {finalPercentage?.toFixed(1)}%
                    </span>
                    {' '}achievable ✓
                </p>
            </div>
        </div>
    )
}

RecoveryPlan.propTypes = {
    subject: PropTypes.object,
    recoveryPlan: PropTypes.shape({
        possible: PropTypes.bool,
        difficulty: PropTypes.string,
        requiredAttendances: PropTypes.number,
        weeksNeeded: PropTypes.number,
        finalPercentage: PropTypes.number,
        maxPercentage: PropTypes.number,
        plan: PropTypes.array,
    }),
}

export default RecoveryPlan
