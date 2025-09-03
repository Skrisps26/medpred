"use client"
const API_URL = process.env.NEXT_PUBLIC_API_URL;
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
  const map: Record<string, keyof Patient> = {
    "subject_id": "patientId",
    "hadm_id": "hadmId",
    "predictions": "prediction",
  }

  const out: Partial<Patient> = {}

  for (const [rawKey, rawVal] of Object.entries(row)) {
    const key = normalizeKey(rawKey)
    const mapped = map[key]
    if (!mapped) continue

    if (mapped === "prediction") {
      const num = typeof rawVal === "number" ? rawVal : Number.parseFloat(String(rawVal ?? ""))
      if (!Number.isNaN(num)) {
        out.prediction = num > 1 ? num / 100 : num
      }
    } else {
      if (rawVal != null && String(rawVal).trim() !== "") {
        ;(out as any)[mapped] = String(rawVal).trim()
      }
    }
  }

  // Calculate age from DOB if present
  if (row.dob) {
    const dob = new Date(row.dob as string)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    out.age = age
  }

  if (!out.patientId || !out.hadmId) return null
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
      // First send file to prediction API
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch('${API_URL}/predict/', {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const predictionBlob = await response.blob()
      const predictionData = await predictionBlob.arrayBuffer()
      const wb = XLSX.read(predictionData, { type: "array" })
      const firstSheet = wb.SheetNames[0]
      const ws = wb.Sheets[firstSheet]
      const rows = XLSX.utils.sheet_to_json<RawRow>(ws, { raw: true })
      
      console.log('Raw Excel data:', rows) // Debug log

      const parsed: Patient[] = rows.map(row => {
        const patient = {
          patientId: String(row.subject_id),
          hadmId: String(row.hadm_id),
          age: row.aoa ? Number(row.aoa) : undefined,
          prediction: row.prob_class_1 ? Number(row.prob_class_1):0.0,
        }
        console.log('Parsed patient:', patient) // Debug log for each patient
        return patient
      }).filter((p): p is Patient => 
        p.patientId != null && 
        p.hadmId != null
      )

      console.log('Final parsed data:', parsed) // Debug final data
      setPatients(parsed)
      
      // Show success message
      toast({
        title: "Predictions complete",
        description: `Loaded ${parsed.length} patients with predictions`,
      })

      // Clear the file input
      if (inputRef.current) inputRef.current.value = ""

    } catch (err: any) {
      toast({
        title: "Failed to process file",
        description: err?.message ?? "Please check the file format or try again.",
        variant: "destructive",
      })
      console.error("Error processing file:", err)
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
