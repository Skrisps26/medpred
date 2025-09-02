"use client"

import * as React from "react"
import { usePatients } from "@/hooks/use-patients"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { Patient } from "@/types/patient"

function toPercent(n?: number) {
  if (n == null) return "—"
  const clamped = Math.max(0, Math.min(1, n))
  return (clamped * 100).toLocaleString(undefined, { maximumFractionDigits: 1 }) + "%"
}

export function PatientLookup() {
  const { findById } = usePatients()
  const [patientId, setPatientId] = React.useState("")
  const [patient, setPatient] = React.useState<Patient | null>(null)
  const [searched, setSearched] = React.useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const found = findById(patientId)
    setPatient(found ?? null)
    setSearched(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Dashboard</CardTitle>
        <CardDescription className="text-pretty">
          Enter your Patient ID to view your current health information.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={onSubmit} className="flex items-end gap-3">
          <div className="grid gap-2">
            <Label htmlFor="pid">Patient ID</Label>
            <Input
              id="pid"
              placeholder="e.g. P-10293"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              aria-label="Enter your Patient ID"
            />
          </div>
          <Button type="submit">View</Button>
        </form>

        {searched && !patient && <p className="text-sm text-muted-foreground">No record found for this Patient ID.</p>}

        {patient && (
          <div className="grid gap-6">
            <section className="grid gap-2">
              <h3 className="text-lg font-semibold text-balance">Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded border p-3">
                  <div className="text-xs text-muted-foreground">Name</div>
                  <div className="font-medium">{patient.name}</div>
                </div>
                <div className="rounded border p-3">
                  <div className="text-xs text-muted-foreground">Patient ID</div>
                  <div className="font-medium">{patient.patientId}</div>
                </div>
                <div className="rounded border p-3">
                  <div className="text-xs text-muted-foreground">Age</div>
                  <div className="font-medium">{patient.age ?? "—"}</div>
                </div>
              </div>
            </section>

            <section className="grid gap-2">
              <h3 className="text-lg font-semibold text-balance">90-day Deterioration Probability</h3>
              <div className="rounded border p-4">
                <div className="text-3xl font-bold">{toPercent(patient.deteriorationProbability90d)}</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  This value is provided by your care team’s analysis and is for informational purposes.
                </p>
              </div>
            </section>

            <section className="grid gap-2">
              <h3 className="text-lg font-semibold text-balance">Diagnosis</h3>
              <div className="rounded border p-4">
                <p className="text-sm">{patient.diagnosis ?? "—"}</p>
              </div>
            </section>

            <section className="grid gap-2">
              <h3 className="text-lg font-semibold text-balance">Prescribed Medicines</h3>
              <div className="rounded border p-4">
                {patient.medicines && patient.medicines.length > 0 ? (
                  <ul className="list-disc pl-5 grid gap-1">
                    {patient.medicines.map((m, i) => (
                      <li key={i} className="text-sm">
                        {m}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">—</p>
                )}
              </div>
            </section>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
