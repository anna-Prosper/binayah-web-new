import mongoose, { Schema, Model } from "mongoose";

export interface IInquiry {
  name: string;
  email: string;
  phone?: string;
  inquiryType?: string;
  message?: string;
  propertySlug?: string;
  propertyTitle?: string;
  source: string;
  status: string;
  createdAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    inquiryType: String,
    message: String,
    propertySlug: String,
    propertyTitle: String,
    source: { type: String, default: "website" },
    status: { type: String, default: "new", index: true },
  },
  { timestamps: true }
);

const Inquiry: Model<IInquiry> =
  mongoose.models.Inquiry || mongoose.model<IInquiry>("Inquiry", InquirySchema);

export default Inquiry;