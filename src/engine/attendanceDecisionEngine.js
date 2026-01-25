/**
 * Attendance Decision Engine
 * 
 * Centralized module for all attendance-related calculations and decision logic.
 * 
 * This is a pure, functional module:
 * - No React dependencies
 * - No UI components
 * - No hooks
 * - All functions are pure (same input → same output)
 * - All functions are testable
 * 
 * Purpose:
 * - Calculate subject states
 * - Determine global system state
 * - Calculate buffers, deficits, percentages
 * - Determine PNR (Point of No Return) dates
 * - Generate recovery plans
 * - Simulate attendance scenarios
 * 
 * Usage:
 * - Called by the store (attendanceStore.js)
 * - Never called directly from UI components
 * - App.jsx should never calculate attendance directly
 */

import {
    calculatePercentage,
    calculateBuffer,
    calculateDeficit,
    getStatus,
    calculatePNR,
    getDaysUntilPNR,
    generateRecoveryPlan,
    calculateSubjectState,
    simulateSkip,
    simulateCancellation,
    simulateAttendAll,
} from '../utils/calculations'

// Re-export all calculation functions for convenience
export {
    calculatePercentage,
    calculateBuffer,
    calculateDeficit,
    getStatus,
    calculatePNR,
    getDaysUntilPNR,
    generateRecoveryPlan,
    calculateSubjectState,
    simulateSkip,
    simulateCancellation,
    simulateAttendAll,
}

// ========================================
// GLOBAL STATE CALCULATION
// ========================================

/**
 * Calculate global system state from all subjects
 * 
 * Returns the worst-case state across all subjects:
 * - If any subject is CRITICAL → CRITICAL
 * - Else if any subject is TENSION → TENSION
 * - Else → SAFE
 * 
 * @param {Array} subjects - Array of subjects with attendance data
 * @param {Object} options - Optional configuration
 * @param {Object} options.totalSessionsMap - Map of subject code to total sessions (optional)
 * @param {number} options.weeksRemaining - Weeks remaining in semester (optional)
 * @returns {'SAFE'|'TENSION'|'CRITICAL'} Global state
 * 
 * @example
 * const subjects = [
 *   { code: 'ML', attendance: { attended: 28, conducted: 41 }, total_expected_sessions: 75 },
 *   { code: 'CSS', attendance: { attended: 30, conducted: 30 }, total_expected_sessions: 45 }
 * ]
 * getGlobalStateFromSubjects(subjects) // returns 'CRITICAL' (ML is below 75%)
 */
export function getGlobalStateFromSubjects(subjects, options = {}) {
    if (!subjects || subjects.length === 0) {
        return 'SAFE'
    }

    const { totalSessionsMap = {}, weeksRemaining } = options
    const states = []

    for (const subject of subjects) {
        const attendance = subject.attendance || subject
        const total = totalSessionsMap[subject.code] || subject.total_expected_sessions || 75
        const sessionsPerWeek = subject.total_sessions_per_week || 4

        // Calculate PNR if weeks remaining provided
        let pnrDate = null
        if (weeksRemaining !== undefined) {
            pnrDate = calculatePNR(attendance, total, sessionsPerWeek)
        }

        const status = getStatus(attendance, total, pnrDate)
        states.push(status)
    }

    // Return worst state
    if (states.includes('CRITICAL')) return 'CRITICAL'
    if (states.includes('TENSION')) return 'TENSION'
    return 'SAFE'
}

// ========================================
// AGGREGATE CALCULATIONS
// ========================================

/**
 * Calculate overall attendance percentage across all subjects
 * 
 * @param {Array} subjects - Array of subjects with attendance
 * @returns {number} Overall percentage (0-100)
 */
export function calculateOverallPercentage(subjects) {
    if (!subjects || subjects.length === 0) return 0

    let totalAttended = 0
    let totalConducted = 0

    for (const subject of subjects) {
        const attendance = subject.attendance || subject
        totalAttended += attendance.attended || 0
        totalConducted += attendance.conducted || 0
    }

    return calculatePercentage(totalAttended, totalConducted)
}

/**
 * Calculate minimum buffer across all subjects
 * 
 * @param {Array} subjects - Array of subjects with attendance
 * @returns {number} Minimum buffer (worst case)
 */
export function calculateMinimumBuffer(subjects) {
    if (!subjects || subjects.length === 0) return Infinity

    let minBuffer = Infinity

    for (const subject of subjects) {
        const attendance = subject.attendance || subject
        const total = subject.total_expected_sessions || 75
        const buffer = calculateBuffer(attendance, total)

        if (buffer < minBuffer) {
            minBuffer = buffer
        }
    }

    return minBuffer === Infinity ? 0 : minBuffer
}

/**
 * Find the worst PNR date across all subjects
 * 
 * @param {Array} subjects - Array of subjects with attendance
 * @param {number} weeksRemaining - Weeks remaining in semester
 * @returns {Date|null|'PASSED'} Worst PNR date
 */
export function findWorstPNR(subjects, weeksRemaining) {
    if (!subjects || subjects.length === 0) return null

    let worstPNR = null

    for (const subject of subjects) {
        const attendance = subject.attendance || subject
        const total = subject.total_expected_sessions || 75
        const sessionsPerWeek = subject.total_sessions_per_week || 4

        const pnrDate = calculatePNR(attendance, total, sessionsPerWeek)

        // Skip null and 'PASSED' for comparison
        if (pnrDate === 'PASSED') {
            return 'PASSED'
        }

        if (pnrDate instanceof Date) {
            if (!worstPNR || pnrDate < worstPNR) {
                worstPNR = pnrDate
            }
        }
    }

    return worstPNR
}

// ========================================
// BATCH CALCULATIONS
// ========================================

/**
 * Calculate states for all subjects at once
 * 
 * @param {Array} subjects - Array of subjects
 * @param {number} weeksRemaining - Weeks remaining in semester
 * @returns {Array} Array of { subject, calculatedState } objects
 */
export function calculateAllSubjectStates(subjects, weeksRemaining) {
    if (!subjects || subjects.length === 0) return []

    return subjects.map(subject => {
        const state = calculateSubjectState(
            subject,
            subject.total_expected_sessions || 75,
            subject.total_sessions_per_week || 4,
            weeksRemaining
        )

        return { subject, calculatedState: state }
    })
}
