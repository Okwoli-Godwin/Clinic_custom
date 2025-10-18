


import { AlertCircle} from "lucide-react"


export function NotFound() {


  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-3xl font-bold text-foreground mb-2">Clinic Not Found</h1>

        {/* Error Description */}
        <p className="text-muted-foreground mb-8">
          Sorry, the clinic you're looking for doesn't exist or may have been removed. Please check the URL and try
          again.
        </p>
      </div>
    </div>
  )
}
