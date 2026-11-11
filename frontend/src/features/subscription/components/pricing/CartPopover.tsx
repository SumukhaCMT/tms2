import { ShoppingCart, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

import { cartTotals, formatPrice, type CartItem } from "../../pricingCart"

interface Props {
  items: CartItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemove: (id: string) => void
  onCheckout: () => void
}

export default function CartPopover({ items, open, onOpenChange, onRemove, onCheckout }: Props) {
  const totals = cartTotals(items)

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button variant="outline" size="icon-lg" className="relative cursor-pointer rounded-full bg-background shadow-md" aria-label="Cart">
            <ShoppingCart />
            {items.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {items.length}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-semibold">Your Cart</span>
          <span className="text-xs text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
        </div>
        <Separator />

        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Your cart is empty.</p>
        ) : (
          <>
            <ul className="flex max-h-72 flex-col divide-y overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.period || item.subtitle}</span>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">{formatPrice(item.total)}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
            <Separator />
            <div className="flex flex-col gap-3 px-4 py-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total incl. GST</span>
                <span className="font-semibold">{formatPrice(totals.total)}</span>
              </div>
              <Button className="w-full cursor-pointer" onClick={onCheckout}>
                View Summary
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
