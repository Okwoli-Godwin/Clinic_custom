import { Globe } from "lucide-react"
import { Badge } from "./ui/badge"

interface LanguagesSectionProps {
  languages: string[]
}

export function LanguagesSection({ languages }: LanguagesSectionProps) {
  // Default languages if none provided
  const displayLanguages = languages.length > 0 ? languages : ["English", "French", "Kinyarwanda"]

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-6 w-6 text-[#FBAE24]" />
        <h2 className="font-serif text-2xl font-bold text-foreground">Available Languages</h2>
      </div>

      <p className="text-muted-foreground mb-4 leading-relaxed">
        Select your preferred language for consultations. This helps us match you with healthcare providers who can
        communicate in your language.
      </p>

      <div className="flex flex-wrap gap-3">
        {displayLanguages.map((language, index) => (
          <Badge
            key={index}
            variant="outline"
            className="px-4 py-2 text-sm font-medium border-[#FBAE24] text-[#FBAE24] hover:bg-[#FBAE24] hover:text-white transition-colors cursor-pointer"
          >
            {language}
          </Badge>
        ))}
      </div>
    </div>
  )
}
