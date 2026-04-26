// ─────────────────────────────────────────────
//  PrescriptionForm — dynamic medicine list
//  Used inline within NewVisitPage
// ─────────────────────────────────────────────

import React from 'react';
import type { Medicine } from '../types';

interface PrescriptionFormProps {
  medicines: Medicine[];
  onChange: (medicines: Medicine[]) => void;
}

const emptyMedicine = (): Medicine => ({ name: '', dosage: '', duration: '' });

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  medicines,
  onChange,
}) => {
  const handleChange = (
    index: number,
    field: keyof Medicine,
    value: string
  ) => {
    const updated = medicines.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    );
    onChange(updated);
  };

  const addRow = () => onChange([...medicines, emptyMedicine()]);

  const removeRow = (index: number) => {
    if (medicines.length === 1) return; // keep at least one
    onChange(medicines.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
          💊 Prescriptions
        </h3>
        <button
          type="button"
          onClick={addRow}
          className="text-teal-600 text-sm font-medium hover:text-teal-800 transition min-h-[36px] px-3"
        >
          + Add medicine
        </button>
      </div>

      {medicines.map((med, index) => (
        <div
          key={index}
          className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Medicine #{index + 1}
            </span>
            {medicines.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="text-red-400 hover:text-red-600 text-xs transition"
              >
                Remove
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="Medicine name *"
            value={med.name}
            onChange={(e) => handleChange(index, 'name', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Dosage (e.g. 500mg)"
              value={med.dosage}
              onChange={(e) => handleChange(index, 'dosage', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
            />
            <input
              type="text"
              placeholder="Duration (e.g. 5 days)"
              value={med.duration}
              onChange={(e) => handleChange(index, 'duration', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrescriptionForm;
