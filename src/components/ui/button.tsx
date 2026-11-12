import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

// Variantes adaptadas a la tienda: botones en forma de píldora y con altura táctil (44 px o más).
// En archivos .astro se usa buttonVariants() como clase de un enlace.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-full border font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-200 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_6px_16px_-6px_rgb(156_79_54/0.55)] hover:bg-clay-deep",
        outline: "border-ink/70 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-cream",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-linen",
        dark: "border-transparent bg-ink text-cream hover:bg-ink/85",
        light: "border-transparent bg-cream text-ink hover:bg-white",
        whatsapp:
          "border-transparent bg-whatsapp text-white shadow-[0_6px_16px_-6px_rgb(31_122_77/0.6)] hover:bg-[#186440]",
        ghost: "border-transparent text-ink hover:bg-sand",
        link: "border-transparent h-auto p-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 text-[0.9375rem]",
        sm: "h-9 px-4 text-sm",
        lg: "h-13 px-8 text-base",
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
