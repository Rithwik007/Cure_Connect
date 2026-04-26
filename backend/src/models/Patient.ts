import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  userId?: mongoose.Types.ObjectId; // Link to the User account (if they registered themselves)
  doctorId: mongoose.Types.ObjectId; // The doctor who manages this patient
  patientCode: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone?: string;
}

const PatientSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    patientCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    phone: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IPatient>('Patient', PatientSchema);
