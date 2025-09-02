"use client"
import { UploadExcel } from "@/components/admin/upload-excel"
import { PatientTable } from "@/components/admin/patient-table"

export default function AdminPage() {
  return (
    <main className="container mx-auto max-w-6xl p-6 font-sans">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-balance">Hospital Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Upload patient data, search by Patient ID, and review 90-day deterioration probabilities.
        </p>
      </header>

      <section className="grid gap-6">
        <UploadExcel />
        <PatientTable />
      </section>
    </main>
  )
}
