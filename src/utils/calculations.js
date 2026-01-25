/**
 * 75Guard - Core Calculation Engine
 * 
 * All calculations must be:
 * - Pure (same input → same output)
 * - Testable (unit tests for every function)
 * - Explainable (comments show math)
 * 
 * Based on PRD §7 Business Logic Rules
 */

import { differenceInDays, addWeeks } from 'date-fns'

// ========================================
// BASE CALCULATIONS
// ========================================

/**
 * Calculate current attendance percentage
 * Formula: (attended / conducted) × 100
 * 
 * @param {number} attended - Number of sessions attended
 * @param {number} conducted - Total sessions conducted so far
 * @returns {number} Percentage rounded to 2 decimal places
 * 
 * @example
 * calculatePercentage(28, 41) // returns 68.29
 * calculatePercentage(0, 0)   // returns 0
 * calculatePercentage(10, 10) // returns 100
 */
export function calculatePercentage(attended, conducted) {
    if (conducted === 0) return 0
    return parseFloat(((attended / conducted) * 100).toFixed(2))
}

/**
 * Calculate attendance buffer
 * Buffer = classes you can still miss while staying ≥75%
 * 
 * Formula:
 *   remaining = totalSessions - conducted
 *   min_required = ceil(total × 0.75)
 *   buffer = (attended + remaining) - min_required
 * 
 * @param {Object} subject - Subject with attendance data
 * @param {number} subject.attended - Sessions attended
 * @param {number} subject.conducted - Sessions conducted
 * @param {number} totalSessions - Total expected sessions in semester
 * @returns {number} Buffer (non-negative integer)
 * 
 * @example
 * // PRD Example: Total=80, Attended=6, Conducted=8
 * // remaining = 80 - 8 = 72
 * // min_required = ceil(80 × 0.75) = 60
 * // buffer = (6 + 72) - 60 = 18
 * calculateBuffer({ attended: 6, conducted: 8 }, 80) // returns 18
 */
export function calculateBuffer(subject, totalSessions) {
    const { attended, conducted } = subject
    const remaining = totalSessions - conducted
    const minRequired = Math.ceil(totalSessions * 0.75)

    const buffer = (attended + remaining) - minRequired
    return Math.max(0, Math.floor(buffer)) // Can't have negative buffer
}

/**
 * Calculate attendance deficit
 * Deficit = additional classes needed to reach 75%
 * 
 * Formula:
 *   min_required = ceil(total × 0.75)
 *   deficit = min_required - attended
 * 
 * @param {Object} subject - Subject with attendance data
 * @param {number} subject.attended - Sessions attended
 * @param {number} totalSessions - Total expected sessions in semester
 * @returns {number} Deficit (non-negative integer)
 * 
 * @example
 * // Need 60 to pass, have 28: deficit = 60 - 28 = 32
 * calculateDeficit({ attended: 28 }, 80) // returns 32
 */
export function calculateDeficit(subject, totalSessions) {
    const { attended } = subject
    const minRequired = Math.ceil(totalSessions * 0.75)

    const deficit = minRequired - attended
    return Math.max(0, Math.ceil(deficit)) // Can't have negative deficit
}

// ========================================
// STATUS CLASSIFICATION
// ========================================

/**
 * Determine subject status
 * 
 * Classification rules (from PRD §7.2):
 * - CRITICAL: percentage < 75% OR buffer ≤ 1 OR recovery impossible
 * - TENSION: buffer 2-4 OR PNR within 14 days OR percentage 75-80%
 * - SAFE: buffer ≥ 5 AND percentage > 80%
 * 
 * @param {Object} subject - Subject with attendance data
 * @param {number} totalSessions - Total expected sessions
 * @param {Date|null} pnrDate - Point of No Return date
 * @returns {'SAFE'|'TENSION'|'CRITICAL'} Status
 */
export function getStatus(subject, totalSessions, pnrDate = null) {
    const { attended, conducted } = subject
    const percentage = calculatePercentage(attended, conducted)
    const buffer = calculateBuffer(subject, totalSessions)
    const deficit = calculateDeficit(subject, totalSessions)
    const remaining = totalSessions - conducted

    // Recovery impossible: deficit > remaining sessions
    if (deficit > remaining) {
        return 'CRITICAL'
    }

    // Critical: Below 75% OR buffer ≤ 1
    if (percentage < 75 || buffer <= 1) {
        return 'CRITICAL'
    }

    // Check PNR proximity
    let daysUntilPNR = Infinity
    if (pnrDate && pnrDate instanceof Date && pnrDate.getTime() > 0) {
        daysUntilPNR = differenceInDays(pnrDate, new Date())
    }

    // Tension: Buffer 2-4 OR PNR within 14 days
    if (buffer <= 4 || daysUntilPNR <= 14) {
        return 'TENSION'
    }

    // Safe: Buffer ≥ 5
    return 'SAFE'
}

