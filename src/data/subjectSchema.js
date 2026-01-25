/**
 * Subject Schema Definition
 * 
 * Defines the structure for subject and attendance data.
 * Used for validation and type reference throughout the app.
 */

/**
 * Subject base data (static, from timetable)
 * @typedef {Object} SubjectBase
 * @property {string} code - Subject code (e.g., "ML")
 * @property {string} name - Full subject name (e.g., "Machine Learning")
 * @property {string} faculty - Faculty code/name
 * @property {'theory'|'lab'} type - Subject type
 * @property {number} lectures_per_week - Number of lecture sessions per week
 * @property {number} labs_per_week - Number of lab sessions per week
 * @property {number} lab_weight - Weight multiplier for labs (typically 2)
 * @property {number} total_sessions_per_week - Computed: lectures + (labs × lab_weight)
 */

/**
 * Attendance data (dynamic, user-entered)
 * @typedef {Object} AttendanceData
 * @property {number} conducted - Total sessions conducted so far
 * @property {number} attended - Sessions attended by student
 * @property {string} last_updated - ISO timestamp of last update
 * @property {'HIGH'|'MEDIUM'|'LOW'|'UNRELIABLE'} confidence - Data freshness
 * @property {'manual'|'pdf_upload'|'batch_update'} source - How data was entered
 */

/**
 * Complete subject with attendance
 * @typedef {Object} Subject
 * @property {string} code
 * @property {string} name
 * @property {string} faculty
 * @property {'theory'|'lab'} type
 * @property {number} lectures_per_week
 * @property {number} labs_per_week
 * @property {number} lab_weight
 * @property {number} total_sessions_per_week
 * @property {number} total_expected_sessions - For entire semester
 * @property {AttendanceData} attendance
 */

/**
 * Calculated state for a subject (derived, not stored)
 * @typedef {Object} CalculatedState
 * @property {string} subject_code
 * @property {number} current_percentage - (attended / conducted) × 100
 * @property {number} buffer - Classes that can be missed while staying ≥75%
 * @property {number} deficit - Additional classes needed to reach 75%
 * @property {'SAFE'|'TENSION'|'CRITICAL'} status
 * @property {number} remaining_sessions - Sessions left in semester
 * @property {Date|null|'PASSED'} pnr_date - Point of No Return date
 * @property {boolean} recovery_possible - Can 75% still be achieved?
 * @property {RecoveryPlan} recovery_plan
 */

/**
 * Recovery plan structure
 * @typedef {Object} RecoveryPlan
 * @property {boolean} possible
 * @property {WeekPlan[]} plan - Week-by-week breakdown
 * @property {number} finalPercentage - Projected final %
 * @property {'EASY'|'MEDIUM'|'HARD'|'IMPOSSIBLE'} difficulty
 * @property {number} [maxAchievable] - If recovery impossible
 * @property {string} [message] - Explanation
 */

/**
 * Week plan entry
 * @typedef {Object} WeekPlan
 * @property {number} week - Week number
 * @property {number} attend - Sessions to attend
 * @property {number} skip - Sessions that can be skipped
 */

/**
 * Default subject list for TE DS based on timetable
 */
export const DEFAULT_SUBJECTS = [
    {
        code: 'ML',
        name: 'Machine Learning',
        faculty: 'SR',
        type: 'theory',
        lectures_per_week: 3,
        labs_per_week: 1,
        lab_weight: 2,
        total_sessions_per_week: 5,
        total_expected_sessions: 75, // 5 × 15 weeks
    },
    {
        code: 'CSS',
        name: 'Cryptography & System Security',
        faculty: 'SA',
        type: 'theory',
        lectures_per_week: 3,
        labs_per_week: 0,
        lab_weight: 2,
        total_sessions_per_week: 3,
        total_expected_sessions: 45, // 3 × 15 weeks
    },
    {
        code: 'DAV',
        name: 'Data Analytics & Visualization',
        faculty: 'AM',
        type: 'theory',
        lectures_per_week: 3,
        labs_per_week: 1,
        lab_weight: 2,
        total_sessions_per_week: 5,
        total_expected_sessions: 75, // 5 × 15 weeks
    },
    {
        code: 'DC',
        name: 'Distributed Computing',
        faculty: 'YA',
        type: 'theory',
        lectures_per_week: 3,
        labs_per_week: 0,
        lab_weight: 2,
        total_sessions_per_week: 3,
        total_expected_sessions: 45, // 3 × 15 weeks
    },
    {
        code: 'SEPM',
        name: 'Software Engineering & Project Management',
        faculty: 'ZK',
        type: 'theory',
        lectures_per_week: 3,
        labs_per_week: 1,
        lab_weight: 2,
        total_sessions_per_week: 5,
        total_expected_sessions: 75, // 5 × 15 weeks
    },
    {
        code: 'CCL',
        name: 'Cloud Computing Lab',
        faculty: 'AM',
        type: 'lab',
        lectures_per_week: 0,
        labs_per_week: 2,
        lab_weight: 2,
        total_sessions_per_week: 4,
        total_expected_sessions: 60, // 4 × 15 weeks
    },
    {
        code: 'DAV L',
        name: 'DAV Lab',
        faculty: 'AM',
        type: 'lab',
        lectures_per_week: 0,
        labs_per_week: 2,
        lab_weight: 2,
        total_sessions_per_week: 4,
        total_expected_sessions: 60, // 4 × 15 weeks
    },
    {
        code: 'CSS L',
        name: 'CSS Lab',
        faculty: 'SA',
        type: 'lab',
        lectures_per_week: 0,
        labs_per_week: 2,
        lab_weight: 2,
        total_sessions_per_week: 4,
        total_expected_sessions: 60, // 4 × 15 weeks
    },
    {
        code: 'ML L',
        name: 'ML Lab',
        faculty: 'SR',
        type: 'lab',
        lectures_per_week: 0,
        labs_per_week: 2,
        lab_weight: 2,
        total_sessions_per_week: 4,
        total_expected_sessions: 60, // 4 × 15 weeks
    },
    {
        code: 'SEPM L',
        name: 'SEPM Lab',
        faculty: 'ZK',
        type: 'lab',
        lectures_per_week: 0,
        labs_per_week: 2,
        lab_weight: 2,
        total_sessions_per_week: 4,
        total_expected_sessions: 60, // 4 × 15 weeks
    },
]

/**
 * Create empty attendance record
 * @returns {AttendanceData}
 */
export function createEmptyAttendance() {
    return {
        conducted: 0,
        attended: 0,
        last_updated: new Date().toISOString(),
        confidence: 'HIGH',
        source: 'manual',
    }
}

/**
 * Create subject with empty attendance
 * @param {SubjectBase} baseData
 * @returns {Subject}
 */
export function createSubjectWithAttendance(baseData) {
    return {
        ...baseData,
        attendance: createEmptyAttendance(),
    }
}

/**
 * Initialize all subjects with empty attendance
 * @returns {Subject[]}
 */
export function initializeSubjects() {
    return DEFAULT_SUBJECTS.map(createSubjectWithAttendance)
}
