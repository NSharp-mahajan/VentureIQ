import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import Activity from "@/models/Activity";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await connectDB();

    // Find all workspaces where the user is a member
    const memberships = await WorkspaceMember.find({ userId }).populate("workspaceId");
    
    // Extract workspaces from memberships
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workspaces = memberships.map((m: any) => ({
      ...m.workspaceId.toObject(),
      role: m.role,
      joinedAt: m.joinedAt,
    }));

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Fetch Workspaces Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { name, description } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    await connectDB();

    const workspace = new Workspace({
      name,
      description,
      ownerId: userId,
    });
    await workspace.save();

    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId,
      role: "OWNER",
    });

    await Activity.create({
      workspaceId: workspace._id,
      userId,
      action: "Created Workspace",
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Create Workspace Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
