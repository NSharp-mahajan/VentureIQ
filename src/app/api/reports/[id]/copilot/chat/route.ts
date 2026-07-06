/* eslint-disable */
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import WorkspaceMember from "@/models/WorkspaceMember";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    await connectDB();
    const resolvedParams = await params;

    // Verify ownership and load report
    const report = await Report.findById(resolvedParams.id);
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.userId !== userId) {
      if (!report.workspaceId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const membership = await WorkspaceMember.findOne({ workspaceId: report.workspaceId, userId });
      if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Load or create conversation (shared per report)
    let conversation = await Conversation.findOne({ reportId: resolvedParams.id });
    if (!conversation) {
      conversation = new Conversation({
        reportId: resolvedParams.id,
        userId: report.userId, // The original creator owns the conversation technically
      });
      await conversation.save();
    }

    // Save user message
    const incomingUserMessage = messages[messages.length - 1];
    
    await Message.create({
      conversationId: conversation._id,
      role: incomingUserMessage.role === "data" ? "user" : incomingUserMessage.role,
      content: incomingUserMessage.content,
    });

    // Fetch previous messages for context
    const previousMessages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    // Build context from report
    let systemPrompt = "";
    try {
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

      if (report.reportData?.swot) {
        contextLines.push(`\n# SWOT Analysis`);
        contextLines.push(`Strengths: ${Array.isArray(report.reportData.swot.strengths) ? report.reportData.swot.strengths.join(", ") : ""}`);
        contextLines.push(`Weaknesses: ${Array.isArray(report.reportData.swot.weaknesses) ? report.reportData.swot.weaknesses.join(", ") : ""}`);
      }

      if (report.reportData?.riskAssessment) {
        contextLines.push(`\n# Risk Assessment\n${report.reportData.riskAssessment}`);
      }

      if (report.reportData?.competitorAnalysis?.summary) {
        contextLines.push(`\n# Competitors\n${report.reportData.competitorAnalysis.summary}`);
      }
      
      systemPrompt = contextLines.join("\n");
      
      if (systemPrompt.length > 12000) {
        systemPrompt = systemPrompt.substring(0, 12000) + "\n...[TRUNCATED FOR LENGTH]...";
      }
    } catch (contextErr) {
      return NextResponse.json({ error: "Failed to build context" }, { status: 500 });
    }

    let apiMessages;
    try {
      apiMessages = [
        { role: "system", content: systemPrompt },
        ...previousMessages.map((m: any) => ({
          role: m.role,
          content: m.content
        })),
      ];
    } catch (msgErr) {
      return NextResponse.json({ error: "Message formatting error" }, { status: 500 });
    }

    let response;
    try {
      response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: apiMessages as any,
        stream: true,
        temperature: 0.3,
      });
    } catch (groqErr) {
      return NextResponse.json({ error: "Groq API error" }, { status: 500 });
    }

    const encoder = new TextEncoder();
    let fullResponseText = "";
    
    // We will generate the title asynchronously if this is the first user message
    const isFirstInteraction = previousMessages.length <= 1; // It was just created above, so length is 1

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              fullResponseText += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          
          try {
            await Message.create({
              conversationId: conversation._id,
              role: "assistant",
              content: fullResponseText,
            });

            if (isFirstInteraction && !conversation.title) {
              // Generate title asynchronously
              groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                  { role: "system", content: "You are a title generator. Generate a concise 3-4 word title for this conversation based on the user's first message. Do not include quotes." },
                  { role: "user", content: incomingUserMessage.content }
                ],
                temperature: 0.5,
              }).then(titleResponse => {
                const title = titleResponse.choices[0]?.message?.content?.trim().replace(/["']/g, '');
                if (title) {
                  Conversation.findByIdAndUpdate(conversation._id, { title }).exec();
                }
              }).catch(console.error);
            }
          } catch (saveErr) {
            console.error("Failed to save assistant message", saveErr);
          }
          
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (err: any) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
