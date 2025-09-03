"use client"

import * as React from "react"
import { usePatients } from "@/hooks/use-patients"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import type { Patient } from "@/types/patient"

function formatProb(prob?: number): string {
  if (prob == null || Number.isNaN(prob)) return "—"
  const clamped = Math.max(0, Math.min(1, prob))
  return (clamped * 100).toLocaleString(undefined, { maximumFractionDigits: 1 }) + "%"
}

function ProbBadge({ value }: { value?: number }) {
  if (value == null) return <span className="text-xs text-muted-foreground">N/A</span>
  const pct = value * 100
  let color = "bg-green-100 text-green-800"
  if (pct >= 50) color = "bg-red-100 text-red-800"
  else if (pct >= 25) color = "bg-yellow-100 text-yellow-800"
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${color}`}>
      {formatProb(value)}
    </span>
  )
}

function DetailList({ patient }: { patient: Patient }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <div className="text-xs text-muted-foreground">Patient ID</div>
        <div className="font-medium">{patient.patientId}</div>
      </div>
      {patient.age != null && (
        <div>
          <div className="text-xs text-muted-foreground">Age</div>
          <div className="font-medium">{patient.age}</div>
        </div>
      )}
      <div>
        <div className="text-xs text-muted-foreground">90d Deterioration</div>
        <div className="font-medium">
          <ProbBadge value={patient.prediction} />
        </div>
      </div>
    </div>
  )
}

export function PatientTable() {
  const { patients, findById } = usePatients()

  // Add detailed debug logging
  React.useEffect(() => {
    console.log('PatientTable: patients state updated:', {
      length: patients.length,
      data: patients
    })
  }, [patients])

  const [query, setQuery] = React.useState("")
  const [found, setFound] = React.useState<Patient | null>(null)

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const p = query ? findById(query) : null
    setFound(p ?? null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Add debug info */}
      <div className="text-sm text-muted-foreground">
        Debug: {patients.length} patients in state
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search by Patient ID</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <form onSubmit={onSearch} className="flex items-end gap-3">
            <div className="grid gap-2">
              <Label htmlFor="patient-id">Patient ID</Label>
              <Input
                id="patient-id"
                placeholder="e.g. P-10293"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search by patient ID"
              />
            </div>
            <Button type="submit">Find</Button>
          </form>
          {found ? (
            <div className="mt-2">
              <DetailList patient={found} />
            </div>
          ) : query ? (
            <p className="text-sm text-muted-foreground">No patient found for “{query}”.</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Patient ID</TableHead>
              <TableHead scope="col">Hospital Admission ID</TableHead>
              <TableHead scope="col">Age</TableHead>
              <TableHead scope="col">Prediction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No data loaded. Upload an Excel file to see patients.
                </TableCell>
              </TableRow>
            ) : (
              patients.map((p) => (
                <TableRow key={p.patientId}>
                  <TableCell className="font-medium">{p.patientId}</TableCell>
                  <TableCell>{p.hadmId}</TableCell>
                  <TableCell>{p.age ?? "—"}</TableCell>
                  <TableCell>
                    <ProbBadge value={p.prediction} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
