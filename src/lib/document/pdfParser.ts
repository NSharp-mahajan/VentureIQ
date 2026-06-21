// @ts-expect-error: pdf-parse types do not specify a default export
import pdfParse from "pdf-parse";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    let text = data.text;
    
    // Clean up whitespace
    text = text.replace(/\s+/g, " ").trim();
    
    // Limit to 15,000 characters to prevent token overflow (~3000-4000 tokens)
    if (text.length > 15000) {
      text = text.substring(0, 15000) + "... [CONTENT TRUNCATED]";
    }
    
    return text;
  } catch (error) {
    console.error("PDF Parsing failed:", error);
    throw new Error("Failed to parse PDF document");
  }
}
