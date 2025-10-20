"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { MapPin, Building2, MessageSquare, Copy, Info } from "lucide-react"
import { Card } from "../components/ui/card"
import { ReviewsSection } from "./reviews-section"
import { AppointmentsSection } from "../components/appointments-section"
import { useClinicStore } from "../store/clinic-store"
import { INSURANCE_OPTIONS, insuranceImages } from "../store/insurance_option"

const scrollbarHideStyles = `
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`

const DELIVERY_METHOD_NAMES = {
  0: "Home Service",
  1: "In-Person",
  2: "Online Session",
}

export function ClinicProfile() {
  const { clinicSlug } = useParams<{ clinicSlug: string }>()
  const navigate = useNavigate()
  const { clinicData, isLoading, error, fetchClinicData, discountCodes, discountCodesLoading, fetchDiscountCodes } =
    useClinicStore()
  const [showFullBio, setShowFullBio] = useState(false)
  const insuranceScrollRef = useRef<HTMLDivElement>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const capitalize = (str: string) => {
    if (!str) return ""
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  useEffect(() => {
    if (!clinicSlug || clinicSlug.trim() === "") {
      navigate("/", { replace: true })
      return
    }
    fetchClinicData(clinicSlug)
  }, [clinicSlug, fetchClinicData, navigate])

  useEffect(() => {
    if (clinicData?.clinicId) {
      fetchDiscountCodes(clinicData.clinicId)
    }
  }, [clinicData?.clinicId, fetchDiscountCodes])

  if (isLoading) {
    return (
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading clinic information...</p>
        </div>
      </div>
    )
  }

  if (error || !clinicData) {
    navigate("/not-found", { replace: true })
    return null
  }

  const bioText =
    clinicData.bio ||
    "This clinic has been serving the community with dedication for many years, offering a wide range of medical services including primary care..."
  const shouldTruncate = bioText.length > 150
  const displayBio = showFullBio || !shouldTruncate ? bioText : `${bioText.substring(0, 150)}...`

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const supportedInsurance = clinicData?.supportInsurance
    ?.map((id) => INSURANCE_OPTIONS.find((opt) => opt.id === id)?.name)
    ?.filter((name): name is string => Boolean(name))

  const deliveryMethods = Array.isArray(clinicData?.deliveryMethods)
    ? clinicData.deliveryMethods.map(
        (method) => DELIVERY_METHOD_NAMES[Number(method) as keyof typeof DELIVERY_METHOD_NAMES] || method,
      )
    : []

  const languagesSpoken = Array.isArray(clinicData?.languages)
    ? clinicData.languages.map((lang) => lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase())
    : []

  return (
    <>
      <style>{scrollbarHideStyles}</style>

      <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
            <AvatarImage src={clinicData.avatar || "/placeholder.svg"} alt={clinicData.clinicName} className="object-cover"/>
            <AvatarFallback className="bg-[#FBAE24] text-2xl text-white sm:text-3xl">
              {clinicData.clinicName?.substring(0, 2).toUpperCase() || "CL"}
            </AvatarFallback>
          </Avatar>

          <h1 className="mt-4 font-bold text-2xl text-foreground sm:text-3xl">{capitalize(clinicData.clinicName)}</h1>

          <p className="mt-1 text-sm text-muted-foreground">@{capitalize(clinicData.username || "clinic_user")}</p>

          <Badge
            className={`mt-3 px-6 py-1 text-sm font-medium rounded-full ${
              clinicData.onlineStatus === "online"
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {clinicData.onlineStatus === "online" ? "Online" : "Offline"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {/* About Section */}
          <Card className="p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#FBAE24]/10 p-2 flex-shrink-0">
                <Info className="h-5 w-5 text-[#FBAE24]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{displayBio}</p>
                {shouldTruncate && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="mt-2 text-sm text-[#FBAE24] hover:text-[#e09d1f] font-medium"
                  >
                    {showFullBio ? "Read less" : "Read more >"}
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* Languages Spoken Section */}
          <Card className="p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#FBAE24]/10 p-2 flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-[#FBAE24]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-3">Languages Spoken</h3>
                <div className="flex flex-wrap gap-2">
                  {languagesSpoken.length > 0 ? (
                    languagesSpoken.map((language: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                        {language}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No languages added yet</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Address Section */}
          <Card className="p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#FBAE24]/10 p-2 flex-shrink-0">
                <MapPin className="h-5 w-5 text-[#FBAE24]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Address</h3>
                <p className="text-sm text-muted-foreground">
                  {clinicData.location?.street}, {clinicData.location?.cityOrDistrict},{" "}
                  {clinicData.location?.stateOrProvince}, {clinicData.country}
                </p>
              </div>
            </div>
          </Card>

          {/* Delivery Methods Section */}
          <Card className="p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#FBAE24]/10 p-2 flex-shrink-0">
                <Building2 className="h-5 w-5 text-[#FBAE24]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-3">Delivery Methods</h3>
                <div className="flex flex-wrap gap-2">
                  {deliveryMethods.length > 0 ? (
                    deliveryMethods.map((method) => (
                      <Badge key={method} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                        {method}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No delivery methods added yet</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Supported Insurance Section */}
        <div className="mb-12">
          <h2 className="font-bold text-[18px] sm:text-[20px] mb-6 text-center">Supported Insurance</h2>

          {supportedInsurance && supportedInsurance.length > 0 ? (
            <div className="relative w-full">
              <div
                ref={insuranceScrollRef}
                className="flex gap-4 overflow-x-auto pb-4 scroll-smooth hide-scrollbar"
                style={{ scrollBehavior: "smooth" }}
              >
                {supportedInsurance.map((insurance: string, index: number) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-60 sm:w-80 border-2 h-[70px] border-[#FBAE24] rounded-lg sm:p-2 p-1 flex items-center gap-4 bg-white transition-colors"
                  >
                    {/* Image on the left */}
                    <div className="flex-shrink-0 h-20 w-20 flex items-center justify-center">
                      <img
                        src={insuranceImages[insurance as keyof typeof insuranceImages] || "/placeholder.svg"}
                        alt={insurance}
                        className="object-contain h-full w-full p-2"
                      />
                    </div>

                    {/* Name on the right */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-semibold text-gray-800 break-words">
                        {insurance.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">No supported insurance listed.</p>
          )}
        </div>

        {/* Active Discount Codes */}
        <div className="mb-12">
          <h2 className="font-bold text-[18px] text-center sm:text-left sm:text-[20px] mb-4">Active Discount Codes</h2>
          {discountCodesLoading ? (
            <div className="bg-green-50/50 rounded-2xl p-4 border border-green-100">
              <p className="text-center text-sm text-muted-foreground">Loading discount codes...</p>
            </div>
          ) : discountCodes && discountCodes.length > 0 ? (
            <div className="bg-green-50/50 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border border-green-100">
              {discountCodes.map((discountCode, index) => (
                <Card key={index} className="p-4 bg-white border-green-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-foreground">{discountCode.code}</span>
                        <Badge className="bg-green-500 text-white text-xs hover:bg-green-500">
                          {discountCode.discount}% off
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Valid until {discountCode.validUntil}</p>
                      {discountCode.description && (
                        <p className="text-xs text-muted-foreground mt-1">{discountCode.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleCopyCode(discountCode.code)}
                      className={`transition-all duration-200 flex-shrink-0 ${
                        copiedCode === discountCode.code
                          ? "text-green-600"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title={copiedCode === discountCode.code ? "Copied!" : "Copy code"}
                    >
                      {copiedCode === discountCode.code ? (
                        <span className="text-xs font-medium">✓ Copied</span>
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-green-50/50 rounded-2xl p-4 border border-green-100">
              <p className="text-center text-sm text-muted-foreground">
                No active discount codes available at this time.
              </p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <ReviewsSection reviews={clinicData.reviews} />

        {/* Tests/Appointments Section */}
        <AppointmentsSection tests={clinicData.tests} />
      </div>
    </>
  )
}
