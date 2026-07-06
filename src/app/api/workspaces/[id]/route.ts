import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import Activity from "@/models/Activity";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await connectDB();
    const resolvedParams = await params;

    const membership = await WorkspaceMember.findOne({ workspaceId: resolvedParams.id, userId });
    if (!membership) return new NextResponse("Forbidden", { status: 403 });

    const workspace = await Workspace.findById(resolvedParams.id);
    if (!workspace) return new NextResponse("Not Found", { status: 404 });

    return NextResponse.json({ ...workspace.toObject(), role: membership.role });
  } catch (error) {
    console.error("Fetch Workspace Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { name, description } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    await connectDB();
    const resolvedParams = await params;

    const membership = await WorkspaceMember.findOne({ workspaceId: resolvedParams.id, userId });
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const workspace = await Workspace.findByIdAndUpdate(
      resolvedParams.id,
      { name, description },
      { new: true }
    );

    await Activity.create({
      workspaceId: resolvedParams.id,
      userId,
      action: "Updated Workspace Details",
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Update Workspace Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await connectDB();
    const resolvedParams = await params;

    const membership = await WorkspaceMember.findOne({ workspaceId: resolvedParams.id, userId });
    if (!membership || membership.role !== "OWNER") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await Workspace.findByIdAndDelete(resolvedParams.id);
    await WorkspaceMember.deleteMany({ workspaceId: resolvedParams.id });
    await Activity.deleteMany({ workspaceId: resolvedParams.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Workspace Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