/**
 * Get global state from all subjects (worst case)
 * 
 * @param {Array} subjects - Array of subjects with attendance
 * @param {number} totalSessionsMap - Map of subject code to total sessions
 * @returns {'SAFE'|'TENSION'|'CRITICAL'} Worst status
 */
export function getGlobalState(subjects, totalSessionsMap = {}) {
    if (!subjects || subjects.length === 0) return 'SAFE'

    const states = subjects.map(subject => {
        const total = totalSessionsMap[subject.code] || subject.total_expected_sessions || 75
        const attendance = subject.attendance || subject
        return getStatus(attendance, total)
    })

    // Return worst state
    if (states.includes('CRITICAL')) return 'CRITICAL'
    if (states.includes('TENSION')) return 'TENSION'
    return 'SAFE'
}

// ========================================
// POINT OF NO RETURN (PNR)
// ========================================

/**
 * Calculate Point of No Return date
 * PNR = date when recovery becomes mathematically impossible
 * 
 * Formula:
 *   If deficit > remaining: Already passed (return 0)
 *   If deficit = 0: No PNR (return null)
 *   Otherwise: sessionsUntilPNR = remaining - deficit
 *              weeksUntilPNR = sessionsUntilPNR / sessionsPerWeek
 *              PNR = today + weeksUntilPNR
 * 
 * @param {Object} subject - Subject with attendance
 * @param {number} totalSessions - Total expected sessions
 * @param {number} sessionsPerWeek - Sessions per week for this subject
 * @returns {Date|null|'PASSED'} PNR date, null if safe, 'PASSED' if already impossible
 */
export function calculatePNR(subject, totalSessions, sessionsPerWeek) {
    const { attended, conducted } = subject
    const remaining = totalSessions - conducted
    const deficit = calculateDeficit(subject, totalSessions)

    // Already impossible - recovery passed
    if (deficit > remaining) {
        return 'PASSED'
    }

    // No deficit - completely safe, no PNR
    if (deficit === 0) {
        return null
    }

    // Calculate date
    const sessionsUntilPNR = remaining - deficit
    const weeksUntilPNR = Math.floor(sessionsUntilPNR / sessionsPerWeek)

    if (weeksUntilPNR <= 0) {
        return 'PASSED'
    }

    return addWeeks(new Date(), weeksUntilPNR)
}

/**
 * Get days until PNR
 * @param {Date|null|'PASSED'} pnrDate
 * @returns {number|null} Days until PNR, null if no PNR, -1 if passed
 */
export function getDaysUntilPNR(pnrDate) {
    if (pnrDate === 'PASSED') return -1
    if (pnrDate === null) return null
    if (!(pnrDate instanceof Date)) return null

    return differenceInDays(pnrDate, new Date())
}

// ========================================
// RECOVERY PLAN GENERATOR
// ========================================

/**
 * Generate recovery plan
 * 
 * @param {Object} subject - Subject with attendance
 * @param {number} totalSessions - Total expected sessions
 * @param {number} sessionsPerWeek - Sessions per week
 * @param {number} weeksRemaining - Weeks left in semester
 * @returns {Object} Recovery plan with possible, plan[], finalPercentage, difficulty
 */
export function generateRecoveryPlan(subject, totalSessions, sessionsPerWeek, weeksRemaining) {
    const { attended, conducted } = subject
    const deficit = calculateDeficit(subject, totalSessions)
    const remaining = totalSessions - conducted

    // Impossible case
    if (deficit > remaining) {
        const maxAchievable = calculatePercentage(attended + remaining, totalSessions)

        return {
            possible: false,
            maxPercentage: maxAchievable,
            message: 'Recovery is mathematically impossible. Even with perfect attendance, 75% cannot be reached.',
            difficulty: 'IMPOSSIBLE',
            plan: [],
        }
    }

    // Already at or above 75%
    if (deficit === 0) {
        const finalPercentage = calculatePercentage(attended + remaining, totalSessions)
        return {
            possible: true,
            plan: [],
            finalPercentage,
            difficulty: 'NONE',
            message: 'You are already at or above 75%. No recovery needed.',
        }
    }

    // Generate week-by-week plan
    const plan = []
    let attendanceNeeded = deficit
    let currentWeek = 1

    while (attendanceNeeded > 0 && currentWeek <= weeksRemaining) {
        const sessionsThisWeek = Math.min(attendanceNeeded, sessionsPerWeek)
        plan.push({
            week: currentWeek,
            attend: sessionsThisWeek,
            skip: Math.max(0, sessionsPerWeek - sessionsThisWeek),
        })

        attendanceNeeded -= sessionsThisWeek
        currentWeek++
    }

    // Calculate final percentage
    const finalPercentage = calculatePercentage(attended + deficit, totalSessions)

    // Classify difficulty
    let difficulty
    if (deficit > sessionsPerWeek * 4) {
        difficulty = 'HARD'
    } else if (deficit > sessionsPerWeek * 2) {
        difficulty = 'MEDIUM'
    } else {
        difficulty = 'EASY'
    }

    return {
        possible: true,
        plan,
        finalPercentage,
        difficulty,
        requiredAttendances: deficit,
        weeksNeeded: plan.length,
    }
}

