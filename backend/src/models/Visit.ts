import mongoose, { Schema, Document } from 'mongoose';

export interface IVisit extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  reason?: string;
  nextAppointment?: string;
  prescription?: Array<{
    medicine: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
}

const VisitSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    symptoms: { type: String, required: true },
    diagnosis: { type: String, required: true },
    treatment: { type: String, required: true },
    notes: { type: String },
    reason: { type: String },
    nextAppointment: { type: String },
    prescription: [{
      medicine: { type: String },
      dosage: { type: String },
      frequency: { type: String },
      duration: { type: String }
    }],
  },
  { timestamps: true }
);

export default mongoose.model<IVisit>('Visit', VisitSchema);
