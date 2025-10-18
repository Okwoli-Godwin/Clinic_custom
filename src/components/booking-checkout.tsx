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
  Banknote,
  CheckCircle2,
  Smartphone,
  Home,
  Users2,
  Video,
} from "lucide-react"
import { Calendar } from "./ui/calendar"
import { Alert, AlertDescription } from "./ui/alert"
import { useClinicStore } from "../store/clinic-store"
import img from "../assets/playstore.png"
import img2 from "../assets/apple.png"

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

const DELIVERY_METHOD_NAMES = {
  0: "Home Service",
  1: "In-Person",
  2: "Online Session",
}

const DELIVERY_METHOD_ICONS = {
  "Home Service": Home,
  "In-Person": Users2,
  "Online Session": Video,
}

export function BookingCheckout({ appointment, quantity, onBack }: BookingCheckoutProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState("") // Added delivery method state
  const [isBooked, setIsBooked] = useState(false)
  const [discountCode, setDiscountCode] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)

  const { clinicData, availableSlots, slotsLoading, fetchAvailableSlots } = useClinicStore()

  const pricePerPerson = appointment.price
  const subtotal = pricePerPerson * quantity
  const totalPrice = subtotal - discountAmount

  const capitalize = (str: string) => {
    if (!str) return ""
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  const availableDeliveryMethods = Array.isArray(clinicData?.deliveryMethods)
    ? clinicData.deliveryMethods.map(
        (method) => DELIVERY_METHOD_NAMES[Number(method) as keyof typeof DELIVERY_METHOD_NAMES] || method,
      )
    : []

  const handleApplyDiscount = () => {
    if (discountCode.toUpperCase() === "SAVE10") {
      setDiscountAmount(subtotal * 0.1) // 10% discount
    } else if (discountCode.toUpperCase() === "SAVE20") {
      setDiscountAmount(subtotal * 0.2) // 20% discount
    } else {
      setDiscountAmount(0)
      alert("Invalid discount code")
    }
  }

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
              <strong>Delivery Method:</strong> {selectedDeliveryMethod}
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
            <h3 className="text-xl font-bold mb-2">{capitalize(appointment.testName)}</h3>
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

              {selectedDeliveryMethod === "Home Service" && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Delivery</span>
                    <span className="font-semibold">0 {appointment.currencySymbol}</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic">*Delivery fee may apply (varies by clinic)</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Banknote className="h-4 w-4" />
                  <span>Price per Person</span>
                </div>
                <span className="font-semibold">
                  {pricePerPerson.toLocaleString()} {appointment.currencySymbol}
                </span>
              </div>

              <div className="border-t pt-3">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Apply Discount Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1 rounded-lg border border-border h-[40px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FBAE24]"
                  />
                  <Button
                    size="sm"
                    onClick={handleApplyDiscount}
                    className="bg-[#FBAE24] h-[40px] hover:bg-[#FBAE24]/90 text-white"
                  >
                    Apply
                  </Button>
                </div>
                {discountAmount > 0 && (
                  <p className="text-xs text-green-600 mt-2">
                    Discount: -{discountAmount.toLocaleString()} {appointment.currencySymbol}
                  </p>
                )}
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
                className="rounded-md border cursor-pointer"
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

          <Card className="p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-4">Select Delivery Method</h3>
            {availableDeliveryMethods.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No delivery methods available</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3">
                {availableDeliveryMethods.map((method) => {
                  const IconComponent = DELIVERY_METHOD_ICONS[method as keyof typeof DELIVERY_METHOD_ICONS]
                  return (
                    <button
                      key={method}
                      onClick={() => setSelectedDeliveryMethod(method)}
                      className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 sm:p-6 transition-all ${
                        selectedDeliveryMethod === method
                          ? "border-[#FBAE24] bg-[#FBAE24]/10"
                          : "border-border hover:border-[#FBAE24]/50"
                      }`}
                    >
                      <div
                        className={`rounded-full p-2 sm:p-3 ${
                          selectedDeliveryMethod === method
                            ? "bg-[#FBAE24] text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {IconComponent && <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-center text-foreground">{method}</span>
                    </button>
                  )
                })}
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
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="w-full sm:w-[250px] cursor-pointer h-[50px] bg-[#000] text-white hover:bg-[#000]"
                  size="lg"
                  onClick={() =>
                    window.open("https://play.google.com/store/apps/details?id=com.sanni9407.lifelineclinics", "_blank")
                  }
                >
                  <img src={img || "/placeholder.svg"} alt="" className="h-[25px]" />
                  Download on Google Play
                </Button>
                <Button
                  className="w-full sm:w-[250px] cursor-pointer h-[50px] bg-foreground text-background hover:bg-[#000]"
                  size="lg"
                  onClick={() => window.open("https://apps.apple.com/rw/app/lifeline-clinics/id6749456432", "_blank")}
                >
                  <img src={img2 || "/placeholder.svg"} alt="" className="h-[35px]" />
                  Download on App Store
                </Button>
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
                {paymentMethod === "mobile" && (
                  <p className="text-xs text-muted-foreground italic ml-10 -mt-2">
                    *Only Rwanda phone numbers are accepted
                  </p>
                )}
              </div>
            </RadioGroup>
          </Card>

          {/* Confirm button */}
          <Button
            size="lg"
            className="w-full bg-[#FBAE24] text-white hover:bg-[#FBAE24]/90 shadow-lg"
            onClick={() => setIsBooked(true)}
            disabled={!selectedDate || !selectedTime || !paymentMethod || !selectedDeliveryMethod}
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  )
}
