/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import { generateDueDiligenceReport, DueDiligenceInput } from "@/lib/ai/groq";
import { scrapeWebsite } from "@/lib/scraper/websiteScraper";
import { calculateOverallConfidence, generateAiMetadata } from "@/lib/ai/metadata";
import { extractDocument } from "@/lib/document/documentExtractor";
import { analyzeDocument } from "@/lib/document/documentAnalyzer";

async function processReportInBackground(
  reportId: string, 
  input: DueDiligenceInput, 
  websiteUrl?: string,
  filesData?: { name: string; type: string; size: number; buffer: Buffer }[]
) {
  try {
    await connectDB();

    if (websiteUrl) {
      const scrapedData = await scrapeWebsite(websiteUrl);
      if (scrapedData) {
        input.scrapedData = scrapedData;
        await Report.findByIdAndUpdate(reportId, { scrapedData });
      }
    }

    if (filesData && filesData.length > 0) {
      const processedDocuments = [];
      for (const file of filesData) {
        try {
          const { text, metadata } = await extractDocument(file.buffer, file.name, file.type, file.size);
          
          let analysis;
          if (text && text.length > 100) {
            analysis = await analyzeDocument(text, file.name);
          }

          processedDocuments.push({
            fileName: file.name,
            fileType: file.type,
            sizeBytes: file.size,
            uploadTimestamp: new Date(),
            extractedText: text,
            metadata,
            analysis
          });
        } catch (err) {
          console.error(`Failed to parse document ${file.name}:`, err);
        }
      }

      if (processedDocuments.length > 0) {
        input.documentsData = processedDocuments;
        await Report.findByIdAndUpdate(reportId, { documents: processedDocuments });
      }
    }

    const startTime = Date.now();
    const aiData = await generateDueDiligenceReport(input);
    
    // Dynamically import the map text function to determine the verdict enum
    const { mapTextToVerdictType } = await import("@/lib/verdicts");
    const verdictEnum = mapTextToVerdictType(aiData.investmentVerdict?.label);

    const overallConfidence = calculateOverallConfidence(aiData.dataQuality as any, aiData.sectionConfidence as any);
    const aiMetadata = generateAiMetadata(startTime, overallConfidence);
    
    await Report.findByIdAndUpdate(reportId, {
      status: "completed",
      reportData: aiData,
      aiScore: typeof aiData.investmentScore === 'number' ? aiData.investmentScore : 0,
      verdict: verdictEnum,
      aiMetadata
    });
  } catch (error) {
    console.error("Groq generation failed:", error);
    await connectDB();
    await Report.findByIdAndUpdate(reportId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Failed to generate AI report.",
    });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    
    const companyName = formData.get("companyName") as string;
    const industry = formData.get("industry") as string;
    const targetMarket = formData.get("targetMarket") as string;
    const analysisType = formData.get("analysisType") as string;
    const businessDescription = formData.get("businessDescription") as string;
    const websiteUrl = formData.get("websiteUrl") as string;
    const notes = formData.get("notes") as string;
    
    // Extract files
    const documents = formData.getAll("documents");
    const filesData = [];
    
    for (const doc of documents) {
      if (doc instanceof File) {
        const arrayBuffer = await doc.arrayBuffer();
        const buffer = Buffer.alloc(arrayBuffer.byteLength);
        Buffer.from(arrayBuffer).copy(buffer);
        filesData.push({
          name: doc.name,
          type: doc.type,
          size: doc.size,
          buffer
        });
      }
    }

    if (!companyName || !analysisType) {
      return NextResponse.json(
        { error: "Company Name and Analysis Type are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const report = await Report.create({
      userId: user.id,
      companyName,
      industry,
      targetMarket,
      analysisType,
      businessDescription,
      websiteUrl,
      notes,
      status: "processing",
      aiScore: 0,
      reportData: {
        executiveSummary: "",
        marketAnalysis: "",
        riskAssessment: "",
        swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
        investmentScore: 0,
        recommendation: "",
        keyInsights: [],
      },
    });

    const aiInput: DueDiligenceInput = {
      companyName,
      industry,
      targetMarket,
      analysisType,
      businessDescription,
      additionalNotes: notes,
    };

    // Fire and forget background process
    processReportInBackground(String(report._id), aiInput, websiteUrl, filesData);

    return NextResponse.json({ success: true, reportId: String(report._id) });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal Server Error" 
    }, { status: 500 });
  }
}
