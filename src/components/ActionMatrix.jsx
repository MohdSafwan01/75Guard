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
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                }}>
                    {/* Left: Status/Message */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {globalState === 'SAFE' && !needsDataUpdate() && hasData && (
                            <div data-testid="no-action-message" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: '700',
                                color: '#1C1C1C',
                            }}>
                                <span style={{ fontSize: '18px' }}>✅</span>
                                All subjects safe
                            </div>
                        )}

                        {globalState === 'TENSION' && (
                            <section data-testid="warning-section" style={{
                                backgroundColor: '#FFF4E5',
                                border: '2px solid #FFB347',
                                padding: '8px 16px',
                                borderRadius: '8px',
                            }}>
                                <div style={{ fontWeight: '700', color: '#1C1C1C' }}>
                                    ⚡ Attention needed
                                </div>
                            </section>
                        )}

                        {globalState === 'CRITICAL' && (
                            <section data-testid="warning-section" style={{
                                backgroundColor: '#FFE8E8',
                                border: '2px solid #FF6B6B',
                                padding: '8px 16px',
                                borderRadius: '8px',
                            }}>
                                <div style={{ fontWeight: '700', color: '#FF6B6B' }}>
                                    🚨 Critical: Action Required
                                </div>
                            </section>
                        )}

                        {needsDataUpdate() && (
                            <section data-testid="confirmation-section" style={{
                                backgroundColor: '#FFF4E5',
                                border: '2px solid #FFB347',
                                padding: '8px 16px',
                                borderRadius: '8px',
                            }}>
                                <div style={{ fontWeight: '600', color: '#1C1C1C' }}>
                                    ⏰ Data may be stale
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right: Action Buttons */}
                    <section style={{ display: 'flex', gap: '10px' }}>
                        {!hasData ? (
                            <button
                                type="button"
                                data-testid="add-data-button"
                                onClick={() => setShowManualEntry(true)}
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: '#7ED957',
                                    color: '#1C1C1C',
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translate(-2px, -2px)'
                                    e.target.style.boxShadow = '4px 4px 0px #1C1C1C'
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'none'
                                    e.target.style.boxShadow = '2px 2px 0px #1C1C1C'
                                }}
                            >
                                ➕ Add Attendance Data
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    data-testid="quick-update-button"
                                    onClick={() => setShowQuickUpdate(true)}
                                    style={{
                                        ...buttonStyle,
                                        backgroundColor: '#FFB5C5',
                                        color: '#1C1C1C',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translate(-2px, -2px)'
                                        e.target.style.boxShadow = '4px 4px 0px #1C1C1C'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'none'
                                        e.target.style.boxShadow = '2px 2px 0px #1C1C1C'
                                    }}
                                >
                                    ⚡ Quick Update
                                </button>

                                <button
                                    type="button"
                                    data-testid="full-update-button"
                                    onClick={() => setShowManualEntry(true)}
                                    style={{
                                        ...buttonStyle,
                                        backgroundColor: '#87CEEB',
                                        color: '#1C1C1C',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translate(-2px, -2px)'
                                        e.target.style.boxShadow = '4px 4px 0px #1C1C1C'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'none'
                                        e.target.style.boxShadow = '2px 2px 0px #1C1C1C'
                                    }}
                                >
                                    📝 Full Update
                                </button>

                                {globalState === 'CRITICAL' && (
                                    <button
                                        type="button"
                                        data-testid="view-recovery-button"
                                        style={{
                                            ...buttonStyle,
                                            backgroundColor: '#98D8AA',
                                            color: '#1C1C1C',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translate(-2px, -2px)'
                                            e.target.style.boxShadow = '4px 4px 0px #1C1C1C'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'none'
                                            e.target.style.boxShadow = '2px 2px 0px #1C1C1C'
                                        }}
                                    >
                                        📈 Recovery Plans
                                    </button>
                                )}
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
