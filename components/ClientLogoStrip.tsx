import { SectionReveal } from './SectionReveal'

interface Logo {
  sourceUrl: string
  name: string
}

interface ClientLogoStripProps {
  logos: Logo[]
  className?: string
}

export function ClientLogoStrip({ logos, className = '' }: ClientLogoStripProps) {
  if (!logos || logos.length === 0) return null

  return (
    <div className={className}>
      <SectionReveal className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
        {logos.map((logo, i) => (
          <div key={i} className="flex items-center justify-center p-4 group">
            <img
              src={logo.sourceUrl}
              alt={logo.name}
              className="max-h-[50px] w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
            />
          </div>
        ))}
      </SectionReveal>
    </div>
  )
}
