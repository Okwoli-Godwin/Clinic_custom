"use client"

import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Smartphone, X } from "lucide-react"
import { useState } from "react"
import img from "../assets/playstore.png"
import img2 from "../assets/apple.png"

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
                className="w-[150px] cursor-pointer h-[50px] text-[#fff] hover:bg-[#000] hover:text-[#fff] bg-[#000]"
                onClick={() => window.open("https://play.google.com/store/apps/details?id=com.sanni9407.lifelineclinics", "_blank")}
              >
                <img src={img} alt="" className="h-[25px]"/>
                Google Play
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-[150px] cursor-pointer h-[50px] hover:bg-[#000] text-[#fff] hover:text-[#fff] bg-[#000]"
                onClick={() => window.open("https://apps.apple.com/rw/app/lifeline-clinics/id6749456432", "_blank")}
              >
                <img src={img2} alt="" className="h-[35px]"/>
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
