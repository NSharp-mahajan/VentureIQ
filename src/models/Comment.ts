import mongoose, { Schema, Document } from "mongoose";

export interface ICommentDocument extends Document {
  reportId: mongoose.Types.ObjectId | string;
  authorId: string;
  content: string;
  createdAt: Date;
}

const CommentSchema = new Schema<ICommentDocument>(
  {
    reportId: { type: Schema.Types.ObjectId, ref: "Report", required: true, index: true },
    authorId: { type: String, required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

if (mongoose.models.Comment) {
  delete mongoose.models.Comment;
}
export default mongoose.model<ICommentDocument>("Comment", CommentSchema);
