"use client"

import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Smartphone, X } from "lucide-react"
import { useState } from "react"

export function AppDownloadBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden border-[#FBAE24]/20 bg-gradient-to-r from-[#FBAE24]/5 via-[#FBAE24]/10 to-[#FBAE24]/5 shadow-lg">
          {/* </CHANGE> */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-2 top-2 rounded-full p-1 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FBAE24]/10">
                <Smartphone className="h-6 w-6 text-[#FBAE24]" />
              </div>
              {/* </CHANGE> */}
              <div className="text-center sm:text-left">
                <p className="font-semibold">For a better experience, download our mobile app</p>
                <p className="text-sm text-muted-foreground">Book appointments, manage your health records, and more</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-[#FBAE24] text-[#FBAE24] hover:bg-[#FBAE24] hover:text-white bg-transparent"
                onClick={() => window.open("https://play.google.com/store/apps/details?id=com.sanni9407.lifelineclinics", "_blank")}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                Google Play
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-[#FBAE24] text-[#FBAE24] hover:bg-[#FBAE24] hover:text-white bg-transparent"
                onClick={() => window.open("https://apps.apple.com/rw/app/lifeline-clinics/id6749456432", "_blank")}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
                App Store
              </Button>
              {/* </CHANGE> */}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
