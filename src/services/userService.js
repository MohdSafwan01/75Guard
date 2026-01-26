/**
 * User Service - Firebase Firestore operations for user data
 */

import { db } from '../config/firebase'
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp
} from 'firebase/firestore'
import { DEFAULT_DIVISION } from '../config/divisions'

/**
 * Create or update user profile in Firestore
 */
export async function saveUserProfile(user, attendanceData = null) {
    if (!user?.uid) return null

    const userRef = doc(db, 'users', user.uid)
    const existingDoc = await getDoc(userRef)

    const userData = {
        email: user.email,
        name: user.name || user.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL || null,
        division: existingDoc.exists() ? existingDoc.data().division : DEFAULT_DIVISION,
        lastUpdated: serverTimestamp(),
    }

    // Add attendance data if provided
    if (attendanceData) {
        userData.attendance = attendanceData
        userData.overallPercentage = calculateOverallPercentage(attendanceData)
    }

    if (existingDoc.exists()) {
        await updateDoc(userRef, userData)
    } else {
        userData.createdAt = serverTimestamp()
        userData.streak = 0
        userData.badges = []
        await setDoc(userRef, userData)
    }

    return userData
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid) {
    if (!uid) return null

    const userRef = doc(db, 'users', uid)
    const userDoc = await getDoc(userRef)

    return userDoc.exists() ? { uid, ...userDoc.data() } : null
}

/**
 * Update user's attendance data
 */
export async function updateUserAttendance(uid, attendanceData) {
    if (!uid || !attendanceData) return

    const userRef = doc(db, 'users', uid)
    const overallPercentage = calculateOverallPercentage(attendanceData)

    await updateDoc(userRef, {
        attendance: attendanceData,
        overallPercentage,
        lastUpdated: serverTimestamp(),
    })

    return overallPercentage
}

/**
 * Get leaderboard for a division
 */
export async function getLeaderboard(division = DEFAULT_DIVISION, maxResults = 20) {
    const usersRef = collection(db, 'users')
    const q = query(
        usersRef,
        where('division', '==', division),
        where('overallPercentage', '>', 0),
        orderBy('overallPercentage', 'desc'),
        limit(maxResults)
    )

    const snapshot = await getDocs(q)
    const leaderboard = []

    snapshot.forEach((doc, index) => {
        const data = doc.data()
        leaderboard.push({
            uid: doc.id,
            rank: leaderboard.length + 1,
            name: data.name || 'Anonymous', // Show FULL Name
            percentage: data.overallPercentage || 0,
            streak: data.streak || 0,
            photoURL: data.photoURL,
        })
    })

    return leaderboard
}

/**
 * Get user's rank in their division
 */
export async function getUserRank(uid, division = DEFAULT_DIVISION) {
    const leaderboard = await getLeaderboard(division, 100)
    const userIndex = leaderboard.findIndex(u => u.uid === uid)

    return {
        rank: userIndex >= 0 ? userIndex + 1 : null,
        total: leaderboard.length,
    }
}

/**
 * Calculate overall attendance percentage
 */
function calculateOverallPercentage(attendanceData) {
    if (!attendanceData || typeof attendanceData !== 'object') return 0

    let totalAttended = 0
    let totalConducted = 0

    Object.values(attendanceData).forEach(subject => {
        if (subject?.attended !== undefined && subject?.conducted !== undefined) {
            totalAttended += subject.attended
            totalConducted += subject.conducted
        }
    })

    return totalConducted > 0
        ? Math.round((totalAttended / totalConducted) * 1000) / 10
        : 0
}

/**
 * Mask name for privacy (e.g., "Safwan Ahmed" -> "S****n A.")
 */
function maskName(name) {
    if (!name) return 'Anonymous'

    const parts = name.trim().split(' ')
    if (parts.length === 1) {
        const first = parts[0]
        if (first.length <= 2) return first
        return first[0] + '***' + first[first.length - 1]
    }

    const firstName = parts[0]
    const lastName = parts[parts.length - 1]

    const maskedFirst = firstName.length <= 2
        ? firstName
        : firstName[0] + '****' + firstName[firstName.length - 1]

    return `${maskedFirst} ${lastName[0]}.`
}

export default {
    saveUserProfile,
    getUserProfile,
    updateUserAttendance,
    getLeaderboard,
    getUserRank,
}
