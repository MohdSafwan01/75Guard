/**
 * LayoutShell - Fixed 4-Panel Structure with User Info
 */

import { useState } from 'react'
import GlobalCommandHeader from './GlobalCommandHeader'
import SubjectStack from './SubjectStack'
import DecisionWorkspace from './DecisionWorkspace'
import ActionMatrix from './ActionMatrix'
import DashboardWidgets from './DashboardWidgets'
import { useAttendanceStore } from '../store/attendanceStore'

function LayoutShell({ user, onLogout }) {
    const [showWidgets, setShowWidgets] = useState(true)
    const activeSubjectId = useAttendanceStore((state) => state.expandedSubjectId)

    return (
        <div data-testid="layout-shell">
            {/* Panel 1: Global Command Header (top, full width) */}
            <GlobalCommandHeader user={user} onLogout={onLogout} />

            {/* Panel 2: Subject Stack (left rail) */}
            <SubjectStack />

            {/* Panel 3: Decision Workspace (main panel, center) */}
            {activeSubjectId ? (
                <DecisionWorkspace />
            ) : (
                <main
                    role="main"
                    aria-label="Decision Workspace"
                    style={{ paddingTop: '20px' }}
                >
                    <DashboardWidgets />
                </main>
            )}

            {/* Panel 4: Action Matrix (bottom bar) */}
            <ActionMatrix />
        </div>
    )
}

export default LayoutShell
