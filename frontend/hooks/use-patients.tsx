"use client"

import { create } from "zustand"
import type { Patient } from "@/types/patient"

interface PatientsStore {
  patients: Patient[]
  setPatients: (patients: Patient[]) => void
  findById: (id: string) => Patient | undefined
}

export const usePatients = create<PatientsStore>((set, get) => ({
  patients: [],
  setPatients: (patients) => {
    console.log("Setting patients in store:", patients) // Debug log
    set({ patients })
  },
  findById: (id) => {
    const normalized = id.trim().toLowerCase()
    return get().patients.find(
      (p) => String(p.patientId).trim().toLowerCase() === normalized
    )
  },
}))
