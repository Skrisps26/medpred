"use client"

import useSWR from "swr"
import type { Patient } from "@/types/patient"

const STORAGE_KEY = "patients"

const fetcher = async (): Promise<Patient[]> => {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(STORAGE_KEY)
  try {
    return raw ? (JSON.parse(raw) as Patient[]) : []
  } catch {
    return []
  }
}

export function usePatients() {
  const { data, error, isLoading, mutate } = useSWR<Patient[]>("patients", fetcher, {
    revalidateOnFocus: false,
  })

  const setPatients = (list: Patient[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      mutate(list, false)
    }
  }

  const clearPatients = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
      mutate([], false)
    }
  }

  const findById = (id: string) => {
    const all = data || []
    return all.find((p) => String(p.patientId).trim().toLowerCase() === String(id).trim().toLowerCase())
  }

  return {
    patients: data || [],
    isLoading,
    error,
    setPatients,
    clearPatients,
    findById,
    mutate,
  }
}
