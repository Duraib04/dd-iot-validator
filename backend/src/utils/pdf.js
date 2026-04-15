import pdfParse from 'pdf-parse';

/**
 * Extract text from PDF buffer
 */
export async function extractPdfText(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text || '';

    if (!text.trim()) {
      throw new Error('PDF appears to be empty or unreadable');
    }

    return text;
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Validate PDF file
 */
export function validatePdfFile(file) {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
  } else if (file.mimetype !== 'application/pdf') {
    errors.push('File must be a PDF');
  } else if (file.size > 5 * 1024 * 1024) { // 5MB max
    errors.push('File size exceeds 5MB limit');
  } else if (file.size < 1024) { // 1KB min
    errors.push('File size too small (less than 1KB)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Clean and normalize text
 */
export function cleanText(rawText) {
  return rawText
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/[\n\r]+/g, ' ') // Newlines to space
    .trim();
}

/**
 * Extract email from resume text
 */
export function extractEmail(resumeText) {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const matches = resumeText.match(emailRegex);
  return matches ? matches[0] : null;
}

/**
 * Extract phone number from resume text
 */
export function extractPhone(resumeText) {
  const phoneRegex = /(\+?1?[-.\s]?)?(\(\d{3}\)|\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})/;
  const match = resumeText.match(phoneRegex);
  return match ? match[0] : null;
}
