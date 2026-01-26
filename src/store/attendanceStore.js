/**
 * 75Guard - Attendance Store
 * 
 * Central state management using Zustand with persistence.
 * 
 * State Structure:
 * - subjects: Array of subjects with attendance data
 * - semester: Semester configuration
 * - globalState: SAFE | TENSION | CRITICAL (worst case)
 * - lastUpdated: Last data update timestamp
 * - expandedSubjectId: Currently expanded subject (focus isolation)
 * - isSimulating: Simulation in progress flag
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import semesterData from '../data/semester.json'
import { DEFAULT_SUBJECTS, initializeSubject } from '../data/subjectSchema'
import { calculateSubjectState } from '../utils/calculations'
import { getGlobalStateFromSubjects } from '../engine/attendanceDecisionEngine'
import { getWeeksRemaining, getDataConfidence } from '../utils/dateHelpers'

/**
 * Create the attendance store
 */
export const useAttendanceStore = create(
    persist(
        (set, get) => ({
            // ==========================================
            // STATE
            // ==========================================

            // Subjects with attendance data
            subjects: [],

            // Semester configuration
            semester: semesterData,

            // Global UI state derived from worst-case subject
            globalState: 'SAFE',

            // Last update timestamp
            lastUpdated: null,

            // Currently expanded subject ID (for focus isolation in UI)
            expandedSubjectId: null,

            // Simulation in progress
            isSimulating: false,

            // Loading state
            isLoading: false,

            // User's batch (for lab filtering)
            userBatch: 1,

            // ==========================================
            // INITIALIZATION
            // ==========================================

            /**
             * Initialize with default subjects
             */
            initializeSubjects: () => {
                const subjects = DEFAULT_SUBJECTS.map(s => ({
                    ...s,
                    attendance: {
                        conducted: 0,
                        attended: 0,
                        last_updated: new Date().toISOString(),
                        confidence: 'HIGH',
                        source: 'manual',
                    }
                }))

                set({
                    subjects,
                    lastUpdated: new Date().toISOString(),
                    globalState: 'SAFE',
                })
            },

            // ==========================================
            // SUBJECT ACTIONS
            // ==========================================

            /**
             * Add a new subject
             */
            addSubject: (subject) => set((state) => {
                const newSubjects = [...state.subjects, {
                    ...subject,
                    attendance: subject.attendance || {
                        conducted: 0,
                        attended: 0,
                        last_updated: new Date().toISOString(),
                        confidence: 'HIGH',
                        source: 'manual',
                    }
                }]

                return {
                    subjects: newSubjects,
                    lastUpdated: new Date().toISOString(),
                    globalState: get().recalculateGlobalState(newSubjects),
                }
            }),

            /**
             * Remove a subject
             */
            removeSubject: (subjectCode) => set((state) => {
                const newSubjects = state.subjects.filter(s => s.code !== subjectCode)
                return {
                    subjects: newSubjects,
                    globalState: get().recalculateGlobalState(newSubjects),
                }
            }),

            /**
             * Update attendance for a subject
             */
            updateAttendance: (subjectCode, attended, conducted) => set((state) => {
                const newSubjects = state.subjects.map((sub) =>
                    sub.code === subjectCode
                        ? {
                            ...sub,
                            attendance: {
                                ...sub.attendance,
                                attended,
                                conducted,
                                last_updated: new Date().toISOString(),
                                confidence: 'HIGH',
                            }
                        }
                        : sub
                )

                return {
                    subjects: newSubjects,
                    lastUpdated: new Date().toISOString(),
                    globalState: get().recalculateGlobalState(newSubjects),
                }
            }),

            /**
             * Batch update attendance for multiple subjects
             */
            batchUpdateAttendance: (updates) => set((state) => {
                // updates: [{ code, attended, conducted }, ...]
                const updateMap = new Map(updates.map(u => [u.code, u]))

                const newSubjects = state.subjects.map((sub) => {
                    const update = updateMap.get(sub.code)
                    if (!update) return sub

                    return {
                        ...sub,
                        attendance: {
                            ...sub.attendance,
                            attended: update.attended,
                            conducted: update.conducted,
                            last_updated: new Date().toISOString(),
                            confidence: 'HIGH',
                            source: update.source || 'batch_update',
                        }
                    }
                })

                return {
                    subjects: newSubjects,
                    lastUpdated: new Date().toISOString(),
                    globalState: get().recalculateGlobalState(newSubjects),
                }
            }),

            /**
             * Import subjects from PDF or manual entry
             * Merges with existing subjects or adds new ones
             */
            importSubjects: (importedSubjects) => set((state) => {
                const existingMap = new Map(state.subjects.map(s => [s.code, s]))

                for (const imported of importedSubjects) {
                    const existing = existingMap.get(imported.code)

                    if (existing) {
                        // Update existing subject
                        existingMap.set(imported.code, {
                            ...existing,
                            attendance: {
                                ...existing.attendance,
                                attended: imported.attendance.attended,
                                conducted: imported.attendance.conducted,
                                last_updated: new Date().toISOString(),
                                confidence: 'HIGH',
                                source: 'import',
                            }
                        })
                    } else {
                        // Add new subject
                        existingMap.set(imported.code, {
                            code: imported.code,
                            name: imported.name || imported.code,
                            type: 'theory',
                            total_expected_sessions: 75,
                            total_sessions_per_week: 4,
                            attendance: {
                                attended: imported.attendance.attended,
                                conducted: imported.attendance.conducted,
                                last_updated: new Date().toISOString(),
                                confidence: 'HIGH',
                                source: 'import',
                            }
                        })
                    }
                }

                const newSubjects = Array.from(existingMap.values())

                return {
                    subjects: newSubjects,
                    lastUpdated: new Date().toISOString(),
                    globalState: get().recalculateGlobalState(newSubjects),
                }
            }),

            // ==========================================
            // SEMESTER ACTIONS
            // ==========================================

            /**
             * Set semester configuration
             */
            setSemester: (semester) => set({ semester }),

            /**
             * Set user batch (for lab filtering)
             */
            setUserBatch: (batch) => set({ userBatch: batch }),

            // ==========================================
            // UI STATE ACTIONS
            // ==========================================

            /**
             * Set expanded subject (focus isolation)
             */
            setExpandedSubject: (id) => set({ expandedSubjectId: id }),

            /**
             * Toggle expanded subject
             */
            toggleExpandedSubject: (id) => set((state) => ({
                expandedSubjectId: state.expandedSubjectId === id ? null : id
            })),

            /**
             * Set simulation state
             */
            setSimulating: (isSimulating) => set({ isSimulating }),

            /**
             * Set global state manually (for testing)
             */
            setGlobalState: (globalState) => set({ globalState }),

            // ==========================================
            // GLOBAL STATE CALCULATION
            // ==========================================

            /**
             * Recalculate global state from subjects
             * Uses the Attendance Decision Engine for all calculations
             */
            recalculateGlobalState: (subjects) => {
                if (!subjects || subjects.length === 0) return 'SAFE'

                // Use the decision engine to calculate global state
                return getGlobalStateFromSubjects(subjects)
            },

            /**
             * Refresh global state
             */
            refreshGlobalState: () => set((state) => ({
                globalState: get().recalculateGlobalState(state.subjects)
            })),

            // ==========================================
            // DATA MANAGEMENT
            // ==========================================

            /**
             * Reset all data
             */
            resetAllData: () => set({
                subjects: [],
                semester: semesterData,
                globalState: 'SAFE',
                lastUpdated: null,
                expandedSubjectId: null,
                isSimulating: false,
                userBatch: 1,
            }),

            /**
             * Import data from JSON
             */
            importData: (data) => {
                if (!data || !data.subjects) return false

                set({
                    subjects: data.subjects,
                    semester: data.semester || semesterData,
                    lastUpdated: new Date().toISOString(),
                    globalState: get().recalculateGlobalState(data.subjects),
                })

                return true
            },

            /**
             * Export data as JSON
             */
            exportData: () => {
                const state = get()
                return {
                    subjects: state.subjects,
                    semester: state.semester,
                    lastUpdated: state.lastUpdated,
                    exportedAt: new Date().toISOString(),
                    version: 1,
                }
            },

            // ==========================================
            // COMPUTED SELECTORS
            // ==========================================

            /**
             * Get subject by code
             */
            getSubject: (code) => {
                return get().subjects.find(s => s.code === code)
            },

            /**
             * Get calculated state for a subject
             */
            getSubjectState: (code) => {
                const subject = get().getSubject(code)
                if (!subject) return null

                const weeksRemaining = getWeeksRemaining()
                return calculateSubjectState(
                    subject,
                    subject.total_expected_sessions,
                    subject.total_sessions_per_week,
                    weeksRemaining
                )
            },

            /**
             * Get all subjects in CRITICAL state
             */
            getCriticalSubjects: () => {
                const state = get()
                return state.subjects.filter(subject => {
                    const calcState = state.getSubjectState(subject.code)
                    return calcState && calcState.status === 'CRITICAL'
                })
            },

            /**
             * Get subjects with upcoming PNR (within 14 days)
             */
            getUpcomingPNRs: () => {
                const state = get()
                return state.subjects
                    .map(subject => ({
                        subject,
                        state: state.getSubjectState(subject.code)
                    }))
                    .filter(({ state: s }) =>
                        s && s.days_until_pnr !== null && s.days_until_pnr >= 0 && s.days_until_pnr <= 14
                    )
                    .sort((a, b) => a.state.days_until_pnr - b.state.days_until_pnr)
            },

            /**
             * Get data confidence level
             */
            getDataConfidence: () => {
                const { lastUpdated } = get()
                return getDataConfidence(lastUpdated)
            },

            /**
             * Check if data needs update
             */
            needsDataUpdate: () => {
                const confidence = get().getDataConfidence()
                return confidence === 'LOW' || confidence === 'UNRELIABLE'
            },
        }),
        {
            name: '75guard-storage',
            version: 2,
            partialize: (state) => ({
                subjects: state.subjects,
                semester: state.semester,
                lastUpdated: state.lastUpdated,
                userBatch: state.userBatch,
                // Don't persist UI state
            }),
        }
    )
)

export default useAttendanceStore
