"use client"
import { Button } from "./ui/button"
import { ArrowLeft, Clock, FileText, ClipboardList, Beaker, Home, Heart } from "lucide-react"

interface AppointmentDetailProps {
  appointment: {
    testNo: number
    testName: string
    price: number
    currencySymbol: string
    turnaroundTime: string
    preTestRequirements: string
    homeCollection: string
    insuranceCoverage: string
    description: string
    testImage: string
    clinicImage: string
    clinicName: string
  }
  onBack: () => void
  onBook: (quantity: number) => void
}

export function AppointmentDetail({ appointment, onBack, onBook }: AppointmentDetailProps) {
  const capitalize = (str: string) => {
    if (!str) return ""
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  const handleBookAppointment = () => {
    onBook(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={onBack} className="-ml-2">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="order-1 lg:order-1">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={appointment.testImage || "/placeholder.svg?height=400&width=800"}
                alt={appointment.testName}
                className="w-full h-64 sm:h-80 lg:h-full object-cover"
              />
            </div>
          </div>

          <div className="order-2 lg:order-2">
            <h1 className="text-[20px] sm:text-1xl font-bold mb-8">{capitalize(appointment.testName)}</h1>

            <div className="flex items-center justify-between mb-8 pb-6 border-b">
              <div className="text-right">
                <p className="text-1xl font-bold">
                  {appointment.price.toLocaleString()} {appointment.currencySymbol}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 shrink-0" />
                <div>
                  <p className="font-medium">Results within {appointment.turnaroundTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <ClipboardList className="h-6 w-6 shrink-0" />
                <div>
                  <p className="font-medium">
                    Pre-Test Requirements: <span className="font-normal">{appointment.preTestRequirements}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FileText className="h-6 w-6 shrink-0" />
                <div>
                  <p className="text-foreground">{appointment.description || "No description available"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Home className="h-6 w-6 shrink-0" />
                <div>
                  <p className="font-medium">
                    Home Collection: <span className="font-normal capitalize">{appointment.homeCollection}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Beaker className="h-6 w-6 shrink-0" />
                <div>
                  <p className="font-medium">
                    Clinic: <span className="font-normal">{appointment.clinicName}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Heart className="h-6 w-6 shrink-0" />
                <div>
                  <p className="font-medium">
                    Insurance Coverage: <span className="font-normal capitalize">{appointment.insuranceCoverage}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white pt-4 pb-6">
          <Button
            size="lg"
            className="w-full bg-[#FBAE24] text-white hover:bg-[#FBAE24]/90 text-lg py-6 rounded-full"
            onClick={handleBookAppointment}
          >
            Book
          </Button>
        </div>
      </div>
    </div>
  )
}
