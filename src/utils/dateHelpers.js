/**
 * 75Guard - Date & Calendar Helpers
 * 
 * Functions for:
 * - Week calculations
 * - Holiday detection
 * - Defaulter list proximity
 * - Data confidence
 * - Teaching day calculations
 * 
 * Based on verified Academic Calendar (Even Semester 2025-26)
 */

import {
    parseISO,
    format,
    differenceInDays,
    differenceInWeeks,
    addDays,
    isWeekend,
    isSameDay,
    isWithinInterval,
    startOfWeek,
    endOfWeek,
} from 'date-fns'

import semesterData from '../data/semester.json'

// ========================================
// SEMESTER CONFIGURATION
// ========================================

const SEMESTER_START = parseISO(semesterData.teaching_start) // Jan 19, 2026
const SEMESTER_END = parseISO(semesterData.end_date)         // Apr 24, 2026
const HOLIDAYS = semesterData.holidays.map(h => parseISO(h.date))
const DEFAULTER_LISTS = semesterData.defaulter_lists.map(d => ({
    ...d,
    date: parseISO(d.date)
}))

// ========================================
// WEEK CALCULATIONS
// ========================================

/**
 * Get weeks elapsed since semester start
 * 
 * @param {Date} [today=new Date()] - Current date
 * @returns {number} Number of complete weeks elapsed
 * 
 * @example
 * // If today is Feb 2, 2026 (2 weeks after Jan 19)
 * getWeeksElapsed(new Date('2026-02-02')) // returns 2
 */
export function getWeeksElapsed(today = new Date()) {
    const weeks = differenceInWeeks(today, SEMESTER_START)
    return Math.max(0, weeks)
}

/**
 * Get weeks remaining until semester end
 * 
 * @param {Date} [today=new Date()] - Current date
 * @returns {number} Weeks remaining (counting current week)
 */
export function getWeeksRemaining(today = new Date()) {
    const totalWeeks = semesterData.teaching_weeks
    const elapsed = getWeeksElapsed(today)
    return Math.max(0, totalWeeks - elapsed)
}

/**
 * Get current week number (1-indexed)
 * 
 * @param {Date} [today=new Date()] - Current date
 * @returns {number} Week number (1-15)
 */
export function getCurrentWeek(today = new Date()) {
    const elapsed = getWeeksElapsed(today)
    return Math.min(elapsed + 1, semesterData.teaching_weeks)
}

// ========================================
// HOLIDAY DETECTION
// ========================================

/**
 * Check if a date is a holiday
 * 
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if holiday
 */
export function isHoliday(date) {
    const checkDate = typeof date === 'string' ? parseISO(date) : date
    return HOLIDAYS.some(holiday => isSameDay(holiday, checkDate))
}

/**
 * Get holiday info for a date
 * 
 * @param {Date|string} date - Date to check
 * @returns {Object|null} Holiday info or null
 */
export function getHolidayInfo(date) {
    const checkDate = typeof date === 'string' ? parseISO(date) : date
    const index = HOLIDAYS.findIndex(h => isSameDay(h, checkDate))

    if (index === -1) return null
    return semesterData.holidays[index]
}

// ========================================
// DEFAULTER LIST PROXIMITY
// ========================================

/**
 * Check if near a defaulter list date (within 7 days)
 * Used for UI alerts
 * 
 * @param {Date} [today=new Date()] - Current date
 * @returns {Object|null} Upcoming defaulter list info or null
 */
export function getNearDefaulterList(today = new Date()) {
    for (const dl of DEFAULTER_LISTS) {
        const daysUntil = differenceInDays(dl.date, today)
        if (daysUntil >= 0 && daysUntil <= 7) {
            return {
                ...dl,
                daysUntil,
            }
        }
    }
    return null
}

/**
 * Check if within warning period before any defaulter list
 * 
 * @param {Date} [today=new Date()] - Current date
 * @returns {boolean} True if within 7 days of defaulter list
 */
export function isNearDefaulterList(today = new Date()) {
    return getNearDefaulterList(today) !== null
}

/**
 * Get all upcoming defaulter lists
 * 
 * @param {Date} [today=new Date()] - Current date
 * @returns {Array} Upcoming defaulter lists with days until
 */
export function getUpcomingDefaulterLists(today = new Date()) {
    return DEFAULTER_LISTS
        .map(dl => ({
            ...dl,
            daysUntil: differenceInDays(dl.date, today),
        }))
        .filter(dl => dl.daysUntil >= 0)
        .sort((a, b) => a.daysUntil - b.daysUntil)
}

// ========================================
// DATA CONFIDENCE
// ========================================

/**
 * Get data confidence level based on last update
 * 
 * Per PRD §4.4:
 * - HIGH: ≤7 days old
 * - MEDIUM: 8-14 days old
 * - LOW: 15-30 days old
 * - UNRELIABLE: >30 days old
 * 
 * @param {string|Date} lastUpdated - ISO timestamp or Date of last update
 * @returns {'HIGH'|'MEDIUM'|'LOW'|'UNRELIABLE'} Confidence level
 */
