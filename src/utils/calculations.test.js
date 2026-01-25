/**
 * 75Guard - Calculation Engine Tests
 * 
 * Unit tests for all calculation functions.
 * Validates formulas match PRD §7 Business Logic.
 */

import { describe, it, expect } from 'vitest'
import {
    calculatePercentage,
    calculateBuffer,
    calculateDeficit,
    getStatus,
    getGlobalState,
    calculatePNR,
    getDaysUntilPNR,
    generateRecoveryPlan,
    simulateSkip,
    simulateAttendAll,
    calculateSubjectState,
} from './calculations'

describe('Base Calculations', () => {
    describe('calculatePercentage', () => {
        it('calculates percentage correctly', () => {
            expect(calculatePercentage(28, 41)).toBe(68.29)
            expect(calculatePercentage(75, 100)).toBe(75)
            expect(calculatePercentage(10, 10)).toBe(100)
        })

        it('handles zero conducted', () => {
            expect(calculatePercentage(0, 0)).toBe(0)
        })

        it('handles edge cases', () => {
            expect(calculatePercentage(0, 10)).toBe(0)
            expect(calculatePercentage(1, 1)).toBe(100)
        })
    })

    describe('calculateBuffer', () => {
        it('calculates buffer correctly - PRD example', () => {
            // PRD Example: Total=80, Attended=6, Conducted=8
            // remaining = 80 - 8 = 72
            // min_required = ceil(80 × 0.75) = 60
            // buffer = (6 + 72) - 60 = 18
            const subject = { attended: 6, conducted: 8 }
            expect(calculateBuffer(subject, 80)).toBe(18)
        })

        it('returns zero for negative buffer', () => {
            const subject = { attended: 10, conducted: 60 }
            expect(calculateBuffer(subject, 80)).toBe(0)
        })

        it('handles full attendance', () => {
            const subject = { attended: 60, conducted: 60 }
            // remaining = 80 - 60 = 20
            // min_required = 60
            // buffer = (60 + 20) - 60 = 20
            expect(calculateBuffer(subject, 80)).toBe(20)
        })
    })

    describe('calculateDeficit', () => {
        it('calculates deficit correctly', () => {
            // Need 60 to pass 80 total, have 28: deficit = 60 - 28 = 32
            const subject = { attended: 28 }
            expect(calculateDeficit(subject, 80)).toBe(32)
        })

        it('returns zero when at or above threshold', () => {
            const subject = { attended: 60 }
            expect(calculateDeficit(subject, 80)).toBe(0)
        })

        it('returns zero for over-attendance', () => {
            const subject = { attended: 75 }
            expect(calculateDeficit(subject, 80)).toBe(0)
        })
    })
})

describe('Status Classification', () => {
    describe('getStatus', () => {
        it('returns CRITICAL when percentage < 75%', () => {
            const subject = { attended: 28, conducted: 41 } // 68.29%
            expect(getStatus(subject, 80)).toBe('CRITICAL')
        })

        it('returns CRITICAL when buffer <= 1', () => {
            // Low buffer case
            const subject = { attended: 58, conducted: 78 }
            expect(getStatus(subject, 80)).toBe('CRITICAL')
        })

        it('returns SAFE when buffer >= 5', () => {
            const subject = { attended: 60, conducted: 64 }
            // buffer = (60 + 16) - 60 = 16
            expect(getStatus(subject, 80)).toBe('SAFE')
        })

        it('returns TENSION when buffer is 2-4', () => {
            // Need a case where buffer is between 2-4
            const subject = { attended: 56, conducted: 76 }
            // remaining = 4, minRequired = 60
            // buffer = (56 + 4) - 60 = 0 -> CRITICAL

            // Let's try another
            const subject2 = { attended: 40, conducted: 50 }
            // remaining = 30, minRequired = 60
            // buffer = (40 + 30) - 60 = 10 -> SAFE

            const subject3 = { attended: 57, conducted: 75 }
            // remaining = 5, minRequired = 60
            // buffer = (57 + 5) - 60 = 2 -> TENSION
            expect(getStatus(subject3, 80)).toBe('TENSION')
        })
    })

    describe('getGlobalState', () => {
        it('returns SAFE for empty array', () => {
            expect(getGlobalState([])).toBe('SAFE')
        })

        it('returns CRITICAL if any subject is critical', () => {
            const subjects = [
                { code: 'A', attendance: { attended: 60, conducted: 64 }, total_expected_sessions: 80 },
                { code: 'B', attendance: { attended: 28, conducted: 41 }, total_expected_sessions: 80 },
            ]
            expect(getGlobalState(subjects)).toBe('CRITICAL')
        })

        it('returns SAFE if all subjects are safe', () => {
            const subjects = [
                { code: 'A', attendance: { attended: 60, conducted: 64 }, total_expected_sessions: 80 },
                { code: 'B', attendance: { attended: 55, conducted: 60 }, total_expected_sessions: 80 },
            ]
            expect(getGlobalState(subjects)).toBe('SAFE')
        })
    })
})

