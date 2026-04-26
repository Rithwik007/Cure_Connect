import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  patientId: mongoose.Types.ObjectId;
  uploaderId: mongoose.Types.ObjectId;
  name: string;
  category: 'Lab Report' | 'Prescription' | 'X-Ray' | 'Other';
  fileUrl: string;
  fileType: string;
  date: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    uploaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['Lab Report', 'Prescription', 'X-Ray', 'Other'], default: 'Lab Report' },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IDocument>('Document', DocumentSchema);
