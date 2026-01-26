/**
 * Division Configuration
 * 
 * Allowed college domains and divisions
 */

// Allowed email domains for college verification
export const ALLOWED_DOMAINS = [
    'aiktc.ac.in',
    'student.aiktc.ac.in',
]

// Available divisions (will expand later)
export const DIVISIONS = [
    { id: 'TE-DS', name: 'TE Data Science', year: 3 },
    { id: 'TE-CE', name: 'TE Computer Engineering', year: 3 },
    { id: 'TE-AIML', name: 'TE AI & ML', year: 3 },
    { id: 'TE-IT', name: 'TE Information Technology', year: 3 },
]

// Default division for new signups
export const DEFAULT_DIVISION = 'TE-DS'

/**
 * Validate if email is from allowed college domain
 * @param {string} email 
 * @returns {boolean}
 */
export function isCollegeEmail(email) {
    if (!email) return false
    const domain = email.split('@')[1]?.toLowerCase()
    return ALLOWED_DOMAINS.some(d => domain === d || domain?.endsWith('.' + d))
}

/**
 * Get error message for invalid email
 * @param {string} email 
 * @returns {string}
 */
export function getEmailValidationError(email) {
    if (!email) return 'Email is required'
    if (!isCollegeEmail(email)) {
        return 'Please use your college email (@aiktc.ac.in)'
    }
    return ''
}

/**
 * Extract student info from college email
 * e.g., "23ds57@aiktc.ac.in" → { year: 23, branch: "ds", rollNo: 57 }
 */
export function parseCollegeEmail(email) {
    if (!email) return null
    const localPart = email.split('@')[0]
    const match = localPart.match(/^(\d{2})([a-z]+)(\d+)$/i)

    if (match) {
        return {
            year: parseInt(match[1], 10),
            branch: match[2].toLowerCase(),
            rollNo: parseInt(match[3], 10),
        }
    }
    return null
}