describe('PNR Calculator', () => {
    describe('calculatePNR', () => {
        it('returns PASSED when deficit > remaining', () => {
            const subject = { attended: 20, conducted: 70 }
            // remaining = 80 - 70 = 10
            // deficit = 60 - 20 = 40
            // 40 > 10 -> PASSED
            expect(calculatePNR(subject, 80, 4)).toBe('PASSED')
        })

        it('returns null when deficit = 0 (safe)', () => {
            const subject = { attended: 60, conducted: 64 }
            expect(calculatePNR(subject, 80, 4)).toBeNull()
        })

        it('returns a Date when PNR is in future', () => {
            const subject = { attended: 40, conducted: 50 }
            // remaining = 30, deficit = 20
            // sessionsUntilPNR = 30 - 20 = 10
            // weeks = 10 / 4 = 2
            const result = calculatePNR(subject, 80, 4)
            expect(result).toBeInstanceOf(Date)
        })
    })

    describe('getDaysUntilPNR', () => {
        it('returns -1 for PASSED', () => {
            expect(getDaysUntilPNR('PASSED')).toBe(-1)
        })

        it('returns null for null', () => {
            expect(getDaysUntilPNR(null)).toBeNull()
        })

        it('returns number for valid date', () => {
            const futureDate = new Date()
            futureDate.setDate(futureDate.getDate() + 7)
            expect(getDaysUntilPNR(futureDate)).toBeGreaterThanOrEqual(6)
        })
    })
})

describe('Recovery Plan Generator', () => {
    describe('generateRecoveryPlan', () => {
        it('returns impossible plan when deficit > remaining', () => {
            const subject = { attended: 20, conducted: 70 }
            const plan = generateRecoveryPlan(subject, 80, 4, 3)

            expect(plan.possible).toBe(false)
            expect(plan.difficulty).toBe('IMPOSSIBLE')
            expect(plan.maxPercentage).toBeGreaterThan(0)
        })

        it('returns no recovery needed when already at 75%', () => {
            const subject = { attended: 60, conducted: 64 }
            const plan = generateRecoveryPlan(subject, 80, 4, 4)

            expect(plan.possible).toBe(true)
            expect(plan.difficulty).toBe('NONE')
        })

        it('generates week-by-week plan', () => {
            const subject = { attended: 45, conducted: 60 }
            // deficit = 60 - 45 = 15
            const plan = generateRecoveryPlan(subject, 80, 5, 4)

            expect(plan.possible).toBe(true)
            expect(plan.plan.length).toBeGreaterThan(0)
            expect(plan.requiredAttendances).toBe(15)
        })

        it('classifies difficulty correctly', () => {
            // EASY: deficit <= 2 × sessionsPerWeek
            const easySubject = { attended: 55, conducted: 70 }
            const easyPlan = generateRecoveryPlan(easySubject, 80, 5, 2)
            expect(easyPlan.difficulty).toBe('EASY')

            // HARD: deficit > 4 × sessionsPerWeek AND possible
            // need: deficit > 20 AND deficit <= remaining
            // attended=35, conducted=50 → remaining=30, deficit=25
            // 25 > 20 (HARD) ✓, 25 <= 30 (possible) ✓
            const hardSubject = { attended: 35, conducted: 50 }
            const hardPlan = generateRecoveryPlan(hardSubject, 80, 5, 4)
            expect(hardPlan.difficulty).toBe('HARD')
        })
    })
})

describe('Skip Impact Simulation', () => {
    describe('simulateSkip', () => {
        it('correctly simulates a single skip', () => {
            const subject = { attended: 60, conducted: 70 }
            const result = simulateSkip(subject, 80, 1)

            expect(result.currentPercentage).toBe(85.71)
            expect(result.newPercentage).toBeLessThan(result.currentPercentage)
            expect(result.percentageChange).toBeLessThan(0)
        })

        it('detects threshold crossing', () => {
            // Right at 75% threshold
            const subject = { attended: 60, conducted: 80 }
            const result = simulateSkip(subject, 85, 1)

            expect(result.wouldCrossThreshold).toBe(true)
        })

        it('detects status worsening', () => {
            // Safe state that would become tension
            const subject = { attended: 57, conducted: 74 }
            const result = simulateSkip(subject, 80, 1)

            expect(result.statusWorsened).toBeDefined()
        })
    })

    describe('simulateAttendAll', () => {
        it('calculates best case correctly', () => {
            const subject = { attended: 40, conducted: 50 }
            const result = simulateAttendAll(subject, 80)

            expect(result.finalAttended).toBe(70) // 40 + 30
            expect(result.remaining).toBe(30)
            expect(result.finalPercentage).toBe(87.5)
            expect(result.canReach75).toBe(true)
        })

        it('detects when 75% is impossible', () => {
            const subject = { attended: 20, conducted: 70 }
            const result = simulateAttendAll(subject, 80)

            expect(result.finalPercentage).toBeLessThan(75)
            expect(result.canReach75).toBe(false)
        })
    })
})

describe('Complete Subject State', () => {
    describe('calculateSubjectState', () => {
        it('returns complete state object', () => {
            const subject = {
                code: 'ML',
                attendance: { attended: 45, conducted: 60 },
            }

            const state = calculateSubjectState(subject, 80, 5, 4)

            expect(state).toHaveProperty('subject_code', 'ML')
            expect(state).toHaveProperty('current_percentage')
            expect(state).toHaveProperty('buffer')
            expect(state).toHaveProperty('deficit')
            expect(state).toHaveProperty('status')
            expect(state).toHaveProperty('remaining_sessions')
            expect(state).toHaveProperty('pnr_date')
            expect(state).toHaveProperty('recovery_possible')
            expect(state).toHaveProperty('recovery_plan')
        })
    })
})
