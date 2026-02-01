/**
 * PDF Parsing Utility
 * Extracts text from PDF buffers for policy analysis
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export interface PDFExtractionResult {
  text: string;
  numPages: number;
  info?: {
    Title?: string;
    Author?: string;
    Subject?: string;
  };
}

/**
 * Extracts text content from PDF buffer
 */
export async function extractTextFromPDF(
  pdfBuffer: Buffer
): Promise<PDFExtractionResult> {
  try {
    console.log("PDF Buffer size:", pdfBuffer.length, "bytes");
    console.log("PDF Buffer type:", typeof pdfBuffer);
    console.log("Is Buffer?", Buffer.isBuffer(pdfBuffer));
    
    const data = await pdfParse(pdfBuffer);

    console.log("PDF parsed successfully:", data.numpages, "pages");

    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    console.error("PDF parsing error details:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    throw new Error("Failed to parse PDF. Please ensure it's a valid PDF file.");
  }
}

/**
 * Cleans extracted PDF text for better AI analysis
 */
export function cleanPDFText(text: string): string {
  return text
    // Remove multiple spaces
    .replace(/\s+/g, " ")
    // Remove excessive newlines
    .replace(/\n{3,}/g, "\n\n")
    // Trim whitespace
    .trim();
}
