export type Patient = {
  patientId: string
  name: string
  age?: number
  gender?: string
  diagnosis?: string
  medicines?: string[] // parsed from comma-separated string if present
  phone?: string
  email?: string
  note?: string
  // stored as 0..1 (e.g., 0.23 for 23%)
  deteriorationProbability90d?: number
}
