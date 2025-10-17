"use client"

import { useState } from "react"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { Search } from "lucide-react"
import { AppointmentDetail } from "./appointment-detail"
import { BookingCheckout } from "./booking-checkout"

interface Test {
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

interface AppointmentsSectionProps {
  tests: Test[]
}

export function AppointmentsSection({ tests }: AppointmentsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState<Test | null>(null)
  const [bookingQuantity, setBookingQuantity] = useState<number | null>(null)

  const filteredAppointments = tests.filter((test) => test.testName.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleBookAppointment = (quantity: number) => {
    setBookingQuantity(quantity)
  }

  const handleBackFromCheckout = () => {
    setBookingQuantity(null)
    setSelectedAppointment(null)
  }

  if (selectedAppointment && bookingQuantity !== null) {
    return (
      <BookingCheckout appointment={selectedAppointment} quantity={bookingQuantity} onBack={handleBackFromCheckout} />
    )
  }

  if (selectedAppointment) {
    return (
      <AppointmentDetail
        appointment={selectedAppointment}
        onBack={() => setSelectedAppointment(null)}
        onBook={handleBookAppointment}
      />
    )
  }

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-xl font-bold text-balance sm:text-xl">Appointments</h2>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search appointments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Appointment Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAppointments.map((appointment) => (
          <Card
            key={appointment.testNo}
            className="cursor-pointer overflow-hidden shadow-md transition-shadow hover:shadow-lg"
            onClick={() => setSelectedAppointment(appointment)}
          >
            <div className="aspect-video w-full overflow-hidden bg-muted">
              <img
                src={appointment.testImage || "/placeholder.svg"}
                alt={appointment.testName}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg leading-tight text-balance uppercase">{appointment.testName}</h3>
              <p className="mt-2 text-[#FBAE24] font-bold">
                {appointment.price.toLocaleString()} {appointment.currencySymbol}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">No appointments found matching your search.</p>
      )}
    </div>
  )
}
