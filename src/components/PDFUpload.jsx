/**
 * 75Guard - PDF Upload Component
 * 
 * Drag-and-drop PDF upload with parsing preview and confirmation.
 * Follows Design Document state-driven UI patterns.
 */

import { useState, useCallback, useRef } from 'react';
import { parsePDF, convertToStoreFormat } from '../utils/pdfParser';
import { useAttendanceStore } from '../store/attendanceStore';

/**
 * PDFUpload - Handles PDF file upload and parsing
 * @param {Object} props
 * @param {Function} props.onComplete - Called after successful import
 * @param {Function} props.onCancel - Called when user cancels
 */
export function PDFUpload({ onComplete, onCancel }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [parseResult, setParseResult] = useState(null);
    const [editedSubjects, setEditedSubjects] = useState([]);
    const fileInputRef = useRef(null);

    const importSubjects = useAttendanceStore(state => state.importSubjects);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            await processFile(files[0]);
        }
    }, []);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const processFile = async (file) => {
        setIsProcessing(true);
        setParseResult(null);

        try {
            const result = await parsePDF(file);
            setParseResult(result);

            if (result.success) {
                // Initialize editable subjects from parsed data
                setEditedSubjects(result.subjects.map(s => ({
                    ...s,
                    selected: true,
                    needsCorrection: s.attended === 0 || s.conducted === 0
                })));
            }
        } catch (error) {
            setParseResult({
                success: false,
                error: error.message,
                subjects: [],
                warnings: []
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubjectToggle = (index) => {
        setEditedSubjects(prev => prev.map((s, i) =>
            i === index ? { ...s, selected: !s.selected } : s
        ));
    };

    const handleSubjectEdit = (index, field, value) => {
        setEditedSubjects(prev => prev.map((s, i) => {
            if (i !== index) return s;

            const updated = { ...s, [field]: value };

            // Recalculate percentage when attended/conducted change
            if (field === 'attended' || field === 'conducted') {
                const attended = field === 'attended' ? parseInt(value) || 0 : s.attended;
                const conducted = field === 'conducted' ? parseInt(value) || 0 : s.conducted;
                if (conducted > 0) {
                    updated.percentage = ((attended / conducted) * 100).toFixed(2);
                }
                updated.needsCorrection = attended === 0 || conducted === 0;
            }

            return updated;
        }));
    };

    const handleConfirm = () => {
        const selectedSubjects = editedSubjects
            .filter(s => s.selected && !s.needsCorrection)
            .map(s => ({
                code: s.subjectCode,
                name: s.subjectName || s.subjectCode,
                attendance: {
                    attended: parseInt(s.attended),
                    conducted: parseInt(s.conducted)
                }
            }));

        if (selectedSubjects.length > 0) {
            importSubjects(selectedSubjects);
            onComplete?.(selectedSubjects.length);
        }
    };

    const hasValidSelection = editedSubjects.some(s => s.selected && !s.needsCorrection);

    return (
        <div className="pdf-upload p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Import Attendance from PDF</h2>

            {/* Drop Zone */}
            {!parseResult && (
                <div
                    className={`
                        drop-zone border-2 border-dashed rounded-xl p-12 text-center
                        transition-all duration-200 cursor-pointer
                        ${isDragging
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }
                        ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-600 dark:text-gray-400">Processing PDF...</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-4xl mb-4">📄</div>
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Drop your attendance PDF here
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                or click to browse
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* Parse Result */}
            {parseResult && (
                <div className="parse-result mt-4">
                    {parseResult.success ? (
                        <>
                            {/* Warnings */}
                            {parseResult.warnings.length > 0 && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                                    <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">⚠️ Warnings:</p>
                                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                                        {parseResult.warnings.map((w, i) => (
                                            <li key={i}>{w}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Metadata */}
                            {Object.keys(parseResult.metadata).length > 0 && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    {parseResult.metadata.semester && (
                                        <span className="mr-4">Semester: {parseResult.metadata.semester}</span>
                                    )}
                                    {parseResult.metadata.reportDate && (
                                        <span>Report Date: {parseResult.metadata.reportDate}</span>
                                    )}
                                </div>
                            )}

                            {/* Subject List */}
                            <div className="space-y-2 mb-4">
                                <p className="font-medium text-gray-700 dark:text-gray-300">
                                    Found {editedSubjects.length} subject(s):
                                </p>

                                {editedSubjects.map((subject, index) => (
                                    <div
                                        key={index}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-lg border
                                            ${subject.selected
                                                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                                : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-60'
                                            }
                                            ${subject.needsCorrection ? 'border-red-300 dark:border-red-700' : ''}
                                        `}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={subject.selected}
                                            onChange={() => handleSubjectToggle(index)}
                                            className="w-4 h-4"
                                        />

                                        <input
                                            type="text"
                                            value={subject.subjectCode}
                                            onChange={(e) => handleSubjectEdit(index, 'subjectCode', e.target.value)}
                                            className="w-20 px-2 py-1 text-sm font-mono border rounded dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="Code"
                                        />

                                        <div className="flex items-center gap-1 flex-1">
                                            <input
                                                type="number"
                                                value={subject.attended}
                                                onChange={(e) => handleSubjectEdit(index, 'attended', e.target.value)}
                                                className={`
                                                    w-16 px-2 py-1 text-sm text-center border rounded
                                                    dark:bg-gray-700 dark:border-gray-600
                                                    ${subject.attended === 0 ? 'border-red-300 bg-red-50' : ''}
                                                `}
                                                min="0"
                                                placeholder="Att"
                                            />
                                            <span className="text-gray-400">/</span>
                                            <input
                                                type="number"
                                                value={subject.conducted}
                                                onChange={(e) => handleSubjectEdit(index, 'conducted', e.target.value)}
                                                className={`
                                                    w-16 px-2 py-1 text-sm text-center border rounded
                                                    dark:bg-gray-700 dark:border-gray-600
                                                    ${subject.conducted === 0 ? 'border-red-300 bg-red-50' : ''}
                                                `}
                                                min="0"
                                                placeholder="Con"
                                            />
                                        </div>

                                        <span className={`
                                            text-sm font-mono px-2 py-1 rounded
                                            ${parseFloat(subject.percentage) >= 75
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }
                                        `}>
                                            {subject.percentage}%
                                        </span>

                                        {subject.needsCorrection && (
                                            <span className="text-xs text-red-500">⚠️ Fix values</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleConfirm}
                                    disabled={!hasValidSelection}
                                    className={`
                                        flex-1 py-3 px-4 rounded-lg font-medium transition-all
                                        ${hasValidSelection
                                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    Import {editedSubjects.filter(s => s.selected && !s.needsCorrection).length} Subject(s)
                                </button>

                                <button
                                    onClick={() => {
                                        setParseResult(null);
                                        setEditedSubjects([]);
                                    }}
                                    className="py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                >
                                    Try Another
                                </button>

                                <button
                                    onClick={onCancel}
                                    className="py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Error State */
                        <div className="text-center">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                                <p className="text-red-700 dark:text-red-300">
                                    ❌ {parseResult.error}
                                </p>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setParseResult(null)}
                                    className="py-2 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all"
                                >
                                    Try Another File
                                </button>
                                <button
                                    onClick={onCancel}
                                    className="py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                >
                                    Use Manual Entry
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Help Text */}
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
                <p>Supported: College attendance reports in PDF format</p>
                <p className="mt-1">
                    The parser will attempt to extract subject codes, attended, and conducted values.
                </p>
            </div>
        </div>
    );
}

export default PDFUpload;
