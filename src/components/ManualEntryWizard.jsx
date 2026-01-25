/**
 * ManualEntryWizard - Guided Attendance Entry (Neo-Brutalist Style)
 */

import { useState } from 'react'
import PropTypes from 'prop-types'
import { useAttendanceStore } from '../store/attendanceStore'
import { getWeeksElapsed, getCurrentWeek } from '../utils/dateHelpers'

function ManualEntryWizard({ onComplete, onCancel }) {
    const subjects = useAttendanceStore((state) => state.subjects)
    const batchUpdateAttendance = useAttendanceStore((state) => state.batchUpdateAttendance)

    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState(
        subjects.map(s => ({
            code: s.code,
            name: s.name,
            attended: s.attendance?.attended || 0,
            conducted: s.attendance?.conducted || 0,
            expectedConducted: Math.floor((s.total_sessions_per_week || 4) * getWeeksElapsed()),
        }))
    )
    const [errors, setErrors] = useState({})

    const currentSubject = formData[currentStep]
    const isLastStep = currentStep === formData.length - 1
    const currentWeek = getCurrentWeek()

    const validateSubject = (data) => {
        const newErrors = {}
        if (data.attended > data.conducted) {
            newErrors.attended = 'Attended cannot exceed conducted'
        }
        if (data.attended < 0) newErrors.attended = 'Cannot be negative'
        if (data.conducted < 0) newErrors.conducted = 'Cannot be negative'
        const maxExpected = data.expectedConducted * 1.5
        if (data.conducted > maxExpected && maxExpected > 0) {
            newErrors.conducted = `Seems high for week ${currentWeek}. Expected ~${data.expectedConducted}`
        }
        return newErrors
    }

    const handleChange = (field, value) => {
        const numValue = parseInt(value, 10) || 0
        const updatedData = [...formData]
        updatedData[currentStep] = { ...updatedData[currentStep], [field]: numValue }
        setFormData(updatedData)
        setErrors({})
    }

    const handleNext = () => {
        const validationErrors = validateSubject(currentSubject)
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }
        if (isLastStep) {
            handleSubmit()
        } else {
            setCurrentStep(currentStep + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
            setErrors({})
        }
    }

    const handleSubmit = () => {
        const updates = formData.map(d => ({
            code: d.code,
            attended: d.attended,
            conducted: d.conducted,
            source: 'manual',
        }))
        batchUpdateAttendance(updates)
        if (onComplete) onComplete()
    }

    if (!currentSubject) {
        return (
            <div style={{ padding: '24px', textAlign: 'center', color: '#7A7A7A' }}>
                No subjects to configure.
            </div>
        )
    }

    const currentPercentage = currentSubject.conducted > 0
        ? ((currentSubject.attended / currentSubject.conducted) * 100).toFixed(1)
        : null

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        borderRadius: '8px',
        border: '2px solid #1C1C1C',
        backgroundColor: '#FFFFFF',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '18px',
        boxShadow: '2px 2px 0px #1C1C1C',
    }

    const inputErrorStyle = {
        ...inputStyle,
        borderColor: '#FF6B6B',
        backgroundColor: '#FFE8E8',
    }

    const buttonStyle = {
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '700',
        border: '2px solid #1C1C1C',
        cursor: 'pointer',
        boxShadow: '2px 2px 0px #1C1C1C',
        transition: 'all 0.15s ease',
    }

    return (
        <div>
            {/* Progress bar */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1C1C1C' }}>
                        Step {currentStep + 1} of {formData.length}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#7A7A7A' }}>
                        {Math.round(((currentStep + 1) / formData.length) * 100)}%
                    </span>
                </div>
                <div style={{
                    height: '12px',
                    backgroundColor: '#FAF3E3',
                    border: '2px solid #1C1C1C',
                    borderRadius: '6px',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${((currentStep + 1) / formData.length) * 100}%`,
                        backgroundColor: '#7ED957',
                        transition: 'width 0.3s ease',
                    }} />
                </div>
            </div>

            {/* Subject info */}
            <div style={{
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: '#FFB5C5',
                borderRadius: '12px',
                border: '2px solid #1C1C1C',
            }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px', color: '#1C1C1C' }}>
                    {currentSubject.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#4A4A4A' }}>
                    📋 {currentSubject.code} • Expected ~{currentSubject.expectedConducted} sessions by week {currentWeek}
                </p>
            </div>

            {/* Input fields */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '700',
                        marginBottom: '8px',
                        color: '#1C1C1C',
                    }}>
                        📊 Sessions Conducted (Total held so far)
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={currentSubject.conducted}
                        onChange={(e) => handleChange('conducted', e.target.value)}
                        style={errors.conducted ? inputErrorStyle : inputStyle}
                    />
                    {errors.conducted && (
                        <p style={{ fontSize: '12px', color: '#FF6B6B', marginTop: '6px', fontWeight: '600' }}>
                            ⚠️ {errors.conducted}
                        </p>
                    )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '700',
                        marginBottom: '8px',
                        color: '#1C1C1C',
                    }}>
                        ✓ Sessions Attended (Your attendance)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max={currentSubject.conducted}
                        value={currentSubject.attended}
                        onChange={(e) => handleChange('attended', e.target.value)}
                        style={errors.attended ? inputErrorStyle : inputStyle}
                    />
                    {errors.attended && (
                        <p style={{ fontSize: '12px', color: '#FF6B6B', marginTop: '6px', fontWeight: '600' }}>
                            ⚠️ {errors.attended}
                        </p>
                    )}
                </div>

                {currentPercentage !== null && (
                    <div style={{
                        padding: '14px 18px',
                        borderRadius: '10px',
                        backgroundColor: parseFloat(currentPercentage) >= 75 ? '#E8F5E0' : '#FFE8E8',
                        border: `2px solid ${parseFloat(currentPercentage) >= 75 ? '#7ED957' : '#FF6B6B'}`,
                    }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1C1C1C' }}>
                            Current:{' '}
                        </span>
                        <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: '800',
                            fontSize: '18px',
                            color: parseFloat(currentPercentage) >= 75 ? '#1C1C1C' : '#FF6B6B',
                        }}>
                            {currentPercentage}%
                        </span>
                        <span style={{ marginLeft: '8px', fontSize: '14px' }}>
                            {parseFloat(currentPercentage) >= 75 ? '✓' : '⚠️'}
                        </span>
                    </div>
                )}
            </div>

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                    {currentStep > 0 && (
                        <button onClick={handleBack} style={{ ...buttonStyle, backgroundColor: '#FFFFFF' }}>
                            ← Back
                        </button>
                    )}
                    {onCancel && currentStep === 0 && (
                        <button onClick={onCancel} style={{ ...buttonStyle, backgroundColor: '#FFFFFF' }}>
                            Cancel
                        </button>
                    )}
                </div>

                <button onClick={handleNext} style={{ ...buttonStyle, backgroundColor: '#7ED957' }}>
                    {isLastStep ? '✓ Save All' : 'Next →'}
                </button>
            </div>
        </div>
    )
}

ManualEntryWizard.propTypes = {
    onComplete: PropTypes.func,
    onCancel: PropTypes.func,
}

export default ManualEntryWizard
