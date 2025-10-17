"use client"

import { useState, useEffect } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import {
  CalendarIcon,
  Clock,
  CreditCard,
  Wallet,
  Users,
  DollarSign,
  CheckCircle2,
  Smartphone,
  Download,
} from "lucide-react"
import { Calendar } from "./ui/calendar"
import { Alert, AlertDescription } from "./ui/alert"
import { useClinicStore } from "../store/clinic-store"

interface BookingCheckoutProps {
  appointment: {
    testNo: number
    testName: string
    price: number
    currencySymbol: string
    testImage: string
    description: string
  }
  quantity: number
  onBack: () => void
}

export function BookingCheckout({ appointment, quantity, onBack }: BookingCheckoutProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isBooked, setIsBooked] = useState(false)

  const { clinicData, availableSlots, slotsLoading, fetchAvailableSlots } = useClinicStore()

  const pricePerPerson = appointment.price
  const totalPrice = pricePerPerson * quantity

  useEffect(() => {
    if (selectedDate && clinicData?.username) {
      const formattedDate = selectedDate.toISOString().split("T")[0]
      fetchAvailableSlots(clinicData.username, formattedDate)
      setSelectedTime("")
    }
  }, [selectedDate, clinicData?.username, fetchAvailableSlots])

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (isBooked) {
    return (
      <div className="mb-8">
        <Card className="p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-6">
            Your appointment has been successfully booked. You will receive a confirmation email shortly.
          </p>
          <div className="space-y-2 text-left bg-muted/50 p-4 rounded-lg mb-6">
            <p>
              <strong>Appointment:</strong> {appointment.testName}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <p>
              <strong>Time:</strong> {selectedTime}
            </p>
            <p>
              <strong>Number of People:</strong> {quantity}
            </p>
            <p>
              <strong>Total Amount:</strong> {totalPrice.toLocaleString()} {appointment.currencySymbol}
            </p>
          </div>
          <Button onClick={onBack} className="w-full bg-[#FBAE24] hover:bg-[#FBAE24]/90">
            Back to Clinic
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <Button variant="ghost" onClick={onBack} className="mb-4 -ml-2">
        <CalendarIcon className="mr-2 h-5 w-5" />
        Back
      </Button>

      <h2 className="text-xl font-bold mb-6 sm:text-xl">Booking Details</h2>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left - Appointment Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 shadow-md sticky top-4">
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted mb-4">
              <img
                src={appointment.testImage || "/placeholder.svg"}
                alt={appointment.testName}
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">{appointment.testName}</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {appointment.description || "No description available"}
            </p>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Number of People</span>
                </div>
                <span className="font-semibold">{quantity}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Price per Person</span>
                </div>
                <span className="font-semibold">
                  {pricePerPerson.toLocaleString()} {appointment.currencySymbol}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-semibold">Total Price</span>
                <span className="text-xl font-bold text-[#FBAE24]">
                  {totalPrice.toLocaleString()} {appointment.currencySymbol}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right - Booking Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date selection */}
          <Card className="p-6 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="h-5 w-5 text-[#FBAE24]" />
              <h3 className="font-semibold text-lg">Select Date</h3>
            </div>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-md border"
              />
            </div>
          </Card>

          {/* Time selection */}
          <Card className="p-6 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-[#FBAE24]" />
              <h3 className="font-semibold text-lg">Select Time</h3>
            </div>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground text-center py-8">Please select a date first</p>
            ) : slotsLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading available slots...</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No available slots for this date. Please select another date.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`rounded-lg border-2 p-3 text-center transition-all ${
                      selectedTime === time
                        ? "border-[#FBAE24] bg-[#FBAE24] text-white"
                        : "border-border hover:border-[#FBAE24]"
                    }`}
                  >
                    <p className="text-sm font-medium">{formatTime(time)}</p>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Info alert */}
          <Alert className="border-[#FBAE24] bg-[#FBAE24]/10">
            <Smartphone className="h-4 w-4 text-[#FBAE24]" />
            <AlertDescription className="ml-2">
              <p className="font-semibold text-foreground mb-2">Insurance payments available on mobile app</p>
              <p className="text-sm text-muted-foreground mb-3">
                To pay with insurance, please download our mobile app for a seamless experience.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://apps.apple.com/rw/app/lifeline-clinics/id6749456432"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#FBAE24] hover:underline"
                >
                  <Download className="h-4 w-4" />
                  Download for iOS
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.sanni9407.lifelineclinics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#FBAE24] hover:underline"
                >
                  <Download className="h-4 w-4" />
                  Download for Android
                </a>
              </div>
            </AlertDescription>
          </Alert>

          {/* Payment method */}
          <Card className="p-6 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-[#FBAE24]" />
              <h3 className="font-semibold text-lg">Payment Method</h3>
            </div>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 rounded-lg border-2 p-4 opacity-60 cursor-not-allowed border-border">
                  <RadioGroupItem value="card" id="card" disabled />
                  <Label htmlFor="card" className="flex items-center gap-3 flex-1 cursor-not-allowed">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="font-medium">Credit/Debit Card</span>
                      <span className="ml-2 text-xs text-muted-foreground">(Coming Soon)</span>
                    </div>
                  </Label>
                </div>

                <div
                  className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    paymentMethod === "mobile"
                      ? "border-[#FBAE24] bg-[#FBAE24]/5"
                      : "border-border hover:border-[#FBAE24]/50"
                  }`}
                  onClick={() => setPaymentMethod("mobile")}
                >
                  <RadioGroupItem value="mobile" id="mobile" />
                  <Label htmlFor="mobile" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Mobile Money (PawaPay)</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </Card>

          {/* Confirm button */}
          <Button
            size="lg"
            className="w-full bg-[#FBAE24] text-white hover:bg-[#FBAE24]/90 shadow-lg"
            onClick={() => setIsBooked(true)}
            disabled={!selectedDate || !selectedTime || !paymentMethod}
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  )
}
