// ─────────────────────────────────────────────
//  usePatients — CRUD for patient records
//  API-first with IndexedDB fallback
// ─────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { auth } from '../firebase';
import api from '../api';
import {
  addPatient as dbAddPatient,
  getPatients as dbGetPatients,
  getPatient as dbGetPatient,
  updatePatient as dbUpdatePatient,
  addToSyncQueue,
} from '../db';
import type { Patient, ApiResponse } from '../types';

interface UsePatientsReturn {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  fetchPatients: () => Promise<void>;
  fetchPatient: (id: string) => Promise<Patient | undefined>;
  createPatient: (
    data: Omit<Patient, '_id' | 'doctorId' | 'patientCode' | 'createdAt' | 'synced'>
  ) => Promise<Patient>;
  updatePatient: (patient: Patient) => Promise<void>;
}

export function usePatients(): UsePatientsReturn {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (navigator.onLine) {
        const res = await api.get<ApiResponse<Patient[]>>('/api/patients');
        const serverPatients = res.data.data;
        // Upsert into local DB
        for (const p of serverPatients) {
          await dbAddPatient({ ...p, synced: true });
        }
        setPatients(serverPatients);
      } else {
        const local = await dbGetPatients();
        setPatients(local);
      }
    } catch {
      // Fallback to local
      const local = await dbGetPatients();
      setPatients(local);
      setError('Could not reach server — showing local data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatient = useCallback(async (id: string): Promise<Patient | undefined> => {
    try {
      if (navigator.onLine) {
        const res = await api.get<ApiResponse<Patient>>(`/api/patients/${id}`);
        const p = { ...res.data.data, synced: true };
        await dbAddPatient(p);
        return p;
      }
    } catch {
      // fall through
    }
    return dbGetPatient(id);
  }, []);

  const createPatient = useCallback(
    async (
      data: Omit<Patient, '_id' | 'doctorId' | 'patientCode' | 'createdAt' | 'synced'>
    ): Promise<Patient> => {
      const doctorId = auth.currentUser?.uid ?? '';
      const patient: Patient = {
        ...data,
        _id: crypto.randomUUID(),
        doctorId,
        patientCode: `PT-${nanoid(6).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        synced: false,
      };

      // Always save locally first
      await dbAddPatient(patient);

      if (navigator.onLine) {
        try {
          const res = await api.post<ApiResponse<Patient>>('/api/patients', patient);
          const saved = { ...res.data.data, synced: true };
          await dbUpdatePatient(saved);
          setPatients((prev) => [saved, ...prev]);
          return saved;
        } catch {
          // If API fails, queue for sync
          await addToSyncQueue({ model: 'patients', action: 'create', payload: patient });
        }
      } else {
        await addToSyncQueue({ model: 'patients', action: 'create', payload: patient });
      }

      setPatients((prev) => [patient, ...prev]);
      return patient;
    },
    []
  );

  const updatePatient = useCallback(async (patient: Patient): Promise<void> => {
    await dbUpdatePatient(patient);

    if (navigator.onLine) {
      try {
        await api.put(`/api/patients/${patient._id}`, patient);
        await dbUpdatePatient({ ...patient, synced: true });
      } catch {
        await addToSyncQueue({ model: 'patients', action: 'update', payload: patient });
      }
    } else {
      await addToSyncQueue({ model: 'patients', action: 'update', payload: patient });
    }

    setPatients((prev) => prev.map((p) => (p._id === patient._id ? patient : p)));
  }, []);

  return { patients, loading, error, fetchPatients, fetchPatient, createPatient, updatePatient };
}
