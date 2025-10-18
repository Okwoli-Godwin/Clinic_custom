

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Smartphone, Star } from "lucide-react"
import img from "../assets/playstore.png"
import img2 from "../assets/apple.png"

interface AppDownloadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AppDownloadDialog({ open, onOpenChange }: AppDownloadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FBAE24]/10">
            <Smartphone className="h-8 w-8 text-[#FBAE24]" />
          </div>
          {/* </CHANGE> */}
          <DialogTitle className="text-center text-2xl">Download Our Mobile App</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            To add a review, please download our mobile app and create an account. We highly encourage you to use the
            mobile app for the best experience.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <Button
            className="w-full h-[50px] bg-[#000] cursor-pointer text-white hover:bg-[#000]"
            size="lg"
            onClick={() => window.open("https://play.google.com/store/apps/details?id=com.sanni9407.lifelineclinics", "_blank")}
          >
            <img src={img} alt="" className="h-[25px]"/>
            Download on Google Play
          </Button>

          <Button
            className="w-full h-[50px] bg-foreground cursor-pointer text-background hover:bg-[#000]"
            size="lg"
            onClick={() => window.open("https://apps.apple.com/rw/app/lifeline-clinics/id6749456432", "_blank")}
          >
            <img src={img2} alt="" className="h-[35px]"/>
            Download on App Store
          </Button>
          {/* </CHANGE> */}
        </div>

        <div className="mt-4 rounded-lg bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 fill-[#FBAE24] text-[#FBAE24]" />
            {/* </CHANGE> */}
            <span className="font-semibold">4.9 rating</span>
            <span className="text-muted-foreground">50K+ downloads</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
