"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { ImageIcon, FileText, X, AlertCircle, CheckCircle, Clock } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useClinicStore } from "../store/clinic-store"

interface PaymentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  paymentData: {
    transactionId: string
    phoneNumber: string
    email: string
    amount: number
    finalAmount: number
    discount?: {
      code: string
      percentage: number
      discountAmount: number
      expiresAt: string
    }
    deliveryMethod: number
    deliveryAddress?: {
      address: string
      cityOrDistrict: string
      phoneNo: string
    }
    scheduledAt: string
  }
  appointmentDetails: {
    testName: string
    currencySymbol: string
  }
}

const DELIVERY_METHOD_NAMES = {
  0: "Home Service",
  1: "In-Person",
  2: "Online Session",
}

const formatCorrespondent = (correspondent: string): string => {
  const correspondentMap: { [key: string]: string } = {
    MTN_MOMO_RWA: "MTN Mobile Money",
    AIRTEL_MONEY_RWA: "Airtel Money",
    EQUITY_BANK_RWA: "Equity Bank",
  }
  return correspondentMap[correspondent] || correspondent
}

const getStatusConfig = (status: string) => {
  const statusMap: {
    [key: string]: { color: string; bgColor: string; icon: React.ReactNode; label: string }
  } = {
    SUCCESS: {
      color: "text-green-700",
      bgColor: "bg-green-50",
      icon: <CheckCircle className="h-5 w-5" />,
      label: "Payment Successful",
    },
    FAILED: {
      color: "text-red-700",
      bgColor: "bg-red-50",
      icon: <AlertCircle className="h-5 w-5" />,
      label: "Payment Failed",
    },
    PENDING: {
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
      icon: <Clock className="h-5 w-5" />,
      label: "Payment Pending",
    },
  }
  return statusMap[status] || statusMap.PENDING
}

const applySafeColors = () => {
  const original = document.documentElement.style.cssText
  document.documentElement.style.cssText += `
    --background: #ffffff;
    --foreground: #000000;
    --muted: #f9fafb;
    --muted-foreground: #6b7280;
    --border: #e5e7eb;
    --input: #e5e7eb;
    --primary: #FBAE24;
    --primary-foreground: #ffffff;
  `
  return original
}