export function getDataConfidence(lastUpdated) {
    if (!lastUpdated) return 'UNRELIABLE'

    const updateDate = typeof lastUpdated === 'string'
        ? parseISO(lastUpdated)
        : lastUpdated

    const daysSinceUpdate = differenceInDays(new Date(), updateDate)

    if (daysSinceUpdate <= 7) return 'HIGH'
    if (daysSinceUpdate <= 14) return 'MEDIUM'
    if (daysSinceUpdate <= 30) return 'LOW'
    return 'UNRELIABLE'
}

/**
 * Check if data update is needed
 * 
 * @param {string|Date} lastUpdated - Last update timestamp
 * @returns {boolean} True if update recommended
 */
export function needsUpdate(lastUpdated) {
    const confidence = getDataConfidence(lastUpdated)
    return confidence === 'LOW' || confidence === 'UNRELIABLE'
}

/**
 * Check if forced update is required
 * 
 * @param {string|Date} lastUpdated - Last update timestamp
 * @returns {boolean} True if forced update required (>30 days)
 */
export function requiresForcedUpdate(lastUpdated) {
    return getDataConfidence(lastUpdated) === 'UNRELIABLE'
}

// ========================================
// TEACHING DAYS
// ========================================

/**
 * Check if a date is a teaching day
 * (Not weekend, not holiday)
 * 
 * @param {Date} date - Date to check
 * @returns {boolean} True if teaching day
 */
export function isTeachingDay(date) {
    return !isWeekend(date) && !isHoliday(date)
}

/**
 * Count teaching days in a date range
 * 
 * @param {Date} startDate - Start of range
 * @param {Date} endDate - End of range
 * @returns {number} Number of teaching days
 */
export function countTeachingDays(startDate, endDate) {
    let count = 0
    let current = new Date(startDate)

    while (current <= endDate) {
        if (isTeachingDay(current)) {
            count++
        }
        current = addDays(current, 1)
    }

    return count
}

/**
 * Get teaching days remaining in semester
 * 
 * @param {Date} [today=new Date()] - Current date
 * @returns {number} Teaching days remaining
 */
export function getTeachingDaysRemaining(today = new Date()) {
    return countTeachingDays(today, SEMESTER_END)
}

// ========================================
// DATE FORMATTING
// ========================================

/**
 * Format date for display
 * 
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date (e.g., "Thu, 23 Jan 2026")
 */
export function formatDateForDisplay(date) {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'EEE, d MMM yyyy')
}

/**
 * Format date short
 * 
 * @param {Date|string} date - Date to format
 * @returns {string} Short format (e.g., "23 Jan")
 */
export function formatDateShort(date) {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'd MMM')
}

/**
 * Format countdown text
 * 
 * @param {number} days - Days until event
 * @returns {string} Human readable countdown
 */
export function formatCountdown(days) {
    if (days < 0) return 'Passed'
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    if (days <= 7) return `${days} days`

    const weeks = Math.floor(days / 7)
    return weeks === 1 ? '1 week' : `${weeks} weeks`
}

// ========================================
// LAST SAFE SKIP DATE
// ========================================

/**
 * Calculate last date to safely skip before entering TENSION
 * 
 * @param {Object} subject - Subject with attendance
 * @param {number} totalSessions - Total expected sessions
 * @param {number} sessionsPerWeek - Sessions per week
 * @returns {Date|null} Last safe skip date or null if already in tension
 */
export function getLastSafeSkipDate(subject, totalSessions, sessionsPerWeek) {
    const { attended, conducted } = subject
    const remaining = totalSessions - conducted
    const minRequired = Math.ceil(totalSessions * 0.75)

    // Current buffer
    const buffer = (attended + remaining) - minRequired

    // If buffer <= 4, already in tension territory
    if (buffer <= 4) return null

    // Calculate how many sessions until buffer = 4
    const sessionsUntilTension = buffer - 4
    const weeksUntilTension = Math.floor(sessionsUntilTension / sessionsPerWeek)

    if (weeksUntilTension <= 0) return null

    return addDays(new Date(), weeksUntilTension * 7)
}

// ========================================
// EXAM PERIOD CHECKS
// ========================================

/**
 * Check if date is during exam period (reduced teaching)
 * 
 * @param {Date} date - Date to check
 * @returns {Object|null} Exam period info or null
 */
export function getExamPeriod(date) {
    for (const exam of semesterData.exam_periods) {
        const start = parseISO(exam.start)
        const end = parseISO(exam.end)

        if (isWithinInterval(date, { start, end })) {
            return exam
        }
    }
    return null
}

/**
 * Check if currently in exam period
 * 
 * @param {Date} [today=new Date()] - Current date
 * @returns {Object|null} Exam period info or null
 */
export function isExamPeriod(today = new Date()) {
    return getExamPeriod(today)
}

// ========================================
// EXPORTS FOR TESTING
// ========================================

export const _testExports = {
    SEMESTER_START,
    SEMESTER_END,
    HOLIDAYS,
    DEFAULTER_LISTS,
}
