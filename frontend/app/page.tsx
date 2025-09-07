"use client"

import { UploadExcel } from "@/components/admin/upload-excel"
import { PatientTable } from "@/components/admin/patient-table"
import { PageToggleButton } from "@/components/ui/page-toggle-button"

export default function AdminPage() {
  return (
    <main className="container mx-auto max-w-6xl p-6 font-sans">
      <header className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-balance">Admin Portal</h1>
            <p className="text-sm text-muted-foreground">Upload patient data and manage predictions.</p>
          </div>
          <PageToggleButton />
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <UploadExcel />
        <PatientTable />
      </div>
    </main>
  )
}