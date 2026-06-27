import { IDocumentMetadata } from "@/types/report";
import { extractPdfText } from "./pdfParser";
import { parseOffice } from "officeparser";

export async function extractDocument(
  buffer: Buffer,
  fileName: string,
  fileType: string,
  sizeBytes: number
): Promise<{ text: string; metadata: IDocumentMetadata }> {
  const startTime = Date.now();
  let text = "";
  let pageCount = 1;
  let extractionSuccess = false;
  let extractionConfidence = 0;

  try {
    if (fileType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
      const result = await extractPdfText(buffer);
      text = result.text;
      pageCount = result.pageCount;
      extractionSuccess = true;
      extractionConfidence = 95;
    } else if (
      fileType.includes("wordprocessingml.document") || 
      fileType.includes("presentationml.presentation") ||
      fileName.toLowerCase().endsWith(".docx") ||
      fileName.toLowerCase().endsWith(".pptx")
    ) {
      // Use officeparser
      text = await parseOffice(buffer) as unknown as string;
      if (text) {
        text = text.replace(/\s+/g, " ").trim();
      }
      
      if (text && text.length > 15000) {
        text = text.substring(0, 15000) + "... [CONTENT TRUNCATED]";
      }
      extractionSuccess = true;
      extractionConfidence = 90;
      // approximate page count (about 300 words per page)
      pageCount = Math.max(1, Math.ceil((text?.split(/\s+/).length || 1) / 300));
    } else if (fileType === "text/plain" || fileName.toLowerCase().endsWith(".txt")) {
      text = buffer.toString("utf-8");
      text = text.replace(/\s+/g, " ").trim();
      if (text.length > 15000) {
        text = text.substring(0, 15000) + "... [CONTENT TRUNCATED]";
      }
      extractionSuccess = true;
      extractionConfidence = 100;
      pageCount = Math.max(1, Math.ceil((text?.split(/\s+/).length || 1) / 300));
    } else {
      throw new Error(`Unsupported file format: ${fileType}`);
    }
  } catch (error) {
    console.error(`Failed to parse document ${fileName}:`, error);
    extractionSuccess = false;
    extractionConfidence = 0;
  }

  const wordCount = text ? text.split(/\s+/).length : 0;
  
  if (extractionSuccess && wordCount === 0) {
    extractionConfidence = 10; // maybe it's just images
  }

  const processingDurationMs = Date.now() - startTime;

  return {
    text: text || "",
    metadata: {
      pageCount,
      wordCount,
      processingDurationMs,
      extractionSuccess,
      extractionConfidence,
    }
  };
}
