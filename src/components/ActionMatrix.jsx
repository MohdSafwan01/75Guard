/**
 * ActionMatrix - Bottom Bar (Neo-Brutalist Style)
 * 
 * Colorful buttons with bold borders
 */

import { useState } from 'react'
import { useAttendanceStore } from '../store/attendanceStore'
import ManualEntryWizard from './ManualEntryWizard'
import QuickBatchUpdate from './QuickBatchUpdate'

function ActionMatrix() {
    const globalState = useAttendanceStore((state) => state.globalState)
    const subjects = useAttendanceStore((state) => state.subjects)
    const needsDataUpdate = useAttendanceStore((state) => state.needsDataUpdate)

    const [showManualEntry, setShowManualEntry] = useState(false)
    const [showQuickUpdate, setShowQuickUpdate] = useState(false)

    const hasData = subjects.length > 0 && subjects.some(s => s.attendance?.conducted > 0)

    const buttonStyle = {
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        border: '2px solid #1C1C1C',
        boxShadow: '2px 2px 0px #1C1C1C',
        transition: 'all 0.15s ease',
    }

    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
    }

    const modalContentStyle = {
        backgroundColor: '#FFFFFF',
        border: '2px solid #1C1C1C',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '6px 6px 0px #1C1C1C',
    }

    return (
        <>
            <footer
                role="toolbar"
                aria-label="Action Matrix"
                data-testid="action-matrix"
                data-state={globalState.toLowerCase()}
                className="w-full"
            >
                <div className="flex items-center justify-between w-full">
                    {/* Left: Status/Message (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center gap-3">
                        {globalState === 'SAFE' && !needsDataUpdate() && hasData && (
                            <div data-testid="no-action-message" className="flex items-center gap-2 font-bold text-[#1C1C1C]">
                                <span className="text-lg">✅</span>
                                All subjects safe
                            </div>
                        )}

                        {globalState === 'TENSION' && (
                            <section data-testid="warning-section" className="bg-[#FFF4E5] border-2 border-[#FFB347] px-4 py-2 rounded-lg">
                                <div className="font-bold text-[#1C1C1C]">
                                    ⚡ Attention needed
                                </div>
                            </section>
                        )}

                        {globalState === 'CRITICAL' && (
                            <section data-testid="warning-section" className="bg-[#FFE8E8] border-2 border-[#FF6B6B] px-4 py-2 rounded-lg">
                                <div className="font-bold text-[#FF6B6B]">
                                    🚨 Critical: Action Required
                                </div>
                            </section>
                        )}

                        {needsDataUpdate() && (
                            <section data-testid="confirmation-section" className="bg-[#FFF4E5] border-2 border-[#FFB347] px-4 py-2 rounded-lg">
                                <div className="font-semibold text-[#1C1C1C]">
                                    ⏰ Data may be stale
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right: Action Buttons (Full Width on Mobile) */}
                    <section className="flex gap-3 w-full md:w-auto justify-end">
                        {!hasData ? (
                            <button
                                type="button"
                                data-testid="add-data-button"
                                onClick={() => setShowManualEntry(true)}
                                className="flex-1 md:flex-none px-5 py-3 rounded-lg text-sm font-bold cursor-pointer border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1C1C1C] bg-[#7ED957] text-[#1C1C1C]"
                            >
                                ➕ Add Attendance Data
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    data-testid="quick-update-button"
                                    onClick={() => setShowQuickUpdate(true)}
                                    className="flex-1 md:flex-none px-5 py-3 rounded-lg text-sm font-bold cursor-pointer border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1C1C1C] bg-[#FFB5C5] text-[#1C1C1C]"
                                >
                                    ⚡ Quick
                                </button>

                                <button
                                    type="button"
                                    data-testid="full-update-button"
                                    onClick={() => setShowManualEntry(true)}
                                    className="flex-1 md:flex-none px-5 py-3 rounded-lg text-sm font-bold cursor-pointer border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1C1C1C] bg-[#87CEEB] text-[#1C1C1C]"
                                >
                                    📝 Update
                                </button>
                            </>
                        )}
                    </section>
                </div>
            </footer>

            {/* Manual Entry Modal */}
            {showManualEntry && (
                <div style={modalOverlayStyle} onClick={() => setShowManualEntry(false)}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                            paddingBottom: '16px',
                            borderBottom: '2px solid #1C1C1C',
                        }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1C' }}>
                                📝 Update Attendance
                            </h2>
                            <button
                                onClick={() => setShowManualEntry(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#1C1C1C',
                                    padding: '4px 8px',
                                    boxShadow: 'none',
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <ManualEntryWizard
                            onComplete={() => setShowManualEntry(false)}
                            onCancel={() => setShowManualEntry(false)}
                        />
                    </div>
                </div>
            )}

            {/* Quick Update Modal */}
            {showQuickUpdate && (
                <div style={modalOverlayStyle} onClick={() => setShowQuickUpdate(false)}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                            paddingBottom: '16px',
                            borderBottom: '2px solid #1C1C1C',
                        }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1C' }}>
                                ⚡ Quick Batch Update
                            </h2>
                            <button
                                onClick={() => setShowQuickUpdate(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#1C1C1C',
                                    padding: '4px 8px',
                                    boxShadow: 'none',
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <QuickBatchUpdate
                            onComplete={() => setShowQuickUpdate(false)}
                            onCancel={() => setShowQuickUpdate(false)}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default ActionMatrix
