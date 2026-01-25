/**
 * BudgetSurface - Attendance Budget Visualization
 * 
 * Per Design Document:
 * - Attendance is treated as a BUDGET, not a percentage
 * - Horizontal bar with three regions:
 *   - Attended (dark filled)
 *   - Remaining (light available)
 *   - Unsafe Zone (red hatched, pushes inward)
 * - Animates when simulating skip
 */

import PropTypes from 'prop-types'

function BudgetSurface({
    attended = 0,
    remaining = 0,
    total = 75,
    status = 'SAFE',
    isSimulating = false,
}) {
    // Calculate minimum required (75%)
    const minRequired = Math.ceil(total * 0.75)

    // Calculate percentages for display
    const attendedPct = (attended / total) * 100
    const remainingPct = (remaining / total) * 100

    // Unsafe zone: what happens if we miss all remaining
    // unsafe = minRequired - attended (if positive, we're in trouble)
    const unsafeClasses = Math.max(0, minRequired - attended)
    const unsafePct = Math.min((unsafeClasses / total) * 100, remainingPct)
    const safePct = remainingPct - unsafePct

    return (
        <div
            className="budget-surface"
            role="img"
            aria-label={`Attendance budget: ${attended} attended out of ${total}. ${remaining} sessions remaining.`}
        >
            {/* Attended region (dark) */}
            <div
                className="budget-attended transition-all"
                style={{
                    width: `${attendedPct}%`,
                    transitionDuration: status === 'SAFE' ? '600ms' : status === 'TENSION' ? '300ms' : '150ms',
                }}
            />

            {/* Safe remaining region (light) */}
            <div
                className="budget-remaining transition-all"
                style={{
                    width: `${safePct}%`,
                }}
            />

            {/* Unsafe zone (red hatched) */}
            {unsafePct > 0 && (
                <div
                    className={`budget-unsafe transition-all ${isSimulating ? 'simulating' : ''}`}
                    style={{
                        width: `${unsafePct}%`,
                    }}
                />
            )}
        </div>
    )
}

BudgetSurface.propTypes = {
    attended: PropTypes.number,
    remaining: PropTypes.number,
    total: PropTypes.number,
    status: PropTypes.oneOf(['SAFE', 'TENSION', 'CRITICAL']),
    isSimulating: PropTypes.bool,
}

export default BudgetSurface
