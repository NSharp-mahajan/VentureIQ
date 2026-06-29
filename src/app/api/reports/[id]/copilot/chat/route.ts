/* eslint-disable */
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import Conversation from "@/models/Conversation";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("\n[1] Starting POST request to Copilot chat route");
    const { userId } = await auth();
    if (!userId) {
      console.log("[ERROR] Unauthorized: No user ID found.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("[1] User authenticated:", userId);

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      console.log("[ERROR] Invalid messages array:", messages);
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }
    console.log("[1.5] Parsed messages. Count:", messages.length);

    await connectDB();
    console.log("[1.8] Connected to MongoDB");
    
    const resolvedParams = await params;
    console.log("[1.9] Resolved params ID:", resolvedParams.id);

    // Verify ownership and load report
    const report = await Report.findOne({ _id: resolvedParams.id, userId });
    if (!report) {
      console.log("[ERROR] Report not found or unauthorized for user. ID:", resolvedParams.id);
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    console.log("[2] Report found:", report.companyName);

    // Load or create conversation
    let conversation = await Conversation.findOne({ reportId: resolvedParams.id, userId });
    if (!conversation) {
      conversation = new Conversation({
        reportId: resolvedParams.id,
        userId,
        messages: [],
      });
      console.log("[3] Created new Conversation document");
    } else {
      console.log("[3] Existing Conversation loaded. ID:", conversation._id);
    }

    // Save user message
    const userMessage = messages[messages.length - 1];
    conversation.messages.push({
      role: userMessage.role,
      content: userMessage.content,
      createdAt: new Date(),
    });
    
    try {
      await conversation.save();
      console.log("[4] Conversation saved with new user message");
    } catch (saveErr: any) {
      console.error("[ERROR] Failed to save conversation:", saveErr);
      return NextResponse.json({ error: "Database error during save: " + saveErr.message, stack: saveErr.stack }, { status: 500 });
    }

    // Build context from report
    let systemPrompt = "";
    try {
      console.log("[4.1] Building Context...");
      const contextLines = [
        `You are a professional Venture Capital analyst Copilot for the platform VentureIQ.`,
        `You are answering questions about the following company report.`,
        `Rules:`,
        `- Never invent information. Only answer using the report context below.`,
        `- If the report lacks sufficient information to answer a question, clearly state that.`,
        `- Explain your reasoning.`,
        `- Use structured bullet points where appropriate for readability.`,
        `- Be concise, professional, and analytical.`,
        `\n--- REPORT CONTEXT ---`,
        `Company Name: ${report.companyName}`,
        `Industry: ${report.industry || "N/A"}`,
        `Target Market: ${report.targetMarket || "N/A"}`,
        `Investment Score: ${report.reportData?.investmentScore || report.aiScore || "N/A"}/100`,
        `Verdict: ${report.reportData?.investmentVerdict?.label || report.verdict || "UNKNOWN"}`,
      ];

      if (report.reportData?.executiveSummary) {
        contextLines.push(`\n# Executive Summary\n${report.reportData.executiveSummary}`);
      }
      
      if (Array.isArray(report.reportData?.keyInsights)) {
        contextLines.push(`\n# Key Insights\n- ${report.reportData.keyInsights.join("\n- ")}`);
      }

      if (report.reportData?.marketAnalysis) {
        contextLines.push(`\n# Market Analysis\n${report.reportData.marketAnalysis}`);
      }
      
      if (report.reportData?.swot) {
        contextLines.push(`\n# SWOT Analysis`);
        contextLines.push(`Strengths: ${Array.isArray(report.reportData.swot.strengths) ? report.reportData.swot.strengths.join(", ") : ""}`);
        contextLines.push(`Weaknesses: ${Array.isArray(report.reportData.swot.weaknesses) ? report.reportData.swot.weaknesses.join(", ") : ""}`);
        contextLines.push(`Opportunities: ${Array.isArray(report.reportData.swot.opportunities) ? report.reportData.swot.opportunities.join(", ") : ""}`);
        contextLines.push(`Threats: ${Array.isArray(report.reportData.swot.threats) ? report.reportData.swot.threats.join(", ") : ""}`);
      }

      if (report.reportData?.riskAssessment) {
        contextLines.push(`\n# Risk Assessment\n${report.reportData.riskAssessment}`);
      }

      if (Array.isArray(report.reportData?.redFlags) && report.reportData.redFlags.length > 0) {
        contextLines.push(`\n# Red Flags`);
        report.reportData.redFlags.forEach((flag: any) => {
          const severity = flag?.severity ? String(flag.severity).toUpperCase() : "WARNING";
          const title = flag?.title || "Red Flag";
          const desc = flag?.description || "";
          contextLines.push(`- [${severity}] ${title}: ${desc}`);
        });
      }

      if (report.reportData?.competitorAnalysis?.summary) {
        contextLines.push(`\n# Competitors\n${report.reportData.competitorAnalysis.summary}`);
      }
      
      if (Array.isArray(report.reportData?.growthOpportunities) && report.reportData.growthOpportunities.length > 0) {
        contextLines.push(`\n# Growth Opportunities`);
        report.reportData.growthOpportunities.forEach((opp: any) => {
          const tf = opp?.timeframe || "Future";
          const title = opp?.title || "Opportunity";
          const desc = opp?.description || "";
          contextLines.push(`- [${tf}] ${title}: ${desc}`);
        });
      }
      
      systemPrompt = contextLines.join("\n");
      
      // Limit context to ~12000 characters if too large (approx 3000 tokens)
      if (systemPrompt.length > 12000) {
        console.log(`[4.2] System prompt too large (${systemPrompt.length} chars). Truncating...`);
        systemPrompt = systemPrompt.substring(0, 12000) + "\n...[TRUNCATED FOR LENGTH]...";
      }
      
      console.log("[5] Context built successfully. Length:", systemPrompt.length);
    } catch (contextErr: any) {
      console.error("[ERROR] Failed to build context:", contextErr);
      return NextResponse.json({ error: "Failed to build context: " + contextErr.message, stack: contextErr.stack }, { status: 500 });
    }

    let apiMessages;
    try {
      apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role === "data" ? "user" : m.role,
          content: m.content
        })),
      ];
      console.log("[6] API messages constructed successfully. Total messages:", apiMessages.length);
    } catch (msgErr: any) {
      console.error("[ERROR] Failed to construct API messages:", msgErr);
      return NextResponse.json({ error: "Message formatting error: " + msgErr.message, stack: msgErr.stack }, { status: 500 });
    }

    console.log("[7] Sending request to Groq SDK...");
    let response;
    try {
      response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: apiMessages as any,
        stream: true,
        temperature: 0.3,
      });
      console.log("[8] Groq streaming response initiated successfully");
    } catch (groqErr: any) {
      console.error("[ERROR] Groq API call failed:", groqErr);
      return NextResponse.json({ error: "Groq API error: " + groqErr.message, stack: groqErr.stack }, { status: 500 });
    }

    const encoder = new TextEncoder();
    let fullResponseText = "";
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log("[9] Starting stream to client");
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              fullResponseText += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          console.log("[10] Groq stream completely read");
          
          try {
            console.log("[11] Saving assistant reply to conversation");
            const currentConversation = await Conversation.findOne({ reportId: resolvedParams.id, userId });
            if (currentConversation) {
              currentConversation.messages.push({
                role: "assistant",
                content: fullResponseText,
                createdAt: new Date(),
              });
              await currentConversation.save();
              console.log("[12] Assistant message saved successfully");
            }
          } catch (saveErr: any) {
            console.error("[ERROR] Failed to save assistant message:", saveErr);
          }
          
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
          console.log("[13] Stream successfully closed");
        } catch (err: any) {
          console.error("[ERROR] Stream reading failed:", err);
          controller.error(err);
        }
      },
    });

    console.log("[14] Returning stream response to client");
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("\n===========================");
    console.error("Copilot Route Error (POST):");
    console.error(error);
    console.error(error?.stack);
    console.error("===========================\n");
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message, stack: error?.stack }, 
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const resolvedParams = await params;

    const conversation = await Conversation.findOne({ reportId: resolvedParams.id, userId }).lean();
    if (!conversation) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: conversation.messages.map((m: any) => ({
        id: m._id?.toString() || Math.random().toString(),
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error("Copilot History Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const resolvedParams = await params;

    await Conversation.findOneAndDelete({ reportId: resolvedParams.id, userId });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Copilot Delete Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
