import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

// Variantes adaptadas a la tienda: botones rectangulares y sobrios, con altura táctil (44 px o más).
// En archivos .astro se usa buttonVariants() como clase de un enlace.
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-2.5 rounded-[2px] border font-medium tracking-[0.015em] whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-soft)] outline-none select-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border-ink bg-ink text-white hover:border-[#3d3835] hover:bg-[#3d3835]",
        dark: "border-ink bg-ink text-white hover:border-[#3d3835] hover:bg-[#3d3835]",
        outline: "border-ink bg-transparent text-ink hover:bg-ink hover:text-white",
        secondary: "border-transparent bg-sand text-ink hover:bg-linen",
        light: "border-white bg-white text-ink hover:border-cream hover:bg-cream",
        "outline-light": "border-white/80 bg-transparent text-white hover:border-white hover:bg-white hover:text-ink",
        whatsapp: "border-whatsapp bg-whatsapp text-white hover:border-[#186440] hover:bg-[#186440]",
        ghost: "border-transparent text-ink hover:bg-sand",
        link: "h-auto border-transparent p-0 text-ink underline underline-offset-4 hover:text-clay",
      },
      size: {
        default: "h-12 px-7 text-sm",
        sm: "h-10 px-5 text-[0.8125rem]",
        lg: "h-13 px-9 text-[0.9375rem]",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
