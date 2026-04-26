// ─────────────────────────────────────────────
//  PatientCard — displays patient summary
// ─────────────────────────────────────────────

import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Patient } from '../types';

interface PatientCardProps {
  patient: Patient;
}

const genderColor: Record<Patient['gender'], string> = {
  male: 'bg-blue-100 text-blue-700',
  female: 'bg-pink-100 text-pink-700',
  other: 'bg-purple-100 text-purple-700',
};

const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const navigate = useNavigate();

  return (
    <button
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-teal-200 transition-all duration-200 active:scale-[0.99]"
      onClick={() => navigate(`/patients/${patient._id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg flex-shrink-0">
            {patient.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-base leading-tight">
              {patient.name}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{patient.patientCode}</p>
          </div>
        </div>

        {/* Sync indicator */}
        <div className="flex-shrink-0">
          {patient.synced ? (
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              ✓ synced
            </span>
          ) : (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              pending
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${genderColor[patient.gender]}`}
        >
          {patient.gender}
        </span>
        <span className="text-xs text-gray-500">{patient.age} yrs</span>
        {patient.phone && (
          <span className="text-xs text-gray-500">📞 {patient.phone}</span>
        )}
      </div>
    </button>
  );
};

export default PatientCard;
