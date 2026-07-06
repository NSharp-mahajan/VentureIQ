import mongoose, { Schema, Document } from "mongoose";

export interface IMessageDocument extends Document {
  conversationId: mongoose.Types.ObjectId | string;
  role: "system" | "user" | "assistant" | "data";
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    role: { type: String, enum: ["system", "user", "assistant", "data"], required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

if (mongoose.models.Message) {
  delete mongoose.models.Message;
}
export default mongoose.model<IMessageDocument>("Message", MessageSchema);
