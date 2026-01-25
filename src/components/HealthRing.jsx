/**
 * HealthRing - Attendance Health Ring (Neo-Brutalist Style)
 */

import { useState } from 'react'
import PropTypes from 'prop-types'

function HealthRing({
    percentage = 0,
    state = 'SAFE',
    buffer = 0,
    size = 160,
    onTap = null,
}) {
    const [showDetails, setShowDetails] = useState(false)

    const strokeWidth = 12
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (Math.min(percentage, 100) / 100) * circumference

    const stateColors = {
        SAFE: '#7ED957',
        TENSION: '#FFB347',
        CRITICAL: '#FF6B6B',
    }

    const handleTap = () => {
        setShowDetails(!showDetails)
        if (onTap) onTap()
    }

    return (
        <div
            onClick={handleTap}
            onKeyDown={(e) => e.key === 'Enter' && handleTap()}
            tabIndex={0}
            role="button"
            aria-label={`Attendance health ring. ${state} state. ${percentage}% attendance.`}
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
            }}
        >
            {/* SVG Ring */}
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#FAF3E3"
                    strokeWidth={strokeWidth}
                />

                {/* Border circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#1C1C1C"
                    strokeWidth={2}
                />

                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={stateColors[state]}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>

            {/* Center content */}
            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <span style={{
                    fontSize: '32px',
                    fontWeight: '900',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#1C1C1C',
                }}>
                    {percentage.toFixed(0)}%
                </span>

                <span style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    marginTop: '4px',
                    backgroundColor: stateColors[state],
                    color: '#1C1C1C',
                    border: '2px solid #1C1C1C',
                }}>
                    {state}
                </span>
            </div>

            {/* Buffer info */}
            {showDetails && (
                <div style={{
                    marginTop: '16px',
                    padding: '10px 16px',
                    backgroundColor: '#FAF3E3',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1C1C1C',
                    border: '2px solid #1C1C1C',
                    boxShadow: '2px 2px 0px #1C1C1C',
                }}>
                    🛡️ Buffer: <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: '700',
                    }}>
                        {buffer}
                    </span> classes
                </div>
            )}
        </div>
    )
}

HealthRing.propTypes = {
    percentage: PropTypes.number,
    state: PropTypes.oneOf(['SAFE', 'TENSION', 'CRITICAL']),
    buffer: PropTypes.number,
    size: PropTypes.number,
    onTap: PropTypes.func,
}

export default HealthRing
