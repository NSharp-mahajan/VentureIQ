import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspaceDocument extends Document {
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspaceDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    ownerId: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Workspace) {
  delete mongoose.models.Workspace;
}
export default mongoose.model<IWorkspaceDocument>("Workspace", WorkspaceSchema);
