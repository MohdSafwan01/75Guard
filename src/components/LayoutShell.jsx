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
        <div className="flex flex-col h-screen bg-[#F5E6C8] text-[#1C1C1C] overflow-hidden font-sans selection:bg-[#FFB5C5] selection:text-[#1C1C1C]">
            {/* Panel 1: Global Command Header (top, fixed height) */}
            <div className="flex-none z-30 relative">
                <GlobalCommandHeader user={user} onLogout={onLogout} />
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Panel 2: Subject Stack (Desktop Sidebar) */}
                <aside className="hidden md:block w-80 flex-none overflow-y-auto border-r-2 border-[#1C1C1C] bg-[#FAF3E3] p-4 pb-24 custom-scrollbar">
                    <SubjectStack />
                </aside>

                {/* Main Content Area */}
                <main
                    className="flex-1 overflow-y-auto overflow-x-hidden relative w-full scroll-smooth custom-scrollbar"
                    role="main"
                    id="main-content"
                >
                    {/* Mobile Subject Stack (Horizontal Scroll) */}
                    <div className="md:hidden sticky top-0 z-20 bg-[#F5E6C8] pt-2 px-2 border-b-2 border-[#1C1C1C] shadow-sm">
                        <SubjectStack mobile={true} />
                    </div>

                    <div className="p-4 pb-32 max-w-5xl mx-auto min-h-full">
                        {activeSubjectId ? (
                            <DecisionWorkspace />
                        ) : (
                            <div className="pt-4">
                                <DashboardWidgets />
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Panel 4: Action Matrix (Floating Bottom Bar) */}
            <div className="fixed bottom-0 left-0 right-0 z-40 p-4 md:p-6 pointer-events-none">
                <div className="pointer-events-auto max-w-6xl mx-auto">
                    <ActionMatrix />
                </div>
            </div>
        </div>
    )
}

export default LayoutShell
