"use client"

import * as React from "react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { usePatients } from "@/hooks/use-patients"
import type { Patient } from "@/types/patient"

type RawRow = Record<string, unknown>

function normalizeKey(k: string): string {
  return k.trim().toLowerCase().replace(/\s+/g, " ").replace(/_/g, " ")
}

function toPatient(row: RawRow): Patient | null {
  const map: Record<string, keyof Patient | "prob"> = {
    "patient id": "patientId",
    id: "patientId",
    patientid: "patientId",

    name: "name",
    "full name": "name",

    age: "age",
    gender: "gender",

    diagnosis: "diagnosis",

    medicines: "medicines",
    "prescribed medicines": "medicines",

    phone: "phone",
    email: "email",
    note: "note",
    notes: "note",

    "probability of deterioration in 90 days": "prob",
    "deterioration probability 90d": "prob",
    "probability 90d": "prob",
    probability: "prob",
    "risk score": "prob",
  }

  const out: Partial<Patient> = {}

  for (const [rawKey, rawVal] of Object.entries(row)) {
    const key = normalizeKey(rawKey)
    const mapped = map[key]
    if (!mapped) continue

    if (mapped === "prob") {
      const num = typeof rawVal === "number" ? rawVal : Number.parseFloat(String(rawVal ?? ""))
      if (!Number.isNaN(num)) {
        out.deteriorationProbability90d = num > 1 ? num / 100 : num
      }
    } else if (mapped === "medicines") {
      if (Array.isArray(rawVal)) {
        out.medicines = rawVal.map((x) => String(x))
      } else if (rawVal != null) {
        out.medicines = String(rawVal)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      }
    } else if (mapped === "age") {
      const ageNum = typeof rawVal === "number" ? rawVal : Number.parseInt(String(rawVal ?? ""), 10)
      if (!Number.isNaN(ageNum)) out.age = ageNum
    } else {
      if (rawVal != null && String(rawVal).trim() !== "") {
        ;(out as any)[mapped] = String(rawVal).trim()
      }
    }
  }

  if (!out.patientId || !out.name) return null
  return out as Patient
}

export function UploadExcel() {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const { setPatients, patients } = usePatients()
  const { toast } = useToast()
  const [isParsing, setIsParsing] = React.useState(false)

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsParsing(true)
    try {
      const data = await file.arrayBuffer()
      const wb = XLSX.read(data, { type: "array" })
      const firstSheet = wb.SheetNames[0]
      const ws = wb.Sheets[firstSheet]
      const rows = XLSX.utils.sheet_to_json<RawRow>(ws, { raw: true })
      const parsed: Patient[] = rows.map(toPatient).filter((p): p is Patient => !!p)

      // Deduplicate by patientId
      const byId = new Map<string, Patient>()
      for (const p of parsed) {
        byId.set(String(p.patientId).trim().toLowerCase(), p)
      }
      const merged = Array.from(byId.values())

      setPatients(merged)
      toast({
        title: "Upload complete",
        description: `Loaded ${merged.length} patients`,
      })
      if (inputRef.current) inputRef.current.value = ""
    } catch (err: any) {
      toast({
        title: "Failed to parse file",
        description: err?.message ?? "Please check the file format.",
        variant: "destructive",
      })
    } finally {
      setIsParsing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload patient data</CardTitle>
        <CardDescription className="text-pretty">
          Upload an Excel or CSV file with columns like: <span className="font-medium">Patient ID</span>,{" "}
          <span className="font-medium">Name</span>, <span className="font-medium">Age</span>,{" "}
          <span className="font-medium">Diagnosis</span>, <span className="font-medium">Medicines</span>, and{" "}
          <span className="font-medium">Probability of Deterioration in 90 days</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid gap-2">
          <Label htmlFor="file">Select file</Label>
          <input
            ref={inputRef}
            id="file"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={onFileChange}
            aria-label="Upload Excel or CSV file with patient data"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={isParsing}>
            {isParsing ? "Parsing…" : "Choose file"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {patients.length > 0 ? `${patients.length} patients loaded` : "No patients loaded"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
