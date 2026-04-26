import mongoose, { Schema, Document } from 'mongoose';

export interface IVital extends Document {
  patientId: mongoose.Types.ObjectId;
  type: 'BP' | 'Glucose' | 'HeartRate' | 'Weight' | 'Temperature';
  value: string; // e.g., "120/80" or "98.6"
  unit: string;  // e.g., "mmHg", "mg/dL", "bpm", "kg", "°F"
  date: Date;
}

const VitalSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['BP', 'Glucose', 'HeartRate', 'Weight', 'Temperature'], required: true },
    value: { type: String, required: true },
    unit: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IVital>('Vital', VitalSchema);
