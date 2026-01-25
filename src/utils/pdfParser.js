/**
 * 75Guard - PDF Parser Utility
 * 
 * Parses attendance data from college attendance PDF reports.
 * Uses PDF.js for text extraction.
 * 
 * Expected PDF formats:
 * 1. Column-based table with Subject, Attended, Conducted
 * 2. Row-based list with percentage values
 */

import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * @typedef {Object} ParsedAttendance
 * @property {string} subjectCode - Subject code extracted
 * @property {string} subjectName - Subject name if found
 * @property {number} attended - Number of attended sessions
 * @property {number} conducted - Number of conducted sessions
 * @property {number} percentage - Calculated or extracted percentage
 */

/**
 * @typedef {Object} ParseResult
 * @property {boolean} success - Whether parsing succeeded
 * @property {ParsedAttendance[]} subjects - Extracted subject data
 * @property {string[]} warnings - Non-fatal issues during parsing
 * @property {string|null} error - Error message if failed
 * @property {Object} metadata - Additional info like semester, date
 */

/**
 * Extract text content from a PDF file
 * @param {File} file - PDF file to parse
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
            .map(item => item.str)
            .join(' ');

        fullText += pageText + '\n';
    }

    return fullText;
}

/**
 * Parse attendance data from extracted PDF text
 * @param {string} text - Extracted text from PDF
 * @returns {ParseResult} - Parsed attendance data
 */
export function parseAttendanceText(text) {
    const result = {
        success: false,
        subjects: [],
        warnings: [],
        error: null,
        metadata: {}
    };

    try {
        // Normalize text
        const normalizedText = text.replace(/\s+/g, ' ').trim();

        // Try different parsing strategies
        let subjects = [];

        // Strategy 1: Table format - "Subject Code | Subject Name | Attended | Conducted | %"
        subjects = parseTableFormat(normalizedText);

        if (subjects.length === 0) {
            // Strategy 2: Pattern matching for common attendance report formats
            subjects = parsePatternFormat(normalizedText);
        }

        if (subjects.length === 0) {
            // Strategy 3: Look for percentage patterns with subject codes
            subjects = parsePercentageFormat(normalizedText);
        }

        if (subjects.length === 0) {
            result.error = 'Could not extract attendance data. Please check the PDF format or use manual entry.';
            return result;
        }

        // Validate extracted data
        const validSubjects = subjects.filter(s => {
            if (s.attended < 0 || s.conducted < 0) {
                result.warnings.push(`Invalid values for ${s.subjectCode}: attended=${s.attended}, conducted=${s.conducted}`);
                return false;
            }
            if (s.attended > s.conducted) {
                result.warnings.push(`${s.subjectCode}: attended (${s.attended}) > conducted (${s.conducted}), swapping values`);
                [s.attended, s.conducted] = [s.conducted, s.attended];
            }
            return true;
        });

        result.subjects = validSubjects;
        result.success = validSubjects.length > 0;

        // Try to extract metadata
        result.metadata = extractMetadata(normalizedText);

    } catch (error) {
        result.error = `Parsing failed: ${error.message}`;
    }

    return result;
}

/**
 * Parse table format attendance data
 * Looking for: SubjectCode SubjectName Attended Conducted Percentage
 */
function parseTableFormat(text) {
    const subjects = [];

    // Common subject code patterns (2-4 uppercase letters followed by optional numbers)
    // Match patterns like: "ML 45 60 75%" or "DSBDA 28 41 68.29%"
    const tableRowPattern = /([A-Z]{2,6}(?:\s*-?\s*[A-Z]*)?)\s+(\d+)\s+(\d+)\s+(\d+(?:\.\d+)?)\s*%?/gi;

    let match;
    while ((match = tableRowPattern.exec(text)) !== null) {
        const [, code, attended, conducted, percentage] = match;

        // Skip if this looks like a date or other number sequence
        if (parseInt(attended) > 500 || parseInt(conducted) > 500) continue;

        subjects.push({
            subjectCode: code.trim().toUpperCase(),
            subjectName: '',
            attended: parseInt(attended),
            conducted: parseInt(conducted),
            percentage: parseFloat(percentage)
        });
    }

    return subjects;
}

/**
 * Parse pattern format - looks for subject codes and nearby numbers
 */
