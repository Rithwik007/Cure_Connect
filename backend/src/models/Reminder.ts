import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
  patientId: mongoose.Types.ObjectId;
  medicationName: string;
  dosage: string;
  time: string; // HH:mm
  active: boolean;
}

const ReminderSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    medicationName: { type: String, required: true },
    dosage: { type: String, required: true },
    time: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IReminder>('Reminder', ReminderSchema);
