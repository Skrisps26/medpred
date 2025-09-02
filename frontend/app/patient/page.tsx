"use client"
import { PatientLookup } from "@/components/patient/patient-lookup"

export default function PatientPage() {
  return (
    <main className="container mx-auto max-w-3xl p-6 font-sans">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-balance">Patient Portal</h1>
        <p className="text-sm text-muted-foreground">Securely view your current information and care details.</p>
      </header>

      <PatientLookup />
    </main>
  )
}
