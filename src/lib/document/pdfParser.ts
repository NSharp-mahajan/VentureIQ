if (typeof global !== 'undefined') {
  if (!global.DOMMatrix) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).DOMMatrix = class DOMMatrix {};
  }
  if (!global.Path2D) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Path2D = class Path2D {};
  }
  if (!global.ImageData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).ImageData = class ImageData {};
  }
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export async function extractPdfText(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  try {
    const data = await pdfParse(buffer);
    let text = data.text;
    const pageCount = data.numpages || 1;
    
    // Clean up whitespace
    text = text.replace(/\s+/g, " ").trim();
    
    // Limit to 15,000 characters to prevent token overflow (~3000-4000 tokens)
    if (text.length > 15000) {
      text = text.substring(0, 15000) + "... [CONTENT TRUNCATED]";
    }
    
    return { text, pageCount };
  } catch (error) {
    console.error("PDF Parsing failed:", error);
    throw new Error("Failed to parse PDF document");
  }
}
