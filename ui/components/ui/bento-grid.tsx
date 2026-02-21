"use client"

import { ReactNode } from "react"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface BentoGridProps {
  children: ReactNode
  className?: string
}

interface BentoCardProps {
  name: ReactNode
  className?: string
  background?: ReactNode
  Icon: React.ElementType
  description: string
  href: string
  cta: string
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full gap-3 lg:grid-rows-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  ...props
}: BentoCardProps) => (
  <a
    href={href}
    key={typeof name === "string" ? name : "card"}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-900/70",
      className
    )}
    {...props}
  >
    {background}
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-0.5 p-4 transition-all duration-300 group-hover:-translate-y-6">
      <Icon className="h-8 w-8 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75" />
      <h3 className="text-base font-semibold text-neutral-300 transition-all duration-300 group-hover:text-white">
        {name}
      </h3>
      <p className="max-w-md text-sm text-neutral-400 leading-snug">{description}</p>
    </div>

    <div className="pointer-events-none absolute bottom-0 flex w-full translate-y-8 transform-gpu flex-row items-center p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
      <button className="pointer-events-auto rounded-md bg-neutral-950 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800">
        {cta}
        <ArrowRight className="ml-1 h-3.5 w-3.5 inline" />
      </button>
    </div>
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/3 group-hover:dark:bg-neutral-800/10" />
  </a>
)

export { BentoCard, BentoGrid }
