"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left text-sm font-medium hover:text-accent transition-colors"
      >
        {title}
        <svg
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            open && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          open ? "max-h-96 pb-4" : "max-h-0"
        )}
      >
        <div className="text-sm text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}

export type AccordionItemData = { title: string; content: React.ReactNode }

export default function Accordion({
  items,
}: {
  items: AccordionItemData[]
}) {
  return (
    <div>
      {items.map((item, i) => (
        <AccordionItem key={i} title={item.title}>
          {item.content}
        </AccordionItem>
      ))}
    </div>
  )
}
