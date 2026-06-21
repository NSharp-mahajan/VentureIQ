import * as cheerio from "cheerio";

export interface ScrapedData {
  title: string;
  description: string;
  content: string;
}

export async function scrapeWebsite(url: string): Promise<ScrapedData | null> {
  try {
    // Add simple protocol validation
    let validUrl = url;
    if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
      validUrl = "https://" + validUrl;
    }

    const response = await fetch(validUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VentureIQ/1.0; +http://localhost:3000)",
      },
      // Timeout is not natively supported in fetch without AbortController, 
      // but in Next.js 14+ fetch defaults are usually reasonable. 
      // Add standard signal for 10s timeout to avoid hanging the scraper
      signal: AbortSignal.timeout(10000), 
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract basic meta
    const title = $("title").text().trim() || "";
    const description = $("meta[name='description']").attr("content")?.trim() || 
                       $("meta[property='og:description']").attr("content")?.trim() || "";

    // Remove unwanted tags to get clean text
    $("script, style, noscript, iframe, img, svg, video, audio").remove();

    // Extract body text and clean up whitespace
    let content = $("body").text();
    content = content.replace(/\s+/g, " ").trim();

    // Limit content length to avoid excessive tokens for LLM (~4000 chars roughly 1k tokens)
    if (content.length > 8000) {
      content = content.substring(0, 8000) + "... [CONTENT TRUNCATED]";
    }

    return {
      title,
      description,
      content,
    };
  } catch (error) {
    console.error("Website scraping failed:", error);
    return null; // Graceful fallback
  }
}
