// ─────────────────────────────────────────────
//  VisitCard — shows visit summary with decrypted
//  diagnosis preview
// ─────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { decryptField } from '../crypto';
import type { Visit } from '../types';

interface VisitCardProps {
  visit: Visit;
}

const VisitCard: React.FC<VisitCardProps> = ({ visit }) => {
  const navigate = useNavigate();
  const [diagnosisPreview, setDiagnosisPreview] = useState<string>('...');

  useEffect(() => {
    let mounted = true;
    async function decrypt() {
      try {
        const plain = await decryptField(visit.diagnosis);
        if (mounted) {
          setDiagnosisPreview(plain.slice(0, 80) + (plain.length > 80 ? '…' : ''));
        }
      } catch {
        if (mounted) setDiagnosisPreview('(encrypted)');
      }
    }
    decrypt();
    return () => {
      mounted = false;
    };
  }, [visit.diagnosis]);

  const formattedDate = new Date(visit.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <button
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-teal-200 transition-all duration-200 active:scale-[0.99]"
      onClick={() => navigate(`/visits/${visit._id}`)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🩺</span>
          <span className="text-sm font-semibold text-gray-800">{formattedDate}</span>
        </div>
        {visit.nextAppointment && (
          <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
            Next: {new Date(visit.nextAppointment).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
        <span className="font-medium text-gray-700">Dx: </span>
        {diagnosisPreview}
      </p>
      <div className="mt-2 flex items-center justify-between">
        {!visit.synced && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            pending sync
          </span>
        )}
        <span className="text-xs text-teal-600 ml-auto">View details →</span>
      </div>
    </button>
  );
};

export default VisitCard;
