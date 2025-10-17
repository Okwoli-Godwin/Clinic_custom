"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { MapPin, Building2, MessageSquare, Copy, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "../components/ui/card"
import { ReviewsSection } from "./reviews-section"
import { AppointmentsSection } from "../components/appointments-section"
import { useClinicStore } from "../store/clinic-store"
import { INSURANCE_OPTIONS, insuranceImages } from "../store/insurance_option"
import useEmblaCarousel from "embla-carousel-react"

const DELIVERY_METHOD_NAMES = {
  0: "Home Service",
  1: "In-Person",
  2: "Online Session",
}

export function ClinicProfile() {
  const { clinicSlug } = useParams<{ clinicSlug: string }>()
  const navigate = useNavigate()
  const { clinicData, isLoading, error, fetchClinicData } = useClinicStore()
  const [showFullBio, setShowFullBio] = useState(false)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: true,
    slidesToScroll: 1,
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    if (!clinicSlug || clinicSlug.trim() === "") {
      navigate("/", { replace: true })
      return
    }
    fetchClinicData(clinicSlug)
  }, [clinicSlug, fetchClinicData, navigate])

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
    }

    emblaApi.on("init", onSelect)
    emblaApi.on("reInit", onSelect)
    emblaApi.on("select", onSelect)

    return () => {
      emblaApi.off("init", onSelect)
      emblaApi.off("reInit", onSelect)
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const autoplay = setInterval(() => {
      emblaApi.scrollNext()
    }, 4000)

    return () => clearInterval(autoplay)
  }, [emblaApi])

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
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
          <AvatarImage src={clinicData.avatar || "/placeholder.svg"} alt={clinicData.clinicName} />
          <AvatarFallback className="bg-[#FBAE24] text-2xl text-white sm:text-3xl">
            {clinicData.clinicName?.substring(0, 2).toUpperCase() || "CL"}
          </AvatarFallback>
        </Avatar>

        <h1 className="mt-4 font-bold text-2xl text-foreground sm:text-3xl">{clinicData.clinicName}</h1>

        <p className="mt-1 text-sm text-muted-foreground">@{clinicData.username || "clinic_user"}</p>

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

      {/* Address Section */}
      <Card className="mb-4 p-4 shadow-sm">
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
      <Card className="mb-4 p-4 shadow-sm">
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

      {/* Languages Spoken Section */}
      <Card className="mb-4 p-4 shadow-sm">
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

      {/* About Section */}
      <Card className="mb-4 p-4 shadow-sm">
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

      {/* ✅ Supported Insurance Section */}
      <div className="mb-12 flex flex-col items-center">
        <h2 className="font-bold text-[18px] sm:text-[20px] mb-4 text-center">Supported Insurance</h2>

        {supportedInsurance && supportedInsurance.length > 0 ? (
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-6 sm:gap-8 justify-center">
                {supportedInsurance.map((insurance: string, index: number) => (
                  <div key={index} className="flex-shrink-0 w-24 sm:w-28 flex flex-col items-center justify-center">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg">
                      <AvatarImage
                        src={insuranceImages[insurance as keyof typeof insuranceImages] || "/placeholder.svg"}
                        alt={insurance}
                        className="object-contain"
                      />
                      <AvatarFallback className="bg-gray-50 text-gray-700 font-bold">
                        {insurance.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs sm:text-sm font-medium text-gray-800 mt-2 text-center line-clamp-2">
                      {insurance.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {supportedInsurance.length > 4 && (
              <>
                <button
                  onClick={() => emblaApi?.scrollPrev()}
                  disabled={!canScrollPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 bg-white rounded-full p-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous insurance"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={() => emblaApi?.scrollNext()}
                  disabled={!canScrollNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 bg-white rounded-full p-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Next insurance"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>
              </>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">No supported insurance listed.</p>
        )}
      </div>

      {/* Active Discount Codes */}
      <div className="mb-12">
        <h2 className="font-bold text-[18px] text-center sm:text-left sm:text-[20px] mb-4">Active Discount Codes</h2>
        <div className="bg-green-50/50 rounded-2xl p-4 space-y-3 border border-green-100">
          <Card className="p-4 bg-white border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-foreground">HEALTH20</span>
                  <Badge className="bg-green-500 text-white text-xs hover:bg-green-500">10% off</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Valid until Sep 3</p>
              </div>
              <button
                onClick={() => handleCopyCode("HEALTH20")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </Card>

          <Card className="p-4 bg-white border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-foreground">FAICALI5</span>
                  <Badge className="bg-green-500 text-white text-xs hover:bg-green-500">10% off</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Valid until Aug 30</p>
              </div>
              <button
                onClick={() => handleCopyCode("FAICALI5")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewsSection reviews={clinicData.reviews} />

      {/* Tests/Appointments Section */}
      <AppointmentsSection tests={clinicData.tests} />
    </div>
  )
}
