/**
 * IrreversibilityTimeline - Constraint Visualizer
 * 
 * Per Design Document:
 * - This is NOT a calendar. This is a constraint visualizer.
 * - Shows: Today, Last Safe Skip, PNR Date, Semester End
 * - Horizontal scroll, mobile-first
 * - Zones compress based on state (Safe 100%, Tension 80%, Critical 60%, Locked 40%)
 * - Auto-centers on next critical point
 */

import { useMemo } from 'react'
import PropTypes from 'prop-types'
import { formatDateShort, formatCountdown } from '../utils/dateHelpers'
import { differenceInDays, parseISO } from 'date-fns'

function TimelinePoint({ date, label, type, isActive, daysUntil }) {
    const colors = {
        today: 'bg-blue-500',
        safe: 'bg-safe',
        pnr: 'bg-critical',
        end: 'bg-gray-400',
        locked: 'bg-gray-300',
    }

    const ringColors = {
        today: 'ring-blue-200',
        safe: 'ring-safe-light',
        pnr: 'ring-critical-light',
        end: 'ring-gray-200',
        locked: 'ring-gray-100',
    }

    // PNR within 7 days gets a pulse
    const shouldPulse = type === 'pnr' && daysUntil !== null && daysUntil <= 7 && daysUntil >= 0

    return (
        <div
            className={`timeline-point flex flex-col items-center min-w-[80px] ${isActive ? 'scale-110' : ''}`}
        >
            {/* Point */}
            <div
                className={`
          w-4 h-4 rounded-full 
          ${colors[type]} 
          ${isActive ? `ring-4 ${ringColors[type]}` : ''}
          ${shouldPulse ? 'animate-pulse' : ''}
        `}
            />

            {/* Date */}
            <p className="text-small mt-2 text-numeric">
                {formatDateShort(date)}
            </p>

            {/* Label */}
            <p className="text-small opacity-70 text-center">
                {label}
            </p>

            {/* Countdown */}
            {daysUntil !== null && daysUntil >= 0 && (
                <p className="text-small font-medium mt-1">
                    {formatCountdown(daysUntil)}
                </p>
            )}
        </div>
    )
}

TimelinePoint.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['today', 'safe', 'pnr', 'end', 'locked']).isRequired,
    isActive: PropTypes.bool,
    daysUntil: PropTypes.number,
}

function IrreversibilityTimeline({
    today = new Date(),
    lastSafeSkip = null,
    pnrDate = null,
    semesterEnd,
    currentState = 'SAFE',
}) {
    // Build timeline points
    const points = useMemo(() => {
        const result = []

        // Today
        result.push({
            date: today,
            label: 'Today',
            type: 'today',
            daysUntil: 0,
        })

        // Last Safe Skip
        if (lastSafeSkip && lastSafeSkip > today) {
            result.push({
                date: lastSafeSkip,
                label: 'Last Safe Skip',
                type: 'safe',
                daysUntil: differenceInDays(lastSafeSkip, today),
            })
        }

        // PNR Date
        if (pnrDate && pnrDate !== 'PASSED' && pnrDate > today) {
            result.push({
                date: pnrDate,
                label: 'Recovery Ends',
                type: 'pnr',
                daysUntil: differenceInDays(pnrDate, today),
            })
        } else if (pnrDate === 'PASSED') {
            // Show "Locked Zone" indicator
            result.push({
                date: today,
                label: 'LOCKED',
                type: 'locked',
                daysUntil: null,
            })
        }

        // Semester End
        if (semesterEnd) {
            const endDate = typeof semesterEnd === 'string' ? parseISO(semesterEnd) : semesterEnd
            result.push({
                date: endDate,
                label: 'Semester End',
                type: 'end',
                daysUntil: differenceInDays(endDate, today),
            })
        }

        // Sort by date
        result.sort((a, b) => a.date - b.date)

        return result
    }, [today, lastSafeSkip, pnrDate, semesterEnd])

    // Zone widths based on state
    const zoneClasses = {
        SAFE: 'timeline-zone safe',
        TENSION: 'timeline-zone tension',
        CRITICAL: 'timeline-zone critical',
    }

    return (
        <div
            className={`timeline-container ${currentState.toLowerCase()} py-4`}
            role="img"
            aria-label="Irreversibility timeline showing key dates"
        >
            <div className={`${zoneClasses[currentState]} flex items-center gap-6 px-4 overflow-x-auto`}>
                {/* Timeline line */}
                <div className="absolute h-0.5 bg-gray-200 left-4 right-4 top-1/2 -translate-y-1/2 -z-10" />

                {/* Points */}
                {points.map((point, index) => (
                    <TimelinePoint
                        key={`${point.type}-${index}`}
                        date={point.date}
                        label={point.label}
                        type={point.type}
                        isActive={point.type === 'pnr' || point.type === 'today'}
                        daysUntil={point.daysUntil}
                    />
                ))}
            </div>
        </div>
    )
}

IrreversibilityTimeline.propTypes = {
    today: PropTypes.instanceOf(Date),
    lastSafeSkip: PropTypes.instanceOf(Date),
    pnrDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.oneOf(['PASSED'])]),
    semesterEnd: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    currentState: PropTypes.oneOf(['SAFE', 'TENSION', 'CRITICAL']),
}

export default IrreversibilityTimeline
