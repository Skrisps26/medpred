"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2, Users } from "lucide-react"

export function PageToggleButton() {
  const router = useRouter()
  const pathname = usePathname()

  const isOnPatientPage = pathname === "/patient"
  const isOnAdminPage = pathname === "/"

  const handleToggle = () => {
    if (isOnPatientPage) {
      router.push("/") // Go to admin page
    } else {
      router.push("/patient") // Go to patient page
    }
  }

  const buttonText = isOnPatientPage ? "Admin Portal" : "Patient Portal"
  const Icon = isOnPatientPage ? Building2 : Users

  return (
    <Button
      onClick={handleToggle}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Icon className="h-4 w-4" />
      {buttonText}
    </Button>
  )
}