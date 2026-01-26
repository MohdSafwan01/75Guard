/**
 * Subject Schema for TE DS (Data Science)
 * 
 * Based on actual timetable w.e.f 19/01/2026
 * 
 * TIMETABLE STRUCTURE:
 * - Labs are divided into Batch 1, 2, 3 (each student attends only their batch)
 * - Each lab slot = 2 hours (counts as 1 lab session)
 * 
 * WEEKLY SCHEDULE (per student):
 * - ML: 3 lectures + 1 lab = 4 sessions
 * - SEPM: 3 lectures + 1 lab = 4 sessions  
 * - CSS: 3 lectures + 1 lab = 4 sessions
 * - DAV: 3 lectures + 1 lab = 4 sessions
 * - DC: 3 lectures only = 3 sessions
 * - CCL: 2 labs only = 2 sessions
 * 
 * SEMESTER: 15 weeks
 */

/**
 * @typedef {Object} Subject
 * @property {string} code - Short code (e.g., 'ML')
 * @property {string} name - Full name
 * @property {string} faculty - Faculty initials
 * @property {'theory'|'lab'|'combined'} type - Subject type
 * @property {number} lectures_per_week - Number of lecture sessions per week
 * @property {number} labs_per_week - Number of lab sessions per week (per student)
 * @property {number} total_sessions_per_week - Total sessions per week
 * @property {number} total_expected_sessions - Total sessions in semester (15 weeks)
 */

/**
 * @typedef {Object} AttendanceData
 * @property {number} attended - Classes attended
 * @property {number} conducted - Classes conducted so far
 */

// Semester configuration (from CSE DS Academic Calendar Even Term 2025-26)
export const SEMESTER_CONFIG = {
    totalWeeks: 15,           // Teaching weeks (Jan 12 - Apr 24)
    startDate: '2026-01-12',  // Commencement of all semesters
    timetableStart: '2026-01-19', // Timetable w.e.f
    termEndDate: '2026-04-24',    // Term End
    eseStartDate: '2026-05-18',   // End Semester Exam starts
    targetPercentage: 75,

    // Key dates for defaulter lists
    defaulterDates: {
        first: '2026-02-02',   // 1st Defaulter List (Week 4)
        second: '2026-03-02',  // 2nd Defaulter List (Week 7)
        third: '2026-04-04',   // 3rd Defaulter List (Week 11)
        final: '2026-04-21',   // Final Defaulter List (Week 14)
    },

    // Holidays
    holidays: [
        { date: '2026-01-26', name: 'Republic Day' },
    ],
}

/**
 * Default subjects for TE DS
 * Combined theory + lab for subjects that have both
 */
export const DEFAULT_SUBJECTS = [
    // THEORY SUBJECTS
    {
        code: 'ML',
        name: 'Machine Learning',
        faculty: 'SR',
        type: 'theory',
        lectures_per_week: 3,
        labs_per_week: 0,
        total_sessions_per_week: 3,
        total_expected_sessions: 45, // 3 × 15 weeks
    },
    {
        code: 'SEPM',
        name: 'Software Engineering & Project Management',
        faculty: 'ZK',
        type: 'theory',
        lectures_per_week: 3,
        labs_per_week: 0,
        total_sessions_per_week: 3,
        total_expected_sessions: 45, // 3 × 15 weeks
    },
    {
        code: 'CSS',
        name: 'Cryptography & System Security',
        faculty: 'SA',
        type: 'theory',
        lectures_per_week: 3,
        labs_per_week: 0,
        total_sessions_per_week: 3,
        total_expected_sessions: 45, // 3 × 15 weeks
    },
    {
        code: 'DAV',
        name: 'Data Analytics & Visualization',
        faculty: 'AM',
        type: 'theory',
        lectures_per_week: 3,
        labs_per_week: 0,
        total_sessions_per_week: 3,
        total_expected_sessions: 45, // 3 × 15 weeks
    },
    {
        code: 'DC',
        name: 'Distributed Computing',
        faculty: 'YA',
        type: 'theory',
        lectures_per_week: 3,
        labs_per_week: 0,
        total_sessions_per_week: 3,
        total_expected_sessions: 45, // 3 × 15 weeks
    },

    // LAB SUBJECTS
    {
        code: 'CCL',
        name: 'Cloud Computing Lab',
        faculty: 'AM',
        type: 'lab',
        lectures_per_week: 0,
        labs_per_week: 2,
        total_sessions_per_week: 2,
        total_expected_sessions: 30, // 2 × 15 weeks
    },
    {
        code: 'ML Lab',
        name: 'Machine Learning Lab',
        faculty: 'SR',
        type: 'lab',
        lectures_per_week: 0,
        labs_per_week: 1,
        total_sessions_per_week: 1,
        total_expected_sessions: 15, // 1 × 15 weeks
    },
    {
        code: 'SEPM Lab',
        name: 'Software Engineering Lab',
        faculty: 'ZK',
        type: 'lab',
        lectures_per_week: 0,
        labs_per_week: 1,
        total_sessions_per_week: 1,
        total_expected_sessions: 15, // 1 × 15 weeks
    },
    {
        code: 'CSS Lab',
        name: 'Cryptography Lab',
        faculty: 'SA',
        type: 'lab',
        lectures_per_week: 0,
        labs_per_week: 1,
        total_sessions_per_week: 1,
        total_expected_sessions: 15, // 1 × 15 weeks
    },
    {
        code: 'DAV Lab',
        name: 'Data Analytics Lab',
        faculty: 'AM',
        type: 'lab',
        lectures_per_week: 0,
        labs_per_week: 1,
        total_sessions_per_week: 1,
        total_expected_sessions: 15, // 1 × 15 weeks
    },
]

/**
 * Total sessions per week across all subjects (per student)
 */
export const TOTAL_SESSIONS_PER_WEEK = DEFAULT_SUBJECTS.reduce(
    (sum, s) => sum + s.total_sessions_per_week, 0
) // = 21 sessions/week

/**
 * Total sessions in semester across all subjects
 */
export const TOTAL_SESSIONS_IN_SEMESTER = DEFAULT_SUBJECTS.reduce(
    (sum, s) => sum + s.total_expected_sessions, 0
) // = 315 sessions total

/**
 * Create empty attendance record
 * @returns {AttendanceData}
 */
export function createEmptyAttendance() {
    return {
        attended: 0,
        conducted: 0,
    }
}

/**
 * Initialize subject with empty attendance
 * @param {Subject} subject 
 * @returns {Subject & { attendance: AttendanceData, id: string }}
 */
export function initializeSubject(subject) {
    return {
        ...subject,
        id: subject.code,
        attendance: createEmptyAttendance(),
    }
}

/**
 * Get all subjects initialized with attendance data
 * @returns {Array}
 */
export function getInitializedSubjects() {
    return DEFAULT_SUBJECTS.map(initializeSubject)
}

/**
 * Calculate sessions remaining in semester for a subject
 * @param {Subject} subject 
 * @param {number} weeksRemaining 
 * @returns {number}
 */
export function calculateRemainingSessionsForSubject(subject, weeksRemaining) {
    return subject.total_sessions_per_week * weeksRemaining
}

/**
 * Calculate how many sessions happened so far (estimated by weeks elapsed)
 * @param {number} weeksElapsed 
 * @returns {Object} - Sessions per subject
 */
export function calculateExpectedSessionsSoFar(weeksElapsed) {
    return DEFAULT_SUBJECTS.reduce((acc, subject) => {
        acc[subject.code] = subject.total_sessions_per_week * weeksElapsed
        return acc
    }, {})
}
