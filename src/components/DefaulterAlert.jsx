/**
 * DefaulterAlert - Defaulter List Warning Banner
 * 
 * Shows warning when within 7 days of a defaulter list date.
 * Displays appropriate urgency based on proximity.
 */

import PropTypes from 'prop-types'
import { formatDateForDisplay, formatCountdown } from '../utils/dateHelpers'

function DefaulterAlert({ defaulterInfo, onDismiss }) {
    if (!defaulterInfo) return null

    const { date, type, description, daysUntil } = defaulterInfo

    // Urgency colors
    const urgencyClasses = daysUntil <= 2
        ? 'bg-critical-light border-critical text-critical'
        : daysUntil <= 5
            ? 'bg-tension-light border-tension text-tension'
            : 'bg-safe-light border-safe text-warm-dark-grey'

    return (
        <div
            className={`
        ${urgencyClasses}
        border-l-4 p-4 rounded-lg mb-4
        flex items-start justify-between
      `}
            role="alert"
            aria-live="polite"
        >
            <div>
                <p className="font-semibold">
                    {type} Defaulter List: {formatCountdown(daysUntil)}
                </p>
                <p className="text-small mt-1 opacity-80">
                    {formatDateForDisplay(date)} — {description}
                </p>
                <p className="text-small mt-2">
                    Ensure your attendance is updated before this date.
                </p>
            </div>

            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="text-small opacity-70 hover:opacity-100"
                    aria-label="Dismiss alert"
                >
                    ✕
                </button>
            )}
        </div>
    )
}

DefaulterAlert.propTypes = {
    defaulterInfo: PropTypes.shape({
        date: PropTypes.instanceOf(Date),
        type: PropTypes.string,
        description: PropTypes.string,
        daysUntil: PropTypes.number,
    }),
    onDismiss: PropTypes.func,
}

export default DefaulterAlert
