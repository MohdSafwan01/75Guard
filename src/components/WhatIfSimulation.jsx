/**
 * WhatIfSimulation - Skip Impact Simulator (Neo-Brutalist Style)
 * 
 * Colorful buttons with playful interaction
 */

import { useState } from 'react'
import PropTypes from 'prop-types'
import { simulateSkip, simulateAttendAll } from '../utils/calculations'

function WhatIfSimulation({
    subject,
    calculatedState,
    onSimulate,
    disabled = false,
}) {
    const [activeButton, setActiveButton] = useState(null)
    const [simulationResult, setSimulationResult] = useState(null)

    const total = subject?.total_expected_sessions || 75
    const attendance = subject?.attendance || {}

    const handleSimulate = async (action) => {
        if (disabled) return
        setActiveButton(action)
        await new Promise(resolve => setTimeout(resolve, 300))

        let result
        switch (action) {
            case 'skip-next':
                result = simulateSkip(attendance, total, 1)
                break
            case 'skip-2':
                result = simulateSkip(attendance, total, 2)
                break
            case 'attend-all':
                result = simulateAttendAll(attendance, total)
                break
            case 'reset':
                result = null
                break
            default:
                result = null
        }

        setSimulationResult(result)
        setActiveButton(null)

        if (onSimulate) {
            onSimulate(action, result)
        }
    }

    const buttonStyle = {
        padding: '10px 16px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '700',
        backgroundColor: '#FFFFFF',
        border: '2px solid #1C1C1C',
        color: '#1C1C1C',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: '2px 2px 0px #1C1C1C',
        transition: 'all 0.15s ease',
    }

    return (
        <div>
            {/* Action buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                <button
                    style={{
                        ...buttonStyle,
                        backgroundColor: activeButton === 'skip-next' ? '#FFB5C5' : '#FFE8E8',
                    }}
                    onClick={() => handleSimulate('skip-next')}
                    disabled={disabled}
                >
                    {activeButton === 'skip-next' ? '⏳ Calculating...' : '🚫 Skip 1 Class'}
                </button>

                <button
                    style={{
                        ...buttonStyle,
                        backgroundColor: activeButton === 'skip-2' ? '#FFB5C5' : '#FFE8E8',
                    }}
                    onClick={() => handleSimulate('skip-2')}
                    disabled={disabled}
                >
                    {activeButton === 'skip-2' ? '⏳ Calculating...' : '🚫 Skip 2 Classes'}
                </button>

                <button
                    style={{
                        ...buttonStyle,
                        backgroundColor: activeButton === 'attend-all' ? '#98D8AA' : '#E8F5E0',
                    }}
                    onClick={() => handleSimulate('attend-all')}
                >
                    {activeButton === 'attend-all' ? '⏳ Calculating...' : '✓ Attend All Remaining'}
                </button>

                {simulationResult && (
                    <button
                        style={{
                            ...buttonStyle,
                            backgroundColor: '#FFFFFF',
                            borderStyle: 'dashed',
                        }}
                        onClick={() => handleSimulate('reset')}
                    >
                        ✕ Clear
                    </button>
                )}
            </div>

            {/* Disabled message */}
            {disabled && (
                <div style={{
                    fontSize: '13px',
                    color: '#FF6B6B',
                    marginBottom: '12px',
                    padding: '8px 12px',
                    backgroundColor: '#FFE8E8',
                    borderRadius: '8px',
                    border: '2px solid #FF6B6B',
                }}>
                    ⚠️ Simulations disabled: Recovery no longer possible
                </div>
            )}

            {/* Simulation result */}
            {simulationResult && (
                <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: '#FAF3E3',
                    border: '2px solid #1C1C1C',
                    boxShadow: '2px 2px 0px #1C1C1C',
                }}>
                    {simulationResult.newPercentage !== undefined ? (
                        <>
                            {/* Percentage change */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: '2px solid #1C1C1C',
                            }}>
                                <span style={{ fontWeight: '600', color: '#1C1C1C' }}>
                                    📊 Percentage
                                </span>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                    <span style={{ color: '#7A7A7A' }}>
                                        {simulationResult.currentPercentage?.toFixed(1)}%
                                    </span>
                                    <span style={{ margin: '0 8px', color: '#1C1C1C' }}>→</span>
                                    <span style={{
                                        fontWeight: '700',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        backgroundColor: simulationResult.percentageChange < 0 ? '#FF6B6B' : '#7ED957',
                                        color: '#1C1C1C',
                                    }}>
                                        {simulationResult.newPercentage?.toFixed(1)}%
                                    </span>
                                    <span style={{
                                        marginLeft: '8px',
                                        fontSize: '12px',
                                        color: simulationResult.percentageChange < 0 ? '#FF6B6B' : '#7ED957',
                                        fontWeight: '700',
                                    }}>
                                        ({simulationResult.percentageChange > 0 ? '+' : ''}{simulationResult.percentageChange?.toFixed(1)}%)
                                    </span>
                                </span>
                            </div>

                            {/* Buffer change */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '12px',
                            }}>
                                <span style={{ fontWeight: '600', color: '#1C1C1C' }}>
                                    🛡️ Buffer
                                </span>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                    <span style={{ color: '#7A7A7A' }}>
                                        {simulationResult.currentBuffer}
                                    </span>
                                    <span style={{ margin: '0 8px', color: '#1C1C1C' }}>→</span>
                                    <span style={{
                                        fontWeight: '700',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        backgroundColor: simulationResult.bufferChange < 0 ? '#FF6B6B' : '#7ED957',
                                        color: '#1C1C1C',
                                    }}>
                                        {simulationResult.newBuffer}
                                    </span>
                                    <span style={{
                                        marginLeft: '8px',
                                        fontSize: '12px',
                                        color: simulationResult.bufferChange < 0 ? '#FF6B6B' : '#7ED957',
                                        fontWeight: '700',
                                    }}>
                                        ({simulationResult.bufferChange > 0 ? '+' : ''}{simulationResult.bufferChange})
                                    </span>
                                </span>
                            </div>

                            {/* Warning: Status change */}
                            {simulationResult.statusWorsened && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    backgroundColor: '#FFF4E5',
                                    border: '2px solid #FFB347',
                                }}>
                                    <p style={{ fontWeight: '700', color: '#1C1C1C' }}>
                                        ⚠️ Status would change: {simulationResult.currentStatus} → {simulationResult.newStatus}
                                    </p>
                                </div>
                            )}

                            {/* Critical: Crossing threshold */}
                            {simulationResult.wouldCrossThreshold && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    backgroundColor: '#FFE8E8',
                                    border: '2px solid #FF6B6B',
                                }}>
                                    <p style={{ fontWeight: '700', color: '#FF6B6B' }}>
                                        🚨 Would drop below 75% threshold!
                                    </p>
                                </div>
                            )}
                        </>
                    ) : simulationResult.canReach75 !== undefined ? (
                        <div>
                            <p style={{ fontWeight: '700', marginBottom: '8px', color: '#1C1C1C' }}>
                                🎯 Best Case Scenario
                            </p>
                            <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                                Final percentage:{' '}
                                <span style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontWeight: '700',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: simulationResult.canReach75 ? '#7ED957' : '#FF6B6B',
                                    color: '#1C1C1C',
                                }}>
                                    {simulationResult.finalPercentage?.toFixed(1)}%
                                </span>
                            </p>
                            <p style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: simulationResult.canReach75 ? '#4A4A4A' : '#FF6B6B',
                            }}>
                                {simulationResult.canReach75
                                    ? '✓ Can reach 75% with perfect attendance'
                                    : '✗ Cannot reach 75% even with perfect attendance'}
                            </p>
                            <p style={{
                                fontSize: '12px',
                                color: '#7A7A7A',
                                marginTop: '8px',
                            }}>
                                {simulationResult.remaining} classes remaining
                            </p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}

WhatIfSimulation.propTypes = {
    subject: PropTypes.object.isRequired,
    calculatedState: PropTypes.object,
    onSimulate: PropTypes.func,
    disabled: PropTypes.bool,
}

export default WhatIfSimulation
