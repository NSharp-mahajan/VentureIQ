import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

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

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: messages.map((m: any) => ({
        id: m._id?.toString() || Math.random().toString(),
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
      title: conversation.title || null,
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

    const conversation = await Conversation.findOne({ reportId: resolvedParams.id, userId });
    
    if (conversation) {
      await Message.deleteMany({ conversationId: conversation._id });
      await Conversation.deleteOne({ _id: conversation._id });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Copilot Delete Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
