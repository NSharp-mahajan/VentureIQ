import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspaceMemberDocument extends Document {
  workspaceId: mongoose.Types.ObjectId | string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: Date;
}

const WorkspaceMemberSchema = new Schema<IWorkspaceMemberDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    userId: { type: String, required: true, index: true },
    role: { type: String, enum: ["OWNER", "ADMIN", "MEMBER"], default: "MEMBER" },
    joinedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

if (mongoose.models.WorkspaceMember) {
  delete mongoose.models.WorkspaceMember;
}
export default mongoose.model<IWorkspaceMemberDocument>("WorkspaceMember", WorkspaceMemberSchema);
