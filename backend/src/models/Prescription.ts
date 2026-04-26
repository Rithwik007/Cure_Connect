import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescription extends Document {
  _id: string;
  visitId: string;
  doctorId: string;
  medicines: {
    name: string;
    dosage: string;
    duration: string;
  }[];
}

const MedicineSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    duration: { type: String, required: true },
  },
  { _id: false }
);

const PrescriptionSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    visitId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true, index: true },
    medicines: { type: [MedicineSchema], required: true },
  },
  { _id: false, versionKey: false }
);

export default mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