// ========================================
// SKIP IMPACT SIMULATION
// ========================================

/**
 * Simulate the impact of skipping classes
 * 
 * @param {Object} subject - Subject with attendance
 * @param {number} totalSessions - Total expected sessions
 * @param {number} skipsToSimulate - Number of skips to simulate (default 1)
 * @returns {Object} Impact: newPercentage, newBuffer, newStatus, wouldCrossThreshold
 */
export function simulateSkip(subject, totalSessions, skipsToSimulate = 1) {
    const { attended, conducted } = subject

    // After skip: conducted increases, attended stays same
    const newConducted = conducted + skipsToSimulate
    const simulatedSubject = { attended, conducted: newConducted }

    const currentPercentage = calculatePercentage(attended, conducted)
    const newPercentage = calculatePercentage(attended, newConducted)
    const newBuffer = calculateBuffer(simulatedSubject, totalSessions)
    const newStatus = getStatus(simulatedSubject, totalSessions)

    // Check if crossing 75% threshold
    const wouldCrossThreshold = currentPercentage >= 75 && newPercentage < 75

    // Check status change
    const currentStatus = getStatus(subject, totalSessions)
    const statusWorsened = (
        (currentStatus === 'SAFE' && newStatus !== 'SAFE') ||
        (currentStatus === 'TENSION' && newStatus === 'CRITICAL')
    )

    return {
        currentPercentage,
        newPercentage,
        percentageChange: parseFloat((newPercentage - currentPercentage).toFixed(2)),
        currentBuffer: calculateBuffer(subject, totalSessions),
        newBuffer,
        bufferChange: newBuffer - calculateBuffer(subject, totalSessions),
        currentStatus,
        newStatus,
        statusWorsened,
        wouldCrossThreshold,
    }
}

/**
 * Simulate a lecture being cancelled (opposite of skip)
 * 
 * @param {Object} subject - Subject with attendance
 * @param {number} totalSessions - Total expected sessions
 * @returns {Object} Impact similar to simulateSkip
 */
export function simulateCancellation(subject, totalSessions) {
    const { attended, conducted } = subject

    // Cancellation: reduces total expected sessions
    const newTotal = totalSessions - 1
    const newBuffer = calculateBuffer(subject, newTotal)
    const newStatus = getStatus(subject, newTotal)

    return {
        newTotal,
        newBuffer,
        newStatus,
        bufferChange: newBuffer - calculateBuffer(subject, totalSessions),
    }
}

/**
 * Simulate attending all remaining classes (best case)
 * 
 * @param {Object} subject - Subject with attendance
 * @param {number} totalSessions - Total expected sessions
 * @returns {Object} Best case scenario
 */
export function simulateAttendAll(subject, totalSessions) {
    const { attended, conducted } = subject
    const remaining = totalSessions - conducted

    // Attend all remaining
    const finalAttended = attended + remaining
    const finalPercentage = calculatePercentage(finalAttended, totalSessions)
    const canReach75 = finalPercentage >= 75

    return {
        finalAttended,
        finalPercentage,
        canReach75,
        remaining,
    }
}

// ========================================
// COMPLETE SUBJECT CALCULATION
// ========================================

/**
 * Calculate complete state for a subject
 * 
 * @param {Object} subject - Subject with attendance data
 * @param {number} totalSessions - Total expected sessions
 * @param {number} sessionsPerWeek - Sessions per week
 * @param {number} weeksRemaining - Weeks left in semester
 * @returns {Object} Complete calculated state
 */
export function calculateSubjectState(subject, totalSessions, sessionsPerWeek, weeksRemaining) {
    const attendance = subject.attendance || subject
    const { attended, conducted } = attendance
    const remaining = totalSessions - conducted

    const percentage = calculatePercentage(attended, conducted)
    const buffer = calculateBuffer(attendance, totalSessions)
    const deficit = calculateDeficit(attendance, totalSessions)
    const pnrDate = calculatePNR(attendance, totalSessions, sessionsPerWeek)
    const status = getStatus(attendance, totalSessions, pnrDate)
    const recoveryPlan = generateRecoveryPlan(attendance, totalSessions, sessionsPerWeek, weeksRemaining)

    return {
        subject_code: subject.code,
        current_percentage: percentage,
        buffer,
        deficit,
        status,
        remaining_sessions: remaining,
        pnr_date: pnrDate,
        days_until_pnr: getDaysUntilPNR(pnrDate),
        recovery_possible: recoveryPlan.possible,
        recovery_plan: recoveryPlan,
    }
}
