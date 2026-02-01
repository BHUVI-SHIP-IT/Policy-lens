/**
 * React hook for PDF upload and text extraction
 */

import { useMutation } from "@tanstack/react-query";

export interface PDFUploadResult {
  text: string;
  numPages: number;
  fileName: string;
  info?: {
    Title?: string;
    Author?: string;
    Subject?: string;
  };
}

/**
 * Hook to upload PDF and extract text
 * Example usage:
 * ```tsx
 * const { mutate: uploadPDF, isPending } = usePDFUpload();
 * 
 * const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *   const file = e.target.files?.[0];
 *   if (file) {
 *     uploadPDF(file, {
 *       onSuccess: (result) => {
 *         console.log("Extracted text:", result.text);
 *       }
 *     });
 *   }
 * };
 * ```
 */
export function usePDFUpload() {
  return useMutation({
    mutationFn: async (file: File): Promise<PDFUploadResult> => {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch("/api/upload/pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload PDF");
      }

      return response.json();
    },
  });
}
