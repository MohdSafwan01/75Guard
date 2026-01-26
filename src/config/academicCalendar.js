/**
 * Academic Calendar Configuration
 * 
 * TE DS Even Semester 2025-26 (Jan 12 - Apr 24, 2026)
 * Source: CSE(DS) Academic Calendar Even Term 2025-26
 */

// Semester dates
export const SEMESTER_DATES = {
    commencement: '2026-01-12',      // Mon, Jan 12 - Semester start
    timetableStart: '2026-01-19',     // Mon, Jan 19 - Timetable effective
    termEnd: '2026-04-24',            // Fri, Apr 24 - Term End
    orPrExams: '2026-04-27',          // Mon, Apr 27 - OR/PR Exams start
    eseStart: '2026-05-18',           // Mon, May 18 - End Semester Exam
    eseResultDate: '2026-06-22',      // Mon, Jun 22 - ESE Result
    nextTermStart: '2026-07-06',      // Mon, Jul 6 - New term commencement
}

// Total teaching weeks
export const TOTAL_TEACHING_WEEKS = 15

// Holidays (No classes on these days)
export const HOLIDAYS = [
    { date: '2026-01-26', name: 'Republic Day', type: 'national' },
    // Add more holidays as per university calendar
    // { date: '2026-03-xx', name: 'Holi', type: 'festival' },
]

// Important academic events (classes may be affected)
export const ACADEMIC_EVENTS = [
    { date: '2026-01-03', name: 'Convocation & Alumni Meet', week: 0 },
    { date: '2026-01-27', name: 'Re-exam of ODD Semester', week: 3 },
    { date: '2026-02-09', name: 'Bonhomie Sports & Cultural Event', week: 5 },
    { date: '2026-03-05', name: 'Mid Semester Exam (MSE) & UT-I', week: 7, important: true },
    { date: '2026-03-07', name: 'Parents Meet', week: 7 },
    { date: '2026-04-04', name: 'Parents Meet / Open House', week: 11 },
    { date: '2026-04-22', name: 'UT-II for TE and BE', week: 14, important: true },
]

// Defaulter list dates (CRITICAL for attendance tracking!)
export const DEFAULTER_DATES = [
    {
        date: '2026-02-02',
        name: '1st Defaulter List',
        week: 4,
        description: 'First warning for students below 75%',
        severity: 'warning'
    },
    {
        date: '2026-03-02',
        name: '2nd Defaulter List',
        week: 7,
        description: 'Second warning - parents may be notified',
        severity: 'serious'
    },
    {
        date: '2026-04-04',
        name: '3rd Defaulter List',
        week: 11,
        description: 'Third warning - risk of detention',
        severity: 'critical'
    },
    {
        date: '2026-04-21',
        name: 'Final Defaulter List',
        week: 14,
        description: 'Final list - may be detained from exams',
        severity: 'final'
    },
]

/**
 * Check if a date is a holiday
 * @param {Date|string} date 
 * @returns {Object|null} Holiday info or null
 */
export function getHolidayInfo(date) {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0]
    return HOLIDAYS.find(h => h.date === dateStr) || null
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param {Date|string} date 
 * @returns {boolean}
 */
export function isWeekend(date) {
    const d = typeof date === 'string' ? new Date(date) : date
    const day = d.getDay()
    return day === 0 || day === 6 // Sunday = 0, Saturday = 6
}

/**
 * Check if classes are held on a given date
 * @param {Date|string} date 
 * @returns {boolean}
 */
export function isClassDay(date) {
    if (isWeekend(date)) return false
    if (getHolidayInfo(date)) return false
    return true
}

/**
 * Get the current week number of the semester
 * @param {Date} [date=new Date()] 
 * @returns {number} Week number (1-15), 0 if before start, >15 if after end
 */
export function getCurrentWeek(date = new Date()) {
    const start = new Date(SEMESTER_DATES.commencement)
    const diffMs = date - start
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const week = Math.floor(diffDays / 7) + 1
    return Math.max(0, week)
}

/**
 * Get weeks remaining in semester
 * @param {Date} [date=new Date()] 
 * @returns {number}
 */
export function getWeeksRemaining(date = new Date()) {
    const week = getCurrentWeek(date)
    return Math.max(0, TOTAL_TEACHING_WEEKS - week + 1)
}

/**
 * Get next defaulter date from current date
 * @param {Date} [date=new Date()] 
 * @returns {Object|null}
 */
export function getNextDefaulterDate(date = new Date()) {
    const dateStr = date.toISOString().split('T')[0]
    return DEFAULTER_DATES.find(d => d.date > dateStr) || null
}

/**
 * Get days until next defaulter list
 * @param {Date} [date=new Date()] 
 * @returns {number|null}
 */
export function getDaysUntilNextDefaulter(date = new Date()) {
    const next = getNextDefaulterDate(date)
    if (!next) return null

    const nextDate = new Date(next.date)
    const diffMs = nextDate - date
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Get semester progress percentage
 * @param {Date} [date=new Date()] 
 * @returns {number} 0-100
 */
export function getSemesterProgress(date = new Date()) {
    const week = getCurrentWeek(date)
    return Math.min(100, Math.round((week / TOTAL_TEACHING_WEEKS) * 100))
}

export default {
    SEMESTER_DATES,
    TOTAL_TEACHING_WEEKS,
    HOLIDAYS,
    ACADEMIC_EVENTS,
    DEFAULTER_DATES,
    getHolidayInfo,
    isWeekend,
    isClassDay,
    getCurrentWeek,
    getWeeksRemaining,
    getNextDefaulterDate,
    getDaysUntilNextDefaulter,
    getSemesterProgress,
}
