/**
 * 75Guard - Validation Utilities
 * 
 * Per PRD §3.2:
 * - Attended ≤ Conducted
 * - Conducted ≈ Expected (based on weeks elapsed)
 * - Clear error messages for validation failures
 */

import { getWeeksElapsed, getCurrentWeek } from './dateHelpers'

/**
 * Validate attended vs conducted
 * 
 * @param {number} attended - Sessions attended
 * @param {number} conducted - Sessions conducted
 * @returns {{valid: boolean, error?: string}}
 */
export function validateAttendedConducted(attended, conducted) {
    if (typeof attended !== 'number' || typeof conducted !== 'number') {
        return { valid: false, error: 'Values must be numbers' }
    }

    if (attended < 0) {
        return { valid: false, error: 'Attended cannot be negative' }
    }

    if (conducted < 0) {
        return { valid: false, error: 'Conducted cannot be negative' }
    }

    if (attended > conducted) {
        return { valid: false, error: 'Attended cannot exceed conducted' }
    }

    return { valid: true }
}

/**
 * Validate expected sessions based on weeks elapsed
 * 
 * @param {number} conducted - Sessions conducted so far
 * @param {number} sessionsPerWeek - Expected sessions per week
 * @param {number} [tolerancePercent=50] - Tolerance percentage
 * @returns {{valid: boolean, warning?: string, expected: number}}
 */
export function validateExpectedSessions(conducted, sessionsPerWeek, tolerancePercent = 50) {
    const weeksElapsed = getWeeksElapsed()
    const expectedSessions = weeksElapsed * sessionsPerWeek
    const tolerance = expectedSessions * (tolerancePercent / 100)

    const minExpected = Math.max(0, expectedSessions - tolerance)
    const maxExpected = expectedSessions + tolerance

    if (conducted < minExpected) {
        return {
            valid: true,
            warning: `Conducted (${conducted}) seems low for week ${getCurrentWeek()}. Expected ~${Math.round(expectedSessions)}.`,
            expected: expectedSessions,
        }
    }

    if (conducted > maxExpected && expectedSessions > 0) {
        return {
            valid: true,
            warning: `Conducted (${conducted}) seems high for week ${getCurrentWeek()}. Expected ~${Math.round(expectedSessions)}.`,
            expected: expectedSessions,
        }
    }

    return { valid: true, expected: expectedSessions }
}

/**
 * Validate complete subject data
 * 
 * @param {Object} subject - Subject object with attendance
 * @returns {{valid: boolean, errors: string[], warnings: string[]}}
 */
export function validateSubjectData(subject) {
    const errors = []
    const warnings = []

    if (!subject) {
        return { valid: false, errors: ['Subject is required'], warnings: [] }
    }

    if (!subject.code) {
        errors.push('Subject code is required')
    }

    if (!subject.name) {
        errors.push('Subject name is required')
    }

    const attendance = subject.attendance || {}
    const { attended = 0, conducted = 0 } = attendance

    // Validate attended vs conducted
    const acResult = validateAttendedConducted(attended, conducted)
    if (!acResult.valid) {
        errors.push(acResult.error)
    }

    // Validate expected sessions
    if (subject.total_sessions_per_week > 0) {
        const esResult = validateExpectedSessions(conducted, subject.total_sessions_per_week)
        if (esResult.warning) {
            warnings.push(esResult.warning)
        }
    }

    // Validate total expected sessions
    if (subject.total_expected_sessions) {
        if (conducted > subject.total_expected_sessions) {
            warnings.push(`Conducted (${conducted}) exceeds total expected (${subject.total_expected_sessions})`)
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    }
}

/**
 * Validate batch import data
 * 
 * @param {Array} subjects - Array of subjects to validate
 * @returns {{valid: boolean, results: Array}}
 */
export function validateBatchData(subjects) {
    if (!Array.isArray(subjects)) {
        return { valid: false, results: [], error: 'Data must be an array of subjects' }
    }

    const results = subjects.map(subject => ({
        code: subject.code,
        ...validateSubjectData(subject),
    }))

    const valid = results.every(r => r.valid)

    return { valid, results }
}

/**
 * Sanitize numeric input
 * 
 * @param {*} value - Input value
 * @param {number} [defaultValue=0] - Default if invalid
 * @param {number} [min=0] - Minimum value
 * @param {number} [max=Infinity] - Maximum value
 * @returns {number}
 */
export function sanitizeNumericInput(value, defaultValue = 0, min = 0, max = Infinity) {
    const num = parseInt(value, 10)

    if (isNaN(num)) {
        return defaultValue
    }

    return Math.max(min, Math.min(max, num))
}

/**
 * Format validation errors for display
 * 
 * @param {string[]} errors - Array of error messages
 * @returns {string}
 */
export function formatValidationErrors(errors) {
    if (!errors || errors.length === 0) return ''
    if (errors.length === 1) return errors[0]
    return errors.map((e, i) => `${i + 1}. ${e}`).join('\n')
}
