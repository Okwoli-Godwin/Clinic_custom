/* eslint-disable @typescript-eslint/no-explicit-any */
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
  MapPin,
  Mail,
  Phone,
  User,
  Download,
} from "lucide-react"
import { Calendar } from "./ui/calendar"
import { Alert, AlertDescription } from "./ui/alert"
import { useClinicStore } from "../store/clinic-store"
import { PaymentDetailsModal } from "./payment-details-modal"
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
  clinicId: number
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

export function BookingCheckout({ appointment, quantity, clinicId, onBack }: BookingCheckoutProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState("")
  const [isBooked, setIsBooked] = useState(false)
  const [discountCode, setDiscountCode] = useState("")
  const [appliedDiscountCode, setAppliedDiscountCode] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountError, setDiscountError] = useState("")
  const [discountLoading, setDiscountLoading] = useState(false)
  const [discountSuccess, setDiscountSuccess] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState("")
  const [checkoutResponse, setCheckoutResponse] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [cityOrDistrict, setCityOrDistrict] = useState("")

  const {
    clinicData,
    availableSlots,
    slotsLoading,
    fetchAvailabilitySlots,
    applyDiscountCode,
    slotsError,
    createCheckout,
  } = useClinicStore()

  const effectiveClinicId = clinicId || clinicData?.clinicId

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
        (method: any) => DELIVERY_METHOD_NAMES[Number(method) as keyof typeof DELIVERY_METHOD_NAMES] || method,
      )
    : []

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Please enter a discount code")
      return
    }

    if (!clinicData?.clinicId) {
      setDiscountError("Clinic information not available")
      return
    }

    setDiscountLoading(true)
    setDiscountError("")
    setDiscountSuccess(false)

    const result = await applyDiscountCode(clinicData.clinicId, discountCode, subtotal)

    if (result.success && result.discount) {
      const discountValue = (subtotal * result.discount) / 100
      setDiscountAmount(discountValue)
      setAppliedDiscountCode(discountCode)
      setDiscountSuccess(true)
      setDiscountCode("")
      setTimeout(() => setDiscountSuccess(false), 3000)
    } else {
      setDiscountError(result.message || "Invalid discount code")
      setDiscountAmount(0)
      setAppliedDiscountCode("")
    }

    setDiscountLoading(false)
  }

  useEffect(() => {
    if (selectedDate && effectiveClinicId) {
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
      const day = String(selectedDate.getDate()).padStart(2, "0")
      const formattedDate = `${year}-${month}-${day}`

      fetchAvailabilitySlots(effectiveClinicId, formattedDate)
      setSelectedTime("")
    }
  }, [selectedDate, effectiveClinicId, fetchAvailabilitySlots])

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleConfirmBooking = async () => {
    if (!name.trim()) {
      alert("Please enter your name")
      return
    }
    if (!email.trim()) {
      alert("Please enter your email")
      return
    }
    if (!phone.trim()) {
      alert("Please enter your phone number")
      return
    }
    if (selectedDeliveryMethod === "Home Service" && !address.trim()) {
      alert("Please enter your address for home service")
      return
    }
    if (selectedDeliveryMethod === "Home Service" && !cityOrDistrict.trim()) {
      alert("Please enter your city or district for home service")
      return
    }

    setCheckoutLoading(true)
    setCheckoutError("")

    // Map delivery method name to number
    const deliveryMethodMap: { [key: string]: number } = {
      "Home Service": 0,
      "In-Person": 1,
      "Online Session": 2,
    }
    const deliveryMethodNumber = deliveryMethodMap[selectedDeliveryMethod] ?? 1

    let formattedPhone = phone.replace(/\D/g, "") // Remove all non-digits
    if (formattedPhone.startsWith("0")) {
      formattedPhone = formattedPhone.substring(1) // Remove leading 0
    }

    // Format date as YYYY-MM-DD
    const year = selectedDate!.getFullYear()
    const month = String(selectedDate!.getMonth() + 1).padStart(2, "0")
    const day = String(selectedDate!.getDate()).padStart(2, "0")
    const formattedDate = `${year}-${month}-${day}`

    const checkoutData: any = {
      clinicId: effectiveClinicId,
      testNo: appointment.testNo,
      paymentMethod: "pawa_pay",
      phoneNumber: formattedPhone,
      fullName: name,
      email: email,
      deliveryMethod: deliveryMethodNumber,
      date: formattedDate,
      time: selectedTime,
    }

    // Add delivery address if home service
    if (deliveryMethodNumber === 0) {
      checkoutData.deliveryAddress = {
        address: address,
        cityOrDistrict: cityOrDistrict,
        phoneNo: phone,
      }
    }

    if (appliedDiscountCode) {
      checkoutData.discountCode = appliedDiscountCode
    }

    console.log("[v0] Checkout data:", checkoutData)

    const result = await createCheckout(checkoutData)

    if (result.success) {
      console.log("[v0] Checkout successful:", result.data)
      setCheckoutResponse(result.data)
      setIsBooked(true)
    } else {
      setCheckoutError(result.message || "Failed to complete checkout")
      console.log("[v0] Checkout error:", result.message)
    }

    setCheckoutLoading(false)
  }

  useEffect(() => {
    if (isBooked) {
      // Clear any existing error
      setCheckoutError("")
    }
  }, [isBooked])

  const getClinicAddress = () => {
    return clinicData?.address || "123 Clinic Street, Kigali, Rwanda"
  }

  const getOnlineSessionLink = () => {
    return "https://meet.clinic.com/session/" + Math.random().toString(36).substr(2, 9)
  }

  if (isBooked) {
    return (
      <>
        <div className="mb-8">
          <Card className="p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Checkout Successful</h2>
            {/* <p className="text-muted-foreground mb-6">
              Your appointment has been successfully booked. You will receive a confirmation email shortly.
            </p> */}

            <div className="space-y-2 text-left bg-muted/50 p-4 rounded-lg mb-6">
              {/* Payment Response Section */}
              {checkoutResponse && (
                <>
                  <div className="mb-4 pb-4 border-b">
                    <h3 className="font-semibold text-lg text-[#FBAE24] mb-3">Payment Information</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Transaction ID:</strong>{" "}
                        <span className="font-mono text-xs bg-background p-1 rounded">
                          {checkoutResponse.transactionId}
                        </span>
                      </p>
                      <p>
                        <strong>Status:</strong> <span className="text-green-600 font-semibold">Payment Initiated</span>
                      </p>
                      <p>
                        <strong>Phone Number:</strong> {checkoutResponse.phoneNumber}
                      </p>
                      <p>
                        <strong>Email:</strong> {checkoutResponse.email}
                      </p>
                    </div>
                  </div>

                  {/* Amount Section */}
                  <div className="mb-4 pb-4 border-b">
                    <h3 className="font-semibold text-lg text-[#FBAE24] mb-3">Amount Details</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Original Amount:</strong> {checkoutResponse.amount?.toLocaleString()} RWF
                      </p>
                      {checkoutResponse.discount && (
                        <>
                          <p>
                            <strong>Discount Code:</strong>{" "}
                            <span className="bg-blue-100 px-2 py-1 rounded font-semibold">
                              {checkoutResponse.discount.code}
                            </span>
                          </p>
                          <p>
                            <strong>Discount Percentage:</strong> {checkoutResponse.discount.percentage}%
                          </p>
                          <p>
                            <strong>Discount Amount:</strong> -
                            {checkoutResponse.discount.discountAmount?.toLocaleString()} RWF
                          </p>
                          <p>
                            <strong>Discount Expires:</strong>{" "}
                            {new Date(checkoutResponse.discount.expiresAt).toLocaleDateString()}
                          </p>
                        </>
                      )}
                      <p className="border-t pt-2 mt-2">
                        <strong className="text-lg">Final Amount:</strong>{" "}
                        <span className="text-lg font-bold text-[#FBAE24]">
                          {checkoutResponse.finalAmount?.toLocaleString()} RWF
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Delivery Section */}
                  <div className="mb-4 pb-4 border-b">
                    <h3 className="font-semibold text-lg text-[#FBAE24] mb-3">Delivery Information</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Delivery Method:</strong>{" "}
                        {DELIVERY_METHOD_NAMES[checkoutResponse.deliveryMethod as keyof typeof DELIVERY_METHOD_NAMES] ||
                          checkoutResponse.deliveryMethod}
                      </p>
                      {checkoutResponse.deliveryAddress && (
                        <>
                          <p>
                            <strong>Address:</strong> {checkoutResponse.deliveryAddress.address}
                          </p>
                          <p>
                            <strong>City/District:</strong> {checkoutResponse.deliveryAddress.cityOrDistrict}
                          </p>
                          <p>
                            <strong>Phone:</strong> {checkoutResponse.deliveryAddress.phoneNo}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Scheduled Date/Time */}
                  {/* {checkoutResponse.scheduledAt && (
                    <div className="mb-4 pb-4 border-b">
                      <h3 className="font-semibold text-lg text-[#FBAE24] mb-3">Scheduled Appointment</h3>
                      <p className="text-sm">
                        <strong>Date & Time:</strong>{" "}
                        {new Date(checkoutResponse.scheduledAt).toLocaleString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )} */}
                </>
              )}

              {/* Original Booking Details */}
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold text-lg text-[#FBAE24] mb-3">Appointment Details</h3>
                <p>
                  <strong>Appointment:</strong> {appointment.testName}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <p>
                  <strong>Time:</strong> {formatTime(selectedTime)}
                </p>
                <p>
                  <strong>Number of People:</strong> {quantity}
                </p>
                <p>
                  <strong>Delivery Method:</strong> {selectedDeliveryMethod}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-[#FBAE24]" />
                  <strong>Name:</strong>
                </p>
                <p className="ml-6 text-sm">{name}</p>
                <p className="flex items-center gap-2 mb-2 mt-2">
                  <Mail className="h-4 w-4 text-[#FBAE24]" />
                  <strong>Email:</strong>
                </p>
                <p className="ml-6 text-sm">{email}</p>
                <p className="flex items-center gap-2 mb-2 mt-2">
                  <Phone className="h-4 w-4 text-[#FBAE24]" />
                  <strong>Phone:</strong>
                </p>
                <p className="ml-6 text-sm">{phone}</p>
              </div>

              {selectedDeliveryMethod === "Home Service" && (
                <div className="mt-4 pt-4 border-t">
                  <p className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-[#FBAE24]" />
                    <strong>Delivery Address:</strong>
                  </p>
                  <p className="ml-6 text-sm">{address}</p>
                </div>
              )}

              {selectedDeliveryMethod === "In-Person" && (
                <div className="mt-4 pt-4 border-t">
                  <p className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-[#FBAE24]" />
                    <strong>Clinic Address:</strong>
                  </p>
                  <p className="ml-6 text-sm bg-blue-50 p-3 rounded border border-blue-200">{getClinicAddress()}</p>
                </div>
              )}

              {selectedDeliveryMethod === "Online Session" && (
                <div className="mt-4 pt-4 border-t">
                  <p className="flex items-center gap-2 mb-2">
                    <Video className="h-4 w-4 text-[#FBAE24]" />
                    <strong>Session Link:</strong>
                  </p>
                  <p className="ml-6 text-sm bg-purple-50 p-3 rounded border border-purple-200 break-all">
                    {getOnlineSessionLink()}
                  </p>
                </div>
              )}

              {/* <p className="mt-4 pt-4 border-t">
                <strong>Total Amount:</strong> {totalPrice.toLocaleString()} {appointment.currencySymbol}
              </p> */}
            </div>

            <div className="flex gap-3">
              <Button onClick={onBack} className="flex-1 bg-[#FBAE24] hover:bg-[#FBAE24]/90">
                Back to Clinic
              </Button>
              <Button onClick={() => setShowPaymentModal(true)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                View Receipt
              </Button>
            </div>
          </Card>
        </div>

        {checkoutResponse && (
          <PaymentDetailsModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            paymentData={checkoutResponse}
            appointmentDetails={{
              testName: appointment.testName,
              currencySymbol: appointment.currencySymbol,
            }}
          />
        )}
      </>
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
                    disabled={discountLoading}
                    className="flex-1 rounded-lg border border-border h-[40px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FBAE24] disabled:opacity-50"
                  />
                  <Button
                    size="sm"
                    onClick={handleApplyDiscount}
                    disabled={discountLoading}
                    className="bg-[#FBAE24] h-[40px] hover:bg-[#FBAE24]/90 text-white disabled:opacity-50"
                  >
                    {discountLoading ? "Applying..." : "Apply"}
                  </Button>
                </div>
                {discountError && <p className="text-xs text-red-600 mt-2">{discountError}</p>}
                {discountSuccess && (
                  <p className="text-xs text-green-600 mt-2">
                    Discount applied! Saving {discountAmount.toLocaleString()} {appointment.currencySymbol}
                  </p>
                )}
                {discountAmount > 0 && !discountSuccess && (
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
                {slotsError || "No available slots for this date. Please select another date."}
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

          {/* Delivery Method Selection */}
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

          {selectedDeliveryMethod === "Home Service" && (
            <Card className="p-6 shadow-md border-[#FBAE24]/50 bg-[#fff]">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-[#FBAE24]" />
                <h3 className="font-semibold text-lg">Delivery Details</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name-home" className="text-sm font-medium mb-2 block">
                    Full Name
                  </Label>
                  <input
                    id="name-home"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FBAE24]"
                  />
                </div>
                <div>
                  <Label htmlFor="email-home" className="text-sm font-medium mb-2 block">
                    Email Address
                  </Label>
                  <input
                    id="email-home"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FBAE24]"
                  />
                </div>
                <div>
                  <Label htmlFor="phone-home" className="text-sm font-medium mb-2 block">
                    Phone Number
                  </Label>
                  <input
                    id="phone-home"
                    type="tel"
                    placeholder="+250 7XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FBAE24]"
                  />
                </div>
                <div>
                  <Label htmlFor="city-home" className="text-sm font-medium mb-2 block">
                    City or District
                  </Label>
                  <input
                    id="city-home"
                    type="text"
                    placeholder="Gasabo"
                    value={cityOrDistrict}
                    onChange={(e) => setCityOrDistrict(e.target.value)}
                    className="w-full rounded-lg border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FBAE24]"
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-sm font-medium mb-2 block">
                    Delivery Address
                  </Label>
                  <textarea
                    id="address"
                    placeholder="Street address, apartment, city, postal code..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FBAE24] resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          )}

          {selectedDeliveryMethod === "In-Person" && (
            <Card className="p-6 shadow-md border-[#FBAE24]/50 bg-[#fff]">
              <div className="flex items-center gap-2 mb-4">
                <Users2 className="h-5 w-5 text-[#FBAE24]" />
                <h3 className="font-semibold text-lg">Contact Information</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name-inperson" className="text-sm font-medium mb-2 block">
                    Full Name
                  </Label>
                  <input
                    id="name-inperson"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FBAE24]"
                  />
                </div>
                <div>
                  <Label htmlFor="email-inperson" className="text-sm font-medium mb-2 block">
                    Email Address
                  </Label>
                  <input
                    id="email-inperson"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FBAE24]"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    We'll send you the clinic address and appointment details to this email.
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone-inperson" className="text-sm font-medium mb-2 block">
                    Phone Number
                  </Label>
                  <input
                    id="phone-inperson"
                    type="tel"
                    placeholder="+250 7XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FBAE24]"
                  />
                </div>
              </div>
            </Card>
          )}

          {selectedDeliveryMethod === "Online Session" && (
            <Card className="p-6 shadow-md border-[#FBAE24]/50 bg-[#fff]">
              <div className="flex items-center gap-2 mb-4">
                <Video className="h-5 w-5 text-[#FBAE24]" />
                <h3 className="font-semibold text-lg">Contact Information</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name-online" className="text-sm font-medium mb-2 block">
                    Full Name
                  </Label>
                  <input
                    id="name-online"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FBAE24]"
                  />
                </div>
                <div>
                  <Label htmlFor="email-online" className="text-sm font-medium mb-2 block">
                    Email Address
                  </Label>
                  <input
                    id="email-online"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FBAE24]"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    We'll send you the online session link to this email.
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone-online" className="text-sm font-medium mb-2 block">
                    Phone Number
                  </Label>
                  <input
                    id="phone-online"
                    type="tel"
                    placeholder="+250 7XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FBAE24]"
                  />
                </div>
              </div>
            </Card>
          )}

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

          {checkoutError && (
            <Alert className="border-red-500 bg-red-50">
              <AlertDescription className="text-red-700">{checkoutError}</AlertDescription>
            </Alert>
          )}

          <Button
            size="lg"
            className="w-full bg-[#FBAE24] text-white hover:bg-[#FBAE24]/90 shadow-lg"
            onClick={handleConfirmBooking}
            disabled={!selectedDate || !selectedTime || !paymentMethod || !selectedDeliveryMethod || checkoutLoading}
          >
            {checkoutLoading ? "Processing..." : "Confirm Booking"}
          </Button>
        </div>
      </div>
    </div>
  )
}