function parsePatternFormat(text) {
    const subjects = [];

    // Known subject patterns from TE DS curriculum
    const knownSubjects = [
        { pattern: /(?:ML|Machine\s*Learning)/i, code: 'ML' },
        { pattern: /(?:DSBDA|DS\s*&?\s*BDA|Data\s*Science)/i, code: 'DSBDA' },
        { pattern: /(?:WT|Web\s*Tech)/i, code: 'WT' },
        { pattern: /(?:CC|Cloud\s*Computing)/i, code: 'CC' },
        { pattern: /(?:CNS|Crypto|Network\s*Security)/i, code: 'CNS' },
        { pattern: /(?:WAD|Web\s*App)/i, code: 'WAD' },
        { pattern: /(?:SEPM|Software\s*Eng)/i, code: 'SEPM' },
        { pattern: /(?:BC|Blockchain)/i, code: 'BC' },
    ];

    for (const { pattern, code } of knownSubjects) {
        const subjectMatch = text.match(pattern);
        if (subjectMatch) {
            // Look for numbers near the subject mention
            const nearbyText = text.slice(
                Math.max(0, subjectMatch.index - 50),
                Math.min(text.length, subjectMatch.index + 100)
            );

            // Look for attended/conducted pattern
            const numbersMatch = nearbyText.match(/(\d+)\s*[\/,]\s*(\d+)/);
            if (numbersMatch) {
                const num1 = parseInt(numbersMatch[1]);
                const num2 = parseInt(numbersMatch[2]);

                // Assume smaller number is attended, larger is conducted
                subjects.push({
                    subjectCode: code,
                    subjectName: '',
                    attended: Math.min(num1, num2),
                    conducted: Math.max(num1, num2),
                    percentage: (Math.min(num1, num2) / Math.max(num1, num2) * 100).toFixed(2)
                });
            }
        }
    }

    return subjects;
}

/**
 * Parse percentage format - looks for percentages and works backwards
 */
function parsePercentageFormat(text) {
    const subjects = [];

    // Look for patterns like "75.50%" or "75.50 %" with context
    const percentPattern = /([A-Z]{2,6})[^\d]*(\d+(?:\.\d+)?)\s*%/gi;

    let match;
    while ((match = percentPattern.exec(text)) !== null) {
        const [, code, percentage] = match;
        const pct = parseFloat(percentage);

        // Estimate attended/conducted from percentage (rough approximation)
        // This is a fallback when we only have percentage
        if (pct > 0 && pct <= 100) {
            subjects.push({
                subjectCode: code.trim().toUpperCase(),
                subjectName: '',
                attended: 0, // Will need manual correction
                conducted: 0, // Will need manual correction
                percentage: pct
            });
        }
    }

    return subjects;
}

/**
 * Extract metadata like semester, date, student info
 */
function extractMetadata(text) {
    const metadata = {};

    // Try to find semester info
    const semesterMatch = text.match(/(?:Sem(?:ester)?|Term)\s*[:-]?\s*(\d+|[IVX]+)/i);
    if (semesterMatch) {
        metadata.semester = semesterMatch[1];
    }

    // Try to find date
    const dateMatch = text.match(/(?:Date|As\s*on|Report\s*Date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    if (dateMatch) {
        metadata.reportDate = dateMatch[1];
    }

    // Try to find student info
    const rollMatch = text.match(/(?:Roll\s*No|PRN|Student\s*ID)[:\s]*([A-Z0-9]+)/i);
    if (rollMatch) {
        metadata.rollNumber = rollMatch[1];
    }

    return metadata;
}

/**
 * Main function to parse a PDF file
 * @param {File} file - PDF file to parse
 * @returns {Promise<ParseResult>} - Parsed attendance data
 */
export async function parsePDF(file) {
    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        return {
            success: false,
            subjects: [],
            warnings: [],
            error: 'Please upload a PDF file',
            metadata: {}
        };
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        return {
            success: false,
            subjects: [],
            warnings: [],
            error: 'File too large. Maximum size is 10MB.',
            metadata: {}
        };
    }

    try {
        const text = await extractTextFromPDF(file);
        return parseAttendanceText(text);
    } catch (error) {
        return {
            success: false,
            subjects: [],
            warnings: [],
            error: `Failed to read PDF: ${error.message}`,
            metadata: {}
        };
    }
}

/**
 * Convert parsed data to store format
 * @param {ParsedAttendance[]} subjects - Parsed subjects
 * @returns {Object} - Data ready for store import
 */
export function convertToStoreFormat(subjects) {
    return subjects.map(s => ({
        code: s.subjectCode,
        name: s.subjectName || s.subjectCode,
        attendance: {
            attended: s.attended,
            conducted: s.conducted
        }
    }));
}
