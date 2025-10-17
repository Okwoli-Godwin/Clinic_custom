"use client"

import { useState } from "react"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Star } from "lucide-react"
import { AppDownloadDialog } from "../components/app-download-dialog"

interface Review {
  reviewNo: number
  rating: number
  comment: string
  patientName: string
}

interface ReviewsSectionProps {
  reviews: Review[]
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [showAppDialog, setShowAppDialog] = useState(false)

  if (reviews.length === 0) {
    return (
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-balance sm:text-xl">Reviews</h2>
          <Button
            variant="outline"
            className="border-[#FBAE24] text-[#FBAE24] hover:bg-[#FBAE24] hover:text-white bg-transparent"
            onClick={() => setShowAppDialog(true)}
          >
            Leave a review
          </Button>
        </div>
        <Card className="p-6 shadow-md sm:p-8">
          <p className="text-center text-muted-foreground">No reviews yet. Be the first to leave a review!</p>
        </Card>
        <AppDownloadDialog open={showAppDialog} onOpenChange={setShowAppDialog} />
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-balance sm:text-xl">Reviews</h2>
          <Button
            variant="outline"
            className="border-[#FBAE24] text-[#FBAE24] hover:bg-[#FBAE24] hover:text-white bg-transparent"
            onClick={() => setShowAppDialog(true)}
          >
            Leave a review
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.reviewNo} className="p-6 shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-lg">{review.patientName}</p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? "fill-[#FBAE24] text-[#FBAE24]" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm">{review.comment}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <AppDownloadDialog open={showAppDialog} onOpenChange={setShowAppDialog} />
    </>
  )
}
