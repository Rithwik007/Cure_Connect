import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  _id: string;
  visitId: string;
  doctorId: string;
  fileName: string;
  fileType: 'image' | 'pdf';
  base64Data: string;
}

const ReportSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    visitId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true, index: true },
    fileName: { type: String, required: true },
    fileType: { type: String, enum: ['image', 'pdf'], required: true },
    base64Data: { type: String, required: true },
  },
  { _id: false, versionKey: false }
);

export default mongoose.model<IReport>('Report', ReportSchema);