export function PaymentDetailsModal({ isOpen, onClose, paymentData, appointmentDetails }: PaymentDetailsModalProps) {
  const [isExporting, setIsExporting] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pawapayDetails, setPawapayDetails] = useState<any>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState("")
  const [exportError, setExportError] = useState("")
  const contentRef = useRef<HTMLDivElement>(null)
  const { getPaymentDetails, clinicData } = useClinicStore()

  useEffect(() => {
    if (isOpen && paymentData.transactionId) {
      fetchPaymentDetails()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, paymentData.transactionId])

  const fetchPaymentDetails = async () => {
    setIsLoadingDetails(true)
    setDetailsError("")
    try {
      const result = await getPaymentDetails(paymentData.transactionId)
      if (result.success && result.data) {
        const details = Array.isArray(result.data) ? result.data[0] : result.data
        setPawapayDetails(details)
      } else {
        setDetailsError(result.message || "Failed to fetch payment details")
      }
    } catch (error) {
      setDetailsError("Error fetching payment details")
      console.error("[v0] Error fetching payment details:", error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!contentRef.current) {
      setExportError("Content not found")
      return
    }

    setIsExporting(true)
    setExportError("")
    try {
      // ✅ TEMP FIX: safe color override to handle OKLCH color crash
      const originalStyles = applySafeColors()

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowHeight: contentRef.current.scrollHeight,
        windowWidth: contentRef.current.scrollWidth,
      })

      // ✅ Restore original colors
      document.documentElement.style.cssText = originalStyles

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= 297

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= 297
      }

      pdf.save(`payment-receipt-${paymentData.transactionId}.pdf`)
    } catch (error) {
      console.error("[v0] Error generating PDF:", error)
      setExportError("Failed to generate PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadImage = async () => {
    if (!contentRef.current) {
      setExportError("Content not found")
      return
    }

    setIsExporting(true)
    setExportError("")
    try {
      // ✅ TEMP FIX: safe color override to handle OKLCH color crash
      const originalStyles = applySafeColors()

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowHeight: contentRef.current.scrollHeight,
        windowWidth: contentRef.current.scrollWidth,
      })

      // ✅ Restore original colors
      document.documentElement.style.cssText = originalStyles

      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/png")
      link.download = `payment-receipt-${paymentData.transactionId}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("[v0] Error generating image:", error)
      setExportError("Failed to generate image. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const statusConfig = pawapayDetails ? getStatusConfig(pawapayDetails.status) : getStatusConfig("PENDING")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-full sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl sm:text-2xl">Payment Receipt</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Your payment details and receipt information
          </DialogDescription>
        </DialogHeader>

        {/* Loading state */}
        {isLoadingDetails && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FBAE24] mx-auto mb-2"></div>
              <p className="text-xs sm:text-sm text-muted-foreground">Fetching payment details...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {detailsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4">
            <p className="text-xs sm:text-sm text-red-700">{detailsError}</p>
          </div>
        )}

        {exportError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4">
            <p className="text-xs sm:text-sm text-red-700">{exportError}</p>
          </div>
        )}

        {/* Content to be exported */}
        {!isLoadingDetails && (
          <div
            ref={contentRef}
            className="bg-white p-4 sm:p-6 md:p-8 rounded-lg space-y-4 sm:space-y-6"
            style={{
              backgroundColor: "#ffffff",
              color: "#000000",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {/* Clinic logo and name header */}
            <div className="text-center border-b pb-4 sm:pb-6" style={{ borderColor: "#e5e7eb" }}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <img
                  src={clinicData?.avatar || "/placeholder-logo.svg"}
                  alt={clinicData?.clinicName || "Clinic Logo"}
                  className="h-10 sm:h-12 w-auto rounded-full"
                  style={{ maxHeight: "60px", objectFit: "cover" }}
                />
                <div className="text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#FBAE24" }}>
                    {clinicData?.clinicName || "Lifeline Clinics"}
                  </h1>
                  {/* <p className="text-xs sm:text-sm" style={{ color: "#6b7280" }}>
                    Professional Healthcare Services
                  </p> */}
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-3 sm:mt-4" style={{ color: "#000000" }}>
                Payment Receipt
              </h2>
            </div>

            {/* Header */}
            <div className="text-center border-b pb-3 sm:pb-4" style={{ borderColor: "#e5e7eb" }}>
              <p className="text-xs sm:text-sm" style={{ color: "#6b7280" }}>
                Receipt Number: {paymentData.transactionId.substring(0, 8).toUpperCase()}
              </p>
            </div>

            {/* Transaction ID */}
            <div
              className="p-3 sm:p-4 rounded-lg border"
              style={{ backgroundColor: "#eff6ff", borderColor: "#93c5fd" }}
            >
              <p className="text-xs mb-1" style={{ color: "#6b7280" }}>
                Transaction ID
              </p>
              <p className="font-mono text-sm sm:text-lg font-bold break-all" style={{ color: "#1e3a8a" }}>
                {paymentData.transactionId}
              </p>
            </div>

            {/* Status and Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div
                className="p-3 sm:p-4 rounded-lg border"
                style={{
                  backgroundColor:
                    statusConfig.bgColor === "bg-green-50"
                      ? "#f0fdf4"
                      : statusConfig.bgColor === "bg-red-50"
                        ? "#fef2f2"
                        : "#fef3c7",
                  borderColor:
                    statusConfig.bgColor === "bg-green-50"
                      ? "#86efac"
                      : statusConfig.bgColor === "bg-red-50"
                        ? "#fecaca"
                        : "#fde047",
                }}
              >
                <p className="text-xs mb-2 flex items-center gap-2" style={{ color: "#6b7280" }}>
                  <span
                    style={{
                      color:
                        statusConfig.color === "text-green-700"
                          ? "#15803d"
                          : statusConfig.color === "text-red-700"
                            ? "#b91c1c"
                            : "#b45309",
                    }}
                  >
                    {statusConfig.icon}
                  </span>
                  Payment Status
                </p>
                <p
                  className="font-semibold text-sm sm:text-base"
                  style={{
                    color:
                      statusConfig.color === "text-green-700"
                        ? "#15803d"
                        : statusConfig.color === "text-red-700"
                          ? "#b91c1c"
                          : "#b45309",
                  }}
                >
                  {pawapayDetails?.status || "PENDING"}
                </p>
                <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
                  {statusConfig.label}
                </p>
              </div>
              {/* <div
                className="p-3 sm:p-4 rounded-lg border"
                style={{ backgroundColor: "#f3e8ff", borderColor: "#d8b4fe" }}
              >
                <p className="text-xs mb-1" style={{ color: "#6b7280" }}>
                  Date & Time
                </p>
                <p className="font-semibold text-xs sm:text-sm" style={{ color: "#6b21a8" }}>
                  {new Date(paymentData.scheduledAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div> */}
            </div>

            {pawapayDetails && (
              <div style={{ borderTopColor: "#e5e7eb", borderTopWidth: "1px", paddingTop: "12px" }}>
                <h3 className="font-semibold text-base sm:text-lg mb-3" style={{ color: "#FBAE24" }}>
                  Payment Method Details
                </h3>
                <div
                  className="space-y-2 text-xs sm:text-sm p-3 sm:p-4 rounded-lg"
                  style={{ backgroundColor: "#f9fafb" }}
                >
                  <p>
                    <strong>Payment Method:</strong> {formatCorrespondent(pawapayDetails.correspondent)}
                  </p>
                  <p>
                    <strong>Payer Phone:</strong> {pawapayDetails.payer?.address?.value}
                  </p>
                  <p>
                    <strong>Currency:</strong> {pawapayDetails.currency}
                  </p>
                  <p>
                    <strong>Country:</strong> {pawapayDetails.country}
                  </p>
                  <p>
                    <strong>Payment Initiated:</strong>{" "}
                    {new Date(pawapayDetails.created).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}

            {pawapayDetails?.failureReason && (
              <div
                className="p-3 sm:p-4 rounded-lg border"
                style={{
                  backgroundColor: "#fef2f2",
                  borderColor: "#fecaca",
                  borderTopWidth: "1px",
                  paddingTop: "12px",
                }}
              >
                <h3 className="font-semibold text-base sm:text-lg mb-3" style={{ color: "#b91c1c" }}>
                  Failure Details
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <p>
                    <strong>Failure Code:</strong> {pawapayDetails.failureReason.failureCode}
                  </p>
                  <p>
                    <strong>Failure Message:</strong> {pawapayDetails.failureReason.failureMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div style={{ borderTopColor: "#e5e7eb", borderTopWidth: "1px", paddingTop: "12px" }}>
              <h3 className="font-semibold text-base sm:text-lg mb-3" style={{ color: "#FBAE24" }}>
                Contact Information
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <p>
                  <strong>Phone Number:</strong> {paymentData.phoneNumber}
                </p>
                <p>
                  <strong>Email:</strong> {paymentData.email}
                </p>
              </div>
            </div>

            {/* Amount Details */}
            <div style={{ borderTopColor: "#e5e7eb", borderTopWidth: "1px", paddingTop: "12px" }}>
              <h3 className="font-semibold text-base sm:text-lg mb-3" style={{ color: "#FBAE24" }}>
                Amount Details
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span>Original Amount:</span>
                  <span className="font-semibold">
                    {paymentData.amount?.toLocaleString()} {appointmentDetails.currencySymbol}
                  </span>
                </div>

                {paymentData.discount && (
                  <>
                    <div className="flex justify-between" style={{ color: "#1d4ed8" }}>
                      <span>Discount Code:</span>
                      <span className="font-semibold px-2 py-1 rounded text-xs" style={{ backgroundColor: "#dbeafe" }}>
                        {paymentData.discount.code}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount Percentage:</span>
                      <span className="font-semibold">{paymentData.discount.percentage}%</span>
                    </div>
                    <div className="flex justify-between" style={{ color: "#dc2626" }}>
                      <span>Discount Amount:</span>
                      <span className="font-semibold">
                        -{paymentData.discount.discountAmount?.toLocaleString()} {appointmentDetails.currencySymbol}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: "#6b7280" }}>
                      <span>Discount Expires:</span>
                      <span>{new Date(paymentData.discount.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </>
                )}

                <div
                  className="border-t pt-2 mt-2 flex justify-between text-base sm:text-lg font-bold"
                  style={{ borderTopColor: "#e5e7eb" }}
                >
                  <span>Final Amount:</span>
                  <span style={{ color: "#FBAE24" }}>
                    {paymentData.finalAmount?.toLocaleString()} {appointmentDetails.currencySymbol}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div style={{ borderTopColor: "#e5e7eb", borderTopWidth: "1px", paddingTop: "12px" }}>
              <h3 className="font-semibold text-base sm:text-lg mb-3" style={{ color: "#FBAE24" }}>
                Delivery Information
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <p>
                  <strong>Delivery Method:</strong>{" "}
                  {DELIVERY_METHOD_NAMES[paymentData.deliveryMethod as keyof typeof DELIVERY_METHOD_NAMES] ||
                    paymentData.deliveryMethod}
                </p>

                {paymentData.deliveryAddress && (
                  <>
                    <p>
                      <strong>Address:</strong> {paymentData.deliveryAddress.address}
                    </p>
                    <p>
                      <strong>City/District:</strong> {paymentData.deliveryAddress.cityOrDistrict}
                    </p>
                    <p>
                      <strong>Phone:</strong> {paymentData.deliveryAddress.phoneNo}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Appointment Details */}
            {/* <div style={{ borderTopColor: "#e5e7eb", borderTopWidth: "1px", paddingTop: "12px" }}>
              <h3 className="font-semibold text-base sm:text-lg mb-3" style={{ color: "#FBAE24" }}>
                Appointment Details
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <p>
                  <strong>Service:</strong> {appointmentDetails.testName}
                </p>
                <p>
                  <strong>Scheduled Date & Time:</strong>{" "}
                  {new Date(paymentData.scheduledAt).toLocaleString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div> */}

            {/* Footer */}
            <div
              className="text-center text-xs"
              style={{ borderTopColor: "#e5e7eb", borderTopWidth: "1px", paddingTop: "12px", color: "#6b7280" }}
            >
              <p>Thank you for choosing {clinicData?.clinicName || "Lifeline Clinics"}</p>
              <p className="mt-2">This is an automated receipt. Please keep it for your records.</p>
            </div>
          </div>
        )}

        {/* Export Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 border-t">
          <Button
            onClick={handleDownloadPDF}
            disabled={isExporting || isLoadingDetails}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Download PDF"}
          </Button>
          <Button
            onClick={handleDownloadImage}
            disabled={isExporting || isLoadingDetails}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Download Image"}
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent text-xs sm:text-sm">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
