/**
 * SubjectStrip - Thin horizontal strip for each subject
 * 
 * Per Design Document:
 * - NOT card-based. Thin horizontal strips (56px height collapsed)
 * - Expands inline when tapped
 * - Other subjects fade (focus isolation: opacity 0.4, grayscale 0.3)
 * - No "Back" buttons - collapse by tapping again
 */

import PropTypes from 'prop-types'
import BudgetSurface from './BudgetSurface'
import WhatIfSimulation from './WhatIfSimulation'

/**
 * Status indicator dot
 */
function StatusDot({ status }) {
    const colors = {
        SAFE: 'bg-safe',
        TENSION: 'bg-tension',
        CRITICAL: 'bg-critical',
    }

    return (
        <span
            className={`inline-block w-3 h-3 rounded-full ${colors[status]}`}
            aria-hidden="true"
        />
    )
}

StatusDot.propTypes = {
    status: PropTypes.oneOf(['SAFE', 'TENSION', 'CRITICAL']).isRequired,
}

function SubjectStrip({
    subject,
    calculatedState,
    isExpanded = false,
    isFaded = false,
    onToggle,
    onSimulate,
}) {
    const { code, name } = subject
    const {
        current_percentage,
        buffer,
        deficit,
        status,
        remaining_sessions,
        recovery_possible,
        recovery_plan,
    } = calculatedState || {}

    // Base classes
    const stripClasses = `
    subject-strip
    flex items-center justify-between
    px-4 cursor-pointer
    transition-all
    ${isExpanded ? 'expanded' : ''}
    ${isFaded ? 'faded' : ''}
  `

    return (
        <div
            className={stripClasses}
            onClick={onToggle}
            onKeyDown={(e) => e.key === 'Enter' && onToggle?.()}
            tabIndex={0}
            role="button"
            aria-expanded={isExpanded}
            aria-label={`${name}. ${status} state. ${current_percentage?.toFixed(1)}% attendance.`}
        >
            {/* Collapsed view */}
            <div className="flex items-center gap-3 flex-1">
                <StatusDot status={status || 'SAFE'} />
                <span className="font-medium truncate">{name}</span>
            </div>

            <span className="text-numeric font-semibold">
                {current_percentage?.toFixed(1) || 0}%
            </span>

            {/* Expanded view */}
            {isExpanded && (
                <div
                    className="w-full pt-4 pb-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Budget Surface */}
                    <div className="mb-4">
                        <BudgetSurface
                            attended={subject.attendance?.attended || 0}
                            remaining={remaining_sessions || 0}
                            total={subject.total_expected_sessions || 75}
                            status={status}
                        />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-small opacity-70">Buffer</p>
                            <p className="text-numeric text-heading">
                                {buffer || 0} <span className="text-small font-normal">classes</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-small opacity-70">Deficit</p>
                            <p className="text-numeric text-heading">
                                {deficit || 0} <span className="text-small font-normal">needed</span>
                            </p>
                        </div>
                    </div>

                    {/* Recovery status */}
                    {deficit > 0 && (
                        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--surface)' }}>
                            {recovery_possible ? (
                                <>
                                    <p className="font-medium">Recovery: {recovery_plan?.difficulty}</p>
                                    <p className="text-small opacity-70">
                                        Attend {recovery_plan?.requiredAttendances} of next {remaining_sessions} classes
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="font-medium text-critical">Recovery: IMPOSSIBLE</p>
                                    <p className="text-small opacity-70">
                                        Maximum achievable: {recovery_plan?.maxPercentage?.toFixed(1)}%
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {/* What-If Simulation */}
                    <WhatIfSimulation
                        subject={subject}
                        calculatedState={calculatedState}
                        onSimulate={onSimulate}
                        disabled={!recovery_possible}
                    />
                </div>
            )}
        </div>
    )
}

SubjectStrip.propTypes = {
    subject: PropTypes.object.isRequired,
    calculatedState: PropTypes.object,
    isExpanded: PropTypes.bool,
    isFaded: PropTypes.bool,
    onToggle: PropTypes.func,
    onSimulate: PropTypes.func,
}

export default SubjectStrip
