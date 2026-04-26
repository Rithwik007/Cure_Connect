import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientId: string;
  doctorId: string;
  date: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

const AppointmentSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'completed'], 
      default: 'pending' 
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
