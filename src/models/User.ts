import mongoose, { Schema, Document } from "mongoose";

export interface IUserDocument extends Document {
  clerkId: string;
  email: string;
  fullName?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  
}

const UserSchema = new Schema<IUserDocument>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    fullName: { type: String },
    imageUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
