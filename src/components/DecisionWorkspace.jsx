/**
 * DecisionWorkspace - Main Panel (Neo-Brutalist Style)
 * 
 * Colorful cards with warm aesthetic
 */

import { useAttendanceStore } from '../store/attendanceStore'
import {
    calculatePercentage,
    calculateBuffer,
    calculateDeficit,
    calculatePNR,
    getDaysUntilPNR,
    getStatus,
    generateRecoveryPlan
} from '../utils/calculations'
import { getWeeksRemaining } from '../utils/dateHelpers'
import WhatIfSimulation from './WhatIfSimulation'
import RecoveryPlan from './RecoveryPlan'

function DecisionWorkspace() {
    const activeSubjectId = useAttendanceStore((state) => state.expandedSubjectId)
    const globalState = useAttendanceStore((state) => state.globalState)
    const subjects = useAttendanceStore((state) => state.subjects)

    const activeSubject = activeSubjectId
        ? subjects.find(s => s.code === activeSubjectId)
        : null

    const getCalculatedState = () => {
        if (!activeSubject) return null

        const attendance = activeSubject.attendance || { attended: 0, conducted: 0 }
        const totalSessions = activeSubject.total_expected_sessions || 75
        const sessionsPerWeek = activeSubject.total_sessions_per_week || 4
        const weeksRemaining = getWeeksRemaining()

        const percentage = calculatePercentage(attendance.attended, attendance.conducted)
        const buffer = calculateBuffer(attendance, totalSessions)
        const deficit = calculateDeficit(attendance, totalSessions)
        const pnrDate = calculatePNR(attendance, totalSessions, sessionsPerWeek)
        const daysUntilPNR = getDaysUntilPNR(pnrDate)
        const status = getStatus(attendance, totalSessions, pnrDate)
        const recoveryPlan = generateRecoveryPlan(attendance, totalSessions, sessionsPerWeek, weeksRemaining)
        const remaining = totalSessions - attendance.conducted

        return {
            percentage,
            buffer,
            deficit,
            pnrDate,
            daysUntilPNR,
            status,
            recoveryPlan,
            remaining,
            attended: attendance.attended,
            conducted: attendance.conducted,
        }
    }

    const calculatedState = getCalculatedState()

    const formatPNR = (daysUntilPNR, pnrDate) => {
        if (daysUntilPNR === null) return { text: 'Safe all semester! 🎉', type: 'safe' }
        if (daysUntilPNR < 0 || pnrDate === 'PASSED') return { text: 'Recovery impossible 😢', type: 'critical' }
        if (daysUntilPNR <= 7) return { text: `${daysUntilPNR} days until PNR ⚠️`, type: 'critical' }
        if (daysUntilPNR <= 14) return { text: `${daysUntilPNR} days until PNR`, type: 'tension' }
        return { text: `${daysUntilPNR} days until PNR`, type: 'safe' }
    }

    // No subject selected
    if (!activeSubject) {
        return (
            <main
                role="main"
                aria-label="Decision Workspace"
                data-testid="decision-workspace"
                data-state={globalState.toLowerCase()}
            >
                <div data-testid="no-subject-selected" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    padding: '60px',
                    textAlign: 'center',
                    border: '3px dashed #1C1C1C',
                    borderRadius: '16px',
                    backgroundColor: '#F5E6C8',
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👈</div>
                    <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1C1C1C',
                        marginBottom: '8px',
                    }}>
                        Select a subject
                    </div>
                    <div style={{ fontSize: '14px', color: '#7A7A7A' }}>
                        Click on a subject from the left panel to see details
                    </div>
                </div>
            </main>
        )
    }

    const pnrInfo = formatPNR(calculatedState?.daysUntilPNR, calculatedState?.pnrDate)
    const isCritical = calculatedState?.status === 'CRITICAL'
    const isTension = calculatedState?.status === 'TENSION'
    const needsRecovery = calculatedState?.percentage < 75

    return (
        <main
            role="main"
            aria-label="Decision Workspace"
            data-testid="decision-workspace"
            data-state={globalState.toLowerCase()}
        >
            {/* Subject Header */}
            <section data-testid="subject-header" style={{
                marginBottom: '20px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #1C1C1C',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '4px 4px 0px #1C1C1C',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: '800',
                            marginBottom: '4px',
                            color: '#1C1C1C',
                            border: 'none',
                            padding: '0',
                        }}>
                            {activeSubject.name}
                        </h1>
                        <div style={{
                            fontSize: '14px',
                            color: '#7A7A7A',
                            display: 'flex',
                            gap: '16px',
                        }}>
                            <span>📋 {activeSubject.code}</span>
                            <span>•</span>
                            <span>✓ {calculatedState?.attended || 0} / {calculatedState?.conducted || 0} attended</span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        border: '2px solid #1C1C1C',
                        backgroundColor: isCritical ? '#FF6B6B'
                            : isTension ? '#FFB347'
                                : '#7ED957',
                        color: '#1C1C1C',
                        boxShadow: '2px 2px 0px #1C1C1C',
                    }}>
                        {calculatedState?.status}
                    </div>
                </div>
            </section>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
            }}>
                {/* Percentage Card - Pink */}
                <section data-testid="percentage-card" style={{
                    border: '2px solid #1C1C1C',
                    borderRadius: '16px',
                    padding: '20px',
                    backgroundColor: '#FFB5C5',
                    boxShadow: '4px 4px 0px #1C1C1C',
                }}>
                    <div style={{ fontSize: '13px', color: '#1C1C1C', marginBottom: '8px', fontWeight: '600' }}>
                        📊 Current Attendance
                    </div>
                    <div style={{
                        fontSize: '42px',
                        fontWeight: '800',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#1C1C1C',
                    }}>
                        {calculatedState?.percentage?.toFixed(1) || 0}%
                    </div>
                    <div style={{ marginTop: '12px' }}>
                        <div style={{
                            height: '12px',
                            backgroundColor: '#FFFFFF',
                            border: '2px solid #1C1C1C',
                            borderRadius: '6px',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${Math.min(calculatedState?.percentage || 0, 100)}%`,
                                backgroundColor: isCritical ? '#FF6B6B'
                                    : isTension ? '#FFB347'
                                        : '#7ED957',
                                borderRadius: '4px',
                                transition: 'width 0.3s ease',
                            }} />
                        </div>
                        <div style={{
                            marginTop: '6px',
                            fontSize: '11px',
                            color: '#1C1C1C',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontWeight: '600',
                        }}>
                            <span>0%</span>
                            <span style={{
                                color: (calculatedState?.percentage || 0) >= 75 ? '#4A4A4A' : '#FF6B6B'
                            }}>
                                75% Required →
                            </span>
                            <span>100%</span>
                        </div>
                    </div>
                </section>

                {/* Buffer/Deficit Card - Blue */}
                <section data-testid="buffer-card" style={{
                    border: '2px solid #1C1C1C',
                    borderRadius: '16px',
                    padding: '20px',
                    backgroundColor: '#87CEEB',
                    boxShadow: '4px 4px 0px #1C1C1C',
                }}>
                    <div style={{ fontSize: '13px', color: '#1C1C1C', marginBottom: '8px', fontWeight: '600' }}>
                        {calculatedState?.buffer > 0 ? '✓ Buffer' : '⚠️ Deficit'}
                    </div>
                    <div style={{
                        fontSize: '42px',
                        fontWeight: '800',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#1C1C1C',
                    }}>
                        {calculatedState?.buffer > 0
                            ? calculatedState.buffer
                            : calculatedState?.deficit || 0}
                    </div>
                    <div style={{ fontSize: '14px', color: '#1C1C1C', marginTop: '8px', fontWeight: '500' }}>
                        {calculatedState?.buffer > 0
                            ? 'classes you can miss'
                            : 'classes needed for 75%'}
                    </div>
                </section>

                {/* PNR Card - Green */}
                <section data-testid="pnr-card" style={{
                    border: '2px solid #1C1C1C',
                    borderRadius: '16px',
                    padding: '20px',
                    backgroundColor: '#98D8AA',
                    boxShadow: '4px 4px 0px #1C1C1C',
                }}>
                    <div style={{ fontSize: '13px', color: '#1C1C1C', marginBottom: '8px', fontWeight: '600' }}>
                        ⏰ Point of No Return
                    </div>
                    <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1C1C1C',
                    }}>
                        {pnrInfo.text}
                    </div>
                    <div style={{ fontSize: '14px', color: '#1C1C1C', marginTop: '8px', fontWeight: '500' }}>
                        {calculatedState?.remaining || 0} sessions remaining
                    </div>
                </section>
            </div>

            {/* What-If Simulation */}
            <section data-testid="simulation-section" style={{
                marginBottom: '20px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #1C1C1C',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '4px 4px 0px #1C1C1C',
            }}>
                <h2 style={{
                    fontSize: '16px',
                    marginBottom: '16px',
                    fontWeight: '700',
                    color: '#1C1C1C',
                    borderBottom: '2px solid #1C1C1C',
                    paddingBottom: '12px',
                }}>
                    🎯 Skip Impact Simulator
                </h2>
                <WhatIfSimulation
                    subject={activeSubject}
                    calculatedState={calculatedState}
                    disabled={!calculatedState?.recoveryPlan?.possible && calculatedState?.percentage < 75}
                />
            </section>

            {/* Recovery Plan (only for subjects in deficit) */}
            {needsRecovery && (
                <section data-testid="recovery-section" style={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #1C1C1C',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '4px 4px 0px #1C1C1C',
                }}>
                    <h2 style={{
                        fontSize: '16px',
                        marginBottom: '16px',
                        fontWeight: '700',
                        color: '#1C1C1C',
                        borderBottom: '2px solid #1C1C1C',
                        paddingBottom: '12px',
                    }}>
                        📈 Recovery Plan
                    </h2>
                    <RecoveryPlan
                        subject={activeSubject}
                        recoveryPlan={calculatedState?.recoveryPlan}
                    />
                </section>
            )}
        </main>
    )
}

export default DecisionWorkspace
